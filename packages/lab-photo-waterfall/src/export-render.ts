import type { ExportRequest } from "./export";
import type { WaterfallLayout } from "./layout";
import { encodePng } from "./png";

type Raster = { image: HTMLImageElement | ImageBitmap; close: () => void };
type Tile = WaterfallLayout["tiles"][number];

const canvasBandWidth = 4096;
const pngWorkingBytes = 4 * 1024 * 1024;
const encoders = {
  png: { type: "image/png" },
  webp: { type: "image/webp", quality: 0.92 },
  jpg: { type: "image/jpeg", quality: 0.92 },
} satisfies Record<ExportRequest["format"], ImageEncodeOptions>;

export class NeedsDocumentError extends Error {}

function surface(width: number, height: number, forReadback = false) {
  if (
    typeof document === "undefined" &&
    typeof OffscreenCanvas === "undefined"
  ) {
    throw new NeedsDocumentError();
  }
  const canvas =
    typeof document === "undefined"
      ? new OffscreenCanvas(width, height)
      : document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: forReadback });
  if (!context) throw new Error("Canvas is unavailable.");
  context.imageSmoothingQuality = "high";
  return { canvas, context };
}

async function decode(file: File): Promise<Raster> {
  try {
    const image = await createImageBitmap(file);
    return { image, close: () => image.close() };
  } catch (error) {
    // Some browser image formats, such as SVG, require an HTML image element.
    if (typeof document === "undefined") throw new NeedsDocumentError();
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      return { image, close: () => URL.revokeObjectURL(url) };
    } catch {
      URL.revokeObjectURL(url);
      throw error;
    }
  }
}

function coverBackground(
  context: ReturnType<typeof surface>["context"],
  background: string | null,
) {
  const { width, height } = context.canvas;
  if (background === null) {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }
}

async function encodeCanvas(
  { files, layout, background, format }: ExportRequest,
  signal?: AbortSignal,
) {
  const { canvas, context } = surface(layout.width, layout.height);
  try {
    coverBackground(
      context,
      format === "jpg" ? (background ?? "#ffffff") : background,
    );
    for (const { index, x, y, width, height } of layout.tiles) {
      signal?.throwIfAborted();
      const raster = await decode(files[index]);
      try {
        signal?.throwIfAborted();
        context.drawImage(raster.image, x, y, width, height);
      } finally {
        raster.close();
      }
    }
    const options: ImageEncodeOptions = encoders[format];
    const blob = await ("convertToBlob" in canvas
      ? canvas.convertToBlob(options)
      : new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, options.type, options.quality),
        ));
    if (!blob || blob.type !== options.type || !blob.size) {
      throw new Error("The browser encoder could not create the image.");
    }
    return blob;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

function tilesInBand(
  columns: WaterfallLayout["columns"],
  offsets: number[],
  top: number,
  bottom: number,
) {
  const visible: Tile[] = [];
  for (const [column, { tiles }] of columns.entries()) {
    while (offsets[column] < tiles.length) {
      const tile = tiles[offsets[column]];
      if (tile.y + tile.height > top) break;
      offsets[column]++;
    }
    for (let index = offsets[column]; index < tiles.length; index++) {
      const tile = tiles[index];
      if (tile.y >= bottom) break;
      visible.push(tile);
    }
  }
  return visible;
}

function copyScanlines(
  rows: Uint8Array,
  rowLength: number,
  channels: 3 | 4,
  left: number,
  pixels: ImageData,
) {
  const { data, width, height } = pixels;
  for (let row = 0; row < height; row++) {
    let destination = row * rowLength + 1 + left * channels;
    const source = row * width * 4;
    const end = source + width * 4;
    if (channels === 4) {
      rows.set(data.subarray(source, end), destination);
    } else {
      for (let index = source; index < end; index += 4) {
        rows[destination++] = data[index];
        rows[destination++] = data[index + 1];
        rows[destination++] = data[index + 2];
      }
    }
  }
}

async function* pngBands(
  { files, layout, background }: ExportRequest,
  channels: 3 | 4,
  signal?: AbortSignal,
) {
  const rowLength = layout.width * channels + 1;
  const bandHeight = Math.max(
    1,
    Math.min(128, Math.floor(pngWorkingBytes / rowLength)),
  );
  const width = Math.min(layout.width, canvasBandWidth);
  const { canvas, context } = surface(width, bandHeight, true);
  const offsets = layout.columns.map(() => 0);
  const rasters = new Map<number, Raster>();
  try {
    for (let top = 0; top < layout.height; top += bandHeight) {
      signal?.throwIfAborted();
      const height = Math.min(bandHeight, layout.height - top);
      const bottom = top + height;
      const rows = new Uint8Array(rowLength * height);
      const tiles = tilesInBand(layout.columns, offsets, top, bottom);
      for (let left = 0; left < layout.width; left += width) {
        const right = Math.min(layout.width, left + width);
        coverBackground(context, background);
        for (const tile of tiles) {
          const tileRight = tile.x + tile.width;
          if (tile.x >= right || tileRight <= left) continue;
          let raster = rasters.get(tile.index);
          if (!raster) {
            raster = await decode(files[tile.index]);
            rasters.set(tile.index, raster);
          }
          signal?.throwIfAborted();
          context.drawImage(
            raster.image,
            tile.x - left,
            tile.y - top,
            tile.width,
            tile.height,
          );
          if (tileRight <= right && tile.y + tile.height <= bottom) {
            raster.close();
            rasters.delete(tile.index);
          }
        }
        copyScanlines(
          rows,
          rowLength,
          channels,
          left,
          context.getImageData(0, 0, right - left, height),
        );
      }
      // Apply PNG's Sub filter from right to left, so each predictor is unfiltered.
      for (let start = 0; start < rows.length; start += rowLength) {
        for (
          let index = start + rowLength - 1;
          index > start + channels;
          index--
        ) {
          rows[index] -= rows[index - channels];
        }
        rows[start] = 1;
      }
      yield rows;
    }
  } finally {
    for (const raster of rasters.values()) raster.close();
    canvas.width = 0;
    canvas.height = 0;
  }
}

export async function renderWaterfall(
  request: ExportRequest,
  signal?: AbortSignal,
) {
  signal?.throwIfAborted();
  const { width, height } = request.layout;
  if (request.format !== "png" || typeof CompressionStream === "undefined") {
    return encodeCanvas(request, signal);
  }
  if (width <= canvasBandWidth && height <= canvasBandWidth) {
    try {
      return await encodeCanvas(request, signal);
    } catch (error) {
      if (error instanceof NeedsDocumentError || signal?.aborted) throw error;
    }
  }
  const channels = request.background === null ? 4 : 3;
  return encodePng(
    width,
    height,
    channels,
    pngBands(request, channels, signal),
  );
}
