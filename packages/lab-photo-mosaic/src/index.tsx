"use client";

import {
  defaultTranslate,
  formatMessage,
  type Translate,
} from "@kiochan/lab-ui/localization";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type Cell,
  type Corner,
  cornerEdges,
  edgeAxis,
  edgePosition,
  edges,
  isCorner,
  minimumTileSide,
  type Photo,
  type PhotoFit,
  type PhotoLocks,
  photoFrames,
  photoLimit,
  place,
  type ResizeHandle,
  repack,
  resizeCanvas,
  resizeTile,
  type Size,
} from "./layout";
import styles from "./mosaic.module.css";
import {
  defaultBackground,
  type ExportFormat,
  exportBackground,
  type RasterSource,
  type Smoothing,
} from "./render-request";
import { processMosaic } from "./worker-client";

const formats = {
  "4:3": { width: 3200, height: 2400 },
  "3:4": { width: 2400, height: 3200 },
  "1:1": { width: 3200, height: 3200 },
  "16:9": { width: 3200, height: 1800 },
  "9:16": { width: 1800, height: 3200 },
} satisfies Record<string, Size>;
const minSide = 64;
const maxSide = 16383;
const maxPixels = 64 * 1024 * 1024;
const zoomLevels = [50, 75, 100, 125, 150, 200, 300, 400];
const fitZoom = zoomLevels.indexOf(100);
const fitDescriptions: Record<PhotoFit, string> = {
  cover: "Balances photo sizes and fills the canvas.",
  maximize: "Fills the canvas while keeping more of each photo visible.",
  contain: "Fits whole photos together and minimizes leftover space.",
};
const exportLabels = { png: "PNG", webp: "WebP", jpg: "JPG" } satisfies Record<
  ExportFormat,
  string
>;
type Asset = Photo & RasterSource & { name: string; url: string };
type Project = {
  layout: Cell[];
  size: Size;
  locks: PhotoLocks;
  fit: PhotoFit;
};
type History = { past: Project[]; present: Project; future: Project[] };
type Notice =
  | string
  | [template: string, values: Record<string, string | number>];
type Gesture = {
  pointer: number;
  cell: Cell;
  layout: Cell[];
  photos: Photo[];
  rect: DOMRect;
  x: number;
  y: number;
  edge?: ResizeHandle;
  lastValid: Cell[];
};
type PanGesture = {
  pointer: number;
  x: number;
  y: number;
  left: number;
  top: number;
};

const empty: Project = {
  layout: [],
  size: formats["4:3"],
  locks: { position: new Set(), size: new Set() },
  fit: "cover",
};
let nextAssetId = 0;
const arrows: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};
const handleLabels: Record<ResizeHandle, string> = {
  left: "Resize left edge",
  right: "Resize right edge",
  top: "Resize top edge",
  bottom: "Resize bottom edge",
  "top-left": "Scale from top-left corner",
  "top-right": "Scale from top-right corner",
  "bottom-left": "Scale from bottom-left corner",
  "bottom-right": "Scale from bottom-right corner",
};

async function loadPhoto(file: File): Promise<Asset | null> {
  if (file.type === "image/svg+xml" || /\.svgz?$/i.test(file.name)) return null;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
    if (image.naturalWidth === 0 || image.naturalHeight === 0)
      throw new Error();
    return {
      id: String(++nextAssetId),
      name: file.name,
      aspect: image.naturalWidth / image.naturalHeight,
      url,
      file,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } catch {
    URL.revokeObjectURL(url);
    return null;
  }
}

function downloadMosaic(blob: Blob, size: Size, format: ExportFormat) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `photo-mosaic-${size.width}x${size.height}.${format}`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function centerPreview(
  viewport: HTMLDivElement,
  board: HTMLDivElement,
  x: number,
  y: number,
) {
  const frame = viewport.getBoundingClientRect();
  const canvas = board.getBoundingClientRect();
  viewport.scrollBy({
    left:
      canvas.left - frame.left + x * canvas.width - viewport.clientWidth / 2,
    top: canvas.top - frame.top + y * canvas.height - viewport.clientHeight / 2,
  });
}

export function PhotoMosaic({
  locale = "en",
  t = defaultTranslate,
}: {
  locale?: string;
  t?: Translate;
} = {}) {
  const [history, setHistory] = useState<History>({
    past: [],
    present: empty,
    future: [],
  });
  const [selected, setSelected] = useState<string>();
  const [draft, setDraft] = useState<Cell[]>();
  const [dragging, setDragging] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [zoom, setZoom] = useState(fitZoom);
  const [panMode, setPanMode] = useState(false);
  const [smoothing, setSmoothing] = useState<Smoothing>("high");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [transparent, setTransparent] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState(defaultBackground);
  const [spacingInput, setSpacingInput] = useState("0");
  const [busy, setBusy] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const assets = useRef(new Map<string, Asset>());
  const mounted = useRef(false);
  const lifetime = useRef(new AbortController());
  const working = useRef(false);
  const gesture = useRef<Gesture | null>(null);
  const dragEntries = useRef(0);
  const viewport = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const panGesture = useRef<PanGesture | null>(null);
  const zoomCenter = useRef<{ level: number; x: number; y: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const anchor = zoomCenter.current;
    if (anchor?.level !== zoom) return;
    zoomCenter.current = null;
    if (viewport.current && board.current)
      centerPreview(viewport.current, board.current, anchor.x, anchor.y);
  }, [zoom]);

  useEffect(() => {
    const photos = assets.current;
    const controller = new AbortController();
    lifetime.current = controller;
    mounted.current = true;
    return () => {
      controller.abort();
      mounted.current = false;
      for (const photo of photos.values()) URL.revokeObjectURL(photo.url);
      photos.clear();
    };
  }, []);

  useEffect(() => {
    const retained = new Set(
      [...history.past, history.present, ...history.future].flatMap(
        ({ layout }) => layout.map(({ id }) => id),
      ),
    );
    for (const [id, asset] of assets.current) {
      if (retained.has(id)) continue;
      URL.revokeObjectURL(asset.url);
      assets.current.delete(id);
    }
  }, [history]);

  const project = history.present;
  const { layout: original, locks, size, fit } = project;
  const background = transparent ? null : backgroundColor;
  const previewBackground = exportBackground(exportFormat, background);
  const preset =
    Object.entries(formats).find(
      ([, value]) => value.width === size.width && value.height === size.height,
    )?.[0] ?? "custom";
  const layout = draft ?? original;
  const requestedSpacing = Number(spacingInput);
  const spacing =
    Number.isSafeInteger(requestedSpacing) && requestedSpacing > 0
      ? requestedSpacing
      : 0;
  const frames = useMemo(
    () => new Map(photoFrames(layout, spacing).map((cell) => [cell.id, cell])),
    [layout, spacing],
  );
  const active = layout.find(({ id }) => id === selected);
  const lockedIds = new Set([...locks.position, ...locks.size]);
  const freeCount = layout.filter(
    ({ id }) => !locks.position.has(id) || !locks.size.has(id),
  ).length;
  const positionLocked = Boolean(active && locks.position.has(active.id));
  const sizeLocked = Boolean(active && locks.size.has(active.id));
  const handles: ResizeHandle[] =
    active && !sizeLocked && !panMode
      ? [
          ...edges(active, size, fit).filter(
            (edge) => !positionLocked || edge === "right" || edge === "bottom",
          ),
          ...(positionLocked
            ? ["bottom-right" as const]
            : (Object.keys(cornerEdges) as Corner[])),
        ]
      : [];

  const blocked = busy || dragging;
  const hasOpenSpace =
    original.reduce((sum, cell) => sum + cell.width * cell.height, 0) <
    size.width * size.height;
  const canImport =
    !blocked &&
    layout.length < photoLimit &&
    (freeCount > 0 || !layout.length || (fit === "contain" && hasOpenSpace));
  function setNotice(...messages: Notice[]) {
    setNotices(messages);
  }

  function commit(next: Project) {
    setHistory(({ past, present }) => ({
      past: [...past.slice(-19), present],
      present: next,
      future: [],
    }));
  }

  function step(direction: "undo" | "redo") {
    const { past, present, future } = history;
    if (direction === "undo" && past.length) {
      setHistory({
        past: past.slice(0, -1),
        present: past[past.length - 1],
        future: [present, ...future],
      });
    } else if (direction === "redo" && future.length) {
      setHistory({
        past: [...past, present],
        present: future[0],
        future: future.slice(1),
      });
    }
    setNotice();
  }

  function currentPhotos() {
    return original.map(({ id }) => assets.current.get(id) as Asset);
  }

  async function addPhotos(files: File[]) {
    if (!files.length || !canImport || working.current || gesture.current)
      return;
    working.current = true;
    setBusy(true);
    setNotice("Opening photos…");
    const existing = currentPhotos();
    const added: Asset[] = [];
    let failed = 0;
    let processed = 0;
    for (const file of files) {
      if (existing.length + added.length >= photoLimit || !mounted.current)
        break;
      const photo = await loadPhoto(file);
      processed++;
      if (photo) added.push(photo);
      else failed++;
    }
    const next = added.length
      ? repack(original, size, [...existing, ...added], locks, undefined, fit)
      : original;
    if (mounted.current && next !== original) {
      for (const photo of added) assets.current.set(photo.id, photo);
      setSelected(added[0].id);
      commit({ ...project, layout: next });
    } else {
      for (const photo of added) URL.revokeObjectURL(photo.url);
    }
    working.current = false;
    if (!mounted.current) return;
    setBusy(false);
    if (added.length && next === original) {
      setNotice("Unlock a photo to make room for the new images.");
      return;
    }
    const messages: Notice[] = [];
    if (failed) {
      messages.push([
        failed === 1
          ? "{count} file could not be opened as a photo."
          : "{count} files could not be opened as photos.",
        { count: failed },
      ]);
    }
    if (processed < files.length) {
      messages.push([
        "This mosaic can hold up to {count} photos.",
        { count: photoLimit },
      ]);
    }
    setNotice(...messages);
  }

  function reroll() {
    const next = repack(original, size, currentPhotos(), locks, undefined, fit);
    if (next !== original) commit({ ...project, layout: next });
    setNotice();
  }

  function remove(id: string) {
    const next = repack(
      original,
      size,
      currentPhotos().filter((photo) => photo.id !== id),
      locks,
      undefined,
      fit,
    );
    if (next === original) {
      setNotice(
        "Unlock another photo to remove this one and keep the canvas filled.",
      );
      return;
    }
    setSelected(undefined);
    setNotice();
    commit({ ...project, layout: next });
  }

  function setSize(next: Size) {
    if (next.width === size.width && next.height === size.height) return;
    if (
      ![next.width, next.height].every(
        (side) => Number.isInteger(side) && side >= minSide && side <= maxSide,
      ) ||
      next.width * next.height > maxPixels
    ) {
      setNotice([
        "Enter whole pixel dimensions from {min} to {max}, up to {total} pixels total.",
        { min: String(minSide), max: String(maxSide), total: maxPixels },
      ]);
      return;
    }
    const resized = resizeCanvas(
      original,
      size,
      next,
      currentPhotos(),
      locks,
      fit,
    );
    if (!resized) {
      setNotice(
        lockedIds.size
          ? "This size cannot be filled around the locked photos. Unlock photos or try a different size."
          : "This canvas is too small to fit all the photos.",
      );
      return;
    }
    commit({ ...project, size: next, layout: resized });
    setNotice();
  }

  function setPhotoFit(next: PhotoFit) {
    if (next === fit) return;
    let cells = original;
    if (original.length && (next !== "cover" || hasOpenSpace)) {
      cells = repack(original, size, currentPhotos(), locks, undefined, next);
      if (
        next !== "contain" &&
        cells.reduce((sum, cell) => sum + cell.width * cell.height, 0) <
          size.width * size.height
      ) {
        setNotice("Unlock a photo to switch to a filled canvas.");
        return;
      }
    }
    commit({ ...project, fit: next, layout: cells });
    setNotice();
  }

  function setTileSize(cell: Cell, dimensions: Size) {
    const next = resizeTile(
      original,
      size,
      currentPhotos(),
      locks,
      cell,
      dimensions,
      fit,
    );
    if (!next) {
      setNotice(
        "That tile size does not fit. Try a smaller size or unlock a photo.",
      );
      return;
    }
    if (next !== original) commit({ ...project, layout: next });
    setNotice();
  }

  function toggleLock(id: string, axis: keyof PhotoLocks) {
    const next = new Set(locks[axis]);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    commit({ ...project, locks: { ...locks, [axis]: next } });
    setNotice();
  }

  function unlockPhoto(id: string) {
    const position = new Set(locks.position);
    const size = new Set(locks.size);
    position.delete(id);
    size.delete(id);
    commit({ ...project, locks: { position, size } });
    setNotice();
  }

  function lockLabel(id: string) {
    if (locks.position.has(id))
      return locks.size.has(id) ? "Position and size fixed" : "Position fixed";
    return "Size fixed";
  }

  function showLockedPhoto(cell: Cell) {
    setSelected(cell.id);
    if (!viewport.current || !board.current) return;
    viewport.current.scrollIntoView({ block: "nearest" });
    centerPreview(
      viewport.current,
      board.current,
      (cell.x + cell.width / 2) / size.width,
      (cell.y + cell.height / 2) / size.height,
    );
  }

  function changeZoom(next: number) {
    const view = viewport.current;
    if (dragging || zoom === next || !view || !board.current) return;
    const frame = view.getBoundingClientRect();
    const canvas = board.current.getBoundingClientRect();
    zoomCenter.current = {
      level: next,
      x: (frame.left + view.clientWidth / 2 - canvas.left) / canvas.width,
      y: (frame.top + view.clientHeight / 2 - canvas.top) / canvas.height,
    };
    if (next <= fitZoom) setPanMode(false);
    setZoom(next);
  }

  function startPan(event: PointerEvent<HTMLDivElement>) {
    if (!panMode || event.pointerType === "touch" || event.button !== 0) return;
    const frame = event.currentTarget;
    event.preventDefault();
    frame.setPointerCapture(event.pointerId);
    panGesture.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: frame.scrollLeft,
      top: frame.scrollTop,
    };
  }

  function movePan(event: PointerEvent<HTMLDivElement>) {
    const pan = panGesture.current;
    if (!pan || pan.pointer !== event.pointerId) return;
    event.currentTarget.scrollTo(
      pan.left + pan.x - event.clientX,
      pan.top + pan.y - event.clientY,
    );
  }

  function endPan(event: PointerEvent<HTMLDivElement>) {
    if (panGesture.current?.pointer === event.pointerId)
      panGesture.current = null;
  }

  async function exportImage() {
    if (working.current || gesture.current) return;
    working.current = true;
    setBusy(true);
    const format = exportLabels[exportFormat];
    setNotice(["Calculating and encoding {format}…", { format }]);
    try {
      const result = await processMosaic(
        {
          format: exportFormat,
          fit,
          background,
          spacing,
          layout,
          size,
          smoothing,
          sources: currentPhotos(),
        },
        lifetime.current.signal,
      );
      if (mounted.current) {
        downloadMosaic(result.blob, size, exportFormat);
        setNotice(["{format} download started.", { format }]);
      }
    } catch {
      if (mounted.current) {
        setNotice([
          exportFormat === "png"
            ? "Could not export {format}. Try a smaller canvas."
            : "Could not export {format}. Try PNG or a smaller canvas.",
          { format },
        ]);
      }
    } finally {
      working.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  function start(
    event: PointerEvent<HTMLButtonElement>,
    cell: Cell,
    edge?: ResizeHandle,
  ) {
    if (panMode || working.current || gesture.current || event.button !== 0)
      return;
    setSelected(cell.id);
    const surface = board.current;
    if (
      !surface ||
      (edge ? locks.size.has(cell.id) : locks.position.has(cell.id))
    )
      return;
    event.currentTarget.focus({ preventScroll: true });
    surface.setPointerCapture(event.pointerId);
    gesture.current = {
      pointer: event.pointerId,
      cell,
      layout: original,
      photos: currentPhotos(),
      rect: surface.getBoundingClientRect(),
      x: event.clientX,
      y: event.clientY,
      edge,
      lastValid: original,
    };
    setDragging(true);
  }

  function proposal(event: PointerEvent<HTMLDivElement>, drag: Gesture) {
    const x = event.clientX - drag.x;
    const y = event.clientY - drag.y;
    if (!drag.edge && Math.hypot(x, y) < 4) return drag.layout;
    const scaleX = size.width / drag.rect.width;
    const scaleY = size.height / drag.rect.height;
    return place(
      drag.layout,
      size,
      drag.photos,
      locks,
      drag.cell,
      x * scaleX,
      y * scaleY,
      { width: 12 * scaleX, height: 12 * scaleY },
      drag.edge,
      fit,
    );
  }

  function end(event: PointerEvent<HTMLDivElement>, accept: boolean) {
    const drag = gesture.current;
    if (!drag || event.pointerId !== drag.pointer) return;
    gesture.current = null;
    setDraft(undefined);
    setDragging(false);
    if (!accept) return;
    const final = proposal(event, drag);
    const next = final ?? drag.lastValid;
    if (next !== drag.layout) commit({ ...project, layout: next });
    if (final) setNotice();
    else setNotice("That change does not fit around the other photos.");
  }

  function adjustByKey(
    event: KeyboardEvent<HTMLButtonElement>,
    cell: Cell,
    edge?: ResizeHandle,
  ) {
    const direction = arrows[event.key];
    if (
      !direction ||
      blocked ||
      panMode ||
      (edge ? locks.size.has(cell.id) : locks.position.has(cell.id))
    )
      return;
    const [dx, dy] = direction;
    if (edge && !isCorner(edge) && !(edgeAxis(edge) === "x" ? dx : dy)) return;
    event.preventDefault();
    const step = event.shiftKey ? 1 : 24;
    let deltaX = dx * step;
    let deltaY = dy * step;
    if (edge && isCorner(edge)) {
      const [horizontal, vertical] = cornerEdges[edge];
      const sx = horizontal === "left" ? -1 : 1;
      const sy = vertical === "top" ? -1 : 1;
      const direction = dx * sx + dy * sy;
      const scale = (direction * step) / Math.max(cell.width, cell.height);
      deltaX = scale * cell.width * sx;
      deltaY = scale * cell.height * sy;
    }
    const next = place(
      original,
      size,
      currentPhotos(),
      locks,
      cell,
      deltaX,
      deltaY,
      { width: 0, height: 0 },
      edge,
      fit,
    );
    setSelected(cell.id);
    if (next && next !== original) commit({ ...project, layout: next });
    if (next) setNotice();
    else setNotice("That change does not fit around the other photos.");
  }

  return (
    <section className={styles.editor} aria-label={t("Photo mosaic editor")}>
      <div className={styles.toolbar}>
        <label className={styles.upload}>
          {t("Add photos")}
          <input
            type="file"
            multiple
            accept="image/*"
            disabled={!canImport}
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              event.currentTarget.value = "";
              void addPhotos(files);
            }}
          />
        </label>
        <button
          type="button"
          disabled={blocked || freeCount < (fit === "contain" ? 1 : 2)}
          onClick={reroll}
        >
          {t(fit === "contain" ? "Tidy layout" : "Shuffle layout")}
        </button>
        <div className={styles.history}>
          <button
            type="button"
            disabled={blocked || !history.past.length}
            onClick={() => step("undo")}
          >
            {t("Undo")}
          </button>
          <button
            type="button"
            disabled={blocked || !history.future.length}
            onClick={() => step("redo")}
          >
            {t("Redo")}
          </button>
        </div>
        <div className={styles.exportGroup}>
          <label className={styles.format}>
            {t("Export format")}
            <select
              value={exportFormat}
              disabled={blocked}
              onChange={(event) =>
                setExportFormat(event.currentTarget.value as ExportFormat)
              }
            >
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
              <option value="jpg">JPG</option>
            </select>
          </label>
          <button
            className={styles.export}
            type="button"
            disabled={blocked || !layout.length}
            onClick={() => void exportImage()}
          >
            {formatMessage(t, "Download {format}", {
              format: exportLabels[exportFormat],
            })}
          </button>
        </div>
      </div>
      <div className={styles.settings}>
        <label className={styles.format}>
          {t("Photo fit")}
          <select
            value={fit}
            disabled={blocked}
            onChange={(event) =>
              setPhotoFit(event.currentTarget.value as PhotoFit)
            }
          >
            <option value="cover">{t("Automatic layout")}</option>
            <option value="maximize">{t("Keep more of each photo")}</option>
            <option value="contain">{t("Keep whole photos")}</option>
          </select>
        </label>
        <label className={styles.format}>
          {t("Preset")}
          <select
            value={preset}
            disabled={blocked}
            onChange={(event) => {
              const next =
                formats[event.currentTarget.value as keyof typeof formats];
              if (next) setSize(next);
            }}
          >
            <option value="custom" disabled>
              {t("Custom")}
            </option>
            {Object.keys(formats).map((key) => (
              <option key={key}>{key}</option>
            ))}
          </select>
        </label>
        <form
          className={styles.dimensions}
          key={`${size.width}x${size.height}`}
          onSubmit={(event) => {
            event.preventDefault();
            if (blocked) return;
            const values = new FormData(event.currentTarget);
            setSize({
              width: Number(values.get("width")),
              height: Number(values.get("height")),
            });
          }}
        >
          <label className={styles.format}>
            {t("Width (px)")}
            <input
              type="number"
              name="width"
              required
              min={minSide}
              max={maxSide}
              defaultValue={size.width}
              disabled={blocked}
            />
          </label>
          <label className={styles.format}>
            {t("Height (px)")}
            <input
              type="number"
              name="height"
              required
              min={minSide}
              max={maxSide}
              defaultValue={size.height}
              disabled={blocked}
            />
          </label>
          <button type="submit" disabled={blocked}>
            {t("Apply size")}
          </button>
        </form>
        <label className={styles.format}>
          {t("Antialiasing")}
          <select
            value={smoothing}
            disabled={blocked}
            onChange={(event) =>
              setSmoothing(event.currentTarget.value as Smoothing)
            }
          >
            <option value="off">{t("Off (nearest neighbor)")}</option>
            <option value="low">{t("Low")}</option>
            <option value="medium">{t("Medium")}</option>
            <option value="high">{t("High")}</option>
          </select>
        </label>
        <div className={styles.backgroundSettings}>
          <label className={styles.format}>
            {t("Photo spacing (px)")}
            <input
              className={styles.spacingInput}
              type="number"
              min={0}
              step={1}
              value={spacingInput}
              disabled={blocked}
              onChange={(event) => setSpacingInput(event.currentTarget.value)}
              onBlur={() => setSpacingInput(String(spacing))}
            />
          </label>
          <label className={styles.format}>
            {t("Blank areas")}
            <select
              value={transparent ? "transparent" : "color"}
              disabled={blocked}
              onChange={(event) =>
                setTransparent(event.currentTarget.value === "transparent")
              }
            >
              <option value="transparent">{t("Transparent")}</option>
              <option value="color">{t("Solid color")}</option>
            </select>
          </label>
          {!transparent && (
            <label className={styles.format}>
              {t("Background color")}
              <input
                type="color"
                value={backgroundColor}
                disabled={blocked}
                onChange={(event) =>
                  setBackgroundColor(event.currentTarget.value)
                }
              />
            </label>
          )}
          {transparent && exportFormat === "jpg" && (
            <span className={styles.stats}>
              {t("JPG fills transparent areas with white.")}
            </span>
          )}
        </div>
        <p className={styles.fitDescription}>{t(fitDescriptions[fit])}</p>
      </div>
      <p className={styles.status} role="status">
        {notices
          .map((notice) =>
            typeof notice === "string"
              ? t(notice)
              : formatMessage(t, ...notice, locale),
          )
          .join(" ")}
      </p>
      {layout.length > 0 && (
        <div className={styles.previewTools}>
          <span>{t("Preview zoom")}</span>
          <button
            type="button"
            aria-label={t("Zoom out")}
            disabled={dragging || zoom === 0}
            onClick={() => changeZoom(zoom - 1)}
          >
            −
          </button>
          <output>{zoomLevels[zoom]}%</output>
          <button
            type="button"
            aria-label={t("Zoom in")}
            disabled={dragging || zoom === zoomLevels.length - 1}
            onClick={() => changeZoom(zoom + 1)}
          >
            +
          </button>
          <button
            type="button"
            disabled={dragging || zoom === fitZoom}
            onClick={() => changeZoom(fitZoom)}
          >
            {t("Fit to view")}
          </button>
          <button
            type="button"
            aria-pressed={panMode}
            disabled={dragging || zoom <= fitZoom}
            onClick={() => setPanMode(!panMode)}
          >
            {t("Pan preview")}
          </button>
        </div>
      )}
      <section
        aria-label={t("Mosaic canvas")}
        className={styles.stage}
        data-drop-active={dropActive}
        onDragEnter={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          dragEntries.current++;
          setDropActive(canImport);
        }}
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = canImport ? "copy" : "none";
        }}
        onDragLeave={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          dragEntries.current = Math.max(0, dragEntries.current - 1);
          if (dragEntries.current === 0) setDropActive(false);
        }}
        onDrop={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          dragEntries.current = 0;
          setDropActive(false);
          if (!canImport) {
            if (!blocked) {
              setNotice(
                layout.length >= photoLimit
                  ? [
                      "This mosaic can hold up to {count} photos.",
                      { count: photoLimit },
                    ]
                  : "Unlock a photo before adding more files.",
              );
            }
            return;
          }
          void addPhotos(Array.from(event.dataTransfer.files));
        }}
      >
        {layout.length === 0 ? (
          <div className={styles.empty}>
            <strong>{t("Drop photos here")}</strong>
            <span>
              {formatMessage(
                t,
                "Drop up to {count} images, or use Add photos to browse.",
                {
                  count: photoLimit,
                },
              )}
            </span>
          </div>
        ) : (
          <div
            ref={viewport}
            className={styles.previewViewport}
            data-pan={panMode}
            style={{ "--zoom": zoomLevels[zoom] / 100 } as CSSProperties}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            onLostPointerCapture={endPan}
          >
            <div className={styles.previewTrack}>
              <div
                ref={board}
                className={styles.board}
                data-fit={fit}
                data-smoothing={smoothing}
                data-transparent={previewBackground === null}
                style={
                  {
                    "--ratio": size.width / size.height,
                    "--photo-background": previewBackground ?? undefined,
                  } as CSSProperties
                }
                onPointerMove={(event) => {
                  const drag = gesture.current;
                  if (!drag || drag.pointer !== event.pointerId) return;
                  const next = proposal(event, drag);
                  if (next) {
                    drag.lastValid = next;
                    setDraft(next);
                  }
                }}
                onPointerUp={(event) => end(event, true)}
                onPointerCancel={(event) => end(event, false)}
                onLostPointerCapture={(event) => end(event, false)}
              >
                {layout
                  .toSorted((a, b) => Number(a.id) - Number(b.id))
                  .map((cell) => {
                    const asset = assets.current.get(cell.id);
                    const frame = frames.get(cell.id) ?? cell;
                    const locked = lockedIds.has(cell.id);
                    return (
                      <button
                        key={cell.id}
                        type="button"
                        className={styles.tile}
                        aria-label={
                          asset && locked
                            ? formatMessage(t, "{name} ({lock})", {
                                name: asset.name,
                                lock: t(lockLabel(cell.id)),
                              })
                            : asset?.name
                        }
                        aria-pressed={selected === cell.id}
                        data-locked={locks.position.has(cell.id)}
                        style={{
                          left: `${(100 * cell.x) / size.width}%`,
                          top: `${(100 * cell.y) / size.height}%`,
                          width: `${(100 * cell.width) / size.width}%`,
                          height: `${(100 * cell.height) / size.height}%`,
                        }}
                        onPointerDown={(event) => start(event, cell)}
                        onClick={() => setSelected(cell.id)}
                        onKeyDown={(event) => adjustByKey(event, cell)}
                      >
                        <img
                          src={asset?.url}
                          alt=""
                          draggable={false}
                          style={{
                            left: `${(100 * (frame.x - cell.x)) / cell.width}%`,
                            top: `${(100 * (frame.y - cell.y)) / cell.height}%`,
                            width: `${(100 * frame.width) / cell.width}%`,
                            height: `${(100 * frame.height) / cell.height}%`,
                          }}
                        />
                        {locked && (
                          <span className={styles.lock} aria-hidden="true">
                            {t(lockLabel(cell.id))}
                          </span>
                        )}
                      </button>
                    );
                  })}
                {active &&
                  handles.map((edge) => {
                    const corner = isCorner(edge);
                    const axis = corner ? undefined : edgeAxis(edge);
                    const x = corner
                      ? edgePosition(active, cornerEdges[edge][0])
                      : axis === "x"
                        ? edgePosition(active, edge)
                        : active.x + active.width / 2;
                    const y = corner
                      ? edgePosition(active, cornerEdges[edge][1])
                      : axis === "y"
                        ? edgePosition(active, edge)
                        : active.y + active.height / 2;
                    return (
                      <button
                        type="button"
                        key={edge}
                        className={styles.handle}
                        data-axis={axis}
                        data-corner={corner ? edge : undefined}
                        aria-label={t(handleLabels[edge])}
                        style={{
                          left: `${(100 * x) / size.width}%`,
                          top: `${(100 * y) / size.height}%`,
                        }}
                        onPointerDown={(event) => start(event, active, edge)}
                        onKeyDown={(event) => adjustByKey(event, active, edge)}
                      />
                    );
                  })}
              </div>
            </div>
          </div>
        )}
        {dropActive && layout.length > 0 && (
          <div className={styles.dropOverlay} aria-hidden="true">
            <span>{t("Drop photos to add them")}</span>
          </div>
        )}
      </section>
      <div className={styles.inspector}>
        <span className={styles.stats}>
          {size.width} × {size.height} px ·{" "}
          {formatMessage(
            t,
            layout.length === 1 ? "{count} photo" : "{count} photos",
            {
              count: layout.length,
            },
          )}{" "}
          · {formatMessage(t, "{count} locked", { count: lockedIds.size })}
        </span>
        {active ? (
          <div className={styles.selection}>
            <div className={styles.selectedPhoto}>
              <span>{t("Selected photo")}</span>
              <strong title={assets.current.get(active.id)?.name}>
                {assets.current.get(active.id)?.name}
              </strong>
            </div>
            <form
              className={styles.tileSize}
              key={`${active.id}:${active.width}x${active.height}`}
              onSubmit={(event) => {
                event.preventDefault();
                if (blocked || sizeLocked) return;
                const values = new FormData(event.currentTarget);
                setTileSize(active, {
                  width: Number(values.get("tile-width")),
                  height: Number(values.get("tile-height")),
                });
              }}
            >
              <label className={styles.format}>
                {t("Tile width (px)")}
                <input
                  name="tile-width"
                  type="number"
                  required
                  min={minimumTileSide}
                  max={size.width - active.x}
                  defaultValue={active.width}
                  disabled={blocked || sizeLocked}
                />
              </label>
              <label className={styles.format}>
                {t("Tile height (px)")}
                <input
                  name="tile-height"
                  type="number"
                  required
                  min={minimumTileSide}
                  max={size.height - active.y}
                  defaultValue={active.height}
                  disabled={blocked || sizeLocked}
                />
              </label>
              <button type="submit" disabled={blocked || sizeLocked}>
                {t("Resize tile")}
              </button>
            </form>
            <div className={styles.selectionActions}>
              <button
                type="button"
                aria-pressed={positionLocked}
                disabled={blocked}
                onClick={() => toggleLock(active.id, "position")}
              >
                {t("Fix position")}
              </button>
              <button
                type="button"
                aria-pressed={sizeLocked}
                disabled={blocked}
                onClick={() => toggleLock(active.id, "size")}
              >
                {t("Fix size")}
              </button>
              <button
                type="button"
                disabled={blocked || positionLocked || sizeLocked}
                onClick={() => remove(active.id)}
              >
                {t("Remove")}
              </button>
            </div>
          </div>
        ) : (
          layout.length > 0 && (
            <span className={styles.stats}>
              {t("Select a photo to resize, lock, or remove it.")}
            </span>
          )
        )}
        {lockedIds.size > 0 && (
          <div className={styles.lockedPhotos}>
            <h3>{t("Locked photos")}</h3>
            <ul>
              {original
                .filter(({ id }) => lockedIds.has(id))
                .map((cell) => {
                  const photo = assets.current.get(cell.id);
                  if (!photo) return null;
                  return (
                    <li key={cell.id}>
                      <button
                        type="button"
                        className={styles.lockedPhoto}
                        aria-pressed={selected === cell.id}
                        disabled={blocked}
                        onClick={() => showLockedPhoto(cell)}
                      >
                        <img
                          className={styles.lockedPhotoThumb}
                          src={photo.url}
                          alt=""
                          loading="lazy"
                        />
                        <span title={photo.name}>
                          {photo.name}
                          <br />
                          <small>{t(lockLabel(cell.id))}</small>
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={blocked}
                        aria-label={formatMessage(t, "Unlock {name}", {
                          name: photo.name,
                        })}
                        onClick={() => unlockPhoto(cell.id)}
                      >
                        {t("Unlock")}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </div>
      {layout.length > 0 && (
        <p className={styles.hint}>
          {t(
            "Drag photos to move them. Drag a side to resize one dimension or a corner to keep the tile's proportions. Arrow keys also work on focused photos and handles.",
          )}
        </p>
      )}
    </section>
  );
}
