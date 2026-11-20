import type { Cell, Size } from "./layout";

export type Smoothing = ImageSmoothingQuality | "off";
export type RasterSource = Size & { id: string; file: File };
export type Request = {
  kind: "arrange" | "preview" | "export";
  layout: Cell[];
  size: Size;
  sources: RasterSource[];
  pinned: string[];
  smoothing: Smoothing;
  target?: RasterSource;
  strength: number;
  density: number;
  matchBrightness: boolean;
};
export type Reply =
  | { kind: "arrange"; layout: Cell[]; changed: boolean }
  | { kind: "preview"; bitmap: ImageBitmap }
  | { kind: "export"; blob: Blob }
  | { kind: "error"; message: string };

export function scaledSize(size: Size, longest: number): Size {
  const scale = Math.min(1, longest / Math.max(size.width, size.height));
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}
