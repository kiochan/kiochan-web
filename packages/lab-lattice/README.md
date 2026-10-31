# Lattice Generator

Independent workspace package: @kiochan/lab-lattice.

## Origin and maintenance

Original project: https://github.com/kiochan/lattice-generator

Further development continues in this package in the Kiochan monorepo. The old repository is a historical reference. No old repository settings or contents are changed by this migration.

## Implementation

A rewritten SVG plaid generator. The legacy Express server, DOM manipulation, canvas screenshot libraries, and bundled images are not carried over. The design retains the idea of repeatable crossed stripes.

## Use

Adjust repeat, stripe width, crossed stripes, and three colors. Export vector SVG or a 720×440 PNG. Default artwork colors come from packages/theme; user-chosen artwork colors are experiment data, not website UI palette overrides.

Open /lab/lattice using `pnpm dev` at the workspace root. Run `pnpm --filter @kiochan/lab-lattice typecheck` to check this package. Its React peer must be compatible with the host; it does not own Next.js routing or website navigation.

## Source and verification

src/pattern.ts is a pure SVG generator. Colors are validated before serialization. Object URLs are revoked after downloads. Tests check constraints and injection rejection.

The host provides semantic --kio-* CSS tokens. Shared experiment controls and canvas lifecycle live in @kiochan/lab-ui. All controls, comments, and documentation use English.

## Card preview

The ./preview export contains lightweight, server-rendered SVG artwork for the Lab index. It imports only shared preview styles, not this package's engine or runtime. Playback is controlled by the host card through data-preview-playing, with pointer, keyboard, touch-button, visibility, and reduced-motion handling. The illustration is a feature preview rather than a live instance of the experiment.
