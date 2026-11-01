import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import path from "node:path";

export const channels = ["prod", "dev"] as const;
export type ReleaseChannel = (typeof channels)[number];
export type Download = {
  id: string;
  file: string;
  label: string;
  bytes: number;
  sha256: string;
};
export type ReleaseMetadata = {
  slug: string;
  title: string;
  summary: string;
  version: string;
  publishedAt: string;
  buildCommit: string;
  status: "trial" | "stable" | "experimental";
  compatibility: string[];
  downloads: Download[];
};
export type PublishedRelease = {
  channel: ReleaseChannel;
  revision: string;
  metadata: ReleaseMetadata;
  markdown: string;
};
export type ReleaseGroup = { slug: string; releases: PublishedRelease[] };
export const isSlug = (value: string) =>
  /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
export const isRevision = (value: string) =>
  /^[a-z0-9][a-z0-9.-]{0,127}$/.test(value);
export const isChannel = (value: string): value is ReleaseChannel =>
  value === "dev" || value === "prod";
export const releasesRoot = () =>
  path.resolve(
    /* turbopackIgnore: true */
    process.env.RELEASES_ROOT ?? path.join(process.cwd(), ".releases"),
  );
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, limit: number): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= limit &&
  Array.from(value).every((character) => character.charCodeAt(0) >= 32);

export function parseReleaseDocument(
  document: string,
  expectedSlug: string,
): { metadata: ReleaseMetadata; markdown: string } {
  if (Buffer.byteLength(document) > 262144)
    throw new Error("Release document is too large.");
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(
    document,
  );
  if (!match || match[1].length > 32768)
    throw new Error("Expected JSON front matter and Markdown.");
  const value: unknown = JSON.parse(match[1]);
  if (
    !object(value) ||
    value.slug !== expectedSlug ||
    !isSlug(expectedSlug) ||
    !text(value.title, 100) ||
    !text(value.summary, 400) ||
    !text(value.version, 80) ||
    !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(value.version) ||
    !text(value.publishedAt, 40) ||
    !/^\d{4}-\d\d-\d\dT.*Z$/.test(value.publishedAt) ||
    !Number.isFinite(Date.parse(value.publishedAt)) ||
    !text(value.buildCommit, 40) ||
    !/^[a-f0-9]{40}$/.test(value.buildCommit) ||
    !["trial", "stable", "experimental"].includes(String(value.status)) ||
    !Array.isArray(value.compatibility) ||
    value.compatibility.length > 12 ||
    !value.compatibility.every((item) => text(item, 160)) ||
    !Array.isArray(value.downloads) ||
    value.downloads.length < 1 ||
    value.downloads.length > 8
  )
    throw new Error("Invalid release metadata.");
  const ids = new Set<string>();
  const downloads: Download[] = value.downloads.map((item: unknown) => {
    if (
      !object(item) ||
      !text(item.id, 64) ||
      !isSlug(item.id) ||
      ids.has(item.id) ||
      !text(item.file, 120) ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.zip$/.test(item.file) ||
      !text(item.label, 100) ||
      typeof item.bytes !== "number" ||
      !Number.isSafeInteger(item.bytes) ||
      item.bytes < 1 ||
      item.bytes > 1073741824 ||
      !text(item.sha256, 64) ||
      !/^[a-f0-9]{64}$/.test(item.sha256)
    )
      throw new Error("Invalid download metadata.");
    ids.add(item.id);
    return {
      id: item.id,
      file: item.file,
      label: item.label,
      bytes: item.bytes,
      sha256: item.sha256,
    };
  });
  return {
    metadata: {
      slug: expectedSlug,
      title: value.title,
      summary: value.summary,
      version: value.version,
      publishedAt: value.publishedAt,
      buildCommit: value.buildCommit,
      status: value.status as ReleaseMetadata["status"],
      compatibility: value.compatibility,
      downloads,
    },
    markdown: match[2],
  };
}

// Resolve against the canonical mount, reject links and open the checked inode.
// Only public release documents, package files and raster images are reachable.
export async function openReleaseFile(
  root: string,
  relative: string,
  maximum: number,
) {
  if (
    path.isAbsolute(relative) ||
    relative.includes("\\") ||
    relative.split("/").some((part) => !part || part === "." || part === "..")
  )
    throw new Error("Invalid release path.");
  const base = await realpath(root);
  const candidate = path.join(base, ...relative.split("/"));
  const resolved = await realpath(candidate);
  if (resolved !== candidate || !resolved.startsWith(base + path.sep))
    throw new Error("Release path escapes the mount or uses a link.");
  const before = await lstat(candidate);
  if (!before.isFile() || before.isSymbolicLink())
    throw new Error("Expected a regular release file.");
  const handle = await open(
    candidate,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  try {
    const stat = await handle.stat();
    if (
      !stat.isFile() ||
      stat.size < 1 ||
      stat.size > maximum ||
      stat.ino !== before.ino ||
      stat.dev !== before.dev
    )
      throw new Error("Release file changed or exceeds its size limit.");
    return { handle, stat };
  } catch (error) {
    await handle.close();
    throw error;
  }
}

async function readSmall(root: string, relative: string, maximum: number) {
  const { handle } = await openReleaseFile(root, relative, maximum);
  try {
    const buffer = Buffer.alloc(maximum + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await handle.read(
        buffer,
        offset,
        buffer.length - offset,
        null,
      );
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset > maximum)
      throw new Error("Release file grew beyond its size limit.");
    return buffer.subarray(0, offset).toString("utf8");
  } finally {
    await handle.close();
  }
}

export async function readCatalog(
  channel: ReleaseChannel,
  root = releasesRoot(),
): Promise<Record<string, string>> {
  try {
    const data: unknown = JSON.parse(
      await readSmall(root, `channels/${channel}/catalog.json`, 32768),
    );
    if (
      !object(data) ||
      data.schema !== 1 ||
      !object(data.products) ||
      Object.keys(data.products).length > 100
    )
      throw new Error("Invalid release catalogue.");
    const result: Record<string, string> = Object.create(null);
    for (const [slug, revision] of Object.entries(data.products)) {
      if (
        !isSlug(slug) ||
        typeof revision !== "string" ||
        !isRevision(revision)
      )
        throw new Error("Invalid catalogue entry.");
      result[slug] = revision;
    }
    return result;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return Object.create(null);
    throw error;
  }
}

export function releaseFolder(release: PublishedRelease) {
  return `channels/${release.channel}/products/${release.metadata.slug}/versions/${release.revision}`;
}

export async function readPublishedRelease(
  slug: string,
  channel: ReleaseChannel,
  root = releasesRoot(),
): Promise<PublishedRelease | null> {
  if (!isSlug(slug)) return null;
  // The previous revision may be removed after a concurrent catalogue switch.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const revision = (await readCatalog(channel, root))[slug];
      if (!revision) return null;
      const document = await readSmall(
        root,
        `channels/${channel}/products/${slug}/versions/${revision}/release.md`,
        262144,
      );
      return { ...parseReleaseDocument(document, slug), revision, channel };
    } catch {
      if (attempt === 1) console.warn("A published release could not be read.");
    }
  }
  return null;
}

export async function listReleaseGroups(
  root = releasesRoot(),
): Promise<ReleaseGroup[]> {
  const slugs = new Set<string>();
  for (const channel of channels) {
    try {
      for (const slug of Object.keys(await readCatalog(channel, root)))
        slugs.add(slug);
    } catch {
      console.warn("A release catalogue could not be read.");
    }
  }
  const groups: ReleaseGroup[] = [];
  for (const slug of [...slugs].sort()) {
    const releases = (
      await Promise.all(
        channels.map((channel) => readPublishedRelease(slug, channel, root)),
      )
    ).filter((item): item is PublishedRelease => item !== null);
    if (releases.length) groups.push({ slug, releases });
  }
  return groups;
}

export function downloadUrl(release: PublishedRelease, download: Download) {
  return `/downloads/${release.metadata.slug}/${release.channel}/${download.id}`;
}
export function screenshotUrl(release: PublishedRelease, source: string) {
  const relative = source.replace(/^\.\//, "");
  if (
    !/^screenshots\/[a-zA-Z0-9._/-]+\.(?:png|jpe?g|webp)$/.test(relative) ||
    relative.split("/").some((part) => part === "." || part === ".." || !part)
  )
    return null;
  return `/release-assets/${release.metadata.slug}/${release.channel}/${release.revision}/${relative.split("/").map(encodeURIComponent).join("/")}`;
}

export function publicRelease(release: PublishedRelease) {
  return {
    schema: 1,
    ...release.metadata,
    channel: release.channel,
    revision: release.revision,
    markdown: release.markdown,
    downloads: release.metadata.downloads.map((file) => ({
      ...file,
      url: downloadUrl(release, file),
    })),
  };
}
