"use client";

import {
  defaultTranslate,
  formatMessage,
  type Translate,
} from "@kiochan/lab-ui/localization";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WaterfallFormat } from "./export";
import {
  buildWaterfall,
  type GapPlacement,
  moveWaterfallPhoto,
} from "./layout";
import { PreviewBoard } from "./preview-board";
import styles from "./waterfall.module.css";

type Photo = {
  id: number;
  name: string;
  width: number;
  height: number;
  file: File;
  url: string;
};

const maxColumns = 12;
const formatLabels = {
  png: "PNG",
  webp: "WebP",
  jpg: "JPG",
};
const exportErrors = {
  "jpeg-size":
    "JPG supports up to 65,535 pixels per side. Choose PNG for larger collages.",
  "png-size": "The collage exceeds PNG’s maximum image dimensions.",
  "webp-size":
    "WebP supports up to 16,383 pixels per side. Choose PNG for larger collages.",
  encoding: "Could not export the collage on this device.",
};

async function makeThumbnail(image: HTMLImageElement) {
  const { naturalWidth: width, naturalHeight: height } = image;
  const scale = Math.min(
    1,
    Math.sqrt((768 * 768) / (width * height)),
    4096 / Math.max(width, height),
  );
  if (scale === 1) return null;

  const canvas = document.createElement("canvas");
  try {
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86),
    );
  } catch {
    return null;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

async function readPhoto(file: File, id: number) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return {
      id,
      name: file.name,
      width: image.naturalWidth,
      height: image.naturalHeight,
      file,
      preview: (await makeThumbnail(image)) ?? file,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function currentOrder(
  photos: readonly Photo[],
  order: readonly (readonly number[])[],
) {
  const indices = new Map(photos.map((photo, index) => [photo.id, index]));
  const groups = order.map((ids) =>
    ids.flatMap((id) => {
      const index = indices.get(id);
      indices.delete(id);
      return index === undefined ? [] : [index];
    }),
  );
  const ratio = (index: number) => photos[index].height / photos[index].width;
  const loads = groups.map((group) =>
    group.reduce((sum, index) => sum + ratio(index), 0),
  );
  for (const index of indices.values()) {
    const shortest = loads.indexOf(Math.min(...loads));
    groups[shortest].push(index);
    loads[shortest] += ratio(index);
  }
  return groups;
}

export function PhotoWaterfall({
  locale = "en",
  t = defaultTranslate,
}: {
  locale?: string;
  t?: Translate;
} = {}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [width, setWidth] = useState("1200");
  const [columns, setColumns] = useState("3");
  const [color, setColor] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);
  const [format, setFormat] = useState<WaterfallFormat>("png");
  const [fit, setFit] = useState(true);
  const [gap, setGap] = useState<GapPlacement>("bottom");
  const [manualOrder, setManualOrder] = useState<number[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
  const [exportError, setExportError] = useState("");
  const nextId = useRef(0);
  const importRequest = useRef<AbortController | null>(null);
  const exportRequest = useRef<AbortController | null>(null);
  const previewUrls = useRef(new Set<string>());
  const dragDepth = useRef(0);
  const widthValue = Number(width);
  const columnValue = Number(columns);
  const valid =
    Number.isSafeInteger(widthValue) &&
    widthValue >= columnValue &&
    Number.isInteger(columnValue) &&
    columnValue >= 1 &&
    columnValue <= maxColumns;
  const layout = useMemo(
    () =>
      valid && photos.length
        ? buildWaterfall(
            photos,
            widthValue,
            columnValue,
            gap,
            manualOrder?.length === columnValue
              ? currentOrder(photos, manualOrder)
              : undefined,
          )
        : null,
    [photos, valid, widthValue, columnValue, gap, manualOrder],
  );

  const showTransparency = transparent && format !== "jpg";
  const background = showTransparency ? null : color;
  const move = useCallback(
    (index: number, column: number, before: number | undefined) => {
      if (!layout) return;
      setManualOrder(
        moveWaterfallPhoto(layout, index, column, before).map((group) =>
          group.map((item) => photos[item].id),
        ),
      );
      setExportError("");
    },
    [layout, photos],
  );

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      importRequest.current?.abort();
      exportRequest.current?.abort();
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  async function addPhotos(files: FileList) {
    if (!files.length || importRequest.current) return;
    const request = new AbortController();
    importRequest.current = request;
    setLoading(true);
    setRejectedFiles([]);
    setExportError("");
    const accepted: Photo[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const { preview, ...photo } = await readPhoto(file, nextId.current++);
        if (request.signal.aborted) return;
        const url = URL.createObjectURL(preview);
        previewUrls.current.add(url);
        accepted.push({ ...photo, url });
      } catch {
        rejected.push(file.name);
      }
      if (request.signal.aborted) return;
    }
    setPhotos((current) => [...current, ...accepted]);
    setRejectedFiles(rejected);
    importRequest.current = null;
    setLoading(false);
  }

  async function download() {
    if (!layout || exportRequest.current || importRequest.current) return;
    const request = new AbortController();
    exportRequest.current = request;
    setExporting(true);
    setExportError("");
    try {
      const { exportWaterfall, WaterfallExportError } = await import(
        "./export"
      );
      const blob = await exportWaterfall(
        photos,
        layout,
        background,
        format,
        request.signal,
      ).catch((error: unknown) => {
        if (error instanceof WaterfallExportError && !request.signal.aborted) {
          setExportError(exportErrors[error.code]);
          return null;
        }
        throw error;
      });
      if (!blob || request.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `photo-waterfall.${format}`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch {
      if (!request.signal.aborted) setExportError(exportErrors.encoding);
    } finally {
      exportRequest.current = null;
      if (!request.signal.aborted) setExporting(false);
    }
  }

  function removePhoto(photo: Photo) {
    URL.revokeObjectURL(photo.url);
    previewUrls.current.delete(photo.url);
    setPhotos((current) => current.filter(({ id }) => id !== photo.id));
    setExportError("");
  }

  return (
    <section
      className={styles.editor}
      aria-label={t("Photo waterfall editor")}
      onDragEnter={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        dragDepth.current++;
        setDragging(true);
      }}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = loading ? "none" : "copy";
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (!dragDepth.current) setDragging(false);
      }}
      onDrop={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        void addPhotos(event.dataTransfer.files);
      }}
    >
      <div className={styles.toolbar}>
        <div className={styles.controls}>
          <label>
            {t("Canvas width (px)")}
            <input
              type="number"
              min="1"
              value={width}
              onChange={(event) => {
                setWidth(event.currentTarget.value);
                setExportError("");
              }}
            />
          </label>
          <label>
            {t("Columns")}
            <input
              type="number"
              min="1"
              max={maxColumns}
              value={columns}
              onChange={(event) => {
                const input = event.currentTarget;
                setColumns(input.value);
                setExportError("");
                if (
                  input.value &&
                  input.validity.valid &&
                  input.valueAsNumber !== manualOrder?.length
                ) {
                  setManualOrder(null);
                }
              }}
            />
          </label>
          <label>
            {t("Gap placement")}
            <select
              value={gap}
              onChange={(event) =>
                setGap(event.currentTarget.value as GapPlacement)
              }
            >
              <option value="bottom">{t("Bottom")}</option>
              <option value="top">{t("Top")}</option>
              <option value="ends">{t("Top and bottom")}</option>
              <option value="between">{t("Between photos")}</option>
            </select>
          </label>
          <label>
            {t("Background color")}
            <input
              type="color"
              value={color}
              disabled={showTransparency}
              onChange={(event) => setColor(event.currentTarget.value)}
            />
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={showTransparency}
              disabled={format === "jpg"}
              onChange={(event) => setTransparent(event.currentTarget.checked)}
            />
            {t("Transparent")}
          </label>
          <label>
            {t("Export format")}
            <select
              value={format}
              onChange={(event) => {
                setFormat(event.currentTarget.value as WaterfallFormat);
                setExportError("");
              }}
            >
              {Object.entries(formatLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.actions}>
          <label className={styles.upload}>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={loading}
              onChange={(event) => {
                const input = event.currentTarget;
                if (input.files) void addPhotos(input.files);
                input.value = "";
              }}
            />
            {t(loading ? "Opening photos…" : "Add photos")}
          </label>
          {layout && manualOrder && (
            <button type="button" onClick={() => setManualOrder(null)}>
              {t("Auto arrange")}
            </button>
          )}
          <button
            type="button"
            className={styles.download}
            disabled={!layout || exporting || loading}
            onClick={() => void download()}
          >
            {exporting
              ? t("Exporting…")
              : formatMessage(t, "Download {format}", {
                  format: formatLabels[format],
                })}
          </button>
        </div>
      </div>

      {layout && (
        <div className={styles.previewTools}>
          <p className={styles.editHint}>
            {t("Drag photos to reorder them or move them to another column.")}
          </p>
          <button type="button" onClick={() => setFit((current) => !current)}>
            {t(fit ? "Scroll to edit" : "Fit all")}
          </button>
        </div>
      )}
      <div className={styles.stage} data-dragging={dragging || undefined}>
        {layout ? (
          <PreviewBoard
            layout={layout}
            photos={photos}
            background={background}
            fit={fit}
            onMove={move}
            t={t}
          />
        ) : (
          <div className={styles.empty}>
            <span className={styles.diagram} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <strong>
              {t(
                photos.length
                  ? "Check the canvas settings"
                  : "Drop photos here",
              )}
            </strong>
            <span>
              {t(
                photos.length
                  ? "Enter a valid width and column count to preview the collage."
                  : "Photos stay in your browser.",
              )}
            </span>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div aria-live="polite">
          {layout && (
            <span>
              {layout.width} × {layout.height} px ·{" "}
              {formatMessage(t, "{percent}% unfilled", {
                percent: layout.fillPercent.toLocaleString(locale, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }),
              })}
            </span>
          )}
        </div>
        {photos.length > 0 && (
          <details>
            <summary>
              {formatMessage(
                t,
                photos.length === 1 ? "{count} photo" : "{count} photos",
                {
                  count: photos.length,
                },
              )}
            </summary>
            <ul className={styles.files}>
              {photos.map((photo) => (
                <li key={photo.id}>
                  <span>{photo.name}</span>
                  <button
                    type="button"
                    aria-label={formatMessage(t, "Remove {name}", {
                      name: photo.name,
                    })}
                    onClick={() => removePhoto(photo)}
                  >
                    {t("Remove")}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
        {!valid && (
          <p role="status">
            {t(
              "Use 1–12 columns and a whole-pixel width at least as large as the column count.",
            )}
          </p>
        )}
        {rejectedFiles.length > 0 && (
          <p role="alert">
            {formatMessage(t, "Could not open {files}.", {
              files: new Intl.ListFormat(locale).format(rejectedFiles),
            })}
          </p>
        )}
        {exportError && <p role="alert">{t(exportError)}</p>}
      </div>
    </section>
  );
}
