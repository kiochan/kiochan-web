import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import test from "node:test";
import { inflateSync } from "node:zlib";
import { LayeredTiffWriter } from "../packages/lab-texture-array/src/tiff.ts";

function decode(bytes) {
  const b = Buffer.from(bytes);
  assert.equal(b.toString("ascii", 0, 2), "MM");
  assert.equal(b.readUInt16BE(2), 42);
  const directory = b.readUInt32BE(4);
  const count = b.readUInt16BE(directory);
  const tags = new Map();
  for (let i = 0; i < count; i++) {
    const at = directory + 2 + i * 12;
    const type = b.readUInt16BE(at + 2);
    const length = b.readUInt32BE(at + 4);
    tags.set(b.readUInt16BE(at), {
      type,
      length,
      value:
        type === 3 && length === 1
          ? b.readUInt16BE(at + 8)
          : b.readUInt32BE(at + 8),
    });
  }
  assert.equal(
    b.readUInt32BE(directory + 2 + count * 12),
    0,
    "One IFD, not multi-page TIFF",
  );
  for (const id of [282, 283]) {
    const tag = tags.get(id);
    assert.equal(tag?.type, 5, "Required TIFF resolution is a RATIONAL");
    assert.equal(tag.length, 1);
    assert.equal(b.readUInt32BE(tag.value), 72);
    assert.equal(b.readUInt32BE(tag.value + 4), 1);
  }
  assert.equal(tags.get(296)?.value, 2, "Resolution is in inches");
  const strip = tags.get(273).value;
  const composite = inflateSync(b.subarray(strip, strip + tags.get(279).value));
  const tag = tags.get(37724);
  const source = b.subarray(tag.value, tag.value + tag.length);
  const signature = Buffer.from("Adobe Photoshop Document Data Block\0");
  assert.ok(source.subarray(0, signature.length).equals(signature));
  assert.equal(
    source.toString("ascii", signature.length, signature.length + 8),
    "8BIMMTrn",
    "Photoshop TIFF merged transparency marker must precede layer data",
  );
  assert.equal(source.readUInt32BE(signature.length + 8), 0);
  let layerData;
  for (let offset = signature.length; offset < source.length; ) {
    assert.equal(source.toString("ascii", offset, offset + 4), "8BIM");
    const key = source.toString("ascii", offset + 4, offset + 8);
    const size = source.readUInt32BE(offset + 8);
    if (key === "Layr")
      layerData = source.subarray(offset + 12, offset + 12 + size);
    offset += 12 + Math.ceil(size / 4) * 4;
  }
  assert.ok(layerData);
  const signedCount = layerData.readInt16BE(0);
  assert.ok(signedCount < 0, "Composite alpha flag");
  const layers = [];
  let offset = 2;
  for (let i = 0; i < -signedCount; i++) {
    const height =
      layerData.readInt32BE(offset + 8) - layerData.readInt32BE(offset);
    const width =
      layerData.readInt32BE(offset + 12) - layerData.readInt32BE(offset + 4);
    const channelCount = layerData.readUInt16BE(offset + 16);
    offset += 18;
    const channels = [];
    for (let c = 0; c < channelCount; c++) {
      channels.push({
        id: layerData.readInt16BE(offset),
        size: layerData.readUInt32BE(offset + 2),
      });
      offset += 6;
    }
    assert.equal(layerData.toString("ascii", offset, offset + 8), "8BIMnorm");
    assert.equal(
      layerData[offset + 8],
      255,
      "Per-instance opacity is already in raster alpha",
    );
    const visible = !(layerData[offset + 10] & 2);
    const extraSize = layerData.readUInt32BE(offset + 12);
    offset += 16;
    const extra = layerData.subarray(offset, offset + extraSize);
    const pascalLength = extra[8];
    const unicodeAt = 8 + Math.ceil((1 + pascalLength) / 4) * 4;
    assert.equal(extra.toString("ascii", unicodeAt, unicodeAt + 8), "8BIMluni");
    const nameLength = extra.readUInt32BE(unicodeAt + 12);
    let name = "";
    for (let c = 0; c < nameLength; c++)
      name += String.fromCharCode(extra.readUInt16BE(unicodeAt + 16 + c * 2));
    layers.push({ width, height, visible, name, channels });
    offset += extraSize;
  }
  for (const layer of layers) {
    layer.rgba = new Uint8Array(layer.width * layer.height * 4);
    assert.deepEqual(
      layer.channels.map((c) => c.id),
      [0, 1, 2, -1],
    );
    for (const [index, channel] of layer.channels.entries()) {
      assert.equal(
        layerData.readUInt16BE(offset),
        2,
        "PSD ZIP compression without prediction",
      );
      const samples = inflateSync(
        layerData.subarray(offset + 2, offset + channel.size),
      );
      assert.equal(samples.length, layer.width * layer.height);
      for (let pixel = 0; pixel < samples.length; pixel++)
        layer.rgba[pixel * 4 + index] = samples[pixel];
      offset += channel.size;
    }
  }
  assert.ok(
    layerData.length - offset <= 1,
    "No unexpected data or truncated channels",
  );
  return { tags, composite, layers };
}

test("layered TIFF preserves top-down pixels, alpha, Unicode names, hidden layers and bottom-to-top order", async () => {
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
  const hidden = Uint8Array.of(
    9,
    8,
    7,
    255,
    6,
    5,
    4,
    255,
    3,
    2,
    1,
    255,
    0,
    0,
    0,
    0,
  );
  const writer = new LayeredTiffWriter(2);
  await writer.setComposite(bottom);
  await writer.addLayer({ name: "底图 🌸.png", visible: true, rgba: bottom });
  await writer.addLayer({ name: "Hidden top", visible: false, rgba: hidden });
  const blob = writer.finish();
  assert.equal(blob.type, "image/tiff");
  const bytes = await blob.arrayBuffer();
  const result = decode(bytes);
  assert.equal(result.tags.get(256).value, 2);
  assert.equal(result.tags.get(258).length, 4);
  assert.equal(
    result.tags.get(338).value,
    1,
    "Associated TIFF composite alpha",
  );
  assert.equal(result.tags.get(37724).type, 7);
  assert.deepEqual(
    [...result.composite],
    [255, 0, 0, 255, 0, 128, 0, 128, 0, 0, 0, 0, 1, 2, 3, 64],
  );
  assert.deepEqual(
    result.layers.map((l) => [l.name, l.visible]),
    [
      ["底图 🌸.png", true],
      ["Hidden top", false],
    ],
  );
  assert.deepEqual(result.layers[0].rgba, bottom);
  assert.deepEqual(result.layers[1].rgba, hidden);
  if (process.env.TIFF_FIXTURE)
    await writeFile(process.env.TIFF_FIXTURE, new Uint8Array(bytes));
});

test("TIFF requires exact pixels and a nonempty layer stack", async () => {
  const writer = new LayeredTiffWriter(2);
  assert.throws(() => writer.finish());
  await assert.rejects(() => writer.setComposite(new Uint8Array(4)));
  await assert.rejects(() =>
    new LayeredTiffWriter(8192).setComposite(new Uint8Array(4)),
  );
  await writer.setComposite(new Uint8Array(16));
  assert.throws(() => writer.finish());
  for (let i = 0; i < 12; i++)
    await writer.addLayer({
      name: `Layer ${i}`,
      visible: false,
      rgba: new Uint8Array(16),
    });
  await assert.rejects(() =>
    writer.addLayer({
      name: "Overflow",
      visible: true,
      rgba: new Uint8Array(16),
    }),
  );
  assert.equal(decode(await writer.finish().arrayBuffer()).layers.length, 12);
});
