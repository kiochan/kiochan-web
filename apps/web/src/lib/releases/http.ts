import { Readable } from "node:stream";
import {
  downloadUrl,
  openReleaseFile,
  type ReleaseChannel,
  readPublishedRelease,
  releaseFolder,
  releasesRoot,
} from "./store.ts";

export function byteRange(
  value: string | null,
  size: number,
): { start: number; end: number; partial: boolean } | null {
  if (!value) return { start: 0, end: size - 1, partial: false };
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return null;
  let start: number, end: number;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix < 1) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= size ||
    end < start
  )
    return null;
  return { start, end, partial: true };
}

export async function downloadResponse(
  request: Request,
  slug: string,
  channel: ReleaseChannel,
  id: string,
  root = releasesRoot(),
): Promise<Response> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const release = await readPublishedRelease(slug, channel, root);
    const file = release?.metadata.downloads.find((item) => item.id === id);
    if (!release || !file) break;
    try {
      const { handle, stat } = await openReleaseFile(
        root,
        `${releaseFolder(release)}/downloads/${file.file}`,
        1073741824,
      );
      if (stat.size !== file.bytes) {
        await handle.close();
        throw new Error("Package size mismatch.");
      }
      const headers = new Headers({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${file.file}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Accept-Ranges": "bytes",
        ETag: `"${file.sha256}"`,
        "X-Release-Version": release.metadata.version,
        Link: `<${downloadUrl(release, file)}>; rel="canonical"`,
      });
      // A resume for a replaced package must start over, never combine versions.
      const ifRange = request.headers.get("if-range");
      const range = byteRange(
        ifRange && ifRange !== headers.get("etag")
          ? null
          : request.headers.get("range"),
        stat.size,
      );
      if (!range) {
        await handle.close();
        headers.set("Content-Range", `bytes */${stat.size}`);
        return new Response(null, { status: 416, headers });
      }
      headers.set("Content-Length", String(range.end - range.start + 1));
      if (range.partial)
        headers.set(
          "Content-Range",
          `bytes ${range.start}-${range.end}/${stat.size}`,
        );
      if (request.method === "HEAD") {
        await handle.close();
        return new Response(null, {
          status: range.partial ? 206 : 200,
          headers,
        });
      }
      const stream = handle.createReadStream({
        start: range.start,
        end: range.end,
        autoClose: true,
      });
      return new Response(
        Readable.toWeb(stream) as ReadableStream<Uint8Array>,
        { status: range.partial ? 206 : 200, headers },
      );
    } catch {
      /* Retry the new catalogue if cleanup won a concurrent switch. */
    }
  }
  return Response.json(
    { error: "Download unavailable" },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}
