# Breakout

Independent workspace package: @kiochan/lab-breakout.

## Origin and maintenance

Original project: https://github.com/kiochan/breakout

Further development continues in this package in the Kiochan monorepo. The old repository is a historical reference. No old repository settings or contents are changed by this migration.

## Implementation

A fresh TypeScript / Canvas implementation of the earlier CoffeeScript brick-breaker. It does not copy the original global document listeners, body styling, or CoffeeScript runtime.

## Use

Start/pause/reset; move the paddle with pointer, touch, or arrow keys. Three lives and 28 bricks, with explicit win/loss state. Space pauses when the canvas has focus. Runs fixed 120 Hz collision steps with bounded frame deltas.

Open /lab/breakout using `pnpm dev` at the workspace root. Run `pnpm --filter @kiochan/lab-breakout typecheck` to check this package. Its React peer must be compatible with the host; it does not own Next.js routing or website navigation.

## Source and verification

src/engine.ts contains collision, paddle, score, lives, and win/loss logic. src/index.tsx handles React controls and rendering. The website embeds the actual engine source in a server-rendered details panel.

The host provides semantic --kio-* CSS tokens. Shared experiment controls and canvas lifecycle live in @kiochan/lab-ui. All controls, comments, and documentation use English.
