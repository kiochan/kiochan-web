import assert from "node:assert/strict";
import { test } from "node:test";
import { extractPalettes } from "../packages/lab-image-palette/src/palettes.ts";

test("a colorful image produces distinct palettes drawn from the sampled colors", () => {
  const colors = [
    "#F4D3AA",
    "#F8EDE4",
    "#7A402C",
    "#FF6045",
    "#112B2F",
    "#344C12",
    "#46CAD6",
    "#133DD0",
    "#741373",
    "#DEC923",
  ];
  const pixels = colors.flatMap((color, index) => {
    const rgb = [1, 3, 5].map((start) =>
      Number.parseInt(color.slice(start, start + 2), 16),
    );
    return Array.from({ length: 30 - index * 2 }, () => [...rgb, 255]).flat();
  });
  const palettes = extractPalettes(new Uint8ClampedArray(pixels));

  assert.equal(palettes.length, 4);
  assert.equal(palettes[0].colors[0], "#F4D3AA");
  assert.equal(palettes[2].colors[0], "#F8EDE4");
  assert.equal(palettes[3].colors[0], "#112B2F");
  const sets = palettes.map(({ colors: swatches }) => {
    assert.equal(swatches.length, 5);
    assert.equal(new Set(swatches).size, 5);
    assert.ok(swatches.every((color) => colors.includes(color)));
    return [...swatches].sort().join();
  });
  assert.equal(new Set(sets).size, palettes.length);
});

test("transparent pixels and nearly identical colors do not create extra palettes", () => {
  assert.deepEqual(extractPalettes(Uint8ClampedArray.of(255, 0, 0, 0)), []);
  const pixels = Uint8ClampedArray.of(
    255,
    0,
    0,
    0,
    16,
    32,
    48,
    255,
    16,
    32,
    48,
    255,
    17,
    33,
    49,
    255,
  );
  assert.deepEqual(extractPalettes(pixels), [
    { name: "Dominant colors", colors: ["#102030"] },
  ]);
});

test("a limited source can produce smaller accent and tonal palettes", () => {
  const pixels = Uint8ClampedArray.of(
    255,
    255,
    255,
    255,
    0,
    0,
    0,
    255,
    255,
    0,
    0,
    255,
  );
  const palettes = extractPalettes(pixels);
  assert.equal(palettes[0].colors.length, 3);
  assert.ok(palettes.length > 1);
  assert.ok(palettes.slice(1).every(({ colors }) => colors.length === 2));
});
