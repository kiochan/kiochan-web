"use client";
import { useEffect, useRef } from "react";
export type Palette = {
  brand: string;
  muted: string;
  surface: string;
  ink: string;
  canvas: string;
};
export function useCanvas(
  draw: (
    context: CanvasRenderingContext2D,
    dt: number,
    palette: Palette,
  ) => void,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const callback = useRef(draw);
  useEffect(() => {
    callback.current = draw;
  }, [draw]);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!context) return;
    let frame = 0;
    let last = 0;
    let palette: Palette;
    const readPalette = () => {
      const css = getComputedStyle(document.documentElement);
      const color = (name: string) =>
        css.getPropertyValue(`--kio-color-${name}`).trim();
      palette = {
        brand: color("brand"),
        muted: color("text-muted"),
        surface: color("surface-muted"),
        ink: color("text"),
        canvas: color("canvas"),
      };
    };
    readPalette();
    const observer = new MutationObserver(readPalette);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const tick = (time: number) => {
      const dt = last ? Math.min((time - last) / 1000, 1 / 30) : 0;
      last = time;
      if (!document.hidden) callback.current(context, dt, palette);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
  return canvas;
}
export function pointerPosition(event: {
  clientX: number;
  clientY: number;
  currentTarget: HTMLCanvasElement;
}) {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * event.currentTarget.width,
    y: ((event.clientY - rect.top) / rect.height) * event.currentTarget.height,
  };
}
