"use client";

import {
  type DragEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ExportFormat } from "./export-encoder";
import { exportImages } from "./export-images";
import { Icon } from "./icon";
import { PsdImportClient } from "./import-psd";
import { createLattice } from "./layout";
import {
  formatTextureText,
  localizeTextureText,
  type TextureTranslator,
} from "./localization";
import { NumberField } from "./number-field";
import { OutputSize } from "./output-size";
import {
  type Asset,
  commit,
  copyLayerParameters,
  emptyProject,
  type Frame,
  hasMixedLayerParameters,
  type Layer,
  type LayerParameters,
  newLayer,
  type Project,
  parseProject,
  pasteLayerParameters,
  replaceLayerImage,
} from "./project";
import type { PsdLayerChoice } from "./psd-import";
import { PsdLayerPicker } from "./psd-layer-picker";
import { TextureRenderer } from "./renderer";
import styles from "./texture-array.module.css";
import { useProjectStorage } from "./use-project-storage";

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
  workspace = false,
}: {
  translate?: TextureTranslator;
  workspace?: boolean;
} = {}) {
  const t = (message: string) => localizeTextureText(message, translate);
  const format = (template: string, values: Record<string, string | number>) =>
    formatTextureText(template, translate, values);
  const [project, setProject] = useState<Project>(emptyProject);
  const [selected, setSelected] = useState("");
  const [checkedLayers, setCheckedLayers] = useState<string[]>([]);
  const persistence = useProjectStorage(project, setProject);
  const [copiedParameters, setCopiedParameters] = useState<{
    name: string;
    parameters: LayerParameters;
  } | null>(null);
  const [repeats, setRepeats] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [processing, setBusy] = useState(false);
  const busy = processing || !persistence.hydrated;
  const importing = useRef(false);
  const psdClient = useRef<PsdImportClient | null>(null);
  const psdUpload = useRef<HTMLInputElement>(null);
  const [psdSelection, setPsdSelection] = useState<{
    layers: PsdLayerChoice[];
    replacementId?: string;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
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
  const replace = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef("");
  const open = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const prefix = useId();
  const frame = project.history[project.cursor];
  const panLimit = Math.max(0.5, (zoom - 1) / 2);
  const layer =
    frame.layers.find((item) => item.id === selected) ?? frame.layers.at(-1);
  const layerName = layer
    ? (layer.name ??
      project.assets.find((asset) => asset.id === layer.asset)?.name ??
      "")
    : "";
  const checked = frame.layers.filter((item) =>
    checkedLayers.includes(item.id),
  );
  const parameterLayers = checked.length ? checked : layer ? [layer] : [];
  const parameterLayer = parameterLayers[0];
  const mixedParameters = hasMixedLayerParameters(parameterLayers);
  const parameterName = parameterLayer
    ? (parameterLayer.name ??
      project.assets.find((asset) => asset.id === parameterLayer.asset)?.name ??
      "")
    : "";
  const lattice = useMemo(
    () => (parameterLayer ? createLattice(parameterLayer) : null),
    [parameterLayer],
  );

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
      psdClient.current?.dispose();
      psdClient.current = null;
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
  function updateParameters(change: Partial<LayerParameters>, label: string) {
    if (mixedParameters) return;
    const ids = new Set(parameterLayers.map((item) => item.id));
    edit(label, (current) => ({
      ...current,
      layers: current.layers.map((item) =>
        ids.has(item.id) ? { ...item, ...change } : item,
      ),
    }));
  }
  async function addImages(files: FileList | null, replacementId?: string) {
    if (!files?.length || busy || importing.current || psdSelection) return;
    const incoming = Array.from(files);
    if (incoming.length === 1 && /\.psd$/i.test(incoming[0].name)) {
      await openPsd(incoming[0], replacementId);
      return;
    }
    importing.current = true;
    setBusy(true);
    setError("");
    try {
      if (replacementId && incoming.length !== 1)
        throw new Error(
          "Drop one image to replace a layer. Drop multiple images outside the layer list to add them.",
        );
      if (!replacementId && frame.layers.length + incoming.length > 12)
        throw new Error(
          "Up to 12 layers per project. Remove a layer before importing more images.",
        );
      if (project.assets.length + incoming.length > 12)
        throw new Error(
          "Up to 12 source images per project, including images retained for undo. Start a new project to clear sources.",
        );
      const additions: Asset[] = [];
      for (const file of incoming) {
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
      if (mounted.current) applyAssets(additions, replacementId);
    } catch (error) {
      if (mounted.current) setError(errorText(error));
    } finally {
      importing.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  function applyAssets(
    additions: Asset[],
    replacementId?: string,
    fromPsd = false,
  ) {
    if (!additions.length) return;
    if (!replacementId && frame.layers.length + additions.length > 12)
      throw new Error(
        "Up to 12 layers per project. Remove a layer before importing more images.",
      );
    const assets = [...project.assets, ...additions];
    if (assets.length > 12)
      throw new Error(
        "Up to 12 source images per project, including images retained for undo. Start a new project to clear sources.",
      );
    if (assets.reduce((sum, asset) => sum + asset.data.length, 0) > 64_000_000)
      throw new Error(
        "Source images exceed the project's 48 MB binary budget.",
      );
    const layers = additions.map((asset) => ({
      ...newLayer(asset.id),
      ...(fromPsd ? { name: asset.name } : {}),
    }));
    setProject((current) =>
      replacementId
        ? replaceLayerImage(current, replacementId, additions[0])
        : commit(
            { ...current, assets },
            {
              ...current.history[current.cursor],
              label: `Import ${layers.length} image(s)`,
              layers: [...current.history[current.cursor].layers, ...layers],
            },
          ),
    );
    setSelected(replacementId ?? layers[0].id);
    setCheckedLayers([]);
  }
  function cancelPsd() {
    const client = psdClient.current;
    psdClient.current = null;
    client?.dispose();
    setPsdSelection(null);
    importing.current = false;
    setBusy(false);
    setError("");
  }
  async function openPsd(file?: File, replacementId?: string) {
    if (!file || busy || importing.current || psdSelection) return;
    importing.current = true;
    setBusy(true);
    setError("");
    let client: PsdImportClient | null = null;
    try {
      if (file.size > 70_000_000)
        throw new Error("Choose a PSD file of up to 70 MB.");
      if (project.assets.length >= 12)
        throw new Error(
          "Up to 12 source images per project, including images retained for undo. Start a new project to clear sources.",
        );
      if (!replacementId && frame.layers.length >= 12)
        throw new Error(
          "Up to 12 layers per project. Remove a layer before importing more images.",
        );
      client = new PsdImportClient();
      psdClient.current = client;
      const buffer = await file.arrayBuffer();
      if (!mounted.current || psdClient.current !== client) return;
      const reply = await client.request({ type: "open", buffer });
      if (mounted.current && psdClient.current === client && reply.layers)
        setPsdSelection({ layers: reply.layers, replacementId });
    } catch (error) {
      if (mounted.current && (!client || psdClient.current === client)) {
        setError(errorText(error));
        client?.dispose();
        psdClient.current = null;
      }
    } finally {
      if (
        mounted.current &&
        (!client || psdClient.current === client || psdClient.current === null)
      ) {
        importing.current = false;
        setBusy(false);
      }
    }
  }
  async function importPsdLayers(ids: number[]) {
    const client = psdClient.current;
    if (!client || !psdSelection || busy) return;
    setBusy(true);
    setError("");
    try {
      const reply = await client.request({ type: "select", ids });
      if (!reply.assets) throw new Error("Unable to read PSD layers.");
      for (const asset of reply.assets) {
        const bitmap = await decode(asset);
        bitmap.close();
      }
      if (!mounted.current || psdClient.current !== client) return;
      applyAssets(reply.assets, psdSelection.replacementId, true);
      cancelPsd();
    } catch (error) {
      if (mounted.current && psdClient.current === client) {
        setError(errorText(error));
        if (client.closed) {
          psdClient.current = null;
          setPsdSelection(null);
        }
      }
    } finally {
      if (
        mounted.current &&
        (psdClient.current === client || psdClient.current === null)
      )
        setBusy(false);
    }
  }
  function fileDropTarget(event: DragEvent<HTMLElement>) {
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-layer-drop]")
        : null;
    return target?.dataset.layerDrop;
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
      persistence.saveNow(next, true);
      setSelected("");
      setCheckedLayers([]);
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
    if (!parameterLayer) return null;
    return (
      <NumberField
        key={`${parameterLayers.map((item) => item.id).join("-")}-${key}`}
        id={`${prefix}-${key}`}
        label={t(label)}
        min={min}
        max={max}
        step={step}
        value={Math.round(parameterLayer[key] * factor * 100) / 100}
        onChange={(value) =>
          updateParameters(
            { [key]: value / factor },
            `Change ${label.toLowerCase()}`,
          )
        }
      />
    );
  }
  return (
    <section
      className={`${styles.tool} ${workspace ? styles.workspaceMode : ""}`}
      aria-label={t("Texture Array editor")}
      aria-busy={busy}
      data-file-drop={dropTarget === "add" ? "true" : undefined}
      onDragOverCapture={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        event.dataTransfer.dropEffect =
          busy || importing.current || psdSelection ? "none" : "copy";
        setDropTarget(
          busy || importing.current || psdSelection
            ? null
            : (fileDropTarget(event) ?? "add"),
        );
      }}
      onDragLeaveCapture={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setDropTarget(null);
      }}
      onDropCapture={(event) => {
        if (
          !event.dataTransfer.types.includes("Files") &&
          !event.dataTransfer.files.length
        )
          return;
        event.preventDefault();
        event.stopPropagation();
        setDropTarget(null);
        void addImages(event.dataTransfer.files, fileDropTarget(event));
      }}
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
          <a
            className={styles.workspaceLink}
            href={workspace ? "/lab/texture-array" : "/lab/texture-array/app"}
            onClick={(event) => {
              if (busy || !persistence.saveNow()) event.preventDefault();
            }}
          >
            <Icon name="fit" />
            {t(workspace ? "Back to overview" : "Open workspace")}
          </a>
          <button
            type="button"
            disabled={busy}
            onClick={() => upload.current?.click()}
          >
            <Icon name="add" />
            {t("Add images")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => psdUpload.current?.click()}
          >
            <Icon name="layers" />
            {t("Import PSD")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => open.current?.click()}
          >
            <Icon name="folder" />
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
            <Icon name="save" />
            {t("Save project")}
          </button>
          <button
            type="button"
            disabled={busy || !ready || !frame.layers.length}
            onClick={() => void exportLayers("psd")}
          >
            <Icon name="download" />
            {t("Export layered PSD")}
          </button>
          <button
            type="button"
            disabled={busy || !ready || !frame.layers.length}
            onClick={() => void exportLayers("zip")}
          >
            <Icon name="download" />
            {t("Export PNG ZIP")}
          </button>
        </div>
      </div>
      <div className={styles.saveStatus} role="status">
        <Icon name="save" />
        <span>
          {t(
            persistence.status === "saved"
              ? "Saved in this browser"
              : persistence.status === "pending"
                ? "Saving project…"
                : persistence.status === "loading"
                  ? "Restoring saved project…"
                  : persistence.status === "blocked"
                    ? "The saved project could not be restored. Open a project, start a new one, or replace the saved copy."
                    : "Browser storage is unavailable or full. Download Save project to keep your work. Workspace navigation is paused until saving succeeds.",
          )}
        </span>
        {(persistence.status === "blocked" ||
          persistence.status === "error") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => persistence.saveNow(project, true)}
          >
            {t("Replace saved copy")}
          </button>
        )}
      </div>
      <p className={styles.hint} role="status">
        {t(
          dropTarget && dropTarget !== "add"
            ? "Drop one image to replace this layer. Its name and settings stay unchanged."
            : "Drop images anywhere in the editor to add layers. Drop one image onto a layer to replace it.",
        )}
      </p>
      {psdSelection && (
        <PsdLayerPicker
          layers={psdSelection.layers}
          limit={Math.max(
            0,
            Math.min(
              12 - project.assets.length,
              psdSelection.replacementId ? 1 : 12 - frame.layers.length,
            ),
          )}
          busy={busy}
          error={error}
          translate={t}
          onImport={(ids) => void importPsdLayers(ids)}
          onCancel={cancelPsd}
        />
      )}
      {busy && psdClient.current && !psdSelection && (
        <button type="button" onClick={cancelPsd}>
          <Icon name="close" />
          {t("Cancel PSD import")}
        </button>
      )}
      <input
        hidden
        ref={psdUpload}
        type="file"
        accept=".psd,image/vnd.adobe.photoshop"
        onChange={(event) => {
          void openPsd(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
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
        ref={replace}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          void addImages(event.target.files, replaceTarget.current);
          event.target.value = "";
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
          {t(
            !persistence.hydrated
              ? "Restoring saved project…"
              : exportProgress || "Processing local files…",
          )}
        </p>
      )}
      {exportProgress && (
        <button type="button" onClick={() => exportController.current?.abort()}>
          <Icon name="close" />
          {t("Cancel export")}
        </button>
      )}
      <div className={styles.workspace}>
        <div className={styles.stageColumn}>
          <OutputSize
            value={frame.size}
            disabled={busy}
            translate={t}
            onChange={(size) =>
              edit("Change output size", (current) => ({ ...current, size }))
            }
          />
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
                <Icon name="fit" />
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
              "PSD keeps layers, transparency, and visibility. PNG ZIP includes each transparent layer, a composite, and a visibility manifest. Exported layers keep custom names. Save project keeps original images and editable array settings.",
            )}
          </p>
        </div>
        <fieldset className={styles.inspector} disabled={busy}>
          <legend className={styles.eyebrow}>{t("LAYERS & ARRAY")}</legend>
          <section className={styles.layerPanel} aria-label={t("Layers")}>
            <div className={styles.panelHeading}>
              <h2>
                <Icon name="layers" />
                {t("Layers")}
              </h2>
              <span className={styles.layerCount}>
                {frame.layers.length} / 12
              </span>
              <button
                type="button"
                className={styles.iconButton}
                title={t("Add images")}
                aria-label={t("Add images")}
                disabled={busy || frame.layers.length >= 12}
                onClick={() => upload.current?.click()}
              >
                <Icon name="add" />
              </button>
            </div>
            <p className={styles.hint}>
              {t(
                "Select a layer to edit. Drop one image on a row to replace it.",
              )}
            </p>
            <div className={styles.selectionTools}>
              <button
                type="button"
                disabled={!frame.layers.length}
                onClick={() =>
                  setCheckedLayers(frame.layers.map((item) => item.id))
                }
              >
                <Icon name="all" />
                {t("Select all layers")}
              </button>
              <button
                type="button"
                disabled={!checked.length}
                onClick={() => setCheckedLayers([])}
              >
                {t("Clear selection")}
              </button>
              <span>
                {format("{count} checked", { count: checked.length })}
              </span>
            </div>
            <div className={styles.layers}>
              {!frame.layers.length && (
                <p className={styles.layerEmpty}>
                  <Icon name="image" />
                  {t("No images yet.")}
                </p>
              )}
              {frame.layers.map((item, index) => {
                const asset = project.assets.find(
                  (source) => source.id === item.asset,
                );
                const name = item.name ?? asset?.name ?? "";
                return (
                  <div
                    key={item.id}
                    className={styles.layerRow}
                    data-layer-drop={item.id}
                    data-selected={layer?.id === item.id}
                    data-file-drop={dropTarget === item.id ? "true" : undefined}
                    data-hidden={!item.visible}
                  >
                    <label className={styles.layerCheckLabel}>
                      <input
                        type="checkbox"
                        className={styles.layerCheck}
                        checked={checkedLayers.includes(item.id)}
                        aria-label={format("Select {name}", { name })}
                        onChange={(event) => {
                          const isChecked = event.target.checked;
                          setCheckedLayers((current) =>
                            isChecked
                              ? [...current, item.id]
                              : current.filter((id) => id !== item.id),
                          );
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.layerSelect}
                      aria-pressed={layer?.id === item.id}
                      onClick={() => {
                        setSelected(item.id);
                        setCheckedLayers([]);
                      }}
                    >
                      <span className={styles.layerThumbnail}>
                        {asset && (
                          <img
                            src={asset.data}
                            alt=""
                            width={40}
                            height={40}
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </span>
                      <span className={styles.layerInfo}>
                        <span className={styles.layerName}>{name}</span>
                        <small>
                          {format("Layer {number}", {
                            number: String(index + 1).padStart(2, "0"),
                          })}
                        </small>
                      </span>
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      title={format(
                        item.visible ? "Hide {name}" : "Show {name}",
                        { name },
                      )}
                      aria-label={format(
                        item.visible ? "Hide {name}" : "Show {name}",
                        { name },
                      )}
                      aria-pressed={item.visible}
                      onClick={() =>
                        edit(
                          item.visible ? "Hide layer" : "Show layer",
                          (current) => ({
                            ...current,
                            layers: current.layers.map((candidate) =>
                              candidate.id === item.id
                                ? { ...candidate, visible: !candidate.visible }
                                : candidate,
                            ),
                          }),
                        )
                      }
                    >
                      <Icon name={item.visible ? "eye" : "hidden"} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
          {layer && (
            <div className={styles.selectedPanel}>
              <div className={styles.panelHeading}>
                <h2>
                  <Icon name="image" />
                  {t("Layer settings")}
                </h2>
              </div>
              {checked.length > 0 && (
                <p className={styles.hint}>
                  {t(
                    "Image actions affect the active layer. Parameters affect checked layers.",
                  )}
                </p>
              )}
              <label className={styles.field}>
                <span>{t("Layer name")}</span>
                <input
                  key={`${layer.id}-${layerName}`}
                  type="text"
                  maxLength={200}
                  defaultValue={layerName}
                  onBlur={(event) => {
                    const name = event.target.value.trim();
                    if (name && name !== layerName)
                      updateLayer({ name }, "Rename layer");
                    else event.target.value = layerName;
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "Escape") {
                      event.preventDefault();
                      event.currentTarget.value = layerName;
                      event.currentTarget.blur();
                    }
                  }}
                />
              </label>
              <div className={styles.layerActions}>
                <button
                  type="button"
                  onClick={() => {
                    replaceTarget.current = layer.id;
                    replace.current?.click();
                  }}
                >
                  <Icon name="replace" />
                  {t("Replace image")}
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
                  <Icon name="duplicate" />
                  {t("Duplicate")}
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() =>
                    edit("Remove layer", (f) => ({
                      ...f,
                      layers: f.layers.filter((l) => l.id !== layer.id),
                    }))
                  }
                >
                  <Icon name="trash" />
                  {t("Remove")}
                </button>
              </div>
              <div className={styles.groupLabel}>
                {t("Parameter clipboard")}
              </div>
              <div className={styles.parameterActions}>
                <button
                  type="button"
                  onClick={() =>
                    setCopiedParameters({
                      name: parameterName,
                      parameters: copyLayerParameters(parameterLayer),
                    })
                  }
                >
                  <Icon name="copy" />
                  {t("Copy parameters")}
                </button>
                <button
                  type="button"
                  disabled={!copiedParameters || mixedParameters}
                  onClick={() => {
                    if (copiedParameters && !mixedParameters)
                      setProject((current) =>
                        pasteLayerParameters(
                          current,
                          parameterLayers.map((item) => item.id),
                          copiedParameters.parameters,
                        ),
                      );
                  }}
                >
                  <Icon name="paste" />
                  {t("Paste parameters")}
                </button>
                <button
                  type="button"
                  disabled={!copiedParameters || mixedParameters}
                  onClick={() => {
                    if (copiedParameters && !mixedParameters)
                      setProject((current) =>
                        pasteLayerParameters(
                          current,
                          current.history[current.cursor].layers.map(
                            (item) => item.id,
                          ),
                          copiedParameters.parameters,
                        ),
                      );
                  }}
                >
                  <Icon name="all" />
                  {t("Paste to all layers")}
                </button>
              </div>
              {copiedParameters && (
                <p className={styles.hint} role="status">
                  {format("Parameters copied from {name}.", {
                    name: copiedParameters.name,
                  })}
                </p>
              )}
              <p className={styles.hint}>
                {t(
                  "Copy array settings, size, angles, offsets, opacity, and image scaling. Paste keeps each layer's image, name, visibility, and order.",
                )}
              </p>
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
                  <Icon name="down" />
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
                  <Icon name="up" />
                  {t("Move up")}
                </button>
              </div>
              <p className={styles.hint}>
                {t(
                  "Later layers draw on top. Size preserves the original aspect ratio.",
                )}
              </p>
              <details className={styles.parameterPanel} open>
                <summary>{t("Array parameters")}</summary>
                <p className={styles.hint}>
                  {format("Editing {count} layer(s)", {
                    count: parameterLayers.length,
                  })}
                </p>
                {mixedParameters && (
                  <div className={styles.mixedNotice} role="status">
                    <p>
                      {format(
                        "Selected layers have different parameters. Confirm to synchronize them with the first checked layer: {name}.",
                        { name: parameterName },
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setProject((current) =>
                          pasteLayerParameters(
                            current,
                            parameterLayers.map((item) => item.id),
                            copyLayerParameters(parameterLayer),
                          ),
                        )
                      }
                    >
                      <Icon name="all" />
                      {t("Confirm and sync selected layers")}
                    </button>
                  </div>
                )}
                <fieldset
                  className={styles.parameterControls}
                  disabled={mixedParameters}
                >
                  <legend className={styles.srOnly}>
                    {t("Selected layer parameters")}
                  </legend>

                  <div className={styles.fields}>
                    {field("columns", "Columns", 1, 32, 1)}
                    {field("rows", "Rows", 1, 32, 1)}
                    {field(
                      "spacingX",
                      "Horizontal spacing (%)",
                      50,
                      400,
                      1,
                      100,
                    )}
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
                      updateParameters(
                        { spacingX: 1, spacingY: 1 },
                        "Reset spacing",
                      )
                    }
                  >
                    <Icon name="reset" />
                    {t("Reset spacing")}
                  </button>
                  <label className={styles.field}>
                    <span>{t("Image scaling")}</span>
                    <select
                      value={parameterLayer.sampling}
                      onChange={(e) =>
                        updateParameters(
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
                        updateParameters(
                          { stagger: 0, layoutAngle: 0 },
                          "Grid array preset",
                        )
                      }
                    >
                      <Icon name="grid" />
                      {t("Grid array")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateParameters(
                          {
                            stagger: 0.5,
                            rows: Math.min(
                              32,
                              parameterLayer.rows + (parameterLayer.rows % 2),
                            ),
                          },
                          "Half-drop array preset",
                        )
                      }
                    >
                      <Icon name="layers" />
                      {t("Half-drop array")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateParameters(
                          { layoutAngle: 45 },
                          "Diagonal array preset",
                        )
                      }
                    >
                      <Icon name="image" />
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
                        angle: lattice
                          ? Math.round(lattice.angle * 100) / 100
                          : 0,
                        count: lattice?.count ?? 0,
                      },
                    )}
                  </p>
                  <p className={styles.hint}>
                    {format(
                      "Fitted center spacing: X {x}% · Y {y}% of tile. Uniform seamless repeats use discrete spacing steps.",
                      {
                        x: lattice
                          ? Math.round(lattice.spacingX * 10000) / 100
                          : 0,
                        y: lattice
                          ? Math.round(lattice.spacingY * 10000) / 100
                          : 0,
                      },
                    )}
                    {lattice?.densityLimited
                      ? ` ${t("The density limit is active; both axes are adjusted proportionally.")}`
                      : ""}
                  </p>
                </fieldset>
              </details>
            </div>
          )}
        </fieldset>
      </div>
      <div className={styles.history}>
        <div className={styles.actions}>
          <button
            type="button"
            disabled={busy || project.cursor === 0}
            onClick={() => setProject((p) => ({ ...p, cursor: p.cursor - 1 }))}
          >
            <Icon name="undo" />
            {t("Undo")}
          </button>
          <button
            type="button"
            disabled={busy || project.cursor === project.history.length - 1}
            onClick={() => setProject((p) => ({ ...p, cursor: p.cursor + 1 }))}
          >
            <Icon name="redo" />
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
            const next = emptyProject();
            setProject(next);
            persistence.saveNow(next, true);
            setSelected("");
            setCheckedLayers([]);
            setError("");
          }}
        >
          <Icon name="add" />
          {t("New project")}
        </button>
      </div>
      <p className={styles.hint}>
        {t(
          "Edits keep original image bytes intact. Save project includes sources and up to 100 history states; editing an earlier state replaces its redo branch. The project autosaves in this browser and is not uploaded. Download Save project for a portable backup.",
        )}
      </p>
    </section>
  );
}
