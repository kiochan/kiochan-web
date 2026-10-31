"use client";
import { useCanvas } from "@kiochan/lab-ui";
import styles from "@kiochan/lab-ui/styles.module.css";
import { useRef, useState } from "react";
import {
  COLUMNS,
  createSnake,
  type Direction,
  ROWS,
  type SnakeGame,
  stepSnake,
} from "./engine";

const CELL = 24;
const keys: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};
export function QuickSnake() {
  const game = useRef<SnakeGame | null>(null);
  const pending = useRef<Direction | null>(null);
  const clock = useRef(0);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Ready");
  const canvas = useCanvas((ctx, dt, palette) => {
    if (!game.current) game.current = createSnake();
    const state = game.current;
    if (running && state.phase === "running") {
      clock.current += dt;
      if (clock.current >= 0.14) {
        clock.current %= 0.14;
        game.current = stepSnake(state, pending.current ?? state.direction);
        pending.current = null;
        setScore(game.current.score);
        if (game.current.phase !== "running") {
          setRunning(false);
          setStatus(
            game.current.phase === "won"
              ? "You filled the board!"
              : "Game over",
          );
        }
      }
    }
    const current = game.current;
    ctx.clearRect(0, 0, COLUMNS * CELL, ROWS * CELL);
    ctx.strokeStyle = palette.surface;
    for (let x = 0; x <= COLUMNS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(COLUMNS * CELL, y * CELL);
      ctx.stroke();
    }
    ctx.fillStyle = palette.brand;
    for (const p of current.snake)
      ctx.fillRect(p.x * CELL + 2, p.y * CELL + 2, CELL - 4, CELL - 4);
    ctx.fillStyle = palette.ink;
    if (current.food) {
      ctx.beginPath();
      ctx.arc(
        (current.food.x + 0.5) * CELL,
        (current.food.y + 0.5) * CELL,
        6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  });
  function reset() {
    game.current = createSnake();
    pending.current = null;
    clock.current = 0;
    setScore(0);
    setRunning(false);
    setStatus("Ready");
  }
  function toggle() {
    if (game.current?.phase !== "running") {
      game.current = createSnake();
      setScore(0);
    }
    setRunning(!running);
    setStatus(running ? "Paused" : "Playing");
    canvas.current?.focus();
  }
  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.button} onClick={toggle}>
          {running ? "Pause" : "Start game"}
        </button>
        <button type="button" className={styles.button} onClick={reset}>
          Reset game
        </button>
        <span role="status">
          {status} · Score: {score}
        </span>
      </div>
      <canvas
        ref={canvas}
        width={COLUMNS * CELL}
        height={ROWS * CELL}
        className={styles.canvas}
        tabIndex={0}
        aria-label="Snake game. Arrow keys or WASD to steer. Space to pause."
        onKeyDown={(e) => {
          const direction = keys[e.key];
          if (direction) {
            e.preventDefault();
            pending.current ??= direction;
          } else if (e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        Use a Canvas-capable browser to play Snake.
      </canvas>
      <fieldset
        className={styles.controls}
        aria-label="Snake direction controls"
      >
        {(["up", "left", "down", "right"] as const).map((direction) => (
          <button
            type="button"
            key={direction}
            className={styles.button}
            aria-label={`Move ${direction}`}
            onClick={() => {
              pending.current ??= direction;
            }}
          >
            {direction === "up"
              ? "↑"
              : direction === "down"
                ? "↓"
                : direction === "left"
                  ? "←"
                  : "→"}
          </button>
        ))}
      </fieldset>
      <p className={styles.status}>
        Start, then steer with the arrow keys, WASD, or the buttons. Eat the
        round food. Avoid the walls and your own tail. Keys are captured only
        while the board has focus.
      </p>
    </div>
  );
}
