type Triple = [number, number, number];
type Swatch = { hex: string; lab: Triple; weight: number };

export type Palette = { name: string; colors: string[] };

function toLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function toOklab(rgb: Triple): Triple {
  const [red, green, blue] = rgb.map(toLinear);
  const l = Math.cbrt(
    0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue,
  );
  const m = Math.cbrt(
    0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue,
  );
  const s = Math.cbrt(
    0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue,
  );
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function distance(a: Triple, b: Triple) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function collectSwatches(pixels: Uint8ClampedArray) {
  const bins = new Map<number, { sum: Triple; weight: number }>();
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3] / 255;
    if (alpha < 0.1) continue;
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];
    const key = ((red >> 3) << 10) | ((green >> 3) << 5) | (blue >> 3);
    const bin = bins.get(key) ?? { sum: [0, 0, 0], weight: 0 };
    bin.sum[0] += red * alpha;
    bin.sum[1] += green * alpha;
    bin.sum[2] += blue * alpha;
    bin.weight += alpha;
    bins.set(key, bin);
  }

  // Start from the most common bins and merge visually similar candidates.
  const swatches: Swatch[] = [];
  const ranked = [...bins.values()].sort((a, b) => b.weight - a.weight);
  for (const { sum, weight } of ranked.slice(0, 256)) {
    const rgb: Triple = [
      Math.round(sum[0] / weight),
      Math.round(sum[1] / weight),
      Math.round(sum[2] / weight),
    ];
    const lab = toOklab(rgb);
    const neighbor = swatches.find(
      (swatch) => distance(swatch.lab, lab) < 0.045,
    );
    if (neighbor) {
      neighbor.weight += weight;
      continue;
    }
    const hex = `#${rgb
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`;
    swatches.push({ hex, lab, weight });
  }
  return swatches;
}

const styles = [
  { name: "Dominant colors", emphasis: () => 1 },
  {
    name: "Color accents",
    emphasis: ([, a, b]: Triple) => 0.15 + Math.hypot(a, b) * 5,
  },
  { name: "Light tones", emphasis: ([light]: Triple) => 0.15 + light ** 2 * 2 },
  {
    name: "Deep tones",
    emphasis: ([light]: Triple) => 0.15 + (1 - light) ** 2 * 2,
  },
];

export function extractPalettes(pixels: Uint8ClampedArray): Palette[] {
  const swatches = collectSwatches(pixels);
  const palettes: Palette[] = [];
  const seen = new Set<string>();
  for (const { name, emphasis } of styles) {
    const limit =
      name === "Dominant colors"
        ? 5
        : Math.min(5, Math.max(2, swatches.length - 1));
    const remaining = [...swatches];
    const selected: Swatch[] = [];
    while (selected.length < limit && remaining.length > 0) {
      let best = 0;
      let bestScore = -1;
      for (const [index, swatch] of remaining.entries()) {
        const separation = selected.reduce(
          (nearest, other) =>
            Math.min(nearest, distance(swatch.lab, other.lab)),
          0.4,
        );
        const score =
          swatch.weight ** 0.25 * emphasis(swatch.lab) * (0.12 + separation);
        if (score > bestScore) {
          best = index;
          bestScore = score;
        }
      }
      selected.push(remaining.splice(best, 1)[0]);
    }
    const colors = selected.map(({ hex }) => hex);
    const key = [...colors].sort().join();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    palettes.push({ name, colors });
  }
  return palettes;
}
