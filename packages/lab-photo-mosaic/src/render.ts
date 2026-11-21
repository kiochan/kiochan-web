import { type PhotoFit, photoFrames, type Rect, type Size } from "./layout";
import { encodePng } from "./png";
import {
  exportBackground,
  type RasterSource,
  type Request,
} from "./render-request";

function surface(size: Size, read = false) {
  const canvas = new OffscreenCanvas(size.width, size.height);
  const context = canvas.getContext("2d", { willReadFrequently: read });
  if (!context) throw new Error("Canvas is unavailable.");
  context.imageSmoothingQuality = "high";
  return context;
}

function drawPhoto(
  context: OffscreenCanvasRenderingContext2D,
  image: ImageBitmap,
  { x, y, width, height }: Rect,
  fit: PhotoFit,
) {
  if (fit === "contain") {
    const scale = Math.min(width / image.width, height / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    context.drawImage(image, x + (width - w) / 2, y + (height - h) / 2, w, h);
    return;
  }
  const aspect = width / height;
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

function prepareMosaic(request: Request, pixelBudget = 0) {
  const { layout, sources, smoothing, fit } = request;
  const background = exportBackground(request.format, request.background);
  const byPhoto = new Map(
    photoFrames(layout, request.spacing).map((cell) => [cell.id, cell]),
  );
  const cache = new Map<string, ImageBitmap>();
  let cachedPixels = 0;

  async function bitmapFor(photo: RasterSource) {
    const existing = cache.get(photo.id);
    if (existing) {
      cache.delete(photo.id);
      cache.set(photo.id, existing);
      return existing;
    }
    for (const [id, bitmap] of cache) {
      if (cachedPixels + photo.width * photo.height <= pixelBudget) break;
      cachedPixels -= bitmap.width * bitmap.height;
      bitmap.close();
      cache.delete(id);
    }
    const bitmap = await createImageBitmap(photo.file);
    cache.set(photo.id, bitmap);
    cachedPixels += bitmap.width * bitmap.height;
    return bitmap;
  }

  return {
    close() {
      for (const bitmap of cache.values()) bitmap.close();
    },
    async draw(context: OffscreenCanvasRenderingContext2D, region: Rect) {
      if (background) {
        context.fillStyle = background;
        context.fillRect(0, 0, region.width, region.height);
      }
      context.imageSmoothingEnabled = smoothing !== "off";
      if (smoothing !== "off") context.imageSmoothingQuality = smoothing;
      for (const photo of sources) {
        const rect = byPhoto.get(photo.id);
        if (
          !rect ||
          rect.x >= region.x + region.width ||
          rect.x + rect.width <= region.x ||
          rect.y >= region.y + region.height ||
          rect.y + rect.height <= region.y
        )
          continue;
        const bitmap = await bitmapFor(photo);
        drawPhoto(
          context,
          bitmap,
          {
            ...rect,
            x: rect.x - region.x,
            y: rect.y - region.y,
          },
          fit,
        );
      }
    },
  };
}

export async function renderMosaic(request: Request) {
  const mosaic = prepareMosaic(request);
  try {
    const context = surface(request.size);
    await mosaic.draw(context, { x: 0, y: 0, ...request.size });
    return context.canvas;
  } finally {
    mosaic.close();
  }
}

async function* scanlines(
  mosaic: ReturnType<typeof prepareMosaic>,
  { width, height }: Size,
) {
  const blockWidth = Math.min(width, 4096);
  const rowLength = width * 4 + 1;
  const bandHeight = Math.min(256, Math.floor((8 * 1024 * 1024) / rowLength));
  const context = surface({ width: blockWidth, height: bandHeight }, true);
  try {
    for (let y = 0; y < height; y += bandHeight) {
      const rows = Math.min(bandHeight, height - y);
      const band = new Uint8Array(rows * rowLength);
      for (let x = 0; x < width; x += blockWidth) {
        const columns = Math.min(blockWidth, width - x);
        context.clearRect(0, 0, blockWidth, bandHeight);
        await mosaic.draw(context, { x, y, width: columns, height: rows });
        const { data } = context.getImageData(0, 0, columns, rows);
        const stride = columns * 4;
        for (let row = 0; row < rows; row++) {
          band.set(
            data.subarray(row * stride, (row + 1) * stride),
            row * rowLength + 1 + x * 4,
          );
        }
      }
      // Apply the PNG Sub filter from right to left to keep predictors intact.
      for (let start = 0; start < band.length; start += rowLength) {
        for (let index = start + rowLength - 1; index > start + 4; index--) {
          band[index] -= band[index - 4];
        }
        band[start] = 1;
      }
      yield band;
    }
  } finally {
    context.canvas.width = 0;
  }
}

export async function renderLargePng(request: Request) {
  const mosaic = prepareMosaic(request, 16 * 1024 * 1024);
  try {
    const { width, height } = request.size;
    return await encodePng(width, height, scanlines(mosaic, request.size));
  } finally {
    mosaic.close();
  }
}
