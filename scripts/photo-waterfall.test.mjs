import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildWaterfall,
  moveWaterfallPhoto,
} from "../packages/lab-photo-waterfall/src/layout.ts";

test("finds an even partition when shortest-column placement leaves gaps", () => {
  const heights = [8, 7, 6, 5, 4];
  const layout = buildWaterfall(
    heights.map((height) => ({ width: 10, height })),
    200,
    2,
  );
  assert.equal(layout.height, 150);
  assert.equal(layout.fillPercent, 0);
  assert.deepEqual(
    layout.tiles.map(({ index }) => index).sort((a, b) => a - b),
    [0, 1, 2, 3, 4],
  );
});

test("uses the full canvas width, stacking uncropped photos without seams", () => {
  const photos = [
    { width: 40, height: 120 },
    { width: 200, height: 60 },
    { width: 20, height: 25 },
    { width: 40, height: 40 },
  ];
  const layout = buildWaterfall(photos, 301, 3);
  const columns = Map.groupBy(layout.tiles, ({ x }) => x);
  let edge = 0;
  let area = 0;
  for (const [x, tiles] of columns) {
    assert.equal(x, edge);
    let y = 0;
    for (const tile of tiles) {
      assert.equal(tile.y, y);
      const photo = photos[tile.index];
      assert.equal(
        tile.height,
        Math.round((tile.width * photo.height) / photo.width),
      );
      assert.equal(tile.width, tiles[0].width);
      y += tile.height;
      area += tile.width * tile.height;
    }
    assert.ok(y <= layout.height);
    edge += tiles[0].width;
  }
  assert.equal(edge, 301);
  assert.equal(layout.width, 301);
  assert.equal(layout.fillPercent, 100 * (1 - area / (301 * layout.height)));
});

test("leaves unused requested columns as background and supports one column", () => {
  const photos = [{ width: 20, height: 10 }];
  const single = buildWaterfall(photos, 300, 1);
  assert.equal(single.height, 150);
  assert.equal(single.fillPercent, 0);

  const three = buildWaterfall(photos, 300, 3);
  assert.deepEqual(three.tiles, [
    { index: 0, x: 0, y: 0, width: 100, height: 50 },
  ]);
  assert.ok(Math.abs(three.fillPercent - 200 / 3) < 0.0001);
});

test("manual moves reorder within columns and can fill an empty column", () => {
  const photos = [90, 30, 50, 80].map((height) => ({ width: 100, height }));
  const initial = buildWaterfall(photos, 300, 3, "bottom", [
    [0, 1, 2],
    [3],
    [],
  ]);
  const reordered = moveWaterfallPhoto(initial, 0, 0, 2);
  assert.deepEqual(reordered, [[1, 0, 2], [3], []]);
  const afterOrder = buildWaterfall(photos, 300, 3, "bottom", reordered);
  const moved = moveWaterfallPhoto(afterOrder, 0, 2, undefined);
  assert.deepEqual(moved, [[1, 2], [3], [0]]);
  const final = buildWaterfall(photos, 300, 3, "bottom", moved);
  assert.deepEqual(
    final.tiles.find(({ index }) => index === 0),
    {
      index: 0,
      x: 200,
      y: 0,
      width: 100,
      height: 90,
    },
  );
});

test("gap placement redistributes the same spare space without resizing photos", () => {
  const photos = [200, 35, 40].map((height) => ({ width: 100, height }));
  for (const [gap, expected] of [
    ["bottom", [0, 35]],
    ["top", [125, 160]],
    ["ends", [62, 97]],
    ["between", [0, 160]],
  ]) {
    const layout = buildWaterfall(photos, 200, 2, gap, [[0], [1, 2]]);
    assert.deepEqual(
      layout.columns[1].tiles.map(({ y }) => y),
      expected,
    );
    assert.deepEqual(
      layout.tiles.map(({ height }) => height),
      [200, 35, 40],
    );
    assert.equal(layout.height, 200);
    assert.equal(layout.fillPercent, 31.25);
  }
  const single = buildWaterfall(photos, 300, 3, "between", [[0], [1], [2]]);
  assert.equal(single.columns[1].tiles[0].y, 82);
});
