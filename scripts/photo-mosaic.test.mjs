import assert from "node:assert/strict";
import { test } from "node:test";
import {
  edges,
  photoFrames,
  place,
  repack,
  resizeCanvas,
  resizeTile,
} from "../packages/lab-photo-mosaic/src/layout.ts";
import { exportBackground } from "../packages/lab-photo-mosaic/src/render-request.ts";

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

function assertCoverage(
  layout,
  expected,
  output = size,
  requireFullCoverage = true,
) {
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
  if (requireFullCoverage) assert.equal(area, output.width * output.height);
  else assert.ok(area <= output.width * output.height);
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

test("whole-photo mode resizes a tile beside a lock even with too few photos to fill every region", () => {
  const canvas = { width: 600, height: 400 };
  const locked = { id: "0", x: 0, y: 0, width: 100, height: 400 };
  const selected = { id: "1", x: 100, y: 0, width: 500, height: 400 };
  const current = [locked, selected];
  const input = current.map(({ id }) => ({ id, aspect: 1 }));
  const pins = new Set([locked.id]);
  const dimensions = { width: 240, height: 170 };
  assert.equal(
    resizeTile(current, canvas, input, pins, selected, dimensions),
    null,
  );
  const resized = resizeTile(
    current,
    canvas,
    input,
    pins,
    selected,
    dimensions,
    "contain",
  );
  assert.deepEqual(resized, [locked, { ...selected, ...dimensions }]);

  const allPinned = new Set(input.map(({ id }) => id));
  const added = [...input, { id: "new", aspect: 1 }];
  const reflowed = repack(
    resized,
    canvas,
    added,
    allPinned,
    random(8),
    "contain",
  );
  assert.deepEqual(reflowed.slice(0, 2), resized);
  const extra = find(reflowed, "new");
  assert.ok(
    extra.x >= selected.x + dimensions.width || extra.y >= dimensions.height,
  );
});

test("whole-photo reflow preserves multiple locks and keeps the remaining square photos similar in size", () => {
  const canvas = { width: 600, height: 400 };
  const anchors = [
    { id: "left", x: 0, y: 0, width: 100, height: 400 },
    { id: "right", x: 500, y: 0, width: 100, height: 400 },
  ];
  const input = [...anchors, ...photos.slice(0, 4)].map(({ id }) => ({
    id,
    aspect: 1,
  }));
  const pins = new Set(anchors.map(({ id }) => id));
  const result = repack(anchors, canvas, input, pins, random(7), "contain");
  assert.deepEqual(result.slice(0, 2), anchors);
  assertCoverage(result, input, canvas);
  const visibleSides = result
    .slice(2)
    .map(({ width, height }) => Math.min(width, height));
  assert.ok(Math.max(...visibleSides) <= 1.25 * Math.min(...visibleSides));
});

test("whole photos can share a wide open region instead of squeezing into uneven gaps", () => {
  const canvas = { width: 640, height: 480 };
  const anchors = [
    { id: "wide", x: 0, y: 0, width: 240, height: 270 },
    { id: "small", x: 0, y: 270, width: 90, height: 90 },
  ];
  const input = [...anchors, ...photos.slice(0, 2)].map(({ id }) => ({
    id,
    aspect: 1,
  }));
  const pins = new Set(anchors.map(({ id }) => id));
  const result = repack(anchors, canvas, input, pins, random(7), "contain");
  assert.deepEqual(result.slice(0, 2), anchors);
  const visibleSides = result
    .slice(2)
    .map(({ width, height }) => Math.min(width, height));
  assert.equal(visibleSides.length, 2);
  assert.ok(Math.max(...visibleSides) <= 1.25 * Math.min(...visibleSides));
  assert.ok(Math.min(...visibleSides) >= 160);
});

test("whole-photo packing tiles mixed aspect ratios without gaps between the photos", () => {
  const canvas = { width: 600, height: 400 };
  const input = [
    { id: "wide-one", aspect: 2 },
    { id: "portrait", aspect: 0.5 },
    { id: "wide-two", aspect: 2 },
  ];
  const pins = new Set();
  const result = repack([], canvas, input, pins, random(7), "contain");
  assertCoverage(result, input, canvas);
  assert.equal(find(result, "portrait").height, 400);
  assert.equal(find(result, "wide-one").height, 200);

  const square = { width: 500, height: 500 };
  const resized = resizeCanvas(result, canvas, square, input, pins, "contain");
  assert.ok(resized);
  const left = Math.min(...resized.map(({ x }) => x));
  const top = Math.min(...resized.map(({ y }) => y));
  const right = Math.max(...resized.map(({ x, width }) => x + width));
  const bottom = Math.max(...resized.map(({ y, height }) => y + height));
  assert.ok(
    left >= 0 && top >= 0 && right <= square.width && bottom <= square.height,
  );
  assertCoverage(
    resized.map(({ x, y, ...tile }) => ({ ...tile, x: x - left, y: y - top })),
    input,
    { width: right - left, height: bottom - top },
  );
  for (const { id, aspect } of input) {
    const { width, height } = find(resized, id);
    assert.ok(Math.abs(width - aspect * height) <= 2);
  }
});

test("whole-photo packing avoids tiny isolated photos in narrow strips by multiple locks", () => {
  const canvas = { width: 1366, height: 1364 };
  const locked = [
    { id: "poster", x: 302, y: 28, width: 536, height: 824 },
    { id: "card", x: 1072, y: 122, width: 160, height: 158 },
  ];
  const aspects = [2 / 3, 3 / 4, 4 / 5, 1, 16 / 9, 1.42, 0.72, 1.18, 0.6, 0.85];
  const input = [
    ...locked.map(({ id, width, height }) => ({ id, aspect: width / height })),
    ...Array.from({ length: 44 }, (_, index) => ({
      id: `photo-${index}`,
      aspect: aspects[index % aspects.length],
    })),
  ];
  const locks = new Set(locked.map(({ id }) => id));
  const result = repack(locked, canvas, input, locks, random(19), "contain");
  assert.deepEqual(result.slice(0, locked.length), locked);
  assertCoverage(result, input, canvas, false);

  const adjustable = result.slice(locked.length);
  const areas = adjustable.map(({ width, height }) => width * height);
  const covered = areas.reduce((sum, value) => sum + value, 0);
  const available =
    canvas.width * canvas.height -
    locked.reduce((sum, { width, height }) => sum + width * height, 0);
  assert.ok(Math.min(...areas) >= (0.35 * covered) / adjustable.length);
  assert.ok(covered >= 0.85 * available);
});

test("maximum retention reflows unlocked photos to crop less while still covering the canvas", () => {
  const canvas = { width: 800, height: 400 };
  const locked = { id: "left", x: 0, y: 0, width: 200, height: 400 };
  const input = [
    { id: "left", aspect: 0.5 },
    { id: "one", aspect: 3 },
    { id: "two", aspect: 3 },
  ];
  const layout = [
    locked,
    { id: "one", x: 200, y: 0, width: 300, height: 400 },
    { id: "two", x: 500, y: 0, width: 300, height: 400 },
  ];
  const pins = new Set([locked.id]);
  const result = repack(layout, canvas, input, pins, random(7), "maximize");
  assert.equal(result[0], locked);
  assertCoverage(result, input, canvas);
  assert.ok(result.slice(1).every(({ width, height }) => width / height === 3));
  assert.equal(
    repack(result, canvas, input, pins, random(8), "maximize"),
    result,
  );
});

test("blank areas use the selected color in all formats and JPG flattens transparency to white", () => {
  for (const format of ["png", "webp", "jpg"]) {
    assert.equal(exportBackground(format, "#3256ab"), "#3256ab");
  }
  assert.equal(exportBackground("png", null), null);
  assert.equal(exportBackground("webp", null), null);
  assert.equal(exportBackground("jpg", null), "#ffffff");
});

test("photo spacing defaults to zero and opens only shared edges", () => {
  const tiles = [
    { id: "left", x: 0, y: 0, width: 50, height: 100 },
    { id: "top", x: 50, y: 0, width: 50, height: 60 },
    { id: "bottom", x: 50, y: 60, width: 50, height: 40 },
    { id: "isolated", x: 110, y: 0, width: 30, height: 100 },
  ];
  assert.equal(photoFrames(tiles), tiles);
  assert.deepEqual(photoFrames(tiles, 7), [
    { ...tiles[0], width: 46 },
    { ...tiles[1], x: 53, width: 47, height: 56 },
    { ...tiles[2], x: 53, y: 63, width: 47, height: 37 },
    tiles[3],
  ]);
  assert.equal(tiles[0].width, 50);
  assert.ok(
    photoFrames(tiles, 200).every(
      ({ width, height }) => width > 0 && height > 0,
    ),
  );
});

test("a size lock permits moving and rearranging without changing dimensions", () => {
  const canvas = { width: 600, height: 400 };
  const first = { id: "first", x: 0, y: 0, width: 300, height: 400 };
  const layout = [first, { ...first, id: "second", x: 300 }];
  const input = layout.map(({ id }) => ({ id, aspect: 0.75 }));
  const locks = { position: new Set(), size: new Set([first.id]) };
  const moved = place(layout, canvas, input, locks, first, 300, 0, noSnap);
  assertCoverage(moved, input, canvas);
  assert.deepEqual(find(moved, first.id), { ...first, x: 300 });
  assert.equal(
    resizeTile(layout, canvas, input, locks, first, {
      width: 200,
      height: 400,
    }),
    null,
  );
  assert.equal(
    place(layout, canvas, input, locks, first, -40, 0, noSnap, "right"),
    null,
  );

  const rearranged = repack(layout, canvas, input, locks, random(14));
  assertCoverage(rearranged, input, canvas);
  assert.deepEqual(find(rearranged, first.id), { ...first, x: 300 });
});

test("a position lock permits resizing while the top-left corner stays fixed", () => {
  const canvas = { width: 600, height: 400 };
  const first = { id: "first", x: 0, y: 0, width: 300, height: 400 };
  const layout = [first, { ...first, id: "second", x: 300 }];
  const input = layout.map(({ id }) => ({ id, aspect: 0.75 }));
  const locks = { position: new Set([first.id]), size: new Set() };
  assert.equal(
    place(layout, canvas, input, locks, first, 300, 0, noSnap),
    null,
  );
  const dimensions = { width: 240, height: 400 };
  const resized = resizeTile(layout, canvas, input, locks, first, dimensions);
  assertCoverage(resized, input, canvas);
  assert.deepEqual(find(resized, first.id), { ...first, ...dimensions });
  assert.deepEqual(
    find(
      place(layout, canvas, input, locks, first, -60, 0, noSnap, "right"),
      first.id,
    ),
    { ...first, ...dimensions },
  );

  const shorter = { width: 600, height: 300 };
  const adapted = resizeCanvas(layout, canvas, shorter, input, locks);
  assertCoverage(adapted, input, shorter);
  assert.deepEqual(find(adapted, first.id), { ...first, height: 300 });
});

test("a movable size-locked tile reflows a position-locked neighbor without moving its origin", () => {
  const canvas = { width: 600, height: 400 };
  const moving = { id: "moving", x: 0, y: 0, width: 120, height: 180 };
  const positioned = {
    id: "positioned",
    x: 120,
    y: 0,
    width: 240,
    height: 180,
  };
  const layout = [moving, positioned];
  const input = layout.map(({ id }) => ({ id, aspect: 1 }));
  const locks = {
    position: new Set([positioned.id]),
    size: new Set([moving.id]),
  };
  const result = place(
    layout,
    canvas,
    input,
    locks,
    moving,
    240,
    0,
    noSnap,
    undefined,
    "contain",
  );
  assertCoverage(result, input, canvas, false);
  assert.deepEqual(find(result, moving.id), { ...moving, x: 240 });
  assert.deepEqual(find(result, positioned.id), { ...positioned, width: 120 });
});

test("corner handles scale both dimensions around the opposite corner", () => {
  const canvas = { width: 600, height: 400 };
  const tile = { id: "photo", x: 160, y: 120, width: 200, height: 100 };
  const input = [{ id: tile.id, aspect: 2 }];
  for (const [handle, dx, dy, x, y] of [
    ["top-left", -100, -50, 60, 70],
    ["top-right", 100, -50, 160, 70],
    ["bottom-left", -100, 50, 60, 120],
    ["bottom-right", 100, 50, 160, 120],
  ]) {
    const result = place(
      [tile],
      canvas,
      input,
      new Set(),
      tile,
      dx,
      dy,
      noSnap,
      handle,
      "contain",
    );
    assert.deepEqual(result, [{ ...tile, x, y, width: 300, height: 150 }]);
  }
});

test("proportional scaling respects position and size locks and canvas limits", () => {
  const canvas = { width: 600, height: 400 };
  const tile = { id: "photo", x: 160, y: 120, width: 200, height: 100 };
  const input = [{ id: tile.id, aspect: 2 }];
  const moveCorner = (handle, locks) =>
    place(
      [tile],
      canvas,
      input,
      locks,
      tile,
      2000,
      1000,
      noSnap,
      handle,
      "contain",
    );
  const position = { position: new Set([tile.id]), size: new Set() };
  assert.equal(moveCorner("top-right", position), null);
  assert.deepEqual(moveCorner("bottom-right", position), [
    { ...tile, width: 440, height: 220 },
  ]);
  assert.equal(
    moveCorner("bottom-right", {
      position: new Set(),
      size: new Set([tile.id]),
    }),
    null,
  );
});

test("corner scaling reflows neighboring photos in the filled-canvas mode", () => {
  const canvas = { width: 600, height: 400 };
  const tile = { id: "photo", x: 0, y: 0, width: 300, height: 200 };
  const layout = [
    tile,
    { id: "right", x: 300, y: 0, width: 300, height: 400 },
    { id: "bottom", x: 0, y: 200, width: 300, height: 200 },
  ];
  const input = layout.map(({ id, width, height }) => ({
    id,
    aspect: width / height,
  }));
  const result = place(
    layout,
    canvas,
    input,
    new Set(),
    tile,
    60,
    40,
    noSnap,
    "bottom-right",
  );
  assertCoverage(result, input, canvas);
  assert.deepEqual(find(result, tile.id), { ...tile, width: 360, height: 240 });
});
