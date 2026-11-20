type ImageSize = { width: number; height: number };
type Tile = ImageSize & { index: number; x: number; y: number };
type Column = { x: number; width: number; tiles: Tile[] };

export type GapPlacement = "bottom" | "top" | "ends" | "between";

export type WaterfallLayout = ImageSize & {
  tiles: Tile[];
  columns: Column[];
  fillPercent: number;
};

export function buildWaterfall(
  images: readonly ImageSize[],
  width: number,
  columns: number,
  gap: GapPlacement = "bottom",
  order?: readonly (readonly number[])[],
): WaterfallLayout {
  const idealWidth = width / columns;
  const groups = order ?? balanceColumns(images, idealWidth, columns);

  const geometry = groups.map((indices, column) => {
    // Snap shared edges once to keep an exact canvas width and avoid seams.
    const x = Math.round(column * idealWidth);
    const tileWidth = Math.round((column + 1) * idealWidth) - x;
    const heights = indices.map((index) =>
      Math.max(
        1,
        Math.round((images[index].height / images[index].width) * tileWidth),
      ),
    );
    return {
      x,
      width: tileWidth,
      indices,
      heights,
      height: heights.reduce((sum, height) => sum + height, 0),
    };
  });
  const height = Math.max(...geometry.map((column) => column.height));
  let imageArea = 0;
  const arranged = geometry.map((column) => {
    const extra = height - column.height;
    const slots = column.indices.length - 1;
    const tiles: Tile[] = [];
    let y = 0;
    for (const [position, index] of column.indices.entries()) {
      const tileHeight = column.heights[position];
      let offset = 0;
      if (gap === "top") offset = extra;
      if (gap === "ends" || (gap === "between" && slots === 0)) {
        offset = Math.floor(extra / 2);
      }
      if (gap === "between" && slots > 0) {
        offset = Math.round((extra * position) / slots);
      }
      tiles.push({
        index,
        x: column.x,
        y: y + offset,
        width: column.width,
        height: tileHeight,
      });
      y += tileHeight;
    }
    imageArea += column.width * column.height;
    return { x: column.x, width: column.width, tiles };
  });
  const area = width * height;
  return {
    width,
    height,
    tiles: arranged.flatMap((column) => column.tiles),
    columns: arranged,
    fillPercent: area ? 100 * (1 - imageArea / area) : 0,
  };
}

function balanceColumns(
  images: readonly ImageSize[],
  idealWidth: number,
  columns: number,
) {
  const photos = images.map(({ width, height }, index) => ({
    index,
    height: Math.max(1, Math.round((height / width) * idealWidth)),
  }));
  photos.sort((a, b) => b.height - a.height || a.index - b.index);

  const loads = Array<number>(columns).fill(0);
  const assignment = photos.map(({ height }) => {
    const column = loads.indexOf(Math.min(...loads));
    loads[column] += height;
    return column;
  });

  // With equal widths and no gutters, lowering the tallest column reduces the
  // background area. Start with a greedy solution, then search within a budget.
  let bestHeight = Math.max(...loads);
  const average = loads.reduce((sum, height) => sum + height, 0) / columns;
  const lowerBound = Math.max(photos[0]?.height ?? 0, Math.ceil(average));
  if (photos.length <= 24 && bestHeight > lowerBound) {
    loads.fill(0);
    const candidate: number[] = [];
    let remaining = 16_000;

    function search(depth: number, tallest: number) {
      if (--remaining < 0 || bestHeight === lowerBound) return;
      if (depth === photos.length) {
        bestHeight = tallest;
        assignment.splice(0, assignment.length, ...candidate);
        return;
      }

      const seen = new Set<number>();
      for (let column = 0; column < columns && remaining > 0; column++) {
        const load = loads[column];
        const nextHeight = load + photos[depth].height;
        if (seen.has(load) || nextHeight >= bestHeight) continue;

        seen.add(load);
        candidate[depth] = column;
        loads[column] = nextHeight;
        search(depth + 1, Math.max(tallest, nextHeight));
        loads[column] = load;
      }
    }

    search(0, 0);
  }

  const groups = Array.from({ length: columns }, () => [] as number[]);
  photos.forEach(({ index }, position) => {
    groups[assignment[position]].push(index);
  });

  for (const group of groups) group.sort((a, b) => a - b);
  return groups;
}

export function moveWaterfallPhoto(
  layout: WaterfallLayout,
  index: number,
  destination: number,
  before: number | undefined,
) {
  const groups = layout.columns.map(({ tiles }) =>
    tiles.filter((tile) => tile.index !== index).map((tile) => tile.index),
  );
  const column = groups[destination];
  const position = before === undefined ? -1 : column.indexOf(before);
  column.splice(position < 0 ? column.length : position, 0, index);
  return groups;
}
