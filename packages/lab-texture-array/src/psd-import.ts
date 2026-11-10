import {
  byteArrayToBase64,
  getLayerImageData,
  type Layer,
  readPsd,
} from "ag-psd";
import { encode } from "fast-png";
import type { Asset } from "./project";

export type PsdLayerChoice = {
  id: number;
  name: string;
  path: string;
  width: number;
  height: number;
  available: boolean;
  hidden: boolean;
};
const validSize = (width: number, height: number) =>
  Number.isInteger(width) &&
  Number.isInteger(height) &&
  width > 0 &&
  height > 0 &&
  width <= 8192 &&
  height <= 8192 &&
  width * height <= 32_000_000;

// Keep compressed channels until the user selects layers; never decode the composite.
export class PsdImport {
  readonly choices: PsdLayerChoice[] = [];
  private layers: Layer[] = [];

  constructor(buffer: ArrayBuffer) {
    if (buffer.byteLength < 26 || buffer.byteLength > 70_000_000)
      throw new Error("Choose a PSD file of up to 70 MB.");
    const header = new DataView(buffer);
    if (header.getUint32(0) !== 0x38425053 || header.getUint16(4) !== 1)
      throw new Error("Choose a valid PSD file. PSB is not supported.");
    if (header.getUint16(22) !== 8 || header.getUint16(24) !== 3)
      throw new Error("PSD import supports 8-bit RGB documents only.");
    if (!validSize(header.getUint32(18), header.getUint32(14)))
      throw new Error(
        "PSD dimensions must be at most 8192px per side and 32 megapixels.",
      );
    const psd = readPsd(buffer, {
      useRawData: true,
      skipCompositeImageData: true,
      skipThumbnail: true,
      skipLinkedFilesData: true,
      imageResourcesWhitelist: [],
      totalMemoryLimit: 256 * 1024 * 1024,
    });
    let count = 0;
    const visit = (layers: Layer[], path: string[], hidden: boolean) => {
      for (const layer of layers) {
        if (++count > 256 || path.length > 32)
          throw new Error(
            "PSD import supports up to 256 layers and 32 nested groups.",
          );
        const name = layer.name?.trim().slice(0, 200) || `Layer ${count}`;
        if (layer.children) {
          visit(layer.children, [...path, name], hidden || !!layer.hidden);
          continue;
        }
        const width = (layer.right ?? 0) - (layer.left ?? 0);
        const height = (layer.bottom ?? 0) - (layer.top ?? 0);
        const available =
          validSize(width, height) &&
          !!layer.rawData?.channels.some(
            (channel) => channel.id >= 0 && channel.data?.length,
          );
        const id = this.layers.push(layer) - 1;
        this.choices.push({
          id,
          name,
          path: [...path, name].join(" / "),
          width,
          height,
          available,
          hidden: hidden || !!layer.hidden,
        });
      }
    };
    visit(psd.children ?? [], [], false);
    if (!this.choices.some((layer) => layer.available))
      throw new Error("This PSD has no importable pixel layers.");
  }

  select(ids: number[]): Asset[] {
    if (!ids.length || ids.length > 12 || new Set(ids).size !== ids.length)
      throw new Error("Select between 1 and 12 PSD layers.");
    const selected = new Set(ids);
    if (ids.some((id) => !this.choices[id]?.available))
      throw new Error("A selected PSD layer cannot be imported.");
    let bytes = 0;
    // Preserve bottom-to-top document order, independent of checkbox click order.
    return this.choices
      .filter((choice) => selected.has(choice.id))
      .map((choice) => {
        const pixels = getLayerImageData(this.layers[choice.id]);
        if (
          !pixels ||
          !(
            pixels.data instanceof Uint8ClampedArray ||
            pixels.data instanceof Uint8Array
          )
        )
          throw new Error("Unable to decode a selected PSD layer.");
        const opacity = Math.max(
          0,
          Math.min(1, this.layers[choice.id].opacity ?? 1),
        );
        if (opacity !== 1) {
          for (let index = 3; index < pixels.data.length; index += 4)
            pixels.data[index] = Math.round(pixels.data[index] * opacity);
        }
        const png = encode({
          width: pixels.width,
          height: pixels.height,
          channels: 4,
          depth: 8,
          data: new Uint8Array(
            pixels.data.buffer,
            pixels.data.byteOffset,
            pixels.data.byteLength,
          ),
        });
        if (png.byteLength > 8_000_000)
          throw new Error("A selected PSD layer exceeds the 8 MB image limit.");
        const data = `data:image/png;base64,${byteArrayToBase64(png)}`;
        bytes += data.length;
        if (bytes > 64_000_000)
          throw new Error(
            "Source images exceed the project's 48 MB binary budget.",
          );
        return { id: crypto.randomUUID(), name: choice.name, data };
      });
  }
}
