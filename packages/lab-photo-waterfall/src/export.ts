import type { WaterfallLayout } from "./layout";

export type WaterfallFormat = "png" | "webp" | "jpg";
type ExportErrorCode = "jpeg-size" | "webp-size" | "png-size" | "encoding";

export class WaterfallExportError extends Error {
  constructor(readonly code: ExportErrorCode) {
    super(code);
  }
}

export type ExportRequest = {
  files: File[];
  layout: WaterfallLayout;
  background: string | null;
  format: WaterfallFormat;
};

export type ExportReply =
  | { kind: "success"; blob: Blob }
  | { kind: "document" }
  | { kind: "failure" };

const dimensionLimits = {
  png: { side: 0x7fffffff, code: "png-size" },
  webp: { side: 16383, code: "webp-size" },
  jpg: { side: 65535, code: "jpeg-size" },
} as const;

function exportInWorker(request: ExportRequest, signal?: AbortSignal) {
  return new Promise<Blob | undefined>((resolve, reject) => {
    signal?.throwIfAborted();
    let worker: Worker;
    try {
      worker = new Worker(
        new URL("./waterfall-export.worker.ts", import.meta.url),
        {
          type: "module",
        },
      );
    } catch {
      resolve(undefined);
      return;
    }

    function dispose() {
      signal?.removeEventListener("abort", abort);
      worker.terminate();
    }
    function abort() {
      dispose();
      reject(signal?.reason);
    }
    function unavailable(event: Event) {
      event.preventDefault();
      dispose();
      resolve(undefined);
    }
    signal?.addEventListener("abort", abort, { once: true });
    worker.onerror = unavailable;
    worker.onmessageerror = unavailable;
    worker.onmessage = ({ data }: MessageEvent<ExportReply>) => {
      dispose();
      if (data.kind === "success") resolve(data.blob);
      else if (data.kind === "document") resolve(undefined);
      else reject(new WaterfallExportError("encoding"));
    };
    try {
      worker.postMessage(request);
    } catch {
      dispose();
      resolve(undefined);
    }
  });
}

export async function exportWaterfall(
  photos: readonly { file: File }[],
  layout: WaterfallLayout,
  background: string | null,
  format: WaterfallFormat,
  signal?: AbortSignal,
) {
  signal?.throwIfAborted();
  const { width, height } = layout;
  const { side, code } = dimensionLimits[format];
  if (width > side || height > side) throw new WaterfallExportError(code);
  const request = {
    files: photos.map(({ file }) => file),
    layout,
    background,
    format,
  };
  try {
    const result = await exportInWorker(request, signal);
    if (result) return result;
    const { renderWaterfall } = await import("./export-render");
    return await renderWaterfall(request, signal);
  } catch {
    signal?.throwIfAborted();
    throw new WaterfallExportError("encoding");
  }
}
