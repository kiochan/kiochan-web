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
  useRef,
  useState,
} from "react";
import { densityTileCount, maxDensity } from "./density";
import {
  type Cell,
  type Edge,
  edgeAxis,
  edgePosition,
  edges,
  type Photo,
  photoLimit,
  place,
  repack,
  resizeCanvas,
  type Size,
} from "./layout";
import styles from "./mosaic.module.css";
import {
  type RasterSource,
  type Smoothing,
  scaledSize,
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
const maxSide = 8192;
const maxPixels = 32 * 1024 * 1024;
type Asset = Photo & RasterSource & { name: string; url: string };
type Project = {
  layout: Cell[];
  size: Size;
  pinned: ReadonlySet<string>;
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
  edge?: Edge;
  lastValid: Cell[];
};

const empty: Project = { layout: [], size: formats["4:3"], pinned: new Set() };
let nextAssetId = 0;
const arrows: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};
const edgeLabels: Record<Edge, string> = {
  left: "Resize left edge",
  right: "Resize right edge",
  top: "Resize top edge",
  bottom: "Resize bottom edge",
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

function downloadMosaic(blob: Blob, size: Size) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `photo-mosaic-${size.width}x${size.height}.png`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const [smoothing, setSmoothing] = useState<Smoothing>("high");
  const [target, setTarget] = useState<Asset>();
  const [strength, setStrength] = useState(72);
  const [density, setDensity] = useState(1);
  const [matchBrightness, setMatchBrightness] = useState(false);
  const [previewStatus, setPreviewStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const assets = useRef(new Map<string, Asset>());
  const targetAsset = useRef<Asset | undefined>(undefined);
  const preview = useRef<HTMLCanvasElement>(null);
  const mounted = useRef(false);
  const lifetime = useRef(new AbortController());
  const working = useRef(false);
  const gesture = useRef<Gesture | null>(null);
  const dragEntries = useRef(0);
  const board = useRef<HTMLDivElement>(null);

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
      if (targetAsset.current) URL.revokeObjectURL(targetAsset.current.url);
      targetAsset.current = undefined;
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
  const { layout: original, pinned, size } = project;
  const preset =
    Object.entries(formats).find(
      ([, value]) => value.width === size.width && value.height === size.height,
    )?.[0] ?? "custom";
  const layout = draft ?? original;
  const active = layout.find(({ id }) => id === selected);
  const freeCount = layout.length - pinned.size;
  const handles = active && !pinned.has(active.id) ? edges(active, size) : [];
  const blocked = busy || dragging;
  const canImport =
    !blocked && layout.length < photoLimit && (freeCount > 0 || !layout.length);
  const showMatching = Boolean(
    target && (strength || density > 1) && layout.length,
  );
  const previewSize = scaledSize(size, 768);
  const status =
    !busy && previewStatus
      ? t(previewStatus)
      : notices
          .map((notice) =>
            typeof notice === "string"
              ? t(notice)
              : formatMessage(t, ...notice, locale),
          )
          .join(" ");

  useEffect(() => {
    const canvas = preview.current;
    if (!canvas || !target || dragging) {
      if (canvas) delete canvas.dataset.rendered;
      setPreviewStatus("");
      return;
    }
    const controller = new AbortController();
    delete canvas.dataset.rendered;
    setPreviewStatus("Calculating preview…");
    // Coalesce rapid strength changes before decoding the source files.
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const { bitmap } = await processMosaic(
            {
              kind: "preview",
              layout,
              size,
              smoothing,
              target,
              sources: layout.map(({ id }) => assets.current.get(id) as Asset),
              pinned: [...pinned],
              strength: strength / 100,
              density,
              matchBrightness,
            },
            controller.signal,
          );
          try {
            if (controller.signal.aborted) return;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("The preview canvas is unavailable.");
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(bitmap, 0, 0);
            canvas.dataset.rendered = "true";
            setPreviewStatus("");
          } finally {
            bitmap.close();
          }
        } catch {
          if (!controller.signal.aborted)
            setPreviewStatus("The matched preview could not be rendered.");
        }
      })();
    }, 100);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    layout,
    size,
    smoothing,
    target,
    strength,
    density,
    matchBrightness,
    pinned,
    dragging,
  ]);

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

  async function openTarget(file: File) {
    if (working.current || gesture.current) return;
    working.current = true;
    setBusy(true);
    setNotice("Opening target…");
    try {
      const image = await loadPhoto(file);
      if (!mounted.current) {
        if (image) URL.revokeObjectURL(image.url);
        return;
      }
      if (!image) {
        setNotice("The target could not be opened as an image.");
        return;
      }
      if (targetAsset.current) URL.revokeObjectURL(targetAsset.current.url);
      targetAsset.current = image;
      setTarget(image);
      await arrangePhotos(image);
    } finally {
      working.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  function calculateArrangement(image: Asset, cells: Cell[]) {
    return processMosaic(
      {
        kind: "arrange",
        layout: cells,
        size,
        smoothing,
        target: image,
        sources: cells.map(({ id }) => assets.current.get(id) as Asset),
        pinned: [...pinned],
        strength: strength / 100,
        density,
        matchBrightness,
      },
      lifetime.current.signal,
    );
  }

  async function arrangePhotos(image: Asset) {
    if (freeCount < 2) {
      setNotice();
      return;
    }
    setNotice("Calculating photo matches…");
    try {
      const result = await calculateArrangement(image, original);
      if (!mounted.current) return;
      if (result.changed) commit({ ...project, layout: result.layout });
      setNotice(
        result.changed
          ? "Photos arranged by target color."
          : "The current layout already matches these photos.",
      );
    } catch {
      if (mounted.current)
        setNotice("The photos could not be rearranged by color.");
    }
  }

  async function matchPhotos(image: Asset) {
    if (working.current || gesture.current) return;
    working.current = true;
    setBusy(true);
    try {
      await arrangePhotos(image);
    } finally {
      working.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  function removeTarget() {
    if (!target) return;
    URL.revokeObjectURL(target.url);
    targetAsset.current = undefined;
    setTarget(undefined);
    setNotice();
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
    let next = added.length
      ? repack(original, size, [...existing, ...added], pinned)
      : original;
    if (mounted.current && next !== original) {
      for (const photo of added) assets.current.set(photo.id, photo);
      if (target) {
        try {
          setNotice("Calculating photo matches…");
          const result = await calculateArrangement(target, next);
          if (result.changed) next = result.layout;
        } catch {
          // Photo import remains usable even if color sampling is unavailable.
        }
      }
      if (!mounted.current) return;
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
    const next = repack(original, size, currentPhotos(), pinned);
    if (next !== original) commit({ ...project, layout: next });
    setNotice();
  }

  function remove(id: string) {
    const next = repack(
      original,
      size,
      currentPhotos().filter((photo) => photo.id !== id),
      pinned,
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
    const resized = resizeCanvas(original, size, next, currentPhotos(), pinned);
    if (!resized) {
      setNotice(
        pinned.size
          ? "This size cannot be filled around the locked photos. Unlock photos or try a different size."
          : "This canvas is too small to fit all the photos.",
      );
      return;
    }
    commit({ ...project, size: next, layout: resized });
    setNotice();
  }

  async function exportPng() {
    if (working.current || gesture.current) return;
    working.current = true;
    setBusy(true);
    setNotice("Calculating and encoding PNG…");
    try {
      const result = await processMosaic(
        {
          kind: "export",
          layout,
          size,
          smoothing,
          target,
          sources: currentPhotos(),
          pinned: [...pinned],
          strength: strength / 100,
          density,
          matchBrightness,
        },
        lifetime.current.signal,
      );
      if (mounted.current) {
        downloadMosaic(result.blob, size);
        setNotice("PNG download started.");
      }
    } catch {
      if (mounted.current) setNotice("The PNG could not be exported.");
    } finally {
      working.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  function start(
    event: PointerEvent<HTMLButtonElement>,
    cell: Cell,
    edge?: Edge,
  ) {
    if (working.current || gesture.current || event.button !== 0) return;
    setSelected(cell.id);
    const surface = board.current;
    if (!surface || pinned.has(cell.id)) return;
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
      pinned,
      drag.cell,
      x * scaleX,
      y * scaleY,
      { width: 12 * scaleX, height: 12 * scaleY },
      drag.edge,
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
    else setNotice("That spot cannot be filled. Kept the last gapless layout.");
  }

  function adjustByKey(
    event: KeyboardEvent<HTMLButtonElement>,
    cell: Cell,
    edge?: Edge,
  ) {
    const direction = arrows[event.key];
    if (!direction || blocked || pinned.has(cell.id)) return;
    const [dx, dy] = direction;
    if (edge && !(edgeAxis(edge) === "x" ? dx : dy)) return;
    event.preventDefault();
    const step = event.shiftKey ? 1 : 24;
    const next = place(
      original,
      size,
      currentPhotos(),
      pinned,
      cell,
      dx * step,
      dy * step,
      { width: 0, height: 0 },
      edge,
    );
    setSelected(cell.id);
    if (next && next !== original) commit({ ...project, layout: next });
    if (next) setNotice();
    else setNotice("There is no gapless layout at that position.");
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
          disabled={blocked || freeCount < 2}
          onClick={reroll}
        >
          {t("Shuffle layout")}
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
        <button
          className={styles.export}
          type="button"
          disabled={blocked || !layout.length}
          onClick={() => void exportPng()}
        >
          {t("Download PNG")}
        </button>
      </div>
      <div className={styles.settings}>
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
      </div>
      <div className={styles.targetControls}>
        <label className={styles.upload}>
          {t(target ? "Replace target image" : "Choose target image")}
          <input
            type="file"
            accept="image/*"
            disabled={blocked}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) void openTarget(file);
            }}
          />
        </label>
        {target && (
          <>
            <div className={styles.targetFile}>
              <img src={target.url} alt="" />
              <span title={target.name}>{target.name}</span>
            </div>
            <label className={styles.strength}>
              {t("Color strength")}
              <input
                type="range"
                min="0"
                max="100"
                value={strength}
                aria-valuetext={`${strength}%`}
                disabled={blocked}
                onChange={(event) =>
                  setStrength(event.currentTarget.valueAsNumber)
                }
              />
              <span aria-hidden="true">{strength}%</span>
            </label>
            <form
              className={styles.density}
              onSubmit={(event) => {
                event.preventDefault();
                const value = Number(
                  new FormData(event.currentTarget).get("density"),
                );
                if (
                  !blocked &&
                  Number.isInteger(value) &&
                  value >= 1 &&
                  value <= maxDensity
                ) {
                  setDensity(value);
                  setNotice();
                }
              }}
            >
              <label className={styles.format}>
                {t("Tiles per side")}
                <input
                  type="number"
                  name="density"
                  defaultValue={density}
                  min={1}
                  max={maxDensity}
                  step={1}
                  required
                  disabled={blocked}
                />
              </label>
              <button type="submit" disabled={blocked}>
                {t("Apply density")}
              </button>
              {layout.length > 0 && (
                <span className={styles.stats}>
                  {density} × {density} ·{" "}
                  {formatMessage(
                    t,
                    "{count} tiles",
                    { count: densityTileCount(layout, pinned, density) },
                    locale,
                  )}
                </span>
              )}
            </form>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={matchBrightness}
                disabled={blocked || strength === 0}
                onChange={(event) =>
                  setMatchBrightness(event.currentTarget.checked)
                }
              />
              {t("Match target brightness")}
            </label>
            <button
              type="button"
              disabled={blocked || freeCount < 2}
              onClick={() => void matchPhotos(target)}
            >
              {t("Match photos again")}
            </button>
            <button type="button" disabled={blocked} onClick={removeTarget}>
              {t("Remove target")}
            </button>
          </>
        )}
      </div>
      <p className={styles.status} role="status">
        {status}
      </p>
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
            ref={board}
            className={styles.board}
            data-smoothing={smoothing}
            style={{ "--ratio": size.width / size.height } as CSSProperties}
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
            {showMatching && (
              <canvas
                ref={preview}
                className={styles.matchedPreview}
                width={previewSize.width}
                height={previewSize.height}
                aria-label={t("Color-matched mosaic preview")}
              />
            )}
            {layout
              .toSorted((a, b) => Number(a.id) - Number(b.id))
              .map((cell) => {
                const asset = assets.current.get(cell.id);
                const locked = pinned.has(cell.id);
                return (
                  <button
                    key={cell.id}
                    type="button"
                    className={styles.tile}
                    aria-label={
                      asset && locked
                        ? formatMessage(t, "{name} (locked)", {
                            name: asset.name,
                          })
                        : asset?.name
                    }
                    aria-pressed={selected === cell.id}
                    data-locked={locked}
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
                    <img src={asset?.url} alt="" draggable={false} />
                    {locked && (
                      <span className={styles.lock} aria-hidden="true">
                        {t("Locked")}
                      </span>
                    )}
                  </button>
                );
              })}
            {active &&
              handles.map((edge) => {
                const axis = edgeAxis(edge);
                const position = edgePosition(active, edge);
                return (
                  <button
                    type="button"
                    key={edge}
                    className={styles.handle}
                    data-axis={axis}
                    aria-label={t(edgeLabels[edge])}
                    style={{
                      left: `${(100 * (axis === "x" ? position : active.x + active.width / 2)) / size.width}%`,
                      top: `${(100 * (axis === "y" ? position : active.y + active.height / 2)) / size.height}%`,
                    }}
                    onPointerDown={(event) => start(event, active, edge)}
                    onKeyDown={(event) => adjustByKey(event, active, edge)}
                  />
                );
              })}
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
          · {formatMessage(t, "{count} locked", { count: pinned.size })}
        </span>
        {active && (
          <div className={styles.selection}>
            <span title={assets.current.get(active.id)?.name}>
              {assets.current.get(active.id)?.name}
            </span>
            <button
              type="button"
              disabled={blocked}
              onClick={() => {
                const next = new Set(pinned);
                if (next.has(active.id)) next.delete(active.id);
                else next.add(active.id);
                commit({ ...project, pinned: next });
                setNotice();
              }}
            >
              {t(pinned.has(active.id) ? "Unlock photo" : "Lock photo")}
            </button>
            <button
              type="button"
              disabled={blocked || pinned.has(active.id)}
              onClick={() => remove(active.id)}
            >
              {t("Remove")}
            </button>
          </div>
        )}
      </div>
      {layout.length > 0 && (
        <p className={styles.hint}>
          {t(
            "Drop files onto the canvas to add them. Drag a photo to move it, or drag an edge handle to resize it. The other unlocked photos reflow around it. Arrow keys work on focused photos and handles.",
          )}
        </p>
      )}
    </section>
  );
}
