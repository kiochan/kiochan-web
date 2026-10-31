"use client";
import { pointerPosition, useCanvas } from "@kiochan/lab-ui";
import styles from "@kiochan/lab-ui/styles.module.css";
import { useRef, useState } from "react";
import { HEIGHT, LIMIT, type Particle, pour, stepFluid, WIDTH } from "./fluid";

export function LiquidPlayground() {
  const particles = useRef<Particle[]>([]);
  const clock = useRef(0);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [gravity, setGravity] = useState(6);
  const canvas = useCanvas((ctx, dt, palette) => {
    if (running) {
      clock.current += dt;
      while (clock.current >= 1 / 60) {
        stepFluid(particles.current, gravity);
        clock.current -= 1 / 60;
      }
    }
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = palette.brand;
    ctx.beginPath();
    for (const p of particles.current) {
      ctx.moveTo(p.x + 4.5, p.y);
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
    }
    ctx.fill();
  });
  const add = (x = WIDTH / 2, y = 100) => {
    pour(particles.current, x, y);
    setCount(particles.current.length);
  };
  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            if (!count) add();
            setRunning(!running);
          }}
        >
          {running ? "Pause" : "Start simulation"}
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={count >= LIMIT}
          onClick={() => add()}
        >
          Add water
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            particles.current = [];
            clock.current = 0;
            setCount(0);
            setRunning(false);
          }}
        >
          Clear
        </button>
        <label className={styles.field}>
          Gravity: {gravity}
          <input
            type="range"
            min={-10}
            max={10}
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
          />
        </label>
      </div>
      <canvas
        ref={canvas}
        width={WIDTH}
        height={HEIGHT}
        className={`${styles.canvas} ${styles.interactive}`}
        aria-label="Particle fluid simulation. Use Add water or tap the canvas to pour."
        onPointerDown={(e) => {
          const p = pointerPosition(e);
          add(p.x, p.y);
        }}
      >
        Your browser needs Canvas support to show this experiment.
      </canvas>
      <p className={styles.status} aria-live="polite">
        {count} / {LIMIT} particles · {running ? "Running" : "Paused"}. Tap the
        canvas to pour. This lightweight particle approximation explores
        fluid-like behavior; it is not an engineering solver.
      </p>
    </div>
  );
}
