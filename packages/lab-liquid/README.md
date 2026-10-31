# Liquid Playground

Independent workspace package: @kiochan/lab-liquid.

## Origin and maintenance

Original project: https://github.com/kiochan/liquid-playground

Further development continues in this package in the Kiochan monorepo. The old repository is a historical reference. No old repository settings or contents are changed by this migration.

## Implementation

A new Canvas 2D implementation inspired by the original liquid experiment. It uses a fixed 60 Hz simulation step, spatial neighborhood search, damped Verlet integration, and two density-relaxation passes. It replaces the original Pixi / LiquidFun WASM dependency tree rather than copying it. This is a fluid-like visual approximation, not a full LiquidFun port or engineering solver.

## Use

Start or pause, pour using the canvas or Add water, change gravity, and clear. Simulation is capped at 480 particles. It starts paused and skips hidden-document frames. The shared canvas hook cancels animation and observers on unmount.

Open /lab/liquid using `pnpm dev` at the workspace root. Run `pnpm --filter @kiochan/lab-liquid typecheck` to check this package. Its React peer must be compatible with the host; it does not own Next.js routing or website navigation.

## Source and verification

src/fluid.ts owns simulation; src/index.tsx owns controls. Tests cover finite coordinates, bounds, and the particle cap.

The host provides semantic --kio-* CSS tokens. Shared experiment controls and canvas lifecycle live in @kiochan/lab-ui. All controls, comments, and documentation use English.
