import { type Layer, type Psd, writePsdUint8Array } from "ag-psd";
import { encode } from "fast-png";
import { strToU8, zipSync } from "fflate";

export type ExportFormat = "psd" | "zip";
export type ExportLayer = {
  visible: boolean;
  rgba: Uint8Array<ArrayBuffer>;
};
export const exportLayerName = (index: number) =>
  `Layer ${String(index + 1).padStart(2, "0")}`;
const limit = 512 * 1024 * 1024;

export class ExportEncoder {
  private psd: Psd;
  private files: Record<string, Uint8Array<ArrayBufferLike>> = {};
  private layers: { name: string; file: string; visible: boolean }[] = [];
  private bytes = 0;
  private format: ExportFormat;
  private size: number;
  constructor(
    format: ExportFormat,
    size: number,
    rgba: Uint8Array<ArrayBuffer>,
  ) {
    this.format = format;
    this.size = size;
    this.validate(rgba);
    this.psd = { width: size, height: size, children: [] };
    if (format === "psd") {
      this.psd.imageData = this.pixels(rgba);
      this.bytes = rgba.byteLength;
    } else this.addPng("Composite.png", rgba);
  }
  private validate(rgba: Uint8Array) {
    if (
      !Number.isInteger(this.size) ||
      this.size < 1 ||
      this.size > 4096 ||
      rgba.length !== this.size * this.size * 4
    )
      throw new Error("Invalid export image dimensions or pixels.");
  }
  private pixels(rgba: Uint8Array<ArrayBuffer>) {
    return {
      width: this.size,
      height: this.size,
      data: new Uint8ClampedArray(
        rgba.buffer,
        rgba.byteOffset,
        rgba.byteLength,
      ),
    };
  }
  private checkLimit(bytes: number) {
    if (this.bytes + bytes > limit)
      throw new Error(
        "Export exceeds the memory limit. Use a smaller output size.",
      );
    this.bytes += bytes;
  }
  private addPng(name: string, rgba: Uint8Array<ArrayBuffer>) {
    const png = encode({
      width: this.size,
      height: this.size,
      data: rgba,
      channels: 4,
      depth: 8,
    });
    this.checkLimit(png.byteLength);
    this.files[name] = png;
  }
  addLayer(layer: ExportLayer) {
    this.validate(layer.rgba);
    if (this.layers.length >= 12)
      throw new Error("Export supports up to 12 layers.");
    const name = exportLayerName(this.layers.length);
    const file = `${name.replace(" ", "-")}.png`;
    if (this.format === "psd") {
      this.checkLimit(layer.rgba.byteLength);
      const child: Layer = {
        name,
        hidden: !layer.visible,
        opacity: 1,
        blendMode: "normal",
        top: 0,
        left: 0,
        bottom: this.size,
        right: this.size,
        imageData: this.pixels(layer.rgba),
      };
      this.psd.children?.push(child);
    } else this.addPng(file, layer.rgba);
    this.layers.push({ name, file, visible: layer.visible });
  }
  finish(): Blob {
    if (!this.layers.length)
      throw new Error("Export needs at least one layer.");
    if (this.format === "psd") {
      const bytes = writePsdUint8Array(this.psd, {
        generateThumbnail: false,
        trimImageData: false,
        noBackground: true,
      });
      return new Blob([new Uint8Array(bytes)], {
        type: "image/vnd.adobe.photoshop",
      });
    }
    this.files["Layers.json"] = strToU8(
      JSON.stringify(
        {
          width: this.size,
          height: this.size,
          order: "bottom-to-top",
          composite: "Composite.png",
          layers: this.layers,
        },
        null,
        2,
      ),
    );
    return new Blob([new Uint8Array(zipSync(this.files, { level: 0 }))], {
      type: "application/zip",
    });
  }
}
