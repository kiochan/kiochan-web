import assert from "node:assert/strict";
import test from "node:test";
import {
  createBreakout,
  HEIGHT,
  movePaddle,
  PADDLE,
  stepBreakout,
  WIDTH,
} from "../packages/lab-breakout/src/engine.ts";
import { createCubismAdapter } from "../packages/lab-cubism/src/adapter.ts";
import { inspectManifest } from "../packages/lab-cubism/src/manifest.ts";

function mockCubism() {
  const events = [];
  const model = {
    update() {
      events.push("update");
    },
    getCanvasWidth() {
      return 2;
    },
    getCanvasHeight() {
      return 2;
    },
  };
  const moc = {
    createModel() {
      return model;
    },
    deleteModel() {
      events.push("deleteModel");
    },
    release() {
      events.push("releaseMoc");
    },
  };
  class Matrix {
    scale() {}
    scaleRelative() {}
    translateRelative() {}
    multiplyByMatrix() {}
    setWidth() {}
  }
  class Renderer {
    initialize() {}
    startUp() {}
    setIsPremultipliedAlpha() {}
    bindTexture() {}
    setMvpMatrix() {}
    setRenderState() {}
    drawModel() {
      events.push("draw");
    }
    release() {
      events.push("releaseRenderer");
    }
  }
  const gl = {
    viewport() {},
    clearColor() {},
    clear() {},
    deleteTexture() {},
    COLOR_BUFFER_BIT: 1,
  };
  return {
    events,
    canvas: {
      ownerDocument: { baseURI: "https://example.test/lab/cubism" },
      width: 720,
      height: 440,
      getContext() {
        return gl;
      },
    },
    bindings: {
      CubismMoc: {
        create() {
          return moc;
        },
      },
      CubismMatrix44: Matrix,
      CubismModelMatrix: Matrix,
      CubismRenderer_WebGL: Renderer,
    },
  };
}

test("Cubism adapter draws through supplied SDK bindings and disposes once", async (context) => {
  const fixture = mockCubism();
  context.mock.method(globalThis, "fetch", async (url) =>
    String(url).endsWith(".json")
      ? new Response(
          JSON.stringify({
            Version: 3,
            FileReferences: { Moc: "own.moc3", Textures: [] },
          }),
        )
      : new Response(new Uint8Array([0, 1, 2])),
  );
  const session = await createCubismAdapter(
    fixture.bindings,
    "/authorized-shaders/",
  )({
    canvas: fixture.canvas,
    modelUrl: "/authorized/own.model3.json",
    signal: new AbortController().signal,
  });
  session.render(0.016, { zoom: 1, panX: 0, panY: 0 });
  session.dispose();
  session.dispose();
  assert.deepEqual(fixture.events, [
    "update",
    "draw",
    "releaseRenderer",
    "deleteModel",
    "releaseMoc",
  ]);
});
test("Cubism adapter releases partially loaded resources on cancellation", async (context) => {
  const fixture = mockCubism(),
    controller = new AbortController();
  context.mock.method(globalThis, "fetch", async (url) => {
    if (String(url).endsWith(".json"))
      return new Response(
        JSON.stringify({
          Version: 3,
          FileReferences: { Moc: "own.moc3", Textures: [] },
        }),
      );
    controller.abort();
    return new Response(new Uint8Array([0, 1, 2]));
  });
  await assert.rejects(
    createCubismAdapter(
      fixture.bindings,
      "/authorized-shaders/",
    )({
      canvas: fixture.canvas,
      modelUrl: "/authorized/own.model3.json",
      signal: controller.signal,
    }),
    { name: "AbortError" },
  );
  assert.deepEqual(fixture.events, [
    "releaseRenderer",
    "deleteModel",
    "releaseMoc",
  ]);
});

import { patternSvg } from "../packages/lab-lattice/src/pattern.ts";
import { LIMIT, pour, stepFluid } from "../packages/lab-liquid/src/fluid.ts";
import {
  COLUMNS,
  createSnake,
  nextFood,
  ROWS,
  stepSnake,
} from "../packages/lab-snake/src/engine.ts";

test("snake grows only when eating and rejects a reverse turn", () => {
  const game = createSnake();
  game.food = { x: 7, y: 8 };
  const next = stepSnake(game, "left", () => 0);
  assert.equal(next.direction, "right");
  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.equal(game.snake.length, 3);
  assert.ok(
    !next.snake.some((p) => p.x === next.food.x && p.y === next.food.y),
  );
});
test("snake loses at a wall and can move into a vacated tail cell", () => {
  const game = createSnake();
  game.snake[0] = { x: COLUMNS - 1, y: 8 };
  assert.equal(stepSnake(game).phase, "lost");
  const loop = {
    snake: [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
      { x: 0, y: 1 },
    ],
    direction: "up",
    food: { x: 20, y: 15 },
    score: 0,
    phase: "running",
  };
  assert.equal(stepSnake(loop, "left").phase, "running");
});
test("snake detects body collision and wins when the final free cell is filled", () => {
  const body = {
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
    ],
    direction: "up",
    food: { x: 20, y: 15 },
    score: 0,
    phase: "running",
  };
  assert.equal(stepSnake(body, "left").phase, "lost");
  const cells = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLUMNS; x++)
      if (!(x === 1 && y === 0)) cells.push({ x, y });
  const full = stepSnake(
    {
      snake: cells,
      direction: "right",
      food: { x: 1, y: 0 },
      score: 0,
      phase: "running",
    },
    "right",
  );
  assert.equal(full.phase, "won");
  assert.equal(full.snake.length, COLUMNS * ROWS);
  assert.equal(nextFood(full.snake), null);
});
test("breakout paddle clamps and ball bounces at a wall", () => {
  const game = createBreakout();
  movePaddle(game, -100);
  assert.equal(game.paddle, PADDLE / 2);
  movePaddle(game, 10000);
  assert.equal(game.paddle, WIDTH - PADDLE / 2);
  game.x = 6;
  game.vx = -160;
  stepBreakout(game, 0.01);
  assert.ok(game.vx > 0);
});
test("breakout counts a brick once, wins, and loses after three misses", () => {
  const game = createBreakout();
  game.bricks = [{ x: 30, y: 40, active: true }];
  game.x = 50;
  game.y = 70;
  game.vy = -240;
  stepBreakout(game, 0.05);
  assert.equal(game.score, 10);
  assert.equal(game.phase, "won");
  stepBreakout(game, 0.05);
  assert.equal(game.score, 10);
  const lost = createBreakout();
  for (let i = 0; i < 3; i++) {
    lost.y = HEIGHT + 20;
    stepBreakout(lost, 0.01);
  }
  assert.equal(lost.lives, 0);
  assert.equal(lost.phase, "lost");
});
test("fluid remains finite and bounded, including negative gravity, with a hard cap", () => {
  const particles = [];
  for (let i = 0; i < 30; i++) pour(particles, 360, 100);
  assert.equal(particles.length, LIMIT);
  for (let i = 0; i < 180; i++) stepFluid(particles, i < 90 ? 10 : -10);
  assert.ok(
    particles.every(
      (p) =>
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        p.x >= 8 &&
        p.x <= 712 &&
        p.y >= 8 &&
        p.y <= 432,
    ),
  );
});
test("pattern constrains repeat and cannot serialize markup from a color value", () => {
  const svg = patternSvg({
    repeat: 999,
    stripe: 999,
    cross: false,
    colors: ['"><script>alert(1)</script>', "#abcdef", "#123456"],
  });
  assert.ok(svg.includes('width="160"'));
  assert.ok(!svg.includes("<script>"));
  assert.ok(!svg.includes("fill-opacity=.7"));
  assert.equal((svg.match(/fill-opacity/g) ?? []).length, 1);
});
test("manifest inspection validates model structure without fetching referenced assets", () => {
  const manifest = {
    Version: 3,
    FileReferences: {
      Moc: "own.moc3",
      Textures: ["textures/a.png"],
      Motions: { Idle: [{ File: "idle.motion3.json" }] },
      Expressions: [{ File: "smile.exp3.json" }],
    },
  };
  assert.deepEqual(inspectManifest(JSON.stringify(manifest)), {
    moc: "own.moc3",
    textures: ["textures/a.png"],
    motions: 1,
    expressions: 1,
  });
  assert.throws(() => inspectManifest("{}"), /Version 3/);
  assert.throws(
    () =>
      inspectManifest(
        JSON.stringify({
          Version: 3,
          FileReferences: { Moc: "a.moc3", Textures: "invalid" },
        }),
      ),
    /Texture/,
  );
});
