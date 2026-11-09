import {
  ExportEncoder,
  type ExportFormat,
  type ExportLayer,
} from "./export-encoder";
export type ExportCommand =
  | {
      type: "start";
      format: ExportFormat;
      size: number;
      rgba: Uint8Array<ArrayBuffer>;
    }
  | { type: "layer"; layer: ExportLayer }
  | { type: "finish" };
export type ExportReply = { blob?: Blob; error?: string };
let encoder: ExportEncoder | null = null;
self.onmessage = (event: MessageEvent<ExportCommand>) => {
  try {
    const message = event.data;
    if (message.type === "start")
      encoder = new ExportEncoder(message.format, message.size, message.rgba);
    else {
      if (!encoder) throw new Error("Export encoder has not started.");
      if (message.type === "layer") encoder.addLayer(message.layer);
      else {
        self.postMessage({ blob: encoder.finish() } satisfies ExportReply);
        encoder = null;
        return;
      }
    }
    self.postMessage({} satisfies ExportReply);
  } catch (error) {
    encoder = null;
    self.postMessage({
      error: error instanceof Error ? error.message : "Image export failed.",
    } satisfies ExportReply);
  }
};
