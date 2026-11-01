import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fixtureBundle, publishFixture } from "./release-fixtures.mjs";

const base = new URL(process.env.BASE_URL ?? "http://127.0.0.1:3000");
const root = path.resolve(process.env.RELEASES_ROOT ?? "");
const temporaryRoot = path.resolve(process.env.RUNNER_TEMP ?? os.tmpdir());
assert.ok(
  ["localhost", "127.0.0.1"].includes(base.hostname),
  "Release fixtures are restricted to a local integration server.",
);
assert.ok(
  root.startsWith(temporaryRoot + path.sep) &&
    path.basename(root).startsWith("kiochan-release"),
  "Use an isolated temporary release mount.",
);
const fixtures = await mkdtemp(
  path.join(temporaryRoot, "kiochan-release-smoke-"),
);
async function get(route) {
  return fetch(new URL(route, base), { signal: AbortSignal.timeout(10000) });
}
const run = Date.now().toString(36);
const firstRevision = `smoke-first-${run}`;
const secondRevision = `smoke-second-${run}`;
const first = await fixtureBundle(fixtures, firstRevision);
for (const channel of ["dev", "prod"]) {
  const publication = publishFixture(
    root,
    first.bundle,
    channel,
    firstRevision,
  );
  assert.equal(publication.status, 0, publication.stderr);
}
const page = await get("/releases/panel-tools");
assert.equal(page.status, 200);
const html = await page.text();
assert.ok(html.includes(firstRevision));
assert.ok(html.includes("Prod channel") && html.includes("Dev channel"));
assert.ok(!html.includes("<script>alert('unsafe')</script>"));
const endpoint = "/downloads/panel-tools/dev/windows-x64";
const download = await get(endpoint);
assert.equal(download.status, 200);
assert.deepEqual(Buffer.from(await download.arrayBuffer()), first.data);
const image = await get(
  `/release-assets/panel-tools/dev/${firstRevision}/screenshots/test.png`,
);
assert.equal(image.status, 200);
assert.equal(image.headers.get("content-type"), "image/png");
await image.arrayBuffer();
assert.equal(
  (await get(`/release-assets/panel-tools/dev/${firstRevision}/release.md`))
    .status,
  404,
);
const second = await fixtureBundle(fixtures, secondRevision);
assert.equal(
  publishFixture(root, second.bundle, "dev", secondRevision).status,
  0,
);
assert.ok(
  (await (await get("/releases/panel-tools")).text()).includes(secondRevision),
);
assert.ok(
  (await (await get("/releases")).text()).includes("Runtime release fixture"),
);
const latest = await get(endpoint);
assert.equal(
  createHash("sha256")
    .update(Buffer.from(await latest.arrayBuffer()))
    .digest("hex"),
  second.metadata.downloads[0].sha256,
);
assert.equal(
  (await (await get("/api/releases/panel-tools/dev")).json()).revision,
  secondRevision,
);
assert.equal(
  (await (await get("/api/releases/panel-tools/prod")).json()).revision,
  firstRevision,
);
assert.ok(
  (await (await get("/sitemap.xml")).text()).includes(
    "https://kiochan.one/releases/panel-tools",
  ),
);
await assert.rejects(
  access(
    path.join(
      root,
      `channels/dev/products/panel-tools/versions/${firstRevision}`,
    ),
  ),
);
await access(
  path.join(
    root,
    `channels/prod/products/panel-tools/versions/${firstRevision}`,
  ),
);
console.log(
  "Runtime Markdown, screenshots, fixed downloads and channel cleanup passed without rebuilding or restarting the website.",
);
