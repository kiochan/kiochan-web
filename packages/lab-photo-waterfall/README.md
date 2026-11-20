# Photo Waterfall

Photo Waterfall is an original kiochan-web Lab tool based on a user-provided layout sketch. It runs at `/lab/photo-waterfall`. The reference artwork is not bundled.

Add or drop local photos, choose the total canvas width and number of columns, then download one PNG. Each image appears in full at its original aspect ratio, subject to pixel rounding. Equal-width columns share their edges and can differ by one pixel when the canvas width does not divide evenly. The tool automatically balances columns. Drag photos in the preview to reorder them or move across columns. Touch screens can drag using a photo's handle, and focused photos can move using the arrow keys. Select Auto arrange to restore automatic balancing. Changing the column count starts a new automatic layout.

Place the spare space at the bottom, at the top, at both ends, or between photos. The last option centers a photo when it is alone in a column. Choose a solid background color or export with transparent gaps. The measured unfilled percentage covers geometric gaps.

All decoding, layout, preview, and PNG encoding happen in the browser. The layout engine lives in `src/layout.ts`, the editor in `src/index.tsx`, and the independent Lab card preview in `src/preview.tsx`. Export supports canvases up to 8192 pixels wide, 16384 pixels tall, and 32 million pixels, subject to browser canvas support.

Run `node --test scripts/photo-waterfall.test.mjs` and `pnpm --filter @kiochan/lab-photo-waterfall typecheck` from the repository root. Open the Lab route and import mixed portrait and landscape photos. Reorder within a column, move between columns, and change gap placement and background. Confirm the downloaded PNG matches the preview and preserves full image bounds.
