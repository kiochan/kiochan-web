import type { Cell, PhotoFit, Size } from "./layout";

export type Smoothing = ImageSmoothingQuality | "off";
export type RasterSource = Size & { id: string; file: File };
export const exportTypes = {
  png: "image/png",
  webp: "image/webp",
  jpg: "image/jpeg",
} as const;

export type ExportFormat = keyof typeof exportTypes;
export const defaultBackground = "#ffffff";

export function exportBackground(
  format: ExportFormat,
  background: string | null,
) {
  return background ?? (format === "jpg" ? defaultBackground : null);
}

export type Request = {
  format: ExportFormat;
  fit: PhotoFit;
  background: string | null;
  spacing: number;
  layout: Cell[];
  size: Size;
  sources: RasterSource[];
  smoothing: Smoothing;
};
export type Reply =
  | { kind: "export"; blob: Blob }
  | { kind: "error"; message: string };
