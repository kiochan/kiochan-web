export type Asset = { id: string; name: string; data: string };
export type Sampling = "sharp" | "pixel";
export type Layer = {
  id: string;
  name?: string;
  asset: string;
  visible: boolean;
  columns: number;
  rows: number;
  spacingX: number;
  spacingY: number;
  size: number;
  rotation: number;
  layoutAngle: number;
  sampling: Sampling;
  x: number;
  y: number;
  stagger: number;
  opacity: number;
};
export type Frame = { label: string; size: number; layers: Layer[] };
const parameterKeys = [
  "columns",
  "rows",
  "spacingX",
  "spacingY",
  "size",
  "rotation",
  "layoutAngle",
  "sampling",
  "x",
  "y",
  "stagger",
  "opacity",
] as const satisfies readonly (keyof Layer)[];
export type LayerParameters = Pick<Layer, (typeof parameterKeys)[number]>;
export function copyLayerParameters(layer: LayerParameters): LayerParameters {
  return Object.fromEntries(
    parameterKeys.map((key) => [key, layer[key]]),
  ) as LayerParameters;
}
export function pasteLayerParameters(
  project: Project,
  targetIds: readonly string[],
  parameters: LayerParameters,
): Project {
  const targets = new Set(targetIds);
  const frame = project.history[project.cursor];
  const snapshot = copyLayerParameters(parameters);
  let changed = false;
  const layers = frame.layers.map((layer) => {
    if (
      !targets.has(layer.id) ||
      !parameterKeys.some((key) => layer[key] !== snapshot[key])
    )
      return layer;
    changed = true;
    return { ...layer, ...snapshot };
  });
  return changed
    ? commit(project, { ...frame, label: "Paste layer parameters", layers })
    : project;
}
export type Project = {
  format: "kiochan-texture-array";
  version: 4;
  assets: Asset[];
  history: Frame[];
  cursor: number;
};
export const emptyProject = (): Project => ({
  format: "kiochan-texture-array",
  version: 4,
  assets: [],
  history: [{ label: "New project", size: 1024, layers: [] }],
  cursor: 0,
});
export function newLayer(asset: string): Layer {
  return {
    id: crypto.randomUUID(),
    asset,
    visible: true,
    columns: 4,
    rows: 4,
    spacingX: 1,
    spacingY: 1,
    size: 0.18,
    rotation: 0,
    layoutAngle: 0,
    sampling: "sharp",
    x: 0,
    y: 0,
    stagger: 0,
    opacity: 1,
  };
}
export function commit(project: Project, frame: Frame): Project {
  const history = [
    ...project.history.slice(0, project.cursor + 1),
    frame,
  ].slice(-100);
  return { ...project, history, cursor: history.length - 1 };
}
export function replaceLayerImage(
  project: Project,
  layerId: string,
  asset: Asset,
): Project {
  const frame = project.history[project.cursor];
  if (!frame.layers.some((layer) => layer.id === layerId)) return project;
  return commit(
    { ...project, assets: [...project.assets, asset] },
    {
      ...frame,
      label: "Replace image",
      layers: frame.layers.map((layer) =>
        layer.id === layerId
          ? {
              ...layer,
              name:
                layer.name ??
                project.assets.find((source) => source.id === layer.asset)
                  ?.name,
              asset: asset.id,
            }
          : layer,
      ),
    },
  );
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid project structure.");
  return value as Record<string, unknown>;
}
function number(
  value: unknown,
  min: number,
  max: number,
  integer = false,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isInteger(value))
  )
    throw new Error("Invalid project setting.");
  return value;
}
function string(value: unknown, limit = 200): string {
  if (typeof value !== "string" || !value.length || value.length > limit)
    throw new Error("Invalid project text.");
  return value;
}
export function parseProject(text: string): Project {
  if (text.length > 70_000_000)
    throw new Error("Project exceeds the 70 MB limit.");
  const root = record(JSON.parse(text));
  if (
    root.format !== "kiochan-texture-array" ||
    ![1, 2, 3, 4].includes(root.version as number)
  )
    throw new Error("Unsupported texture project.");
  if (!Array.isArray(root.assets) || root.assets.length > 12)
    throw new Error("A project supports up to 12 source images.");
  let bytes = 0;
  const assets = root.assets.map((value): Asset => {
    const a = record(value);
    const data = string(a.data, 12_000_000);
    bytes += data.length;
    if (
      bytes > 64_000_000 ||
      !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(data)
    )
      throw new Error("Invalid or oversized image source.");
    return { id: string(a.id), name: string(a.name), data };
  });
  const ids = new Set(assets.map((a) => a.id));
  if (ids.size !== assets.length)
    throw new Error("Duplicate image identifiers.");
  if (
    !Array.isArray(root.history) ||
    !root.history.length ||
    root.history.length > 100
  )
    throw new Error("Invalid project history.");
  const history = root.history.map((value): Frame => {
    const f = record(value);
    if (!Array.isArray(f.layers) || f.layers.length > 12)
      throw new Error("Too many layers.");
    const layers = f.layers.map((value): Layer => {
      const l = record(value);
      const asset = string(l.asset);
      if (!ids.has(asset) || typeof l.visible !== "boolean")
        throw new Error("Invalid layer source.");
      const sampling =
        l.sampling === undefined && root.version === 1 ? "sharp" : l.sampling;
      if (sampling !== "sharp" && sampling !== "pixel")
        throw new Error("Invalid image sampling mode.");
      return {
        id: string(l.id),
        ...(l.name === undefined ? {} : { name: string(l.name) }),
        asset,
        visible: l.visible,
        columns: number(l.columns, 1, 32, true),
        rows: number(l.rows, 1, 32, true),
        spacingX: number(
          l.spacingX === undefined && root.version !== 4 ? 1 : l.spacingX,
          0.5,
          4,
        ),
        spacingY: number(
          l.spacingY === undefined && root.version !== 4 ? 1 : l.spacingY,
          0.5,
          4,
        ),
        size: number(l.size, 0.01, 0.7),
        rotation: number(l.rotation, -180, 180),
        layoutAngle: number(
          l.layoutAngle === undefined && root.version === 1 ? 0 : l.layoutAngle,
          -180,
          180,
        ),
        sampling,
        x: number(l.x, 0, 1),
        y: number(l.y, 0, 1),
        stagger: number(l.stagger, 0, 1),
        opacity: number(l.opacity, 0, 1),
      };
    });
    if (new Set(layers.map((l) => l.id)).size !== layers.length)
      throw new Error("Duplicate layer identifiers.");
    const size = number(f.size, 256, 4096, true);
    if (![256, 512, 1024, 2048, 4096].includes(size))
      throw new Error("Invalid output resolution.");
    return { label: string(f.label), size, layers };
  });
  return {
    format: "kiochan-texture-array",
    version: 4,
    assets,
    history,
    cursor: number(root.cursor, 0, history.length - 1, true),
  };
}
