export type TextureTranslator = (message: string) => string;
export const textureFieldLabels = [
  "Columns",
  "Rows",
  "Horizontal spacing (%)",
  "Vertical spacing (%)",
  "Size (% of tile)",
  "Image rotation (°)",
  "Array angle (°)",
  "Offset X (%)",
  "Offset Y (%)",
  "Row stagger (%)",
  "Opacity (%)",
] as const;
export function formatTextureText(
  template: string,
  translate: TextureTranslator,
  values: Record<string, string | number>,
) {
  return translate(template).replace(
    /\{(\w+)\}/g,
    (placeholder, key: string) =>
      values[key] === undefined ? placeholder : String(values[key]),
  );
}
export function localizeTextureText(
  message: string,
  translate: TextureTranslator,
): string {
  const direct = translate(message);
  if (direct !== message) return direct;
  const imported = /^Import (\d+) image\(s\)$/.exec(message);
  if (imported)
    return formatTextureText("Import {count} image(s)", translate, {
      count: imported[1],
    });
  const progress = /^Encoding TIFF layer (\d+) of (\d+)…$/.exec(message);
  if (progress)
    return formatTextureText(
      "Encoding TIFF layer {current} of {total}…",
      translate,
      { current: progress[1], total: progress[2] },
    );
  const textureLimit =
    /^Image exceeds this GPU's (\d+)px texture limit\.$/.exec(message);
  if (textureLimit)
    return formatTextureText(
      "Image exceeds this GPU's {size}px texture limit.",
      translate,
      { size: textureLimit[1] },
    );
  const changed = /^Change (.+)$/.exec(message);
  if (changed) {
    const label =
      textureFieldLabels.find((field) => field.toLowerCase() === changed[1]) ??
      (changed[1] === "rotation (°)" ? "Image rotation (°)" : undefined);
    if (label)
      return formatTextureText("Change {setting}", translate, {
        setting: translate(label),
      });
  }
  return message;
}
