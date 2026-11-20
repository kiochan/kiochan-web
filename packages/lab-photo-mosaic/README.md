# Photo Mosaic

Photo Mosaic is an original browser editor maintained in `packages/lab-photo-mosaic` and served at `/lab/photo-mosaic`. It opens up to 100 local raster images, keeps photo data in the current browser session, and exports a single PNG at the canvas dimensions. Choose a preset or apply a custom width and height. Each side can be 64–8192 pixels, with a maximum total of 33,554,432 pixels.

Drop local files onto the canvas or use Add photos to browse. Drag a tile to place it while preserving its size. Select the tile and drag an edge to resize it. During either gesture, unlocked photos fill the remaining space. Positions near the canvas or a locked tile can snap to an edge when that makes a full layout possible. If the requested rectangle overlaps a lock or the remaining photos cannot cover the surrounding space, the editor keeps the last usable layout. Keyboard users can focus a tile or resize handle and nudge it with the arrow keys. Shift plus an arrow nudges one export pixel at a time.

Locking a tile fixes its rectangle during editing and shuffling. Shuffle Layout tries alternatives in the unlocked regions and ranks them by how much each would crop the source photos. Undo and redo let users compare layouts. Resizing a canvas scales the layout when no photos are locked. With locks, the editor preserves their exact pixel coordinates and sizes and reflows the rest. If the new canvas cannot be filled around the locks, the existing size stays in effect.

Antialiasing controls how photos are resampled in the PNG. Off disables Canvas 2D smoothing and uses a pixelated preview. Low, Medium, and High pass a quality hint to the browser's smoothing implementation. High is the default.

Choose a target image to build a photo mosaic that resembles it. The reference is center-cropped to the canvas aspect ratio. Unlocked photos are assigned to tile regions using their visible crop colors and a minimum-cost one-to-one match. Color strength blends the reference colors while preserving the source luminance and photo detail. Match target brightness also adjusts luminance when explicitly enabled. Enter 1–32 tiles per side and apply the density to subdivide each unlocked tile into a grid. The editor shows the total tile count and limits subdivisions to available output pixels. The smaller tiles reuse imported photos and are matched independently. Locked tiles retain their photo and geometry. Density changes the preview and export while the original tiles remain the editing controls.

Match photos again reassigns the unlocked tiles for the current geometry. Removing the target clears the tint and density expansion. Undo can restore the previous photo assignments. Photo matching, rendered previews, and PNG encoding run in Web Workers. The editor shows status while those calculations are in progress.

The layout engine partitions the canvas into rectangles with shared edges at whole pixel coordinates. Each source is center-cropped to cover its tile. Any transparency already present in a source image is preserved in the PNG. Preview overlays are excluded from the export.

Run `node --test scripts/photo-mosaic.test.mjs` for free placement, snapping, locked geometry, resizing, and coverage checks. Run the workspace lint, typecheck, build, and route smoke checks for host integration.
