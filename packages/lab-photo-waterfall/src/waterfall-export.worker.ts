import type { ExportReply, ExportRequest } from "./export";
import { NeedsDocumentError, renderWaterfall } from "./export-render";

self.onmessage = async ({ data }: MessageEvent<ExportRequest>) => {
  try {
    const blob = await renderWaterfall(data);
    self.postMessage({ kind: "success", blob } satisfies ExportReply);
  } catch (error) {
    self.postMessage({
      kind: error instanceof NeedsDocumentError ? "document" : "failure",
    } satisfies ExportReply);
  }
};
