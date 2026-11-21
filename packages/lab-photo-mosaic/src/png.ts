const signature = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10);
const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) {
    crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return crc;
});

function pngChunk(type: string, bytes: Uint8Array<ArrayBuffer>): BlobPart[] {
  const header = new Uint8Array(8);
  new DataView(header.buffer).setUint32(0, bytes.length);
  header.set(new TextEncoder().encode(type), 4);
  let crc = 0xffffffff;
  for (const buffer of [header.subarray(4), bytes]) {
    for (const value of buffer) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ value) & 255];
    }
  }
  const checksum = new DataView(new ArrayBuffer(4));
  checksum.setUint32(0, crc ^ 0xffffffff);
  return [header, bytes, checksum];
}

export async function encodePng(
  width: number,
  height: number,
  bands: AsyncGenerator<Uint8Array<ArrayBuffer>>,
) {
  const header = new Uint8Array(13);
  const dimensions = new DataView(header.buffer);
  dimensions.setUint32(0, width);
  dimensions.setUint32(4, height);
  header[8] = 8;
  header[9] = 6;
  const parts: BlobPart[] = [signature, ...pngChunk("IHDR", header)];

  const input = new ReadableStream<Uint8Array<ArrayBuffer>>({
    async pull(controller) {
      const band = await bands.next();
      if (band.done) controller.close();
      else controller.enqueue(band.value);
    },
    async cancel() {
      await bands.return(undefined);
    },
  });
  const reader = input
    .pipeThrough(new CompressionStream("deflate"))
    .getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(...pngChunk("IDAT", value));
    }
  } finally {
    await reader.cancel();
  }
  parts.push(...pngChunk("IEND", new Uint8Array()));
  return new Blob(parts, { type: "image/png" });
}
