export type Size = { width: number; height: number };
export type Rect = Size & { x: number; y: number };
export type Axis = "x" | "y";
export type Photo = { id: string; aspect: number };
export type Cell = Rect & { id: string };
export type Edge = "left" | "right" | "top" | "bottom";
export const cornerEdges = {
  "top-left": ["left", "top"],
  "top-right": ["right", "top"],
  "bottom-left": ["left", "bottom"],
  "bottom-right": ["right", "bottom"],
} as const;
export type Corner = keyof typeof cornerEdges;
export type ResizeHandle = Edge | Corner;

export function isCorner(handle: ResizeHandle): handle is Corner {
  return handle in cornerEdges;
}

export type PhotoFit = "cover" | "maximize" | "contain";
export type PhotoLocks = {
  position: ReadonlySet<string>;
  size: ReadonlySet<string>;
};
type Locks = PhotoLocks | ReadonlySet<string>;

function lockAxes(locks: Locks): PhotoLocks {
  return "position" in locks ? locks : { position: locks, size: locks };
}

export const photoLimit = 100;
export const minimumTileSide = 12;
const right = (rect: Rect) => rect.x + rect.width;
const bottom = (rect: Rect) => rect.y + rect.height;
const area = (size: Size) => size.width * size.height;
const capacity = (rect: Rect) =>
  Math.floor(rect.width / minimumTileSide) *
  Math.floor(rect.height / minimumTileSide);
const overlaps = (a: Rect, b: Rect) =>
  a.x < right(b) && b.x < right(a) && a.y < bottom(b) && b.y < bottom(a);

function fitInsets(side: number, start: number, end: number) {
  const total = start + end;
  if (total < side) return { start, end };
  const scale = (side - 1) / total;
  return { start: Math.floor(start * scale), end: Math.floor(end * scale) };
}

export function photoFrames(layout: Cell[], spacing = 0): Cell[] {
  if (spacing <= 0) return layout;
  const start = Math.floor(spacing / 2);
  const end = spacing - start;
  return layout.map((cell) => {
    let leftInset = 0;
    let rightInset = 0;
    let topInset = 0;
    let bottomInset = 0;
    for (const other of layout) {
      if (cell.y < bottom(other) && other.y < bottom(cell)) {
        if (right(other) === cell.x) leftInset = start;
        if (right(cell) === other.x) rightInset = end;
      }
      if (cell.x < right(other) && other.x < right(cell)) {
        if (bottom(other) === cell.y) topInset = start;
        if (bottom(cell) === other.y) bottomInset = end;
      }
    }
    const x = fitInsets(cell.width, leftInset, rightInset);
    const y = fitInsets(cell.height, topInset, bottomInset);
    return {
      id: cell.id,
      x: cell.x + x.start,
      y: cell.y + y.start,
      width: cell.width - x.start - x.end,
      height: cell.height - y.start - y.end,
    };
  });
}

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

function wholePhotoRegions(
  partition: Rect[],
  count: number,
  availableArea: number,
) {
  const ranked = partition
    .filter((rect) => capacity(rect) > 0)
    .toSorted((a, b) => area(b) - area(a));
  const largest = ranked.slice(0, count);
  const typicalArea = availableArea / count;
  const typicalSide = Math.sqrt(typicalArea);
  const plans = [largest];
  // Narrow spaces beside locks can technically hold a photo, but often make
  // it look like a stray thumbnail. Try leaving those regions open.
  for (const fraction of [0.35, 0.55]) {
    plans.push(
      ranked
        .filter(
          (rect) =>
            Math.min(rect.width, rect.height) >= typicalSide * fraction &&
            area(rect) >= typicalArea * fraction,
        )
        .slice(0, count),
    );
  }
  let space = 0;
  const lastNeeded = largest.findIndex((rect) => {
    space += capacity(rect);
    return space >= count;
  });
  // Compare spreading photos across the available regions with packing them
  // together, which can avoid squeezing a photo into a narrow strip.
  const compactCount = lastNeeded + 1;
  if (compactCount > 0) plans.push(largest.slice(0, compactCount));
  return plans.filter(
    (regions, index) =>
      regions.length > 0 &&
      !plans
        .slice(0, index)
        .some(
          (earlier) =>
            earlier.length === regions.length &&
            earlier.every((rect, slot) => rect === regions[slot]),
        ),
  );
}

function scoreLayout(
  cells: Cell[],
  aspects: Map<string, number>,
  availableArea: number,
  fit: PhotoFit,
) {
  const retained = cells.map((cell) => {
    const ratio = cell.width / cell.height / (aspects.get(cell.id) ?? 1);
    return Math.min(ratio, 1 / ratio);
  });
  const visibleAreas = cells.map((cell, index) => area(cell) * retained[index]);
  const displayedAreas = fit === "contain" ? visibleAreas : cells.map(area);
  const mean =
    displayedAreas.reduce((sum, value) => sum + value, 0) / cells.length;
  const variation =
    displayedAreas.reduce(
      (sum, value) => sum + Math.log2(value / mean) ** 2,
      0,
    ) / cells.length;
  if (fit === "maximize") {
    const cut = retained.reduce((sum, value) => sum + 1 - value, 0);
    return cut / cells.length + 0.05 * variation;
  }
  const visibleTotal = visibleAreas.reduce((sum, value) => sum + value, 0);
  const gaps = 1 - visibleTotal / availableArea;
  if (fit === "contain") {
    const smallest = Math.min(...visibleAreas);
    const tinyPhotoPenalty = Math.max(0, Math.log2(mean / (4 * smallest)));
    return gaps + 0.2 * variation + 0.25 * tinyPhotoPenalty;
  }
  return gaps + variation;
}

function justifiedRows(
  photos: Photo[],
  bounds: Rect,
  turn: boolean,
  rowCount: number,
  sums: number[],
  bestScore: number,
) {
  const totalAspect = sums[photos.length];
  const rows: { end: number; height: number }[] = [];
  let start = 0;
  let fullHeight = 0;
  for (let left = rowCount; left > 0; left--) {
    const limit = photos.length - left + 1;
    const target = sums[start] + (totalAspect - sums[start]) / left;
    let end = start + 1;
    while (
      end < limit &&
      Math.abs(sums[end + 1] - target) < Math.abs(sums[end] - target)
    )
      end++;
    const height = bounds.width / (sums[end] - sums[start]);
    rows.push({ end, height });
    fullHeight += height;
    start = end;
  }
  const scale = Math.min(1, bounds.height / fullHeight);
  const roundedArea =
    Math.ceil(bounds.width * scale + 1) * Math.ceil(fullHeight * scale + 1);
  if (1 - roundedArea / area(bounds) > bestScore) return null;
  const x = bounds.x + (bounds.width * (1 - scale)) / 2;
  let y = bounds.y + (bounds.height - fullHeight * scale) / 2;
  start = 0;
  const cells: Cell[] = [];
  for (const row of rows) {
    const height = row.height * scale;
    const top = Math.round(y);
    const bottom = Math.round(y + height);
    if (bottom - top < minimumTileSide) return null;
    for (let index = start; index < row.end; index++) {
      const left = Math.round(x + (sums[index] - sums[start]) * height);
      const right = Math.round(x + (sums[index + 1] - sums[start]) * height);
      if (right - left < minimumTileSide) return null;
      const cell = {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
      };
      cells.push({ ...(turn ? transpose(cell) : cell), id: photos[index].id });
    }
    y += height;
    start = row.end;
  }
  return cells;
}

function packWholePhotos(
  photos: Photo[],
  rect: Rect,
  aspects: Map<string, number>,
) {
  let best: Cell[] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  // Justified rows and columns use shared edges. Scale the entire group when
  // necessary so the space left over stays outside the photos.
  for (const turn of [false, true]) {
    const bounds = turn ? transpose(rect) : rect;
    const sums = [0];
    for (const photo of photos) {
      sums.push(
        sums[sums.length - 1] + (turn ? 1 / photo.aspect : photo.aspect),
      );
    }
    const limit = Math.min(
      photos.length,
      Math.floor(bounds.height / minimumTileSide),
    );
    for (let rows = 1; rows <= limit; rows++) {
      const cells = justifiedRows(photos, bounds, turn, rows, sums, bestScore);
      if (!cells) continue;
      const score = scoreLayout(cells, aspects, area(rect), "contain");
      if (score < bestScore) {
        best = cells;
        bestScore = score;
      }
    }
  }
  return best;
}

function fill(
  size: Size,
  anchors: Cell[],
  remaining: Photo[],
  previous: Cell[],
  random?: () => number,
  fit: PhotoFit = "cover",
): Cell[] | null {
  const availableArea =
    area(size) - anchors.reduce((sum, cell) => sum + area(cell), 0);
  if (!remaining.length)
    return fit === "contain" || availableArea === 0 ? anchors : null;
  const partitions = [openRegions(size, anchors, false)];
  if (anchors.length) partitions.push(openRegions(size, anchors, true));
  const fixed = new Set(anchors.map(({ id }) => id));
  const previousFree = previous.filter(({ id }) => !fixed.has(id));
  const previousFillsSpace =
    previousFree.reduce((sum, cell) => sum + area(cell), 0) === availableArea;
  // For an unchanged set of anchors, the current unlocked rectangles already
  // form an exact partition even if neither scan finds a partition as small.
  if (
    random &&
    previous.length &&
    anchors.length &&
    (fit === "contain" || previousFillsSpace)
  )
    partitions.push(previousFree);
  const byId = new Map(previous.map((cell) => [cell.id, cell]));
  const aspects = new Map(remaining.map(({ id, aspect }) => [id, aspect]));
  const byAspect =
    fit === "contain" || (fit === "maximize" && random)
      ? remaining.toSorted((a, b) => a.aspect - b.aspect)
      : undefined;
  const best: { cells: Cell[] | null; score: number } = {
    cells: null,
    score: Number.POSITIVE_INFINITY,
  };
  function matchesPrevious(cells: Cell[]) {
    return (
      cells.length === previous.length &&
      cells.every((cell) => {
        const before = byId.get(cell.id);
        return before && sameRect(before, cell);
      })
    );
  }
  function consider(candidate: Cell[]) {
    const score = scoreLayout(
      candidate.slice(anchors.length),
      aspects,
      availableArea,
      fit,
    );
    if (score > best.score) return;
    if (
      score === best.score &&
      (!random ||
        fit !== "contain" ||
        !best.cells ||
        !matchesPrevious(best.cells) ||
        matchesPrevious(candidate))
    )
      return;
    best.cells = candidate;
    best.score = score;
  }
  if (
    fit === "maximize" &&
    byAspect &&
    previousFillsSpace &&
    previousFree.length === remaining.length &&
    previousFree.every(({ id }) => aspects.has(id))
  ) {
    consider([...anchors, ...previousFree]);
  }
  const candidates =
    fit === "contain"
      ? partitions.flatMap((partition) =>
          wholePhotoRegions(partition, remaining.length, availableArea),
        )
      : partitions;
  for (const regions of candidates) {
    const counts = slots(regions, remaining.length);
    if (!counts) continue;
    const attempts =
      fit === "contain" ? (random ? 4 : 2) : random ? (byAspect ? 18 : 6) : 1;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const order =
        fit === "contain" && attempt === 0 && byAspect
          ? byAspect
          : random
            ? shuffled(remaining, random)
            : remaining;
      const candidate = [...anchors];
      let offset = 0;
      for (const [index, rect] of regions.entries()) {
        const count = counts[index];
        const photos = order.slice(offset, offset + count);
        const whole =
          fit === "contain" ? packWholePhotos(photos, rect, aspects) : null;
        if (whole) candidate.push(...whole);
        else build(photos, rect, random ?? (() => 0.5), candidate);
        offset += count;
      }
      if (random && !byAspect && matchesPrevious(candidate)) continue;
      consider(candidate);
      if (fit === "maximize" && byAspect) {
        const ordered = candidate
          .slice(anchors.length)
          .sort((a, b) => a.width / a.height - b.width / b.height);
        consider([
          ...anchors,
          ...ordered.map((rect, index) => ({
            ...rect,
            id: byAspect[index].id,
          })),
        ]);
      }
    }
    // During a gesture, prefer the first valid scan throughout the drag.
    if (best.cells && !random && fit === "cover") return best.cells;
  }
  return best.cells && matchesPrevious(best.cells) ? previous : best.cells;
}

function placeSizedTile(
  cell: Cell,
  size: Size,
  anchors: Cell[],
  plan: number,
): Cell | undefined {
  if (cell.width > size.width || cell.height > size.height) return;
  const previous = {
    ...cell,
    x: Math.min(cell.x, size.width - cell.width),
    y: Math.min(cell.y, size.height - cell.height),
  };
  const fits = (rect: Cell) =>
    anchors.every((anchor) => !overlaps(rect, anchor));
  if (!plan && fits(previous)) return previous;
  const regions = [
    ...openRegions(size, anchors, false),
    ...openRegions(size, anchors, true),
  ];
  const options = regions.flatMap((rect) => {
    if (rect.width < cell.width || rect.height < cell.height) return [];
    const x = right(rect) - cell.width;
    const y = bottom(rect) - cell.height;
    return [
      { ...cell, x: rect.x, y: rect.y },
      { ...cell, x, y: rect.y },
      { ...cell, x: rect.x, y },
      { ...cell, x, y },
    ];
  });
  if (fits(previous)) options.push(previous);
  function rank(rect: Cell) {
    switch (plan % 4) {
      case 1:
        return rect.y * size.width + rect.x;
      case 2:
        return -rect.y * size.width - rect.x;
      case 3:
        return rect.x * size.height - rect.y;
      default:
        return Math.hypot(rect.x - cell.x, rect.y - cell.y);
    }
  }
  return options.sort((a, b) => rank(a) - rank(b))[0];
}

function placePositionedTile(
  cell: Cell,
  size: Size,
  obstacles: Cell[],
  plan: number,
  targetArea: number,
) {
  const remainingWidth = size.width - cell.x;
  const remainingHeight = size.height - cell.y;
  const ratio = cell.width / cell.height;
  const widthHint =
    plan === 2 ? Math.round(Math.sqrt(targetArea * ratio)) : cell.width;
  const heightHint =
    plan === 2 ? Math.round(Math.sqrt(targetArea / ratio)) : cell.height;
  let width = Math.min(
    remainingWidth,
    plan === 3 ? remainingWidth : Math.max(minimumTileSide, widthHint),
  );
  let height = Math.min(
    remainingHeight,
    plan === 3 ? remainingHeight : Math.max(minimumTileSide, heightHint),
  );
  for (const obstacle of obstacles) {
    if (!overlaps({ ...cell, width, height }, obstacle)) continue;
    const left = obstacle.x - cell.x;
    const above = obstacle.y - cell.y;
    if (
      left >= minimumTileSide &&
      (above < minimumTileSide ||
        (plan === 2
          ? left / width < above / height
          : left / width >= above / height))
    ) {
      width = left;
    } else if (above >= minimumTileSide) {
      height = above;
    } else return;
  }
  if (width >= minimumTileSide && height >= minimumTileSide)
    return { ...cell, width, height };
}

function fillWithLocks(
  size: Size,
  layout: Cell[],
  photos: Photo[],
  locks: PhotoLocks,
  fit: PhotoFit,
  random?: () => number,
  target?: Cell,
) {
  const ids = new Set(photos.map(({ id }) => id));
  const constrained = layout.filter(
    ({ id }) =>
      id !== target?.id &&
      ids.has(id) &&
      (locks.position.has(id) || locks.size.has(id)),
  );
  const fixed = constrained.filter(
    ({ id }) => locks.position.has(id) && locks.size.has(id),
  );
  if (target) fixed.push(target);
  if (
    fixed.some(
      (cell, index) =>
        right(cell) > size.width ||
        bottom(cell) > size.height ||
        fixed.slice(0, index).some((other) => overlaps(cell, other)),
    )
  )
    return null;
  const fixedIds = new Set(fixed.map(({ id }) => id));
  const partial = constrained.filter(({ id }) => !fixedIds.has(id));
  const constrainedIds = new Set(constrained.map(({ id }) => id));
  const remaining = photos.filter(
    ({ id }) => id !== target?.id && !constrainedIds.has(id),
  );
  if (!partial.length) {
    const previous =
      !target && fixed.every((cell) => layout.includes(cell)) ? layout : [];
    return fill(size, fixed, remaining, previous, random, fit);
  }
  const positioned = partial.filter(({ id }) => locks.position.has(id));
  const sized = partial
    .filter(({ id }) => locks.size.has(id))
    .sort((a, b) => area(b) - area(a));
  const before = new Map(layout.map((cell) => [cell.id, cell]));
  const targetArea =
    (area(size) - fixed.reduce((sum, cell) => sum + area(cell), 0)) /
    (partial.length + remaining.length);
  let fallback: Cell[] | null = null;
  for (const plan of random ? [1, 2, 3, 0] : [0, 1, 2, 3]) {
    const anchors = [...fixed];
    for (const cell of positioned) {
      const obstacles = [
        ...anchors,
        ...positioned
          .filter((other) => other !== cell)
          .map((other) => ({
            ...other,
            width: minimumTileSide,
            height: minimumTileSide,
          })),
      ];
      const rect = placePositionedTile(cell, size, obstacles, plan, targetArea);
      if (rect) anchors.push(rect);
    }
    if (anchors.length !== fixed.length + positioned.length) continue;
    for (const cell of sized) {
      const rect = placeSizedTile(cell, size, anchors, plan);
      if (rect) anchors.push(rect);
    }
    if (anchors.length !== fixed.length + partial.length) continue;
    const unchanged = anchors.every((cell) => {
      const old = before.get(cell.id);
      return old && sameRect(cell, old);
    });
    const result = fill(
      size,
      anchors,
      remaining,
      unchanged ? layout : [],
      random,
      fit,
    );
    if (!result) continue;
    if (!random || !unchanged) return result;
    fallback = result;
  }
  return fallback;
}

export function repack(
  layout: Cell[],
  size: Size,
  photos: Photo[],
  pinned: Locks,
  random = Math.random,
  fit: PhotoFit = "cover",
): Cell[] {
  if (!photos.length) return [];
  const locks = lockAxes(pinned);
  const remaining = photos.filter(
    ({ id }) => !locks.position.has(id) && !locks.size.has(id),
  );
  const result = fillWithLocks(size, layout, photos, locks, fit, random);
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
  pinned: Locks,
  fit: PhotoFit = "cover",
): Cell[] | null {
  if (!layout.length) return layout;
  const locks = lockAxes(pinned);
  if (!locks.position.size && !locks.size.size && fit !== "contain") {
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
    if (scaled.every((cell) => capacity(cell) > 0)) {
      return fit === "maximize"
        ? repack(scaled, next, photos, pinned, undefined, fit)
        : scaled;
    }
  }

  return fillWithLocks(next, layout, photos, locks, fit);
}

export function edges(cell: Cell, size: Size, fit: PhotoFit = "cover"): Edge[] {
  if (fit === "contain") return ["left", "right", "top", "bottom"];
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

function fitAroundTile(
  size: Size,
  layout: Cell[],
  cell: Cell,
  target: Cell,
  photos: Photo[],
  locks: PhotoLocks,
  fit: PhotoFit,
) {
  if (sameRect(cell, target)) return layout;
  return fillWithLocks(size, layout, photos, locks, fit, undefined, target);
}

export function resizeTile(
  layout: Cell[],
  size: Size,
  photos: Photo[],
  pinned: Locks,
  cell: Cell,
  dimensions: Size,
  fit: PhotoFit = "cover",
): Cell[] | null {
  const { width, height } = dimensions;
  const locks = lockAxes(pinned);
  if (
    locks.size.has(cell.id) ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < minimumTileSide ||
    height < minimumTileSide ||
    cell.x + width > size.width ||
    cell.y + height > size.height
  )
    return null;
  return fitAroundTile(
    size,
    layout,
    cell,
    { ...cell, ...dimensions },
    photos,
    locks,
    fit,
  );
}

export function place(
  layout: Cell[],
  size: Size,
  photos: Photo[],
  pinned: Locks,
  cell: Cell,
  dx: number,
  dy: number,
  snap: Size,
  edge?: ResizeHandle,
  fit: PhotoFit = "cover",
): Cell[] | null {
  const locks = lockAxes(pinned);
  if (
    edge
      ? locks.size.has(cell.id) ||
        (locks.position.has(cell.id) &&
          edge !== "right" &&
          edge !== "bottom" &&
          edge !== "bottom-right")
      : locks.position.has(cell.id)
  )
    return null;
  const anchors = layout.filter(
    ({ id }) => id !== cell.id && locks.position.has(id),
  );
  function tryRect(target: Cell) {
    return fitAroundTile(size, layout, cell, target, photos, locks, fit);
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

  if (edge && isCorner(edge)) {
    const [horizontal, vertical] = cornerEdges[edge];
    const sx = horizontal === "left" ? -1 : 1;
    const sy = vertical === "top" ? -1 : 1;
    const anchorX = sx < 0 ? right(cell) : cell.x;
    const anchorY = sy < 0 ? bottom(cell) : cell.y;
    const maxWidth = sx < 0 ? anchorX : size.width - anchorX;
    const maxHeight = sy < 0 ? anchorY : size.height - anchorY;
    const minScale = minimumTileSide / Math.min(cell.width, cell.height);
    const maxScale = Math.min(maxWidth / cell.width, maxHeight / cell.height);
    // Project the pointer delta onto the diagonal so both axes share one scale.
    const scale = Math.max(
      minScale,
      Math.min(
        maxScale,
        1 +
          (dx * sx * cell.width + dy * sy * cell.height) /
            (cell.width ** 2 + cell.height ** 2),
      ),
    );
    const scales = [scale];
    for (const guide of guidesX) {
      const candidate = (sx * (guide - anchorX)) / cell.width;
      if (Math.abs(candidate - scale) * cell.width <= snap.width)
        scales.push(candidate);
    }
    for (const guide of guidesY) {
      const candidate = (sy * (guide - anchorY)) / cell.height;
      if (Math.abs(candidate - scale) * cell.height <= snap.height)
        scales.push(candidate);
    }
    for (const candidate of [...new Set(scales)].sort(
      (a, b) => Math.abs(a - scale) - Math.abs(b - scale),
    )) {
      if (candidate < minScale || candidate > maxScale) continue;
      const width = Math.round(cell.width * candidate);
      const height = Math.round(cell.height * candidate);
      const result = tryRect({
        ...cell,
        x: sx < 0 ? anchorX - width : anchorX,
        y: sy < 0 ? anchorY - height : anchorY,
        width,
        height,
      });
      if (result) return result;
    }
    return null;
  }

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
