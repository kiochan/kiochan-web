# Image Palette

Image Palette is an original Kiochan Lab tool maintained in this package and served at `/lab/image-palette`.

Choose, drop, or paste one local image. The browser samples a reduced copy, groups similar colors in Oklab, and builds up to four sets of five HEX swatches. Sets emphasize dominant colors, accents, light tones, or deep tones. Images with few distinct colors can yield fewer swatches and palettes. Copy a single swatch or the full comma-separated palette. Image data stays in the browser.

Run `pnpm --filter @kiochan/lab-image-palette typecheck` and `node --test scripts/image-palette.test.mjs` from the repository root. Open the lab route and try a colorful photo, a solid-color image, and a transparent PNG. Check image replacement, keyboard operation, and both single-color and whole-palette copying.
