# Texture Array

An original, local-first seamless texture editor maintained in `packages/lab-texture-array`. Open it at `/lab/texture-array`; the host owns navigation, theme, metadata, and the Lab sidebar. No external motif assets or user reference images ship with the package.

## Editing

Import multiple PNG, JPEG, or WebP images. Each image becomes an independent layer with aspect-preserving size, rotation, opacity, column/row counts, tile-relative offsets, and alternating-row stagger. The half-drop preset uses even rows to maintain its rhythm across seams. Later layers composite over earlier layers; layers can be hidden, reordered, duplicated, or removed.

Array angle rotates the finite set of motif centers around the tile center, independently from image rotation. Set any angle from −180° to 180°, including fractional values, or start with the 45° diagonal preset. Centers and crossing motifs wrap into the tile. This guarantees continuous image edges, but arbitrary angles do not guarantee uniform inter-motif spacing across a square seam. The array remains finite and never expands or animates continuously.

Sharp image scaling uses bounded Catmull–Rom reconstruction when enlarging, transitioning to trilinear mipmap filtering when reducing, with up to 8× anisotropic filtering when supported by the GPU. Source bitmaps and mipmaps are premultiplied before filtering to prevent dark transparent fringes; TIFF readback returns straight-alpha pixels. Pixel mode uses exact nearest texels for hard edges and may alias when reduced. Magnified canvas inspection displays output pixels without a second smoothing pass. These algorithms preserve available detail; they cannot reconstruct detail missing from the uploaded raster. Every render samples the original uploaded texture, never a previously resized output.

Saved projects now use version 2 to preserve array angle and sampling. Version 1 projects upgrade all historical layers to zero array angle and Sharp sampling, retaining sources and other settings. Version 2 files require this updated editor.

The square output is a periodic tile. Instances crossing an edge wrap to the opposite edge. A finite 3 × 3 check previews nine copies, with guide lines excluded from export. Drag the viewport or use focused arrow keys to pan within fixed bounds. Plus/minus change zoom and Home/Fit restores the view. View changes never alter the design. Transparent areas use a theme-aware checkerboard.

Export produces one square, 8-bit RGBA `.tif` at 256–4096px, with a transparent composite and Adobe Photoshop ImageSourceData (tag 37724) containing each rendered layer. Names (including Unicode), stack order, alpha, and hidden-layer flags are preserved. Each editor layer becomes one raster layer; repeated instances are baked into that layer, including per-instance opacity. TIFF layers do not contain procedural array settings or original source images; use Save project for those. This is layered TIFF, not a multi-page image. TIFF readers without support for the Adobe layer extension show only the composite. Photoshop application compatibility must be verified in a real editor; independent decoder checks alone do not prove every editor supports the extension. Deflate compression runs in a dedicated worker, receiving one transferred RGBA image at a time; progress and cancellation are available. Exports are capped at 1.5 GB. Save project downloads a versioned JSON containing original image bytes, layer settings, the current history position, and up to 100 snapshots. Open project restores these snapshots for further undo/redo. A new edit from an earlier snapshot replaces its redo branch. Images remain embedded even when removed from a layer so undo can recover them. Nothing is uploaded or automatically persisted; save before closing or starting a new project.

## Rendering and limits

`src/renderer.ts` uses WebGL2 GLSL shaders and instanced quads (one array draw per visible layer). Nine bounded wrap copies per instance cover the neighboring tiles. The longest motif side is capped at 70% of the tile, so a rotated motif cannot extend beyond the supported wrap neighborhood. A framebuffer stores the tile; a second shader samples it for the finite repeat preview. Textures have mipmaps. Rendering is driven by design/view-mode changes; there is no animation loop, and pan/zoom only change CSS transforms. GPU textures, framebuffers, programs, decoded bitmaps, and download URLs are released. Context restoration recreates GPU resources from retained originals.

Projects allow 12 source images and 12 active layers, up to 8 MB per uploaded image and approximately 48 MB total source bytes. Decoded images are limited to 8192px per side and 32 megapixels, and must fit the device texture limit. Counts are bounded at 32 × 32 per layer. Project imports validate schema, sizes, finite numeric bounds, source references, and raster-only data URLs before replacing the current project. The renderer reports unsupported WebGL2 and GPU allocation failures. High-overlap arrays and 4096px output can still be expensive on low-end devices; no device-independent frame-rate guarantee is made. Source files stay intact, while exported TIFF layers are raster resamplings of the edited layout.

## Verification

- `node --test scripts/texture-array.test.mjs` checks history branching, source preservation, and untrusted project validation.
- `pnpm lint`, `pnpm typecheck`, and `pnpm build` check workspace integration.
- `node scripts/smoke-test.mjs` checks the production route, Lab catalogue, shared chrome, and sitemap.
- Browser verification should cover transparent multi-image import, asymmetric image orientation, overlapping alpha, edge wrapping, layered TIFF channels, visibility and order, single/3 × 3 export equivalence, cancellation, saved project restoration, keyboard and touch navigation, context loss, and narrow/light/dark layouts.

TIFF structure follows [Adobe Photoshop File Formats](https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/), including ImageSourceData, layer records, Unicode names, and ZIP-compressed channel data. Run `node --test scripts/texture-array-tiff.test.mjs` for TIFF directory, composite and layer-channel checks.
