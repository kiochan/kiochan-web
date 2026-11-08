export const HARMONIES = [
  "analogous",
  "complementary",
  "triadic",
  "monochrome",
] as const;
export type Harmony = (typeof HARMONIES)[number];

function hslHex(hue: number, saturation: number, lightness: number) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = (((hue % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((sector % 2) - 1));
  const channels = [
    [chroma, x, 0],
    [x, chroma, 0],
    [0, chroma, x],
    [0, x, chroma],
    [x, 0, chroma],
    [chroma, 0, x],
  ][Math.floor(sector)];
  return `#${channels
    .map((c) =>
      Math.round((c + lightness - chroma / 2) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

// Seeded hue rotation keeps palettes reproducible. Restrained saturation and
// separated lightness bands keep the translucent stripes and fine lines legible.
export function generatePalette(
  seed: number,
  harmony: Harmony,
): [string, string, string] {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const hue = random() * 360;
  const dark = random() < 0.5;
  const offset = {
    analogous: 30,
    complementary: 180,
    triadic: 120,
    monochrome: 0,
  }[harmony];
  return [
    hslHex(hue, 0.18 + random() * 0.14, dark ? 0.14 : 0.92),
    hslHex(hue + offset, 0.38 + random() * 0.18, dark ? 0.64 : 0.4),
    hslHex(hue - offset, 0.3 + random() * 0.2, dark ? 0.9 : 0.14),
  ];
}
