export type PatternOptions = {
  repeat: number;
  stripe: number;
  cross: boolean;
  colors: [string, string, string];
};
export function patternSvg({ repeat, stripe, cross, colors }: PatternOptions) {
  const safeColors = colors.map((color) =>
    /^#[0-9a-f]{6}$/i.test(color) ? color : "currentColor",
  );
  const size = Math.max(24, Math.min(160, Math.round(repeat)));
  const band = Math.max(2, Math.min(size / 2, Math.round(stripe)));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="440" viewBox="0 0 720 440"><defs><pattern id="plaid" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${safeColors[0]}"/><rect x="${size / 3}" width="${band}" height="${size}" fill="${safeColors[1]}" fill-opacity=".7"/>${cross ? `<rect y="${size / 3}" width="${size}" height="${band}" fill="${safeColors[1]}" fill-opacity=".7"/>` : ""}<path d="M2 0v${size}M0 2h${size}" stroke="${safeColors[2]}" stroke-width="2"/></pattern></defs><rect width="720" height="440" fill="url(#plaid)"/></svg>`;
}
