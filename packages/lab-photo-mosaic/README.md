# Photo Mosaic

Photo Mosaic is an original browser editor maintained in `packages/lab-photo-mosaic` and served at `/lab/photo-mosaic`. It opens up to 100 local raster images, keeps photo data in the current browser session, and exports a single PNG, WebP, or JPG at the canvas dimensions. Choose a preset or apply a custom width and height. Each side can be 64–16,383 pixels, with a maximum total of 67,108,864 pixels. Large PNGs are encoded in strips to limit memory usage. WebP and JPG use the browser’s encoders, so the largest sizes those formats can export depend on the browser and device.

Drop local files onto the canvas or use Add photos to browse. Drag a tile to place it while preserving its size. Select a tile and drag an edge or enter its width and height in the selection panel. The remaining unlocked photos adapt around the edited tile. Positions near the canvas or a locked tile can snap to an edge. If the requested rectangle overlaps a lock or there is too little room for the remaining photos, the editor keeps the last usable layout. Keyboard users can focus a tile or resize handle and nudge it with the arrow keys. Shift plus an arrow nudges one export pixel at a time.

Lock multiple tiles to fix their rectangles during editing and shuffling. The Locked photos list shows each lock in the current session. Select a thumbnail or name to locate that photo in the preview, or unlock it directly from the list. Undo and redo include lock changes. Shuffle Layout tries alternatives in the unlocked regions, favoring similar displayed sizes and better use of the canvas. Resizing a canvas scales the layout when no photos are locked. With locks, the editor preserves their exact pixel coordinates and sizes and reflows the rest. If the locks or other photos cannot fit on the new canvas, the existing size stays in effect.

Preview zoom ranges from 50% to 400% of the fitted view. Fit to view restores the full composition. At higher zoom, use the scrollbars or enable Pan preview and drag to inspect another area. Zoom and pan change only the view.

Antialiasing controls how photos are resampled in the export. Off disables Canvas 2D smoothing and uses a pixelated preview. Low, Medium, and High pass a quality hint to the browser's smoothing implementation. High is the default.

Photo fit controls how each image fits its rectangle. Automatic layout fills the canvas and favors similar tile sizes. Keep more of each photo fills the canvas and gives priority to layouts that require less cropping around the locked tiles. Keep whole photos packs the unlocked photos into rows or columns sized to their original aspect ratios. It compares layouts to use more of the canvas while keeping displayed photo sizes similar. Tidy layout can leave narrow strips around locked photos open to avoid tiny isolated photos. Manually resized or locked tiles retain their dimensions.

Choose a solid background color or transparency for blank areas. The same choice applies behind partially transparent source photos. The preview shows how the exported background will look, with a checkerboard for transparent PNG and WebP output. JPG uses the selected color or fills transparency with white. The editor encodes exports in a Web Worker.

Photo spacing defaults to 0 output pixels. Positive spacing exposes the chosen background along shared tile edges, leaving the outer edges of the canvas untouched. Tight tiles limit how much spacing can fit. Whole-photo mode still preserves original proportions and may leave additional space.

Run `node --test scripts/photo-mosaic.test.mjs` for free placement, snapping, locked geometry, resizing, and coverage checks. Run the workspace lint, typecheck, build, and route smoke checks for host integration.
