"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ExportFormat } from "./export-encoder";
import { exportImages } from "./export-images";
import { createLattice } from "./layout";
import {
  formatTextureText,
  localizeTextureText,
  type TextureTranslator,
} from "./localization";
import {
  type Asset,
  commit,
  emptyProject,
  type Frame,
  type Layer,
  newLayer,
  type Project,
  parseProject,
} from "./project";
import { TextureRenderer } from "./renderer";
import styles from "./texture-array.module.css";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function decode(asset: Asset) {
  const blob = await (await fetch(asset.data)).blob();
  const image = await createImageBitmap(blob, {
    premultiplyAlpha: "premultiply",
    imageOrientation: "from-image",
  });
  if (
    image.width > 8192 ||
    image.height > 8192 ||
    image.width * image.height > 32_000_000
  ) {
    image.close();
    throw new Error(
      "Source images must be at most 8192px per side and 32 megapixels.",
    );
  }
  return image;
}
const errorText = (error: unknown) => {
  if (error instanceof SyntaxError)
    return "Invalid project JSON. Choose a saved Texture Array project.";
  if (error instanceof DOMException && error.name === "InvalidStateError")
    return "Unable to decode image. Choose a valid PNG, JPEG, or WebP image.";
  return error instanceof Error ? error.message : "Something went wrong.";
};
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const identity: TextureTranslator = (message) => message;
export function TextureArray({
  translate = identity,
}: {
  translate?: TextureTranslator;
} = {}) {
  const t = (message: string) => localizeTextureText(message, translate);
  const format = (template: string, values: Record<string, string | number>) =>
    formatTextureText(template, translate, values);
  const [project, setProject] = useState<Project>(emptyProject);
  const [selected, setSelected] = useState("");
  const [repeats, setRepeats] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exportProgress, setExportProgress] = useState("");
  const exportController = useRef<AbortController | null>(null);
  const [generation, setGeneration] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<TextureRenderer | null>(null);
  const drag = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);
  const upload = useRef<HTMLInputElement>(null);
  const open = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const prefix = useId();
  const frame = project.history[project.cursor];
  const panLimit = Math.max(0.5, (zoom - 1) / 2);
  const layer =
    frame.layers.find((item) => item.id === selected) ?? frame.layers.at(-1);
  const lattice = useMemo(() => (layer ? createLattice(layer) : null), [layer]);

  useEffect(() => {
    setPan((p) => ({
      x: clamp(p.x, -panLimit, panLimit),
      y: clamp(p.y, -panLimit, panLimit),
    }));
  }, [panLimit]);

  useEffect(() => {
    mounted.current = true;
    const element = canvas.current;
    if (!element) return;
    const lost = (event: Event) => {
      event.preventDefault();
      setReady(false);
      setError(
        "GPU context lost. Your project is still available to save. Restore the context or reload your saved project.",
      );
    };
    const restored = () => setGeneration((n) => n + 1);
    element.addEventListener("webglcontextlost", lost);
    element.addEventListener("webglcontextrestored", restored);
    try {
      renderer.current = new TextureRenderer(element);
      setReady(true);
      setError("");
    } catch (error) {
      setError(errorText(error));
    }
    return () => {
      mounted.current = false;
      exportController.current?.abort();
      element.removeEventListener("webglcontextlost", lost);
      element.removeEventListener("webglcontextrestored", restored);
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, []);

  // Rebuild all GPU resources after a restored context; source data stays untouched.
  useEffect(() => {
    if (!generation || !canvas.current) return;
    try {
      // Context loss already invalidated old handles. Deleting them after
      // restoration would send invalid operations to the new GPU context.
      renderer.current = new TextureRenderer(canvas.current);
      setReady(true);
      setError("");
    } catch (error) {
      setError(errorText(error));
    }
  }, [generation]);

  useEffect(() => {
    const gpu = renderer.current;
    if (!gpu || !ready) return;
    let cancelled = false;
    async function render() {
      try {
        if (!gpu) return;
        gpu.retain(new Set(project.assets.map((a) => a.id)));
        for (const asset of project.assets) {
          if (gpu.has(asset.id)) continue;
          const bitmap = await decode(asset);
          try {
            if (!cancelled) gpu.upload(asset.id, bitmap);
          } finally {
            bitmap.close();
          }
          if (cancelled) return;
        }
        if (!cancelled) gpu.render(frame, repeats);
      } catch (error) {
        if (!cancelled) setError(errorText(error));
      }
    }
    void render();
    return () => {
      cancelled = true;
    };
  }, [project.assets, frame, repeats, ready]);

  function edit(label: string, change: (frame: Frame) => Frame) {
    setProject((p) => commit(p, { ...change(p.history[p.cursor]), label }));
  }
  function updateLayer(change: Partial<Layer>, label: string) {
    if (!layer) return;
    edit(label, (f) => ({
      ...f,
      layers: f.layers.map((l) =>
        l.id === layer.id ? { ...l, ...change } : l,
      ),
    }));
  }
  async function addImages(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      if (frame.layers.length + files.length > 12)
        throw new Error(
          "Up to 12 layers per project. Remove a layer before importing more images.",
        );
      if (project.assets.length + files.length > 12)
        throw new Error(
          "Up to 12 source images per project, including images retained for undo. Start a new project to clear sources.",
        );
      const additions: Asset[] = [];
      for (const file of Array.from(files)) {
        if (
          !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
          file.size > 8_000_000
        )
          throw new Error(
            "Choose PNG, JPEG, or WebP images of up to 8 MB each.",
          );
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Unable to read image."));
          reader.readAsDataURL(file);
        });
        const asset = {
          id: crypto.randomUUID(),
          name: file.name.slice(0, 200),
          data,
        };
        const bitmap = await decode(asset);
        bitmap.close();
        additions.push(asset);
      }
      const assets = [...project.assets, ...additions];
      if (assets.reduce((sum, a) => sum + a.data.length, 0) > 64_000_000)
        throw new Error(
          "Source images exceed the project's 48 MB binary budget.",
        );
      const layers = additions.map((a) => newLayer(a.id));
      if (!mounted.current) return;
      setProject((p) =>
        commit(
          { ...p, assets },
          {
            ...p.history[p.cursor],
            label: `Import ${layers.length} image(s)`,
            layers: [...p.history[p.cursor].layers, ...layers],
          },
        ),
      );
      setSelected(layers[0].id);
    } catch (error) {
      if (mounted.current) setError(errorText(error));
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function openProject(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (file.size > 70_000_000)
        throw new Error("Project exceeds the 70 MB limit.");
      const next = parseProject(await file.text());
      for (const asset of next.assets) {
        const bitmap = await decode(asset);
        bitmap.close();
      }
      if (!mounted.current) return;
      setProject(next);
      setSelected("");
      setPan({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
      if (mounted.current) setError(errorText(error));
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function exportLayers(format: ExportFormat) {
    const gpu = renderer.current;
    if (!gpu || !canvas.current) return;
    setBusy(true);
    setError("");
    const controller = new AbortController();
    exportController.current = controller;
    try {
      if (project.assets.some((a) => !gpu.has(a.id)))
        throw new Error("Images are still loading. Please try again.");
      const blob = await exportImages(
        gpu,
        frame,
        format,
        controller.signal,
        setExportProgress,
      );
      if (mounted.current)
        download(blob, `texture-array-${frame.size}.${format}`);
    } catch (error) {
      if (mounted.current) setError(errorText(error));
    } finally {
      exportController.current = null;
      if (mounted.current) {
        setExportProgress("");
        try {
          gpu.render(frame, repeats);
        } catch (error) {
          setError(errorText(error));
        }
        setBusy(false);
      }
    }
  }
  function field(
    key:
      | "columns"
      | "rows"
      | "spacingX"
      | "spacingY"
      | "size"
      | "rotation"
      | "layoutAngle"
      | "x"
      | "y"
      | "stagger"
      | "opacity",
    label: string,
    min: number,
    max: number,
    step: number,
    factor = 1,
  ) {
    if (!layer) return null;
    return (
      <label className={styles.field} htmlFor={`${prefix}-${key}`}>
        <span>{t(label)}</span>
        <input
          id={`${prefix}-${key}`}
          type="number"
          min={min}
          max={max}
          step={step}
          value={Math.round(layer[key] * factor * 100) / 100}
          onChange={(event) => {
            if (event.target.value === "") return;
            const value = event.target.valueAsNumber;
            if (Number.isFinite(value))
              updateLayer(
                {
                  [key]:
                    clamp(step === 1 ? Math.round(value) : value, min, max) /
                    factor,
                },
                `Change ${label.toLowerCase()}`,
              );
          }}
        />
      </label>
    );
  }
  return (
    <section
      className={styles.tool}
      aria-label={t("Texture Array editor")}
      aria-busy={busy}
    >
      <div className={styles.toolbar}>
        <div>
          <p className={styles.eyebrow}>
            {t("TEXTURE ARRAY / SEAMLESS WORKSPACE")}
          </p>
          <p className={styles.hint}>
            {t("Local images. Editable arrays. One seamless square.")}
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            disabled={busy}
            onClick={() => upload.current?.click()}
          >
            {t("Add images")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => open.current?.click()}
          >
            {t("Open project")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              download(
                new Blob([JSON.stringify(project)], {
                  type: "application/json",
                }),
                "texture-array.json",
              )
            }
          >
            {t("Save project")}
          </button>
          <button
            type="button"
            disabled={busy || !ready || !frame.layers.length}
            onClick={() => void exportLayers("psd")}
          >
            {t("Export layered PSD")}
          </button>
          <button
            type="button"
            disabled={busy || !ready || !frame.layers.length}
            onClick={() => void exportLayers("zip")}
          >
            {t("Export PNG ZIP")}
          </button>
        </div>
      </div>
      <input
        hidden
        ref={upload}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={(e) => {
          void addImages(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        hidden
        ref={open}
        type="file"
        accept=".json,application/json"
        onChange={(e) => {
          void openProject(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && (
        <p className={styles.error} role="alert">
          {t(error)}
        </p>
      )}
      {busy && (
        <p role="status" className={styles.hint}>
          {t(exportProgress || "Processing local files…")}
        </p>
      )}
      {exportProgress && (
        <button type="button" onClick={() => exportController.current?.abort()}>
          {t("Cancel export")}
        </button>
      )}
      <div className={styles.workspace}>
        <div className={styles.stageColumn}>
          <div className={styles.viewbar}>
            <div className={styles.actions}>
              <button
                type="button"
                disabled={busy}
                aria-pressed={repeats === 1}
                onClick={() => setRepeats(1)}
              >
                {t("Single tile")}
              </button>
              <button
                type="button"
                disabled={busy}
                aria-pressed={repeats === 3}
                onClick={() => setRepeats(3)}
              >
                {t("3 × 3 check")}
              </button>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                aria-label={t("Zoom out")}
                onClick={() => setZoom((z) => clamp(z - 0.25, 0.5, 4))}
              >
                −
              </button>
              <span className={styles.hint}>{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                aria-label={t("Zoom in")}
                onClick={() => setZoom((z) => clamp(z + 0.25, 0.5, 4))}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
              >
                {t("Fit")}
              </button>
            </div>
          </div>
          <div
            className={styles.stage}
            role="application"
            aria-label={t(
              "Texture viewport. Drag to pan, or use arrow keys. Plus and minus zoom. Home resets the view.",
            )}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: This viewport implements keyboard panning and zoom.
            tabIndex={0}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.currentTarget.focus({ preventScroll: true });
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = {
                x: e.clientX,
                y: e.clientY,
                panX: pan.x,
                panY: pan.y,
              };
            }}
            onPointerMove={(e) => {
              const start = drag.current;
              if (!start) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setPan({
                x: clamp(
                  start.panX + (e.clientX - start.x) / rect.width,
                  -panLimit,
                  panLimit,
                ),
                y: clamp(
                  start.panY + (e.clientY - start.y) / rect.height,
                  -panLimit,
                  panLimit,
                ),
              });
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onLostPointerCapture={() => {
              drag.current = null;
            }}
            onKeyDown={(e) => {
              if (
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  e.key,
                )
              ) {
                e.preventDefault();
                setPan((p) => ({
                  x: clamp(
                    p.x +
                      (e.key === "ArrowLeft"
                        ? -0.05
                        : e.key === "ArrowRight"
                          ? 0.05
                          : 0),
                    -panLimit,
                    panLimit,
                  ),
                  y: clamp(
                    p.y +
                      (e.key === "ArrowUp"
                        ? -0.05
                        : e.key === "ArrowDown"
                          ? 0.05
                          : 0),
                    -panLimit,
                    panLimit,
                  ),
                }));
              } else if (e.key === "+" || e.key === "=") {
                e.preventDefault();
                setZoom((z) => clamp(z + 0.25, 0.5, 4));
              } else if (e.key === "-") {
                e.preventDefault();
                setZoom((z) => clamp(z - 0.25, 0.5, 4));
              } else if (e.key === "Home") {
                e.preventDefault();
                setPan({ x: 0, y: 0 });
                setZoom(1);
              }
            }}
          >
            <div
              className={styles.tile}
              style={{
                transform: `translate(${pan.x * 100}%, ${pan.y * 100}%) scale(${zoom})`,
              }}
            >
              <canvas
                ref={canvas}
                width={1024}
                height={1024}
                aria-label={t("Square seamless texture preview")}
              />
              {repeats === 3 && (
                <div className={styles.grid} aria-hidden="true" />
              )}
            </div>
            {!frame.layers.length && (
              <div className={styles.empty}>
                <strong>{t("A pattern starts with an image.")}</strong>
                <p>
                  {t("Add PNG, JPEG, or WebP images above.")}
                  <br />
                  {t("Transparent motifs work especially well.")}
                </p>
              </div>
            )}
          </div>
          <div className={styles.status}>
            <span>
              {format("{size} × {size} · PSD / PNG ZIP", { size: frame.size })}
            </span>
            <span>{t("Drag to pan · Arrow keys to move · Fit to reset")}</span>
          </div>
          <p className={styles.hint}>
            {t(
              "The outline is the finite preview area. 3 × 3 shows nine copies; export always saves one square tile. View movement never changes your design.",
            )}
          </p>
          <p className={styles.hint}>
            {t(
              "PSD keeps layers, transparency, and visibility. PNG ZIP includes each transparent layer, a composite, and a visibility manifest. Exported layers use English names. Save project keeps original images and editable array settings.",
            )}
          </p>
        </div>
        <fieldset className={styles.inspector} disabled={busy}>
          <legend className={styles.eyebrow}>{t("LAYERS & ARRAY")}</legend>
          <div className={styles.layers}>
            {!frame.layers.length && (
              <p className={styles.hint}>{t("No images yet.")}</p>
            )}
            {frame.layers.map((l, i) => (
              <button
                type="button"
                key={l.id}
                aria-pressed={layer?.id === l.id}
                onClick={() => setSelected(l.id)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.layerName}>
                  {project.assets.find((a) => a.id === l.asset)?.name}
                </span>
                <span>{l.visible ? "●" : "○"}</span>
              </button>
            ))}
          </div>
          {layer && (
            <>
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() =>
                    updateLayer(
                      { visible: !layer.visible },
                      layer.visible ? "Hide layer" : "Show layer",
                    )
                  }
                >
                  {t(layer.visible ? "Hide" : "Show")}
                </button>
                <button
                  type="button"
                  disabled={frame.layers.length >= 12}
                  onClick={() => {
                    const copy = { ...layer, id: crypto.randomUUID() };
                    edit("Duplicate layer", (f) => ({
                      ...f,
                      layers: [...f.layers, copy],
                    }));
                    setSelected(copy.id);
                  }}
                >
                  {t("Duplicate")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    edit("Remove layer", (f) => ({
                      ...f,
                      layers: f.layers.filter((l) => l.id !== layer.id),
                    }))
                  }
                >
                  {t("Remove")}
                </button>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  disabled={frame.layers[0]?.id === layer.id}
                  onClick={() =>
                    edit("Move layer down", (f) => {
                      const layers = [...f.layers];
                      const index = layers.findIndex((l) => l.id === layer.id);
                      [layers[index - 1], layers[index]] = [
                        layers[index],
                        layers[index - 1],
                      ];
                      return { ...f, layers };
                    })
                  }
                >
                  {t("Move down")}
                </button>
                <button
                  type="button"
                  disabled={frame.layers.at(-1)?.id === layer.id}
                  onClick={() =>
                    edit("Move layer up", (f) => {
                      const layers = [...f.layers];
                      const index = layers.findIndex((l) => l.id === layer.id);
                      [layers[index], layers[index + 1]] = [
                        layers[index + 1],
                        layers[index],
                      ];
                      return { ...f, layers };
                    })
                  }
                >
                  {t("Move up")}
                </button>
              </div>
              <p className={styles.hint}>
                {t(
                  "Later layers draw on top. Size preserves the original aspect ratio.",
                )}
              </p>
              <div className={styles.fields}>
                {field("columns", "Columns", 1, 32, 1)}
                {field("rows", "Rows", 1, 32, 1)}
                {field("spacingX", "Horizontal spacing (%)", 50, 400, 1, 100)}
                {field("spacingY", "Vertical spacing (%)", 50, 400, 1, 100)}
                {field("size", "Size (% of tile)", 1, 70, 0.5, 100)}
                {field("rotation", "Image rotation (°)", -180, 180, 0.01)}
                {field("layoutAngle", "Array angle (°)", -180, 180, 0.01)}
                {field("x", "Offset X (%)", 0, 100, 0.5, 100)}
                {field("y", "Offset Y (%)", 0, 100, 0.5, 100)}
                {field("stagger", "Row stagger (%)", 0, 100, 0.5, 100)}
                {field("opacity", "Opacity (%)", 0, 100, 1, 100)}
              </div>
              <p className={styles.hint}>
                {t(
                  "Spacing follows the rotated array axes. 100% uses the Columns and Rows baseline; higher values spread motifs apart without resizing the images.",
                )}
              </p>
              <button
                type="button"
                onClick={() =>
                  updateLayer({ spacingX: 1, spacingY: 1 }, "Reset spacing")
                }
              >
                {t("Reset spacing")}
              </button>
              <label className={styles.field}>
                <span>{t("Image scaling")}</span>
                <select
                  value={layer.sampling}
                  onChange={(e) =>
                    updateLayer(
                      {
                        sampling:
                          e.target.value === "pixel" ? "pixel" : "sharp",
                      },
                      "Change image scaling",
                    )
                  }
                >
                  <option value="sharp">{t("Sharp · Smooth edges")}</option>
                  <option value="pixel">{t("Pixel · Hard edges")}</option>
                </select>
              </label>
              <p className={styles.hint}>
                {t(
                  "Sharp balances detail and smooth edges. Pixel preserves hard pixels and may alias when reduced. Zoom reveals output pixels without extra smoothing.",
                )}
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() =>
                    updateLayer(
                      { stagger: 0, layoutAngle: 0 },
                      "Grid array preset",
                    )
                  }
                >
                  {t("Grid array")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateLayer(
                      {
                        stagger: 0.5,
                        rows: Math.min(32, layer.rows + (layer.rows % 2)),
                      },
                      "Half-drop array preset",
                    )
                  }
                >
                  {t("Half-drop array")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateLayer({ layoutAngle: 45 }, "Diagonal array preset")
                  }
                >
                  {t("Diagonal 45°")}
                </button>
              </div>
              <p className={styles.hint}>
                {t(
                  "Half-drop shifts neighboring rows by about half a cell. The repeat is fitted to the square edges.",
                )}
              </p>
              <p className={styles.hint}>
                {format(
                  "Uniform repeat: {angle}° · {count} motifs per tile. The requested angle and spacing are matched to a uniform square repeat, so the actual angle and count may adjust. Image rotation stays independent.",
                  {
                    angle: lattice ? Math.round(lattice.angle * 100) / 100 : 0,
                    count: lattice?.count ?? 0,
                  },
                )}
              </p>
              <p className={styles.hint}>
                {format(
                  "Fitted center spacing: X {x}% · Y {y}% of tile. Uniform seamless repeats use discrete spacing steps.",
                  {
                    x: lattice ? Math.round(lattice.spacingX * 10000) / 100 : 0,
                    y: lattice ? Math.round(lattice.spacingY * 10000) / 100 : 0,
                  },
                )}
                {lattice?.densityLimited
                  ? ` ${t("The density limit is active; both axes are adjusted proportionally.")}`
                  : ""}
              </p>
            </>
          )}
          <label className={styles.field}>
            {t("Output size")}
            <select
              value={frame.size}
              onChange={(e) =>
                edit("Change output size", (f) => ({
                  ...f,
                  size: Number(e.target.value),
                }))
              }
            >
              {[256, 512, 1024, 2048, 4096].map((size) => (
                <option key={size} value={size}>
                  {size} × {size}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      </div>
      <div className={styles.history}>
        <div className={styles.actions}>
          <button
            type="button"
            disabled={busy || project.cursor === 0}
            onClick={() => setProject((p) => ({ ...p, cursor: p.cursor - 1 }))}
          >
            {t("Undo")}
          </button>
          <button
            type="button"
            disabled={busy || project.cursor === project.history.length - 1}
            onClick={() => setProject((p) => ({ ...p, cursor: p.cursor + 1 }))}
          >
            {t("Redo")}
          </button>
        </div>
        <label className={styles.field}>
          {t("Edit history")}
          <select
            disabled={busy}
            value={project.cursor}
            onChange={(e) =>
              setProject((p) => ({ ...p, cursor: Number(e.target.value) }))
            }
          >
            {project.history.map((f, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: History positions are serialized addresses; options have no local state.
              <option key={`${i}-${f.label}`} value={i}>
                {i + 1}. {t(f.label)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setProject(emptyProject());
            setSelected("");
            setError("");
          }}
        >
          {t("New project")}
        </button>
      </div>
      <p className={styles.hint}>
        {t(
          "Edits keep original image bytes intact. Save project includes sources and up to 100 history states; editing an earlier state replaces its redo branch. Files stay in this browser tab and are not uploaded. Save before leaving or starting a new project.",
        )}
      </p>
    </section>
  );
}
