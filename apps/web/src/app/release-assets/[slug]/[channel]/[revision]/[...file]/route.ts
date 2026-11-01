import { Readable } from "node:stream";
import {
  isChannel,
  openReleaseFile,
  readPublishedRelease,
  releaseFolder,
  releasesRoot,
  screenshotUrl,
} from "@/lib/releases/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
      channel: string;
      revision: string;
      file: string[];
    }>;
  },
) {
  const { slug, channel, revision, file } = await params;
  const release = isChannel(channel)
    ? await readPublishedRelease(slug, channel)
    : null;
  const relative = file.join("/");
  if (
    release &&
    release.revision === revision &&
    screenshotUrl(release, relative)
  ) {
    try {
      const { handle, stat } = await openReleaseFile(
        releasesRoot(),
        `${releaseFolder(release)}/${relative}`,
        8388608,
      );
      const magic = Buffer.alloc(12);
      await handle.read(magic, 0, magic.length, 0);
      const type =
        relative.endsWith(".png") &&
        magic
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          ? "image/png"
          : /\.jpe?g$/.test(relative) &&
              magic[0] === 255 &&
              magic[1] === 216 &&
              magic[2] === 255
            ? "image/jpeg"
            : relative.endsWith(".webp") &&
                magic.toString("ascii", 0, 4) === "RIFF" &&
                magic.toString("ascii", 8, 12) === "WEBP"
              ? "image/webp"
              : null;
      if (!type) {
        await handle.close();
        throw new Error("Invalid raster image.");
      }
      return new Response(
        Readable.toWeb(
          handle.createReadStream({ start: 0, autoClose: true }),
        ) as ReadableStream<Uint8Array>,
        {
          headers: {
            "Content-Type": type,
            "Content-Length": String(stat.size),
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    } catch {
      /* Missing or invalid assets must not expose filesystem details. */
    }
  }
  return new Response(null, {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}
