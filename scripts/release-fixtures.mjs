import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repository = path.resolve(
  fileURLToPath(new URL("..", import.meta.url)),
);
export const python = process.platform === "win32" ? "python" : "python3";
export function pythonCommand(args) {
  const result = spawnSync(python, args, {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error) throw result.error;
  return result;
}
export async function fixtureBundle(
  directory,
  marker,
  corrupt = false,
  options = {},
) {
  const slug = options.slug || "panel-tools";
  const producer = options.producer || "kiochan/photoshop-panel-tools";
  const stage = path.join(directory, marker);
  const product = path.join(stage, "products", slug);
  await mkdir(path.join(product, "downloads"), { recursive: true });
  await mkdir(path.join(product, "screenshots"), { recursive: true });
  const zip = path.join(product, "downloads/panel-tools.zip");
  const result = pythonCommand([
    "-c",
    "import sys,zipfile; z=zipfile.ZipFile(sys.argv[1],'w'); z.writestr('build.txt',sys.argv[2]); z.close()",
    zip,
    marker,
  ]);
  if (result.status !== 0) throw new Error(result.stderr);
  const data = await readFile(zip);
  const metadata = {
    slug,
    title: "Runtime release fixture",
    summary: "Isolated release integration fixture.",
    version: options.version ?? "0.1.0",
    publishedAt: "2026-11-01T00:00:00Z",
    buildCommit: "a".repeat(40),
    status: "trial",
    compatibility: ["Photoshop 2019+ target; runtime unverified"],
    downloads: [
      {
        id: "windows-x64",
        file: "panel-tools.zip",
        label: "Windows x64",
        bytes: data.length,
        sha256: corrupt
          ? "0".repeat(64)
          : createHash("sha256").update(data).digest("hex"),
      },
    ],
  };
  await writeFile(
    path.join(product, "release.md"),
    `---\n${JSON.stringify(metadata, null, 2)}\n---\n\n## Release notes\n\n${marker}\n\n![Fixture screenshot](screenshots/test.png)\n\n<script>alert('unsafe')</script>\n`,
  );
  await writeFile(
    path.join(product, "screenshots/test.png"),
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jY1kAAAAASUVORK5CYII=",
      "base64",
    ),
  );
  await writeFile(
    path.join(stage, "bundle.json"),
    JSON.stringify({
      schema: 1,
      repository: producer,
      products: [slug],
      buildCommit: metadata.buildCommit,
    }),
  );
  const bundle = path.join(directory, `${marker}.tar.gz`);
  const packed = pythonCommand([
    "-c",
    "import sys,tarfile; t=tarfile.open(sys.argv[1],'w:gz'); t.add(sys.argv[2]+'/bundle.json',arcname='bundle.json'); t.add(sys.argv[2]+'/products',arcname='products'); t.close()",
    bundle,
    stage,
  ]);
  if (packed.status !== 0) throw new Error(packed.stderr);
  return { bundle, metadata, data };
}
export function publishFixture(
  root,
  bundle,
  channel,
  revision,
  producer = "kiochan/photoshop-panel-tools",
) {
  return pythonCommand([
    path.join(repository, "infrastructure/releases/publish.py"),
    "--root",
    root,
    "--bundle",
    bundle,
    "--channel",
    channel,
    "--revision",
    revision,
    "--repository",
    producer,
  ]);
}
