"use client";
import { pointerPosition, useCanvas } from "@kiochan/lab-ui";
import styles from "@kiochan/lab-ui/styles.module.css";
import { useRef, useState } from "react";
import {
  type BreakoutGame,
  createBreakout,
  HEIGHT,
  movePaddle,
  PADDLE,
  RADIUS,
  stepBreakout,
  WIDTH,
} from "./engine";

function phaseLabel(phase: BreakoutGame["phase"]) {
  return phase === "won"
    ? "You cleared the board!"
    : phase === "lost"
      ? "Game over"
      : "Playing";
}
export function Breakout() {
  const game = useRef<BreakoutGame | null>(null);
  const held = useRef(0),
    clock = useRef(0);
  const [running, setRunning] = useState(false);
  const [hud, setHud] = useState({ score: 0, lives: 3, status: "Ready" });
  const canvas = useCanvas((ctx, dt, palette) => {
    if (!game.current) game.current = createBreakout();
    const state = game.current;
    if (running && state.phase === "running") {
      movePaddle(state, state.paddle + held.current * 420 * dt);
      clock.current += dt;
      while (clock.current >= 1 / 120) {
        stepBreakout(state, 1 / 120);
        clock.current -= 1 / 120;
      }
      if (
        state.score !== hud.score ||
        state.lives !== hud.lives ||
        state.phase !== "running"
      ) {
        setHud({
          score: state.score,
          lives: state.lives,
          status: phaseLabel(state.phase),
        });
        if (state.phase !== "running") setRunning(false);
      }
    }
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = palette.brand;
    for (const brick of state.bricks)
      if (brick.active) ctx.fillRect(brick.x, brick.y, 85, 20);
    ctx.fillStyle = palette.ink;
    ctx.fillRect(state.paddle - PADDLE / 2, HEIGHT - 30, PADDLE, 10);
    ctx.beginPath();
    ctx.arc(state.x, state.y, RADIUS, 0, Math.PI * 2);
    ctx.fill();
  });
  function reset() {
    game.current = createBreakout();
    clock.current = 0;
    held.current = 0;
    setRunning(false);
    setHud({ score: 0, lives: 3, status: "Ready" });
  }
  function toggle() {
    if (game.current?.phase !== "running") {
      game.current = createBreakout();
      setHud({ score: 0, lives: 3, status: "Playing" });
    } else
      setHud((current) => ({
        ...current,
        status: running ? "Paused" : "Playing",
      }));
    held.current = 0;
    setRunning(!running);
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
          {hud.status} · Score: {hud.score} · Lives: {hud.lives}
        </span>
      </div>
      <canvas
        ref={canvas}
        width={WIDTH}
        height={HEIGHT}
        className={`${styles.canvas} ${styles.interactive}`}
        tabIndex={0}
        aria-label="Breakout game. Left and right arrows move the paddle. Space pauses."
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            held.current = e.key === "ArrowLeft" ? -1 : 1;
          } else if (e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            held.current = 0;
          }
        }}
        onBlur={() => {
          held.current = 0;
        }}
        onPointerMove={(e) => {
          if (game.current) movePaddle(game.current, pointerPosition(e).x);
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          if (game.current) movePaddle(game.current, pointerPosition(e).x);
        }}
      >
        Use a Canvas-capable browser to play Breakout.
      </canvas>
      <p className={styles.status}>
        Start, then move the paddle with your pointer, a finger, or the left and
        right arrow keys. Clear all 28 bricks before losing three balls. Space
        pauses while the board has focus.
      </p>
    </div>
  );
}
