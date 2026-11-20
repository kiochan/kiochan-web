import type { Reply, Request } from "./render-request";

export function processMosaic<K extends Request["kind"]>(
  request: Request & { kind: K },
  signal: AbortSignal,
): Promise<Extract<Reply, { kind: K }>> {
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
      else if (data.kind === request.kind)
        resolve(data as Extract<Reply, { kind: K }>);
      else reject(new Error("Unexpected image worker response."));
    };
    try {
      worker.postMessage(request);
    } catch (error) {
      dispose();
      reject(error);
    }
  });
}
