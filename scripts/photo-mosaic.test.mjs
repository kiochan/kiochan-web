import assert from "node:assert/strict";
import { test } from "node:test";
import {
  averageColor,
  matchTiles,
  regionColor,
  samplingAxis,
  tintPixels,
} from "../packages/lab-photo-mosaic/src/color-match.ts";
import {
  densityTileCount,
  maxDensity,
  subdivideTile,
} from "../packages/lab-photo-mosaic/src/density.ts";
import {
  edges,
  place,
  repack,
  resizeCanvas,
} from "../packages/lab-photo-mosaic/src/layout.ts";

const size = { width: 3200, height: 1800 };
const noSnap = { width: 0, height: 0 };
const photos = Array.from({ length: 100 }, (_, i) => ({
  id: String(i),
  aspect: 2 ** (((i % 11) - 5) / 2),
}));

function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function assertCoverage(layout, expected, output = size) {
  assert.deepEqual(
    new Set(layout.map(({ id }) => id)),
    new Set(expected.map(({ id }) => id)),
  );
  assert.equal(layout.length, expected.length);
  let area = 0;
  for (const [index, cell] of layout.entries()) {
    const { x, y, width, height } = cell;
    assert.ok([x, y, width, height].every(Number.isInteger));
    assert.ok(width > 0 && height > 0);
    assert.ok(
      x >= 0 &&
        y >= 0 &&
        x + width <= output.width &&
        y + height <= output.height,
    );
    area += width * height;
    for (const other of layout.slice(index + 1)) {
      const overlap =
        x < other.x + other.width &&
        other.x < x + width &&
        y < other.y + other.height &&
        other.y < y + height;
      assert.ok(!overlap, `${cell.id} overlaps ${other.id}`);
    }
  }
  assert.equal(area, output.width * output.height);
}

const find = (layout, id) => layout.find((cell) => cell.id === id);
const grid = Array.from({ length: 20 }, (_, index) => ({
  id: String(index),
  x: (index % 5) * 640,
  y: Math.floor(index / 5) * 450,
  width: 640,
  height: 450,
}));

test("mixed-aspect photos cover every output pixel in landscape and portrait", () => {
  for (const output of [size, { width: 1800, height: 3200 }]) {
    for (const count of [1, 2, 5, 31, 100]) {
      const input = photos.slice(0, count);
      assertCoverage(
        repack([], output, input, new Set(), random(count)),
        input,
        output,
      );
    }
  }
});

test("free drag places a photo at exact new coordinates and reflows around locked photos", () => {
  const input = photos.slice(0, grid.length);
  const dragged = find(grid, "0");
  const locks = new Set(["3", "13", "19"]);
  const next = place(grid, size, input, locks, dragged, 811, 267, noSnap);
  assert.ok(next);
  assert.deepEqual(find(next, "0"), { ...dragged, x: 811, y: 267 });
  assert.ok(!grid.some(({ x, y }) => x === 811 && y === 267));
  for (const id of locks) assert.deepEqual(find(next, id), find(grid, id));
  assertCoverage(next, input);
  assert.equal(place(grid, size, input, locks, dragged, 1920, 0, noSnap), null);
  assert.equal(
    place(grid, size, input, locks, find(grid, "3"), 8, 0, noSnap),
    null,
  );
});

test("a freely positioned photo can be resized and locked at its new geometry", () => {
  const input = photos.slice(0, grid.length);
  const locks = new Set(["3", "13", "19"]);
  const first = place(
    grid,
    size,
    input,
    locks,
    find(grid, "0"),
    811,
    267,
    noSnap,
  );
  const selected = find(first, "0");
  assert.deepEqual(edges(selected, size), ["left", "right", "top", "bottom"]);
  const resized = place(
    first,
    size,
    input,
    locks,
    selected,
    110,
    0,
    noSnap,
    "right",
  );
  assert.deepEqual(find(resized, "0"), { ...selected, width: 750 });
  for (const id of locks) assert.deepEqual(find(resized, id), find(grid, id));
  assertCoverage(resized, input);
  locks.add("0");
  const fewer = input.filter(({ id }) => id !== "1");
  for (const [index, items] of [input, photos, fewer].entries()) {
    const next = repack(resized, size, items, locks, random(12 + index));
    assert.notDeepEqual(next, resized);
    for (const id of locks) assert.deepEqual(find(next, id), find(resized, id));
    assertCoverage(next, items);
  }
});

test("few-photo drag rejects a hole and can snap to a feasible edge", () => {
  const input = photos.slice(0, 2);
  const layout = [
    { id: "0", x: 0, y: 0, width: 1600, height: 1800 },
    { id: "1", x: 1600, y: 0, width: 1600, height: 1800 },
  ];
  assert.equal(
    place(layout, size, input, new Set(), layout[0], 700, 0, noSnap),
    null,
  );
  const next = place(layout, size, input, new Set(), layout[0], 1580, 0, {
    width: 24,
    height: 24,
  });
  assert.deepEqual(find(next, "0"), { ...layout[0], x: 1600 });
  assertCoverage(next, input);
  const locks = new Set(["1"]);
  assert.equal(repack(layout, size, input.slice(1), locks), layout);
});

test("adding into a narrow unlocked strip keeps all photos and the pinned area", () => {
  const layout = [
    { id: "0", x: 0, y: 0, width: 12, height: 1800 },
    { id: "1", x: 12, y: 0, width: 3188, height: 1800 },
  ];
  const next = repack(layout, size, photos, new Set(["1"]), random(7));
  assertCoverage(next, photos);
  assert.deepEqual(find(next, "1"), layout[1]);
});

test("custom output dimensions scale shared edges without gaps", () => {
  const next = { width: 997, height: 611 };
  const input = photos.slice(0, grid.length);
  const resized = resizeCanvas(grid, size, next, input, new Set());
  assertCoverage(resized, input, next);
  assert.deepEqual(find(resized, "1"), {
    id: "1",
    x: 199,
    y: 0,
    width: 200,
    height: 153,
  });
});

test("changing canvas size preserves locked rectangle coordinates", () => {
  const input = photos.slice(0, grid.length);
  const locks = new Set(["1", "7"]);
  const enlarged = { width: 3571, height: 2113 };
  const resized = resizeCanvas(grid, size, enlarged, input, locks);
  assertCoverage(resized, input, enlarged);
  for (const id of locks) assert.deepEqual(find(resized, id), find(grid, id));
  assert.equal(
    resizeCanvas(grid, size, { width: 1300, height: 800 }, input, locks),
    null,
  );

  const crowded = repack([], size, photos, new Set(), random(7));
  assert.equal(
    resizeCanvas(crowded, size, { width: 64, height: 64 }, photos, new Set()),
    null,
  );
});

test("target palette assigns each photo once while preserving locks", () => {
  const strip = Array.from({ length: 4 }, (_, index) => ({
    id: String(index),
    x: index * 64,
    y: 0,
    width: 64,
    height: 64,
  }));
  const target = [8, 0, 15, 0];
  const photos = [0, 10, 15, 8];
  const gray = (value) => [value, value, value];
  const result = matchTiles(
    strip,
    new Set(["3"]),
    ({ x }) => gray(target[x / 64]),
    (id) => gray(photos[Number(id)]),
  );
  assert.deepEqual(
    result.map(({ id }) => id),
    ["1", "0", "2", "3"],
  );
  assert.deepEqual(
    result.map(({ id: _, ...rect }) => rect),
    strip.map(({ id: _, ...rect }) => rect),
  );
  assert.equal(result[3], strip[3]);
  assert.equal(
    matchTiles(
      strip,
      new Set(),
      () => null,
      () => gray(0),
    ),
    strip,
  );
});

test("tone matching follows spatial target colors, retains texture, and preserves alpha", () => {
  const field = {
    width: 4,
    height: 1,
    data: new Uint8ClampedArray([
      210, 30, 15, 255, 210, 30, 15, 255, 20, 50, 210, 0, 20, 50, 210, 255,
    ]),
  };
  const source = new Uint8ClampedArray([
    96, 96, 96, 255, 136, 136, 136, 137, 100, 100, 100, 255, 120, 120, 120, 0,
  ]);
  const rect = { x: 0, y: 0, width: 4, height: 1 };
  const mean = averageColor(source);
  assert.deepEqual(
    regionColor(field, { ...rect, width: 2 }, field),
    [210, 30, 15],
  );
  assert.equal(regionColor(field, { ...rect, x: 2, width: 1 }, field), null);
  const pixels = source.slice();
  const x = samplingAxis(4, 4);
  const y = samplingAxis(1, 1);
  tintPixels(pixels, rect, mean, field, x, y, 0);
  assert.deepEqual(pixels, source);
  tintPixels(pixels, rect, mean, field, x, y, 1, true);
  assert.ok(pixels[0] > 195 && pixels[1] < 40);
  assert.equal(pixels[4] - pixels[0], 12);
  assert.deepEqual([...pixels.subarray(8)], [...source.subarray(8)]);
  assert.deepEqual([pixels[3], pixels[7]], [255, 137]);

  const originalBrightness = source.slice();
  tintPixels(originalBrightness, rect, mean, field, x, y, 1);
  const luma = (bytes, offset) =>
    0.2126 * bytes[offset] +
    0.7152 * bytes[offset + 1] +
    0.0722 * bytes[offset + 2];
  assert.notDeepEqual(originalBrightness, source);
  for (const offset of [0, 4, 8, 12]) {
    assert.ok(
      Math.abs(luma(originalBrightness, offset) - luma(source, offset)) <= 0.5,
    );
    assert.equal(originalBrightness[offset + 3], source[offset + 3]);
  }
});

test("dense subtiles share rounded edges and retain full pixel coverage", () => {
  const output = { width: 641, height: 503 };
  const tile = { ...output, x: 0, y: 0, id: "0" };
  for (const density of [1, 3, 12, maxDensity]) {
    const pieces = subdivideTile(tile, density).map((piece, index) => ({
      ...piece,
      id: String(index),
    }));
    assert.equal(pieces.length, density ** 2);
    assertCoverage(pieces, pieces, output);
  }
  const tiny = { ...tile, x: 641, width: 4, id: "1" };
  assert.equal(subdivideTile(tiny, maxDensity).length, 4 * maxDensity);
  assert.equal(
    densityTileCount([tile, tiny], new Set(["0"]), maxDensity),
    1 + 4 * maxDensity,
  );
});
