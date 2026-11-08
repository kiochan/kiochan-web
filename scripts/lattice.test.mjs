import assert from "node:assert/strict";
import test from "node:test";
import {
  generatePalette,
  HARMONIES,
} from "../packages/lab-lattice/src/palette.ts";
import {
  PATTERN_LAYERS,
  patternGeometry,
  patternSvg,
} from "../packages/lab-lattice/src/pattern.ts";

const options = {
  repeat: 73,
  stripe: 18,
  cross: true,
  colors: ["#e0ddd4", "#486768", "#202020"],
};

test("square exports always contain whole repeat periods on both axes", () => {
  for (let repeat = 24; repeat <= 160; repeat++) {
    for (const tiles of [1, 4, 8, 16]) {
      const extent = repeat * tiles;
      const svg = patternSvg({ ...options, repeat }, { tiles });
      assert.ok(svg.includes(`viewBox="0 0 ${extent} ${extent}"`));
      assert.ok(svg.includes(`width="${extent}" height="${extent}"`));
      assert.equal(extent % repeat, 0);
    }
  }
  for (const value of [NaN, Infinity, -Infinity, -100, 10000]) {
    const geometry = patternGeometry(value, value, value);
    assert.ok(Number.isFinite(geometry.extent));
    assert.ok(geometry.band >= 2 && geometry.band <= geometry.size / 2);
  }
});

test("individual transparent layers preserve the composite geometry and stacking order", () => {
  const full = patternSvg(options);
  let previous = -1;
  for (const { id } of PATTERN_LAYERS) {
    const index = full.indexOf(`<g id="${id}"`);
    assert.ok(index > previous);
    previous = index;
    const single = patternSvg(options, { layer: id });
    assert.equal((single.match(/<g /g) ?? []).length, 1);
    const definition = full.match(
      new RegExp(`<pattern id="tile-${id}".*?</pattern>`),
    )[0];
    assert.ok(single.includes(definition));
    if (id !== "base") assert.ok(!single.includes(options.colors[0]));
    assert.ok(
      single.includes(
        `inkscape:label="${PATTERN_LAYERS.find((item) => item.id === id).label}"`,
      ),
    );
  }
  const noCross = patternSvg({ ...options, cross: false });
  assert.ok(!noCross.includes('id="horizontal"'));
  assert.ok(
    !patternSvg({ ...options, cross: false }, { layer: "horizontal" }).includes(
      "<g ",
    ),
  );
});

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((c) => {
      const value = parseInt(c, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

test("algorithmic palettes are reproducible, varied, and tonally separated", () => {
  for (const harmony of HARMONIES) {
    const palettes = new Set();
    for (let seed = 0; seed < 500; seed++) {
      const colors = generatePalette(seed, harmony);
      assert.deepEqual(colors, generatePalette(seed, harmony));
      assert.ok(colors.every((c) => /^#[0-9a-f]{6}$/.test(c)));
      assert.equal(new Set(colors).size, 3);
      const [base, stripe, line] = colors.map(luminance);
      assert.ok(Math.abs(base - stripe) > 0.12);
      assert.ok(
        (Math.max(base, line) + 0.05) / (Math.min(base, line) + 0.05) > 7,
      );
      palettes.add(colors.join(","));
    }
    assert.ok(palettes.size > 490);
  }
  assert.equal(
    new Set(HARMONIES.map((h) => generatePalette(42, h).join(","))).size,
    4,
  );
});
