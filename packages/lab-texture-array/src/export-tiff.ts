import type { Frame, Project } from "./project";
import type { TextureRenderer } from "./renderer";
import type { TiffCommand, TiffReply } from "./tiff.worker";

export async function exportTiff(
  gpu: TextureRenderer,
  frame: Frame,
  assets: Project["assets"],
  signal: AbortSignal,
  onProgress: (text: string) => void,
) {
  const worker = new Worker(new URL("./tiff.worker.ts", import.meta.url), {
    type: "module",
  });
  let rejectPending: ((reason: Error) => void) | null = null;
  const abort = () => {
    worker.terminate();
    rejectPending?.(new Error("TIFF export cancelled."));
  };
  signal.addEventListener("abort", abort, { once: true });
  function request(message: TiffCommand, transfer: Transferable[] = []) {
    return new Promise<TiffReply>((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error("TIFF export cancelled."));
        return;
      }
      rejectPending = reject;
      worker.onmessage = (event: MessageEvent<TiffReply>) => {
        rejectPending = null;
        if (event.data.error) reject(new Error(event.data.error));
        else resolve(event.data);
      };
      worker.onerror = () => {
        rejectPending = null;
        reject(new Error("TIFF encoder failed. Try a smaller output size."));
      };
      worker.onmessageerror = () => {
        rejectPending = null;
        reject(new Error("Unable to read TIFF encoder response."));
      };
      worker.postMessage(message, transfer);
    });
  }
  try {
    onProgress("Preparing TIFF composite…");
    gpu.render(frame, 1, false);
    const composite = gpu.readTile();
    await request({ type: "start", size: frame.size, rgba: composite }, [
      composite.buffer,
    ]);
    for (const [index, layer] of frame.layers.entries()) {
      if (signal.aborted) throw new Error("TIFF export cancelled.");
      onProgress(`Encoding TIFF layer ${index + 1} of ${frame.layers.length}…`);
      gpu.render({ ...frame, layers: [{ ...layer, visible: true }] }, 1, false);
      const rgba = gpu.readTile();
      await request(
        {
          type: "layer",
          layer: {
            name: assets.find((a) => a.id === layer.asset)?.name ?? "Layer",
            visible: layer.visible,
            rgba,
          },
        },
        [rgba.buffer],
      );
    }
    onProgress("Finishing layered TIFF…");
    const result = await request({ type: "finish" });
    if (!result.blob) throw new Error("TIFF encoder returned no file.");
    return result.blob;
  } finally {
    signal.removeEventListener("abort", abort);
    rejectPending = null;
    worker.terminate();
  }
}
