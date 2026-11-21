import { renderLargePng, renderMosaic } from "./render";
import { exportTypes, type Reply, type Request } from "./render-request";

async function exportMosaic(request: Request) {
  const { format, size } = request;
  if (
    format === "png" &&
    typeof CompressionStream !== "undefined" &&
    (size.width > 4096 ||
      size.height > 4096 ||
      size.width * size.height > 16_000_000)
  ) {
    return renderLargePng(request);
  }
  const canvas = await renderMosaic(request);
  try {
    const type = exportTypes[format];
    const blob = await canvas.convertToBlob({ type, quality: 0.92 });
    if (blob.type !== type || !blob.size) {
      throw new Error("The browser could not encode the selected format.");
    }
    return blob;
  } finally {
    canvas.width = 0;
  }
}

self.onmessage = async ({ data }: MessageEvent<Request>) => {
  try {
    const blob = await exportMosaic(data);
    self.postMessage({ kind: "export", blob } satisfies Reply);
  } catch (error) {
    self.postMessage({
      kind: "error",
      message:
        error instanceof Error ? error.message : "Image processing failed.",
    } satisfies Reply);
  }
};
