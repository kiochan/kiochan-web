import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import { ExportEncoder } from "../packages/lab-texture-array/src/export-encoder.ts";

const require = createRequire(
  new URL("../packages/lab-texture-array/package.json", import.meta.url),
);
const { initializeCanvas, readPsd } = require("ag-psd");
const { unzipSync, strFromU8 } = require("fflate");
const { decode } = await import(require.resolve("fast-png"));
initializeCanvas(
  () => {
    throw new Error("Canvas must not be needed for export");
  },
  (width, height) => ({
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
  }),
);
const bottom = Uint8Array.of(
  255,
  0,
  0,
  255,
  0,
  255,
  0,
  128,
  0,
  0,
  255,
  0,
  4,
  8,
  12,
  64,
);
const top = Uint8Array.of(9, 8, 7, 255, 6, 5, 4, 128, 3, 2, 1, 0, 0, 0, 0, 0);
function make(format) {
  const encoder = new ExportEncoder(format, 2, bottom.slice());
  encoder.addLayer({ visible: true, rgba: bottom.slice() });
  encoder.addLayer({ visible: false, rgba: top.slice() });
  return encoder.finish();
}
test("PSD preserves English layer names, bottom-to-top order, hidden layers and straight-alpha pixels", async () => {
  const blob = make("psd");
  assert.equal(blob.type, "image/vnd.adobe.photoshop");
  const bytes = new Uint8Array(await blob.arrayBuffer());
  assert.equal(Buffer.from(bytes.subarray(0, 4)).toString(), "8BPS");
  const psd = readPsd(bytes, { useImageData: true, skipThumbnail: true });
  assert.equal(psd.width, 2);
  assert.equal(psd.height, 2);
  assert.deepEqual(
    psd.children.map((l) => [l.name, !!l.hidden]),
    [
      ["Layer 01", false],
      ["Layer 02", true],
    ],
  );
  assert.deepEqual([...psd.children[0].imageData.data], [...bottom]);
  assert.deepEqual([...psd.children[1].imageData.data], [...top]);
  // PSD composites matte RGB for compatibility; alpha must remain exact.
  assert.deepEqual(
    [...psd.imageData.data].filter((_, i) => i % 4 === 3),
    [255, 128, 0, 64],
  );
  if (process.env.PSD_FIXTURE) await writeFile(process.env.PSD_FIXTURE, bytes);
});
test("PNG ZIP contains exact full-tile RGBA layers, including hidden ones, and an English visibility manifest", async () => {
  const blob = make("zip");
  assert.equal(blob.type, "application/zip");
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const files = unzipSync(bytes);
  assert.deepEqual(Object.keys(files), [
    "Composite.png",
    "Layer-01.png",
    "Layer-02.png",
    "Layers.json",
  ]);
  for (const [name, expected] of [
    ["Composite.png", bottom],
    ["Layer-01.png", bottom],
    ["Layer-02.png", top],
  ]) {
    const png = decode(files[name]);
    assert.equal(png.width, 2);
    assert.equal(png.height, 2);
    assert.equal(png.channels, 4);
    assert.deepEqual([...png.data], [...expected]);
  }
  assert.deepEqual(JSON.parse(strFromU8(files["Layers.json"])), {
    width: 2,
    height: 2,
    order: "bottom-to-top",
    composite: "Composite.png",
    layers: [
      { name: "Layer 01", file: "Layer-01.png", visible: true },
      { name: "Layer 02", file: "Layer-02.png", visible: false },
    ],
  });
  if (process.env.ZIP_FIXTURE) await writeFile(process.env.ZIP_FIXTURE, bytes);
});
test("exports reject invalid buffers, empty stacks and excess layers", () => {
  for (const format of ["psd", "zip"]) {
    assert.throws(() => new ExportEncoder(format, 8192, bottom));
    assert.throws(() => new ExportEncoder(format, 2, new Uint8Array(4)));
    const encoder = new ExportEncoder(format, 2, bottom.slice());
    assert.throws(() => encoder.finish());
    assert.throws(() =>
      encoder.addLayer({ visible: true, rgba: new Uint8Array(4) }),
    );
    for (let i = 0; i < 12; i++)
      encoder.addLayer({ visible: true, rgba: bottom.slice() });
    assert.throws(() =>
      encoder.addLayer({ visible: true, rgba: bottom.slice() }),
    );
  }
});
