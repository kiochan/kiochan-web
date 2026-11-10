import type { Asset } from "./project";
import type { PsdLayerChoice } from "./psd-import";
import { PsdImport } from "./psd-import";

export type PsdImportCommand =
  | { type: "open"; buffer: ArrayBuffer }
  | { type: "select"; ids: number[] };
export type PsdImportReply = {
  layers?: PsdLayerChoice[];
  assets?: Asset[];
  error?: string;
};
let document: PsdImport | null = null;
initializeCanvas(
  () => {
    throw new Error("Unable to read PSD layers.");
  },
  (width, height) => ({
    width,
    height,
    colorSpace: "srgb",
    data: new Uint8ClampedArray(width * height * 4),
  }),
);
self.onmessage = (event: MessageEvent<PsdImportCommand>) => {
  try {
    if (event.data.type === "open") {
      document = new PsdImport(event.data.buffer);
      self.postMessage({ layers: document.choices } satisfies PsdImportReply);
    } else {
      if (!document) throw new Error("Open a PSD before selecting layers.");
      self.postMessage({
        assets: document.select(event.data.ids),
      } satisfies PsdImportReply);
    }
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error ? error.message : "Unable to read PSD layers.",
    } satisfies PsdImportReply);
  }
};

import { initializeCanvas } from "ag-psd";
