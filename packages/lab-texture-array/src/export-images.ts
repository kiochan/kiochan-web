import type { ExportCommand, ExportReply } from "./export.worker";
import type { ExportFormat } from "./export-encoder";
import type { Frame } from "./project";
import type { TextureRenderer } from "./renderer";

export async function exportImages(
  gpu: TextureRenderer,
  frame: Frame,
  format: ExportFormat,
  signal: AbortSignal,
  onProgress: (text: string) => void,
) {
  const worker = new Worker(new URL("./export.worker.ts", import.meta.url), {
    type: "module",
  });
  let rejectPending: ((reason: Error) => void) | null = null;
  const abort = () => {
    worker.terminate();
    rejectPending?.(new Error("Image export cancelled."));
  };
  signal.addEventListener("abort", abort, { once: true });
  function request(message: ExportCommand, transfer: Transferable[] = []) {
    return new Promise<ExportReply>((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error("Image export cancelled."));
        return;
      }
      rejectPending = reject;
      worker.onmessage = (event: MessageEvent<ExportReply>) => {
        rejectPending = null;
        if (event.data.error) reject(new Error(event.data.error));
        else resolve(event.data);
      };
      worker.onerror = () => {
        rejectPending = null;
        reject(new Error("Image encoder failed. Try a smaller output size."));
      };
      worker.onmessageerror = () => {
        rejectPending = null;
        reject(new Error("Unable to read image encoder response."));
      };
      worker.postMessage(message, transfer);
    });
  }
  try {
    onProgress("Preparing export composite…");
    gpu.render(frame, 1, false);
    const composite = gpu.readTile();
    await request(
      { type: "start", format, size: frame.size, rgba: composite },
      [composite.buffer],
    );
    for (const [index, layer] of frame.layers.entries()) {
      if (signal.aborted) throw new Error("Image export cancelled.");
      onProgress(
        `Encoding export layer ${index + 1} of ${frame.layers.length}…`,
      );
      gpu.render({ ...frame, layers: [{ ...layer, visible: true }] }, 1, false);
      const rgba = gpu.readTile();
      await request(
        {
          type: "layer",
          layer: {
            visible: layer.visible,
            rgba,
          },
        },
        [rgba.buffer],
      );
    }
    onProgress("Finishing image export…");
    const result = await request({ type: "finish" });
    if (!result.blob) throw new Error("Image encoder returned no file.");
    return result.blob;
  } finally {
    signal.removeEventListener("abort", abort);
    rejectPending = null;
    worker.terminate();
  }
}
