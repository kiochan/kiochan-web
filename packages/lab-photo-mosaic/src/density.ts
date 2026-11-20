import type { Cell } from "./layout";

export const maxDensity = 32;

export function densityTileCount(
  layout: readonly Cell[],
  pinned: ReadonlySet<string>,
  density: number,
) {
  return layout.reduce(
    (total, cell) =>
      total +
      (pinned.has(cell.id)
        ? 1
        : Math.min(density, cell.width) * Math.min(density, cell.height)),
    0,
  );
}

export function subdivideTile(cell: Cell, density: number): Cell[] {
  const columns = Math.min(density, cell.width);
  const rows = Math.min(density, cell.height);
  const tiles: Cell[] = [];
  for (let row = 0; row < rows; row++) {
    const y = cell.y + Math.round((row * cell.height) / rows);
    const height = cell.y + Math.round(((row + 1) * cell.height) / rows) - y;
    for (let column = 0; column < columns; column++) {
      const x = cell.x + Math.round((column * cell.width) / columns);
      const width =
        cell.x + Math.round(((column + 1) * cell.width) / columns) - x;
      tiles.push({ id: cell.id, x, y, width, height });
    }
  }
  return tiles;
}
