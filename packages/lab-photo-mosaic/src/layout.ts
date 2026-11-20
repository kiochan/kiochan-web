export type Size = { width: number; height: number };
export type Rect = Size & { x: number; y: number };
export type Axis = "x" | "y";
export type Photo = { id: string; aspect: number };
export type Cell = Rect & { id: string };
export type Edge = "left" | "right" | "top" | "bottom";

export const photoLimit = 100;
const minimumTileSide = 12;
const right = (rect: Rect) => rect.x + rect.width;
const bottom = (rect: Rect) => rect.y + rect.height;
const area = (rect: Rect) => rect.width * rect.height;
const capacity = (rect: Rect) =>
  Math.floor(rect.width / minimumTileSide) *
  Math.floor(rect.height / minimumTileSide);
const overlaps = (a: Rect, b: Rect) =>
  a.x < right(b) && b.x < right(a) && a.y < bottom(b) && b.y < bottom(a);

function transpose({ x, y, width, height }: Rect): Rect {
  return { x: y, y: x, width: height, height: width };
}

// Scan slabs between obstacle edges and join identical open spans in
// consecutive slabs. Scanning both directions often yields different tilings.
function openRegions(
  size: Size,
  anchors: readonly Rect[],
  turn: boolean,
): Rect[] {
  const { width, height } = turn
    ? { width: size.height, height: size.width }
    : size;
  const obstacles = turn ? anchors.map(transpose) : anchors;
  const lines = [
    ...new Set([
      0,
      width,
      ...obstacles.flatMap((rect) => [rect.x, right(rect)]),
    ]),
  ].sort((a, b) => a - b);
  const regions: Rect[] = [];
  let previous = new Map<string, Rect>();
  for (let index = 1; index < lines.length; index++) {
    const x = lines[index - 1];
    const end = lines[index];
    const occupied = obstacles
      .filter((rect) => rect.x < end && right(rect) > x)
      .sort((a, b) => a.y - b.y);
    const current = new Map<string, Rect>();
    let y = 0;
    function span(limit: number) {
      if (limit <= y) return;
      const key = `${y}:${limit}`;
      let region = previous.get(key);
      if (region) region.width += end - x;
      else {
        region = { x, y, width: end - x, height: limit - y };
        regions.push(region);
      }
      current.set(key, region);
    }
    for (const rect of occupied) {
      span(rect.y);
      y = Math.max(y, bottom(rect));
    }
    span(height);
    previous = current;
  }
  return turn ? regions.map(transpose) : regions;
}

function build(
  photos: readonly Photo[],
  rect: Rect,
  random: () => number,
  result: Cell[],
) {
  if (photos.length === 1) {
    result.push({ ...rect, id: photos[0].id });
    return;
  }
  const preferred =
    random() < rect.width / (rect.width + rect.height) ? "x" : "y";
  const axes: Axis[] = [preferred, preferred === "x" ? "y" : "x"];
  const target = Math.round(photos.length * (0.35 + random() * 0.3));
  const counts = Array.from(
    { length: photos.length - 1 },
    (_, index) => index + 1,
  ).sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
  for (const count of counts) {
    for (const axis of axes) {
      const side = axis === "x" ? "width" : "height";
      const cross = Math.floor(
        rect[axis === "x" ? "height" : "width"] / minimumTileSide,
      );
      const min = Math.ceil(count / cross) * minimumTileSide;
      const max =
        rect[side] -
        Math.ceil((photos.length - count) / cross) * minimumTileSide;
      if (min > max) continue;
      const offset = Math.max(
        min,
        Math.min(max, Math.round((rect[side] * count) / photos.length)),
      );
      build(
        photos.slice(0, count),
        { ...rect, [side]: offset },
        random,
        result,
      );
      build(
        photos.slice(count),
        {
          ...rect,
          [axis]: rect[axis] + offset,
          [side]: rect[side] - offset,
        },
        random,
        result,
      );
      return;
    }
  }
  throw new Error("The photos cannot fit in this region.");
}

function slots(regions: Rect[], count: number) {
  const limits = regions.map(capacity);
  if (
    regions.length > count ||
    limits.some((limit) => limit === 0) ||
    limits.reduce((sum, limit) => sum + limit, 0) < count
  )
    return null;
  const counts = regions.map(() => 1);
  for (let assigned = regions.length; assigned < count; assigned++) {
    let best = -1;
    let space = -1;
    for (const [index, rect] of regions.entries()) {
      const next = area(rect) / (counts[index] + 1);
      if (counts[index] < limits[index] && next > space) {
        best = index;
        space = next;
      }
    }
    counts[best]++;
  }
  return counts;
}

function shuffled(photos: readonly Photo[], random: () => number) {
  const result = [...photos];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function sameRect(a: Rect, b: Rect) {
  return (
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  );
}

function fill(
  size: Size,
  anchors: Cell[],
  remaining: Photo[],
  previous: Cell[],
  random?: () => number,
): Cell[] | null {
  const partitions = [openRegions(size, anchors, false)];
  if (anchors.length) partitions.push(openRegions(size, anchors, true));
  // For an unchanged set of anchors, the current unlocked rectangles already
  // form an exact partition even if neither scan finds a partition as small.
  if (random && previous.length && anchors.length) {
    const fixed = new Set(anchors.map(({ id }) => id));
    partitions.push(previous.filter(({ id }) => !fixed.has(id)));
  }
  const byId = new Map(previous.map((cell) => [cell.id, cell]));
  const aspects = new Map(remaining.map(({ id, aspect }) => [id, aspect]));
  let best: Cell[] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const regions of partitions) {
    const counts = slots(regions, remaining.length);
    if (!counts) continue;
    for (let attempt = 0; attempt < (random ? 6 : 1); attempt++) {
      const order = random ? shuffled(remaining, random) : [...remaining];
      const candidate = [...anchors];
      let offset = 0;
      for (const [index, rect] of regions.entries()) {
        const count = counts[index];
        build(
          order.slice(offset, offset + count),
          rect,
          random ?? (() => 0.5),
          candidate,
        );
        offset += count;
      }
      if (
        random &&
        candidate.length === previous.length &&
        candidate.every((cell) => {
          const original = byId.get(cell.id);
          return original && sameRect(original, cell);
        })
      )
        continue;
      const score = candidate.reduce((sum, cell) => {
        const aspect = aspects.get(cell.id);
        return aspect
          ? sum + Math.abs(Math.log(cell.width / cell.height / aspect))
          : sum;
      }, 0);
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
    // During a gesture, prefer the first valid scan throughout the drag.
    if (best && !random) return best;
  }
  return best;
}

export function repack(
  layout: Cell[],
  size: Size,
  photos: Photo[],
  pinned: ReadonlySet<string>,
  random = Math.random,
): Cell[] {
  if (!photos.length) return [];
  const anchors = layout.filter(({ id }) => pinned.has(id));
  const remaining = photos.filter(({ id }) => !pinned.has(id));
  const result = fill(size, anchors, remaining, layout, random);
  if (result) return result;
  // The same geometry is still a valid reroll if unlocked images exchange
  // assignments. Imports and removals need a partition for the new count.
  const current = new Set(layout.map(({ id }) => id));
  if (
    remaining.length < 2 ||
    layout.length !== photos.length ||
    !photos.every(({ id }) => current.has(id))
  )
    return layout;
  const [a, b] = remaining;
  return layout.map((cell) =>
    cell.id === a.id
      ? { ...cell, id: b.id }
      : cell.id === b.id
        ? { ...cell, id: a.id }
        : cell,
  );
}

export function resizeCanvas(
  layout: Cell[],
  previous: Size,
  next: Size,
  photos: Photo[],
  pinned: ReadonlySet<string>,
): Cell[] | null {
  if (!layout.length) return layout;
  if (!pinned.size) {
    const scaleX = next.width / previous.width;
    const scaleY = next.height / previous.height;
    const scaled = layout.map((cell) => {
      const x = Math.round(cell.x * scaleX);
      const y = Math.round(cell.y * scaleY);
      return {
        id: cell.id,
        x,
        y,
        width: Math.round(right(cell) * scaleX) - x,
        height: Math.round(bottom(cell) * scaleY) - y,
      };
    });
    if (scaled.every((cell) => capacity(cell) > 0)) return scaled;
  }

  const anchors = layout.filter(({ id }) => pinned.has(id));
  if (
    anchors.some(
      (cell) => right(cell) > next.width || bottom(cell) > next.height,
    )
  )
    return null;
  const remaining = photos.filter(({ id }) => !pinned.has(id));
  // The old unlocked rectangles describe a different canvas. Use only the
  // pinned rectangles as obstacles when packing the resized canvas.
  return fill(next, anchors, remaining, []);
}

export function edges(cell: Cell, size: Size): Edge[] {
  const result: Edge[] = [];
  if (cell.x > 0) result.push("left");
  if (right(cell) < size.width) result.push("right");
  if (cell.y > 0) result.push("top");
  if (bottom(cell) < size.height) result.push("bottom");
  return result;
}

export function edgeAxis(edge: Edge): Axis {
  return edge === "left" || edge === "right" ? "x" : "y";
}

export function edgePosition(cell: Cell, edge: Edge) {
  switch (edge) {
    case "left":
      return cell.x;
    case "right":
      return right(cell);
    case "top":
      return cell.y;
    case "bottom":
      return bottom(cell);
  }
}

function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, Math.round(value)));
}

function positions(
  value: number,
  candidates: number[],
  max: number,
  radius: number,
) {
  return [...new Set([value, ...candidates])]
    .filter(
      (candidate) =>
        candidate >= 0 &&
        candidate <= max &&
        Math.abs(candidate - value) <= radius,
    )
    .sort((a, b) => Math.abs(a - value) - Math.abs(b - value))
    .slice(0, 4);
}

export function place(
  layout: Cell[],
  size: Size,
  photos: Photo[],
  pinned: ReadonlySet<string>,
  cell: Cell,
  dx: number,
  dy: number,
  snap: Size,
  edge?: Edge,
): Cell[] | null {
  if (pinned.has(cell.id)) return null;
  const anchors = layout.filter(({ id }) => pinned.has(id));
  const remaining = photos.filter(
    ({ id }) => id !== cell.id && !pinned.has(id),
  );
  function tryRect(target: Cell) {
    if (sameRect(cell, target)) return layout;
    if (anchors.some((anchor) => overlaps(anchor, target))) return null;
    return fill(size, [...anchors, target], remaining, layout);
  }
  const guidesX = [
    0,
    size.width,
    ...anchors.flatMap((anchor) => [anchor.x, right(anchor)]),
  ];
  const guidesY = [
    0,
    size.height,
    ...anchors.flatMap((anchor) => [anchor.y, bottom(anchor)]),
  ];

  if (edge) {
    const axis = edgeAxis(edge);
    const start = edge === "left" || edge === "top";
    const side = axis === "x" ? "width" : "height";
    const stationary = start ? cell[axis] + cell[side] : cell[axis];
    const low = start ? 0 : stationary + minimumTileSide;
    const high = start ? stationary - minimumTileSide : size[side];
    const coordinate = clamp(
      edgePosition(cell, edge) + (axis === "x" ? dx : dy),
      low,
      high,
    );
    const guides = axis === "x" ? guidesX : guidesY;
    for (const position of positions(coordinate, guides, high, snap[side])) {
      if (position < low) continue;
      const result = tryRect({
        ...cell,
        [axis]: Math.min(position, stationary),
        [side]: Math.abs(position - stationary),
      });
      if (result) return result;
    }
    return null;
  }

  const maxX = size.width - cell.width;
  const maxY = size.height - cell.height;
  const x = clamp(cell.x + dx, 0, maxX);
  const y = clamp(cell.y + dy, 0, maxY);
  const xs = positions(
    x,
    guidesX.flatMap((guide) => [guide, guide - cell.width]),
    maxX,
    snap.width,
  );
  const ys = positions(
    y,
    guidesY.flatMap((guide) => [guide, guide - cell.height]),
    maxY,
    snap.height,
  );
  const pairs = xs
    .flatMap((a) => ys.map((b) => ({ x: a, y: b })))
    .sort(
      (a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y),
    );
  for (const position of pairs) {
    const result = tryRect({ ...cell, ...position });
    if (result) return result;
  }
  return null;
}
