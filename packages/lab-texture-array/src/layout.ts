export type LatticeSettings = {
  columns: number;
  rows: number;
  layoutAngle: number;
  stagger: number;
  spacingX?: number;
  spacingY?: number;
};
export type Lattice = {
  positions: Float32Array<ArrayBuffer>;
  angle: number;
  count: number;
  spacingX: number;
  spacingY: number;
  densityLimited: boolean;
  frequencies: readonly [number, number, number, number];
};

// Integer reciprocal frequencies make both square edges exact lattice periods.
// Quantize the rotated/sheared basis, then enumerate its finite fundamental tile.
export function createLattice(settings: LatticeSettings): Lattice {
  const { columns, rows, layoutAngle, stagger } = settings;
  const spacingX = settings.spacingX ?? 1,
    spacingY = settings.spacingY ?? 1;
  if (
    !Number.isInteger(columns) ||
    !Number.isInteger(rows) ||
    columns < 1 ||
    columns > 32 ||
    rows < 1 ||
    rows > 32 ||
    !Number.isFinite(layoutAngle) ||
    Math.abs(layoutAngle) > 180 ||
    !Number.isFinite(stagger) ||
    stagger < 0 ||
    stagger > 1 ||
    !Number.isFinite(spacingX) ||
    spacingX < 0.5 ||
    spacingX > 4 ||
    !Number.isFinite(spacingY) ||
    spacingY < 0.5 ||
    spacingY > 4
  )
    throw new Error("Invalid lattice settings.");
  const theta = (layoutAngle * Math.PI) / 180;
  const cos = Math.cos(theta),
    sin = Math.sin(theta);
  const requestedColumns = columns / spacingX,
    requestedRows = rows / spacingY;
  // Keep solver work and instance counts bounded at extreme dense settings.
  const densityScale = Math.min(
    1,
    Math.sqrt(1024 / (requestedColumns * requestedRows)),
  );
  const frequencyX = requestedColumns * densityScale,
    frequencyY = requestedRows * densityScale;
  const target = [
    frequencyX * cos + stagger * frequencyY * sin,
    frequencyX * sin - stagger * frequencyY * cos,
    -frequencyY * sin,
    frequencyY * cos,
  ];
  const rounded = target.map(Math.round);
  const desiredX = [cos / frequencyX, sin / frequencyX];
  const desiredY = [
    (stagger * cos) / frequencyX - sin / frequencyY,
    (stagger * sin) / frequencyX + cos / frequencyY,
  ];
  const xLength = 1 / frequencyX;
  const yLength = Math.hypot(...desiredY);
  let best: {
    matrix: [number, number, number, number];
    det: number;
    score: number;
  } | null = null;
  for (let da = -1; da <= 1; da++)
    for (let db = -1; db <= 1; db++)
      for (let dc = -1; dc <= 1; dc++)
        for (let dd = -1; dd <= 1; dd++) {
          const [a, b, c, d] = [
            rounded[0] + da,
            rounded[1] + db,
            rounded[2] + dc,
            rounded[3] + dd,
          ];
          const det = a * d - b * c;
          if (det <= 0 || det > 2048) continue;
          const x = [d / det, -c / det],
            y = [-b / det, a / det];
          const xError =
            ((x[0] - desiredX[0]) ** 2 + (x[1] - desiredX[1]) ** 2) /
            xLength ** 2;
          const yError =
            ((y[0] - desiredY[0]) ** 2 + (y[1] - desiredY[1]) ** 2) /
            yLength ** 2;
          const direction = (x[0] * cos + x[1] * sin) / Math.hypot(...x);
          const density = Math.log(det / (frequencyX * frequencyY));
          const score =
            xError + yError + 4 * (1 - direction) + 0.2 * density * density;
          if (!best || score < best.score - 1e-12)
            best = { matrix: [a, b, c, d], det, score };
        }
  if (!best) throw new Error("Unable to construct a bounded periodic lattice.");
  const [a, b, c, d] = best.matrix;
  const det = best.det;
  const positions = new Float32Array(det * 2);
  const rangeX = Math.abs(a) + Math.abs(b),
    rangeY = Math.abs(c) + Math.abs(d);
  const shift = (stagger * (rows - 1)) / (2 * frequencyX);
  let count = 0;
  for (
    let j = Math.floor(-rangeY / 2 - 0.5) - 1;
    j <= Math.ceil(rangeY / 2 - 0.5) + 1;
    j++
  ) {
    for (
      let i = Math.floor(-rangeX / 2 - 0.5) - 1;
      i <= Math.ceil(rangeX / 2 - 0.5) + 1;
      i++
    ) {
      // Half-open integer bounds avoid duplicated or missing centers on seams.
      const nx = d * (2 * i + 1) - b * (2 * j + 1) + det;
      const ny = -c * (2 * i + 1) + a * (2 * j + 1) + det;
      if (nx < 0 || nx >= 2 * det || ny < 0 || ny >= 2 * det) continue;
      positions[count * 2] = (((nx / (2 * det) + shift * cos) % 1) + 1) % 1;
      positions[count * 2 + 1] = (((ny / (2 * det) + shift * sin) % 1) + 1) % 1;
      count++;
    }
  }
  if (count !== det) throw new Error("Periodic lattice enumeration failed.");
  return {
    positions,
    count,
    spacingX: Math.hypot(c, d) / det,
    spacingY: 1 / Math.hypot(c, d),
    densityLimited: densityScale < 1,
    frequencies: best.matrix,
    angle: (Math.atan2(-c, d) * 180) / Math.PI,
  };
}
