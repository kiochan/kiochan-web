export type PatternOptions = {
  repeat: number;
  stripe: number;
  cross: boolean;
  colors: [string, string, string];
};

export const PATTERN_LAYERS = [
  { id: "base", label: "Background" },
  { id: "vertical", label: "Vertical stripes" },
  { id: "horizontal", label: "Horizontal stripes" },
  { id: "lines", label: "Fine lines" },
] as const;
export type PatternLayer = (typeof PATTERN_LAYERS)[number]["id"];
export type PatternExport = {
  tiles?: number;
  layer?: PatternLayer | "all";
};

export function patternGeometry(repeat: number, stripe: number, tiles = 8) {
  const size = Math.max(24, Math.min(160, Math.round(repeat) || 72));
  return {
    size,
    band: Math.max(2, Math.min(size / 2, Math.round(stripe) || 2)),
    extent: size * Math.max(1, Math.min(16, Math.round(tiles) || 1)),
  };
}

// Every export contains an integer number of periods on both axes. Layers use
// normal source-over compositing in the same order as the combined artwork.
export function patternSvg(
  { repeat, stripe, cross, colors }: PatternOptions,
  { tiles = 8, layer = "all" }: PatternExport = {},
) {
  const safeColors = colors.map((color) =>
    /^#[0-9a-f]{6}$/i.test(color) ? color : "currentColor",
  );
  const { size, band, extent } = patternGeometry(repeat, stripe, tiles);
  const shapes: Record<PatternLayer, string> = {
    base: `<rect width="${size}" height="${size}" fill="${safeColors[0]}"/>`,
    vertical: `<rect x="${size / 3}" width="${band}" height="${size}" fill="${safeColors[1]}" fill-opacity=".7"/>`,
    horizontal: cross
      ? `<rect y="${size / 3}" width="${size}" height="${band}" fill="${safeColors[1]}" fill-opacity=".7"/>`
      : "",
    lines: `<path d="M2 0v${size}M0 2h${size}" stroke="${safeColors[2]}" stroke-width="2"/>`,
  };
  const layers = PATTERN_LAYERS.filter(
    (item) => (layer === "all" || item.id === layer) && shapes[item.id],
  );
  const definitions = layers
    .map(
      ({ id }) =>
        `<pattern id="tile-${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${shapes[id]}</pattern>`,
    )
    .join("");
  const artwork = layers
    .map(
      ({ id, label }) =>
        `<g id="${id}" inkscape:groupmode="layer" inkscape:label="${label}"><title>${label}</title><rect width="${extent}" height="${extent}" fill="url(#tile-${id})"/></g>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${extent}" height="${extent}" viewBox="0 0 ${extent} ${extent}"><defs>${definitions}</defs>${artwork}</svg>`;
}
