import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  access,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  byteRange,
  downloadResponse,
} from "../apps/web/src/lib/releases/http.ts";
import {
  listReleaseGroups,
  openReleaseFile,
  parseReleaseDocument,
  readPublishedRelease,
  releaseFolder,
  screenshotUrl,
} from "../apps/web/src/lib/releases/store.ts";
import {
  fixtureBundle,
  publishFixture,
  pythonCommand,
} from "./release-fixtures.mjs";

test("runtime publications are atomic, channel-isolated and latest-only", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "kiochan-release-"));
  const root = path.join(temporary, "mount");
  try {
    assert.deepEqual(await listReleaseGroups(root), []);
    const first = await fixtureBundle(temporary, "first");
    for (const channel of ["dev", "prod"]) {
      const result = publishFixture(root, first.bundle, channel, "first");
      assert.equal(result.status, 0, result.stderr);
    }
    const groups = await listReleaseGroups(root);
    assert.deepEqual(
      groups[0].releases.map((item) => item.channel),
      ["prod", "dev"],
    );
    const before = await readPublishedRelease("panel-tools", "dev", root);
    assert.ok(before);
    const document = path.join(root, releaseFolder(before), "release.md");
    await writeFile(
      document,
      (await readFile(document, "utf8")).replace(
        "## Release notes",
        "## Edited without rebuilding",
      ),
    );
    assert.match(
      (await readPublishedRelease("panel-tools", "dev", root)).markdown,
      /Edited without rebuilding/,
    );
    assert.equal(screenshotUrl(before, "https://tracker.invalid/a.png"), null);
    assert.equal(screenshotUrl(before, "screenshots/../../secret.png"), null);
    await assert.rejects(openReleaseFile(root, "../outside", 100));
    const response = await downloadResponse(
      new Request("http://localhost/download"),
      "panel-tools",
      "dev",
      "windows-x64",
      root,
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), first.data);
    const partial = await downloadResponse(
      new Request("http://localhost/download", {
        headers: { Range: "bytes=0-9" },
      }),
      "panel-tools",
      "dev",
      "windows-x64",
      root,
    );
    assert.equal(partial.status, 206);
    assert.deepEqual(
      Buffer.from(await partial.arrayBuffer()),
      first.data.subarray(0, 10),
    );
    const head = await downloadResponse(
      new Request("http://localhost/download", { method: "HEAD" }),
      "panel-tools",
      "dev",
      "windows-x64",
      root,
    );
    assert.equal(head.headers.get("content-length"), String(first.data.length));
    assert.equal((await head.arrayBuffer()).byteLength, 0);
    const second = await fixtureBundle(temporary, "second");
    assert.equal(
      publishFixture(root, second.bundle, "dev", "second").status,
      0,
    );
    await assert.rejects(
      access(
        path.join(root, "channels/dev/products/panel-tools/versions/first"),
      ),
    );
    await access(
      path.join(root, "channels/prod/products/panel-tools/versions/first"),
    );
    const latest = await readPublishedRelease("panel-tools", "dev", root);
    assert.equal(latest.revision, "second");
    const resumed = await downloadResponse(
      new Request("http://localhost/download", {
        headers: {
          Range: "bytes=10-",
          "If-Range": `"${first.metadata.downloads[0].sha256}"`,
        },
      }),
      "panel-tools",
      "dev",
      "windows-x64",
      root,
    );
    assert.equal(resumed.status, 200);
    assert.equal(
      createHash("sha256")
        .update(Buffer.from(await resumed.arrayBuffer()))
        .digest("hex"),
      second.metadata.downloads[0].sha256,
    );
    const catalogue = await readFile(
      path.join(root, "channels/dev/catalog.json"),
      "utf8",
    );
    const corrupt = await fixtureBundle(temporary, "corrupt", true);
    assert.notEqual(
      publishFixture(root, corrupt.bundle, "dev", "corrupt").status,
      0,
    );
    assert.equal(
      await readFile(path.join(root, "channels/dev/catalog.json"), "utf8"),
      catalogue,
    );
    assert.equal(
      (await readPublishedRelease("panel-tools", "dev", root)).revision,
      "second",
    );
    const malicious = path.join(temporary, "escape.tar.gz");
    assert.equal(
      pythonCommand([
        "-c",
        "import io,sys,tarfile; t=tarfile.open(sys.argv[1],'w:gz'); i=tarfile.TarInfo('../escaped.txt'); i.size=1; t.addfile(i,io.BytesIO(b'x')); t.close()",
        malicious,
      ]).status,
      0,
    );
    assert.notEqual(publishFixture(root, malicious, "dev", "unsafe").status, 0);
    await assert.rejects(access(path.join(root, "channels/dev/escaped.txt")));
    assert.equal(
      await readFile(path.join(root, "channels/dev/catalog.json"), "utf8"),
      catalogue,
    );
    if (process.platform !== "win32") {
      const outside = path.join(temporary, "outside.txt");
      await writeFile(outside, "private");
      await symlink(outside, path.join(root, "escape.txt"));
      await assert.rejects(openReleaseFile(root, "escape.txt", 100));
    }
  } finally {
    assert.equal(path.dirname(temporary), path.resolve(os.tmpdir()));
    assert.ok(path.basename(temporary).startsWith("kiochan-release-"));
    await rm(temporary, { recursive: true, force: true });
  }
});

test("range and document validation reject malformed input", () => {
  assert.deepEqual(byteRange("bytes=-4", 10), {
    start: 6,
    end: 9,
    partial: true,
  });
  for (const value of [
    "bytes=10-",
    "bytes=-0",
    "bytes=5-3",
    "bytes=0-1,3-4",
    "bytes=999999999999999999999999-",
  ])
    assert.equal(byteRange(value, 10), null);
  assert.throws(() =>
    parseReleaseDocument('---\n{"slug":"../private"}\n---\n', "panel-tools"),
  );
  assert.throws(() =>
    parseReleaseDocument("---\ntitle: unsafe yaml\n---\n", "panel-tools"),
  );
});

test("retired producer identities and products cannot be republished", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "kiochan-release-"));
  const root = path.join(temporary, "mount");
  const retired = "kiochan/cep-card-layer";
  const panel = "kiochan/photoshop-panel-tools";
  try {
    const a = await fixtureBundle(temporary, "panel-first");
    assert.equal(
      publishFixture(root, a.bundle, "dev", "panel-first", panel).status,
      0,
    );
    const catalogue = path.join(root, "channels/dev/catalog.json");
    const initial = await readFile(catalogue, "utf8");
    const b = await fixtureBundle(temporary, "retired", false, {
      slug: "bailey-workspace",
      producer: retired,
    });
    assert.notEqual(
      publishFixture(root, b.bundle, "dev", "retired", retired).status,
      0,
    );
    // The active identity cannot add the retired product under its own name.
    const forged = await fixtureBundle(temporary, "forged", false, {
      slug: "bailey-workspace",
      producer: panel,
    });
    assert.notEqual(
      publishFixture(root, forged.bundle, "dev", "forged", panel).status,
      0,
    );
    assert.equal(await readFile(catalogue, "utf8"), initial);
    const newer = await fixtureBundle(temporary, "panel-second");
    assert.equal(
      publishFixture(root, newer.bundle, "dev", "panel-second", panel).status,
      0,
    );
    const latest = JSON.parse(await readFile(catalogue, "utf8"));
    assert.deepEqual(latest.products, { "panel-tools": "panel-second" });
  } finally {
    assert.equal(path.dirname(temporary), path.resolve(os.tmpdir()));
    assert.ok(path.basename(temporary).startsWith("kiochan-release-"));
    await rm(temporary, { recursive: true, force: true });
  }
});

test("color picker publisher cannot replace another product", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "kiochan-release-"));
  const root = path.join(temporary, "mount");
  const producer = "kiochan/kio-color-picker-photoshop";
  try {
    const panel = await fixtureBundle(temporary, "panel");
    assert.equal(publishFixture(root, panel.bundle, "dev", "panel").status, 0);
    const picker = await fixtureBundle(temporary, "picker", false, {
      slug: "kio-color-picker",
      producer,
    });
    assert.equal(
      publishFixture(root, picker.bundle, "dev", "picker", producer).status,
      0,
    );
    const forged = await fixtureBundle(temporary, "forged-picker", false, {
      slug: "panel-tools",
      producer,
    });
    assert.notEqual(
      publishFixture(root, forged.bundle, "dev", "forged-picker", producer)
        .status,
      0,
    );
    const catalogue = JSON.parse(
      await readFile(path.join(root, "channels/dev/catalog.json"), "utf8"),
    );
    assert.deepEqual(catalogue.products, {
      "panel-tools": "panel",
      "kio-color-picker": "picker",
    });
  } finally {
    assert.equal(path.dirname(temporary), path.resolve(os.tmpdir()));
    assert.ok(path.basename(temporary).startsWith("kiochan-release-"));
    await rm(temporary, { recursive: true, force: true });
  }
});
