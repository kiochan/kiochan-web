import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { PsdImportClient } from "../packages/lab-texture-array/src/import-psd.ts";
import {
  commit,
  emptyProject,
  newLayer,
  parseProject,
} from "../packages/lab-texture-array/src/project.ts";
import { PsdImport } from "../packages/lab-texture-array/src/psd-import.ts";

const require = createRequire(
  new URL("../packages/lab-texture-array/package.json", import.meta.url),
);
const { initializeCanvas, writePsd } = require("ag-psd");
const { decode } = await import(
  pathToFileURL(require.resolve("fast-png")).href
);
initializeCanvas(
  () => {
    throw new Error("PSD import must not need a canvas");
  },
  (width, height) => ({
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
  }),
);
const pixels = Uint8ClampedArray.of(200, 100, 50, 128, 90, 80, 70, 0);
const raster = (name, extra = {}) => ({
  name,
  top: 1,
  left: 1,
  right: 3,
  bottom: 2,
  imageData: { width: 2, height: 1, data: pixels.slice() },
  ...extra,
});
function fixture() {
  return writePsd(
    {
      width: 4,
      height: 4,
      children: [
        raster("Bottom"),
        {
          name: "Group",
          hidden: true,
          children: [raster("Nested"), raster("Top", { opacity: 0.5 })],
        },
      ],
    },
    { generateThumbnail: false, trimImageData: false },
  );
}

test("PSD lists nested raster layers without decoding pixels and imports only selected layers in stack order", () => {
  const document = new PsdImport(fixture());
  assert.deepEqual(
    document.choices.map((layer) => [
      layer.id,
      layer.name,
      layer.path,
      layer.width,
      layer.height,
      layer.available,
      layer.hidden,
    ]),
    [
      [0, "Bottom", "Bottom", 2, 1, true, false],
      [1, "Nested", "Group / Nested", 2, 1, true, true],
      [2, "Top", "Group / Top", 2, 1, true, true],
    ],
  );
  const assets = document.select([2, 0]);
  assert.deepEqual(
    assets.map((asset) => asset.name),
    ["Bottom", "Top"],
  );
  assert.notEqual(assets[0].id, assets[1].id);
  const bottom = decode(Buffer.from(assets[0].data.split(",")[1], "base64"));
  assert.equal(bottom.width, 2);
  assert.equal(bottom.height, 1);
  assert.deepEqual([...bottom.data], [...pixels]);
  const top = decode(Buffer.from(assets[1].data.split(",")[1], "base64"));
  assert.deepEqual([...top.data], [200, 100, 50, 64, 90, 80, 70, 0]);
  assert.deepEqual(
    [
      ...decode(
        Buffer.from(document.select([0])[0].data.split(",")[1], "base64"),
      ).data,
    ],
    [...pixels],
  );
  const project = commit(
    { ...emptyProject(), assets },
    {
      label: "Import PSD",
      size: 1024,
      layers: assets.map((asset) => ({
        ...newLayer(asset.id),
        name: asset.name,
      })),
    },
  );
  assert.deepEqual(parseProject(JSON.stringify(project)), project);
});

test("PSD import validates selection and keeps raw source channels reusable after failed selection", () => {
  const document = new PsdImport(fixture());
  for (const ids of [
    [],
    [0, 0],
    [-1],
    [0.5],
    [99],
    Array.from({ length: 13 }, (_, i) => i),
  ])
    assert.throws(() => document.select(ids));
  assert.equal(document.select([1])[0].name, "Nested");
});

test("PSD rejects unsupported headers, color depths, dimensions and malformed payloads before decoding", () => {
  const original = fixture();
  for (const mutate of [
    (view) => view.setUint32(0, 0),
    (view) => view.setUint16(4, 2),
    (view) => view.setUint16(22, 16),
    (view) => view.setUint16(24, 4),
    (view) => view.setUint32(18, 8193),
    (view) => {
      view.setUint32(18, 8192);
      view.setUint32(14, 8192);
    },
  ]) {
    const buffer = original.slice(0);
    mutate(new DataView(buffer));
    assert.throws(() => new PsdImport(buffer));
  }
  assert.throws(() => new PsdImport(new ArrayBuffer(5)));
  assert.throws(() => new PsdImport(original.slice(0, 30)));
});

test("PSD marks empty layers unavailable and rejects empty documents", () => {
  const buffer = writePsd(
    { width: 4, height: 4, children: [{ name: "Empty" }, raster("Pixels")] },
    { generateThumbnail: false },
  );
  const document = new PsdImport(buffer);
  assert.equal(document.choices[0].available, false);
  assert.throws(() => document.select([0]));
  assert.equal(document.select([1])[0].name, "Pixels");
  assert.throws(
    () =>
      new PsdImport(
        writePsd({ width: 4, height: 4 }, { generateThumbnail: false }),
      ),
  );
});

test("PSD worker requests transfer source bytes, allow selection retries, and cancel pending work", async () => {
  let worker;
  class TestWorker {
    terminated = false;
    constructor() {
      worker = this;
    }
    postMessage(command, transfer) {
      this.command = command;
      this.transfer = transfer;
    }
    terminate() {
      this.terminated = true;
    }
  }
  const previous = globalThis.Worker;
  globalThis.Worker = TestWorker;
  try {
    const client = new PsdImportClient();
    const buffer = fixture();
    const opened = client.request({ type: "open", buffer });
    assert.deepEqual(worker.transfer, [buffer]);
    worker.onmessage({ data: { layers: [] } });
    assert.deepEqual(await opened, { layers: [] });
    const invalid = client.request({ type: "select", ids: [] });
    worker.onmessage({
      data: { error: "Select between 1 and 12 PSD layers." },
    });
    await assert.rejects(invalid, /Select between/);
    assert.equal(client.closed, false);
    const pending = client.request({ type: "select", ids: [0] });
    client.dispose();
    await assert.rejects(pending, /cancelled/);
    assert.equal(worker.terminated, true);
    await assert.rejects(
      client.request({ type: "select", ids: [0] }),
      /cancelled/,
    );
  } finally {
    globalThis.Worker = previous;
  }
});

test("PSD worker failures terminate decoding and reject further requests", async () => {
  let worker;
  const previous = globalThis.Worker;
  globalThis.Worker = class {
    constructor() {
      worker = this;
    }
    postMessage() {}
    terminate() {
      this.terminated = true;
    }
  };
  try {
    const client = new PsdImportClient();
    const pending = client.request({ type: "open", buffer: fixture() });
    worker.onerror();
    await assert.rejects(pending, /Unable to read/);
    assert.equal(client.closed, true);
    assert.equal(worker.terminated, true);
    await assert.rejects(
      client.request({ type: "select", ids: [0] }),
      /cancelled/,
    );
  } finally {
    globalThis.Worker = previous;
  }
});
