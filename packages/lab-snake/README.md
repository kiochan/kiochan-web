# Quick Snake

Independent workspace package: @kiochan/lab-snake.

## Origin and maintenance

Original project: https://github.com/kiochan/quick-snake

Further development continues in this package in the Kiochan monorepo. The old repository is a historical reference. No old repository settings or contents are changed by this migration.

## Implementation

A fresh TypeScript / Canvas implementation inspired by the early Electron prototype. The Electron shell, global keyboard listeners, and string-based board are not carried over.

## Use

Start/pause/reset; steer with arrows, WASD, or direction buttons. Food, growth, wall/body collisions, reverse-turn protection, and a full-board win state are implemented. Inputs are queued once per simulation tick. No scores are stored or uploaded.

Open /lab/snake using `pnpm dev` at the workspace root. Run `pnpm --filter @kiochan/lab-snake typecheck` to check this package. Its React peer must be compatible with the host; it does not own Next.js routing or website navigation.

## Source and verification

src/engine.ts contains immutable game transitions and free-cell food placement. src/index.tsx owns input and drawing. The website embeds the actual engine source. Tests include growth, reversing, tail movement, collisions, and a full board.

The host provides semantic --kio-* CSS tokens. Shared experiment controls and canvas lifecycle live in @kiochan/lab-ui. All controls, comments, and documentation use English.
