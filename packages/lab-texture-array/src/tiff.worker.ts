import { LayeredTiffWriter, type TiffLayer } from "./tiff";

export type TiffCommand =
  | { type: "start"; size: number; rgba: Uint8Array<ArrayBuffer> }
  | { type: "layer"; layer: TiffLayer }
  | { type: "finish" };
export type TiffReply = { blob?: Blob; error?: string };
let writer: LayeredTiffWriter | null = null;
self.onmessage = async (event: MessageEvent<TiffCommand>) => {
  try {
    const message = event.data;
    if (message.type === "start") {
      writer = new LayeredTiffWriter(message.size);
      await writer.setComposite(message.rgba);
    } else {
      if (!writer) throw new Error("TIFF encoder has not started.");
      if (message.type === "layer") await writer.addLayer(message.layer);
      else {
        self.postMessage({ blob: writer.finish() } satisfies TiffReply);
        writer = null;
        return;
      }
    }
    self.postMessage({} satisfies TiffReply);
  } catch (error) {
    writer = null;
    self.postMessage({
      error: error instanceof Error ? error.message : "TIFF encoding failed.",
    } satisfies TiffReply);
  }
};
