// Classic big-endian TIFF with Adobe ImageSourceData (37724), not multi-page TIFF.
// References: Adobe Photoshop File Formats, Layer Records and Photoshop TIFF tags.
export type TiffLayer = {
  name: string;
  visible: boolean;
  rgba: Uint8Array<ArrayBuffer>;
};
type EncodedLayer = { record: Uint8Array<ArrayBuffer>; channels: Blob[] };
const ascii = (text: string) => new TextEncoder().encode(text);
function u16(value: number) {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value & 0xffff);
  return bytes;
}
function u32(value: number) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value);
  return bytes;
}
function join(parts: Uint8Array<ArrayBuffer>[]) {
  const bytes = new Uint8Array(
    parts.reduce((sum, part) => sum + part.length, 0),
  );
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
}
function block(key: string, data: Blob, alignment = 4) {
  return new Blob([
    ascii(`8BIM${key}`),
    u32(data.size),
    data,
    new Uint8Array((alignment - (data.size % alignment)) % alignment),
  ]);
}
async function deflate(bytes: Uint8Array<ArrayBuffer>) {
  if (typeof CompressionStream === "undefined")
    throw new Error(
      "TIFF export requires a browser with CompressionStream support.",
    );
  return new Response(
    new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate")),
  ).blob();
}
function validatePixels(size: number, rgba: Uint8Array) {
  if (
    !Number.isInteger(size) ||
    size < 1 ||
    size > 4096 ||
    rgba.length !== size * size * 4
  )
    throw new Error("Invalid TIFF image dimensions or pixels.");
}

export class LayeredTiffWriter {
  private composite: Blob | null = null;
  private layers: EncodedLayer[] = [];
  private size: number;
  constructor(size: number) {
    this.size = size;
  }
  async setComposite(rgba: Uint8Array<ArrayBuffer>) {
    validatePixels(this.size, rgba);
    this.composite = await deflate(rgba);
  }
  async addLayer(layer: TiffLayer) {
    validatePixels(this.size, layer.rgba);
    if (this.layers.length >= 12)
      throw new Error("TIFF supports up to 12 editor layers.");
    const channels: Blob[] = [];
    for (let channel = 0; channel < 4; channel++) {
      const planar = new Uint8Array(this.size * this.size);
      for (let pixel = 0; pixel < planar.length; pixel++)
        planar[pixel] = layer.rgba[pixel * 4 + channel];
      channels.push(new Blob([u16(2), await deflate(planar)]));
    }
    const name = layer.name.slice(0, 200) || "Layer";
    const fallback = Uint8Array.from(name, (c) =>
      c.charCodeAt(0) < 128 ? c.charCodeAt(0) : 63,
    );
    const pascal = join([
      Uint8Array.of(fallback.length),
      fallback,
      new Uint8Array((4 - ((fallback.length + 1) % 4)) % 4),
    ]);
    const unicode = new Uint8Array(4 + name.length * 2);
    const unicodeView = new DataView(unicode.buffer);
    unicodeView.setUint32(0, name.length);
    for (let i = 0; i < name.length; i++)
      unicodeView.setUint16(4 + i * 2, name.charCodeAt(i));
    const extra = join([
      u32(0),
      u32(0),
      pascal,
      ascii("8BIMluni"),
      u32(unicode.length),
      unicode,
    ]);
    const record = join([
      u32(0),
      u32(0),
      u32(this.size),
      u32(this.size),
      u16(4),
      ...channels.flatMap((channel, i) => [
        u16(i === 3 ? -1 : i),
        u32(channel.size),
      ]),
      ascii("8BIMnorm"),
      Uint8Array.of(255, 0, layer.visible ? 0 : 2, 0),
      u32(extra.length),
      extra,
    ]);
    this.layers.push({ record, channels });
  }
  finish(): Blob {
    if (!this.composite || !this.layers.length)
      throw new Error(
        "A layered TIFF needs a composite and at least one layer.",
      );
    // Records and channel blocks follow editor order, bottom to top.
    const layerData = new Blob([
      u16(-this.layers.length),
      ...this.layers.map((l) => l.record),
      ...this.layers.flatMap((l) => l.channels),
    ]);
    const evenLayerData = new Blob([
      layerData,
      new Uint8Array(layerData.size % 2),
    ]);
    const source = new Blob([
      ascii("Adobe Photoshop Document Data Block\0"),
      block("MTrn", new Blob([])),
      block("Layr", evenLayerData),
      block(
        "LMsk",
        new Blob([new Uint8Array(10), u16(100), Uint8Array.of(128)]),
      ),
    ]);
    // One RGBA IFD provides a transparent composite to baseline TIFF readers.
    const count = 14;
    const ifdEnd = 8 + 2 + count * 12 + 4;
    const bitsOffset = ifdEnd;
    const sourceOffset = bitsOffset + 8;
    const pixelsOffset = sourceOffset + source.size + (source.size % 2);
    if (pixelsOffset + this.composite.size > 1_500_000_000)
      throw new Error(
        "TIFF exceeds the 1.5 GB export limit. Use a smaller output size.",
      );
    const header = new Uint8Array(ifdEnd);
    const view = new DataView(header.buffer);
    header.set(ascii("MM"));
    view.setUint16(2, 42);
    view.setUint32(4, 8);
    view.setUint16(8, count);
    let offset = 10;
    function tag(id: number, type: number, length: number, value: number) {
      view.setUint16(offset, id);
      view.setUint16(offset + 2, type);
      view.setUint32(offset + 4, length);
      if (type === 3 && length === 1) view.setUint16(offset + 8, value);
      else view.setUint32(offset + 8, value);
      offset += 12;
    }
    tag(256, 4, 1, this.size);
    tag(257, 4, 1, this.size);
    tag(258, 3, 4, bitsOffset);
    tag(259, 3, 1, 8);
    tag(262, 3, 1, 2);
    tag(273, 4, 1, pixelsOffset);
    tag(274, 3, 1, 1);
    tag(277, 3, 1, 4);
    tag(278, 4, 1, this.size);
    tag(279, 4, 1, this.composite.size);
    tag(284, 3, 1, 1);
    tag(317, 3, 1, 1);
    tag(338, 3, 1, 2);
    tag(37724, 7, source.size, sourceOffset);
    return new Blob(
      [
        header,
        join([u16(8), u16(8), u16(8), u16(8)]),
        source,
        new Uint8Array(source.size % 2),
        this.composite,
      ],
      { type: "image/tiff" },
    );
  }
}
