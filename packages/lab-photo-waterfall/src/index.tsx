"use client";

import {
  defaultTranslate,
  formatMessage,
  type Translate,
} from "@kiochan/lab-ui/localization";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  buildWaterfall,
  type GapPlacement,
  moveWaterfallPhoto,
  type WaterfallLayout,
} from "./layout";
import { PreviewBoard } from "./preview-board";
import styles from "./waterfall.module.css";

type Photo = {
  id: number;
  name: string;
  width: number;
  height: number;
  image: HTMLImageElement;
};

const minWidth = 120;
const maxWidth = 8192;
const maxColumns = 12;

async function readPhoto(file: File, id: number): Promise<Photo> {
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
      image,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function draw(
  canvas: HTMLCanvasElement,
  photos: readonly Photo[],
  layout: WaterfallLayout,
  color: string | null,
  scale = 1,
) {
  const pixel = (value: number) => Math.round(value * scale);
  canvas.width = Math.max(1, pixel(layout.width));
  canvas.height = Math.max(1, pixel(layout.height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable.");

  context.imageSmoothingQuality = "high";
  if (color !== null) {
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  for (const { index, x, y, width, height } of layout.tiles) {
    context.drawImage(
      photos[index].image,
      pixel(x),
      pixel(y),
      pixel(x + width) - pixel(x),
      pixel(y + height) - pixel(y),
    );
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
  const [gap, setGap] = useState<GapPlacement>("bottom");
  const [manualOrder, setManualOrder] = useState<number[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
  const [exportError, setExportError] = useState("");
  const nextId = useRef(0);
  const importing = useRef(false);
  const dragDepth = useRef(0);
  const widthValue = Number(width);
  const columnValue = Number(columns);
  const valid =
    Number.isInteger(widthValue) &&
    widthValue >= minWidth &&
    widthValue <= maxWidth &&
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

  const background = transparent ? null : color;
  const paint = useCallback(
    (canvas: HTMLCanvasElement, scale: number) => {
      if (layout) draw(canvas, photos, layout, background, scale);
    },
    [layout, photos, background],
  );

  function move(index: number, column: number, before: number | undefined) {
    if (!layout) return;
    setManualOrder(
      moveWaterfallPhoto(layout, index, column, before).map((group) =>
        group.map((item) => photos[item].id),
      ),
    );
    setExportError("");
  }

  const tooLarge =
    layout &&
    (layout.height > 16_384 || layout.width * layout.height > 32_000_000);

  async function addPhotos(files: FileList) {
    if (!files.length || importing.current) return;
    importing.current = true;
    setLoading(true);
    setRejectedFiles([]);
    setExportError("");
    const accepted: Photo[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      try {
        accepted.push(await readPhoto(file, nextId.current++));
      } catch {
        rejected.push(file.name);
      }
    }
    setPhotos((current) => [...current, ...accepted]);
    setRejectedFiles(rejected);
    importing.current = false;
    setLoading(false);
  }

  async function download() {
    if (!layout || tooLarge || exporting) return;
    setExporting(true);
    setExportError("");
    const canvas = document.createElement("canvas");
    try {
      paint(canvas, 1);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("PNG encoding failed.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "photo-waterfall.png";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch {
      setExportError("PNG export failed. Try a smaller canvas width.");
    } finally {
      canvas.width = 0;
      canvas.height = 0;
      setExporting(false);
    }
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
              min={minWidth}
              max={maxWidth}
              value={width}
              onChange={(event) => setWidth(event.currentTarget.value)}
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
              disabled={transparent}
              onChange={(event) => setColor(event.currentTarget.value)}
            />
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={transparent}
              onChange={(event) => setTransparent(event.currentTarget.checked)}
            />
            {t("Transparent")}
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
            disabled={!layout || !!tooLarge || exporting || loading}
            onClick={() => void download()}
          >
            {t(exporting ? "Exporting…" : "Download PNG")}
          </button>
        </div>
      </div>

      {layout && (
        <p className={styles.editHint}>
          {t("Drag photos to reorder them or move them to another column.")}
        </p>
      )}
      <div className={styles.stage} data-dragging={dragging || undefined}>
        {layout ? (
          <PreviewBoard
            layout={layout}
            photos={photos}
            transparent={transparent}
            paint={paint}
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
              {photos.map(({ id, name }) => (
                <li key={id}>
                  <span>{name}</span>
                  <button
                    type="button"
                    aria-label={formatMessage(t, "Remove {name}", { name })}
                    onClick={() => {
                      setPhotos((current) =>
                        current.filter((photo) => photo.id !== id),
                      );
                      setExportError("");
                    }}
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
            {t("Use a width of 120–8192 px and 1–12 columns.")}
          </p>
        )}
        {tooLarge && (
          <p role="status">
            {t(
              "This collage is too large to export. Reduce the canvas width or add columns.",
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
