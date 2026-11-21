import type { Reply, Request } from "./render-request";

export function processMosaic(
  request: Request,
  signal: AbortSignal,
): Promise<Extract<Reply, { kind: "export" }>> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const worker = new Worker(new URL("./mosaic.worker.ts", import.meta.url), {
      type: "module",
    });
    function dispose() {
      signal.removeEventListener("abort", cancel);
      worker.terminate();
    }
    function cancel() {
      dispose();
      reject(signal.reason);
    }
    function fail(event: Event) {
      event.preventDefault();
      dispose();
      reject(new Error("The image worker could not finish."));
    }
    signal.addEventListener("abort", cancel, { once: true });
    worker.onerror = fail;
    worker.onmessageerror = fail;
    worker.onmessage = ({ data }: MessageEvent<Reply>) => {
      dispose();
      if (data.kind === "error") reject(new Error(data.message));
      else resolve(data);
    };
    try {
      worker.postMessage(request);
    } catch (error) {
      dispose();
      reject(error);
    }
  });
}
