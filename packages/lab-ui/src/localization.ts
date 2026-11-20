export type Translate = (text: string) => string;

export const defaultTranslate: Translate = (text) => text;

export function formatMessage(
  t: Translate,
  template: string,
  values: Record<string, string | number>,
  locale?: string,
) {
  return t(template).replace(/\{(\w+)\}/g, (placeholder, key: string) => {
    if (!Object.hasOwn(values, key)) return placeholder;
    const value = values[key];
    return typeof value === "number" && locale
      ? value.toLocaleString(locale)
      : String(value);
  });
}
