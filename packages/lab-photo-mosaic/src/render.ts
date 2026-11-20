import {
  averageColor,
  type Color,
  type ColorField,
  colorDifference,
  matchTiles,
  regionColor,
  samplingAxis,
  tintPixels,
} from "./color-match";
import { densityTileCount, subdivideTile } from "./density";
import type { Cell, Rect, Size } from "./layout";
import { type RasterSource, type Request, scaledSize } from "./render-request";

function surface(size: Size, read = true) {
  const canvas = new OffscreenCanvas(size.width, size.height);
  const context = canvas.getContext("2d", { willReadFrequently: read });
  if (!context) throw new Error("Canvas is unavailable.");
  context.imageSmoothingQuality = "high";
  return context;
}

function decode(source: RasterSource, max?: number) {
  const size = max && scaledSize(source, max);
  if (!size || (size.width === source.width && size.height === source.height)) {
    return createImageBitmap(source.file);
  }
  return createImageBitmap(source.file, {
    resizeWidth: size.width,
    resizeHeight: size.height,
    resizeQuality: "high",
  });
}

function drawCover(
  context: OffscreenCanvasRenderingContext2D,
  image: ImageBitmap,
  { x, y, width, height }: Rect,
  aspect = width / height,
) {
  const sourceWidth = Math.min(image.width, image.height * aspect);
  const sourceHeight = Math.min(image.height, image.width / aspect);
  context.drawImage(
    image,
    (image.width - sourceWidth) / 2,
    (image.height - sourceHeight) / 2,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

async function makeField(
  image: RasterSource,
  size: Size,
  tileCount: number,
): Promise<ColorField> {
  const detail = Math.max(
    112,
    Math.min(384, Math.ceil(Math.sqrt(tileCount) * 3)),
  );
  const sample = scaledSize(size, detail);
  const context = surface(sample);
  const bitmap = await decode(image, 768);
  try {
    drawCover(
      context,
      bitmap,
      { x: 0, y: 0, ...sample },
      size.width / size.height,
    );
    return context.getImageData(0, 0, sample.width, sample.height);
  } finally {
    bitmap.close();
  }
}

const swatch = { x: 0, y: 0, width: 12, height: 12 };

function samplePhoto(
  context: OffscreenCanvasRenderingContext2D,
  image: ImageBitmap,
  aspect: number,
) {
  context.clearRect(0, 0, swatch.width, swatch.height);
  drawCover(context, image, swatch, aspect);
  return averageColor(
    context.getImageData(0, 0, swatch.width, swatch.height).data,
  );
}

async function withPalette<T>(
  sources: RasterSource[],
  action: (getColor: (id: string, aspect: number) => Color) => T,
): Promise<T> {
  const images = new Map<string, ImageBitmap>();
  try {
    for (const source of sources)
      images.set(source.id, await decode(source, 224));
    const context = surface(swatch);
    const cache = new Map<string, Color>();
    return action((id, aspect) => {
      const bucket = Math.round(Math.log2(aspect) * 6);
      const key = `${id}:${bucket}`;
      const cached = cache.get(key);
      if (cached) return cached;
      const image = images.get(id);
      if (!image) throw new Error("A photo is missing.");
      const color = samplePhoto(context, image, 2 ** (bucket / 6));
      cache.set(key, color);
      return color;
    });
  } finally {
    for (const image of images.values()) image.close();
  }
}

export async function arrangeForTarget({
  layout,
  size,
  pinned,
  sources,
  target,
}: Request) {
  if (!target || layout.length - pinned.length < 2) return layout;
  const fixed = new Set(pinned);
  const field = await makeField(target, size, layout.length);
  return withPalette(
    sources.filter(({ id }) => !fixed.has(id)),
    (color) =>
      matchTiles(
        layout,
        fixed,
        (cell) => regionColor(field, cell, size),
        color,
      ),
  );
}

async function expansion(request: Request, field: ColorField): Promise<Cell[]> {
  const { layout, density, size, pinned, sources } = request;
  if (density === 1 || pinned.length === layout.length) return layout;
  const fixed = new Set(pinned);
  return withPalette(sources, (color) => {
    const uses = new Map<string, number>();
    return layout.flatMap((cell) => {
      if (fixed.has(cell.id)) return [cell];
      const parts = subdivideTile(cell, density);
      const columns = Math.min(density, cell.width);
      const assigned: Cell[] = [];
      for (const [index, part] of parts.entries()) {
        const goal = regionColor(field, part, size);
        let best = part.id;
        let bestScore = Number.POSITIVE_INFINITY;
        if (goal) {
          const left = index % columns ? assigned[index - 1]?.id : undefined;
          const above = assigned[index - columns]?.id;
          const aspect = part.width / part.height;
          for (const { id } of sources) {
            const count = uses.get(id) ?? 0;
            // Keep repetition costs bounded even on a very dense canvas.
            const score =
              colorDifference(goal, color(id, aspect)) +
              (1800 * count) / (count + 8) +
              (id === left ? 1600 : 0) +
              (id === above ? 1600 : 0);
            if (score >= bestScore) continue;
            best = id;
            bestScore = score;
          }
        }
        uses.set(best, (uses.get(best) ?? 0) + 1);
        assigned.push({ ...part, id: best });
      }
      return assigned;
    });
  });
}

export async function renderMosaic(request: Request) {
  const {
    layout,
    size,
    sources,
    smoothing,
    target,
    strength,
    density,
    matchBrightness,
  } = request;
  const preview = request.kind === "preview";
  const output = preview ? scaledSize(size, 768) : size;
  const field =
    target && (strength > 0 || density > 1)
      ? await makeField(
          target,
          size,
          densityTileCount(layout, new Set(request.pinned), density),
        )
      : undefined;
  const tiles = field ? await expansion(request, field) : layout;
  const tint = strength > 0 ? field : undefined;
  const context = surface(output, Boolean(tint));
  context.imageSmoothingEnabled = smoothing !== "off";
  if (smoothing !== "off") context.imageSmoothingQuality = smoothing;
  const analysis = tint ? surface(swatch) : undefined;
  const horizontal = tint ? samplingAxis(output.width, tint.width) : undefined;
  const vertical = tint ? samplingAxis(output.height, tint.height) : undefined;
  const byPhoto = new Map<string, Cell[]>();
  for (const cell of tiles) {
    const group = byPhoto.get(cell.id);
    if (group) group.push(cell);
    else byPhoto.set(cell.id, [cell]);
  }
  for (const photo of sources) {
    const group = byPhoto.get(photo.id);
    if (!group) continue;
    const bitmap = await decode(photo, preview ? 1024 : undefined);
    const averages = new Map<number, Color>();
    try {
      for (const cell of group) {
        const x = Math.round((cell.x * output.width) / size.width);
        const y = Math.round((cell.y * output.height) / size.height);
        const w =
          Math.round(((cell.x + cell.width) * output.width) / size.width) - x;
        const h =
          Math.round(((cell.y + cell.height) * output.height) / size.height) -
          y;
        if (!w || !h) continue;
        const aspect = cell.width / cell.height;
        drawCover(context, bitmap, { x, y, width: w, height: h }, aspect);
        if (!tint || !analysis || !horizontal || !vertical) continue;
        let source = averages.get(aspect);
        if (!source) {
          source = samplePhoto(analysis, bitmap, aspect);
          averages.set(aspect, source);
        }
        for (let offset = 0; offset < h; offset += 128) {
          const band = {
            x,
            y: y + offset,
            width: w,
            height: Math.min(128, h - offset),
          };
          const pixels = context.getImageData(
            band.x,
            band.y,
            band.width,
            band.height,
          );
          tintPixels(
            pixels.data,
            band,
            source,
            tint,
            horizontal,
            vertical,
            strength,
            matchBrightness,
          );
          context.putImageData(pixels, band.x, band.y);
        }
      }
    } finally {
      bitmap.close();
    }
  }
  return context.canvas;
}
