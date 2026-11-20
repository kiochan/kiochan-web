import { arrangeForTarget, renderMosaic } from "./render";
import type { Reply, Request } from "./render-request";

self.onmessage = async ({ data }: MessageEvent<Request>) => {
  try {
    if (data.kind === "arrange") {
      const layout = await arrangeForTarget(data);
      self.postMessage({
        kind: "arrange",
        layout,
        changed: layout !== data.layout,
      } satisfies Reply);
      return;
    }
    const canvas = await renderMosaic(data);
    if (data.kind === "preview") {
      const bitmap = canvas.transferToImageBitmap();
      self.postMessage({ kind: "preview", bitmap } satisfies Reply, {
        transfer: [bitmap],
      });
    } else {
      const blob = await canvas.convertToBlob({ type: "image/png" });
      self.postMessage({ kind: "export", blob } satisfies Reply);
    }
  } catch (error) {
    self.postMessage({
      kind: "error",
      message:
        error instanceof Error ? error.message : "Image processing failed.",
    } satisfies Reply);
  }
};
