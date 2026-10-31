"use client";
import { useEffect, useRef, useState } from "react";
export type ViewTransform = { zoom: number; panX: number; panY: number };
export type CubismSession = {
  render: (deltaSeconds: number, view: ViewTransform) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};
export type CubismAdapter = (options: {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  signal: AbortSignal;
}) => Promise<CubismSession>;
export type Live2DViewerProps = {
  modelUrl?: string;
  adapter?: CubismAdapter;
  view?: ViewTransform;
};
const defaultView: ViewTransform = { zoom: 1, panX: 0, panY: 0 };

// SDK ownership stays with the host. No script, model, or CDN is loaded implicitly.
export function Live2DViewer({
  modelUrl,
  adapter,
  view = defaultView,
}: Live2DViewerProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const transform = useRef(view);
  const [status, setStatus] = useState("No authorized renderer connected.");
  useEffect(() => {
    transform.current = view;
  }, [view]);
  useEffect(() => {
    const element = canvas.current;
    if (!element || !adapter || !modelUrl) {
      setStatus("No authorized renderer connected.");
      return;
    }
    const controller = new AbortController();
    let session: CubismSession | undefined,
      frame = 0,
      last = 0,
      observer: ResizeObserver | undefined;
    setStatus("Loading model…");
    void adapter({ canvas: element, modelUrl, signal: controller.signal })
      .then((loaded) => {
        if (controller.signal.aborted) {
          loaded.dispose();
          return;
        }
        session = loaded;
        const resize = () => {
          const rect = element.getBoundingClientRect(),
            dpr = Math.min(devicePixelRatio || 1, 2);
          element.width = Math.max(1, Math.round(rect.width * dpr));
          element.height = Math.max(1, Math.round(rect.height * dpr));
          loaded.resize(element.width, element.height);
        };
        resize();
        observer = new ResizeObserver(resize);
        observer.observe(element);
        setStatus("Model ready.");
        const tick = (time: number) => {
          try {
            if (!document.hidden)
              loaded.render(
                last ? Math.min((time - last) / 1000, 0.05) : 0,
                transform.current,
              );
            last = time;
            frame = requestAnimationFrame(tick);
          } catch {
            observer?.disconnect();
            loaded.dispose();
            session = undefined;
            setStatus(
              "The renderer stopped. Reconnect an authorized renderer to retry.",
            );
          }
        };
        frame = requestAnimationFrame(tick);
      })
      .catch(() => {
        observer?.disconnect();
        session?.dispose();
        session = undefined;
        if (!controller.signal.aborted)
          setStatus(
            "Could not load this model. Check the renderer and authorized asset paths.",
          );
      });
    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
      observer?.disconnect();
      session?.dispose();
    };
  }, [adapter, modelUrl]);
  return (
    <div>
      <canvas
        ref={canvas}
        width={720}
        height={440}
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "18 / 11",
          display: "block",
          background: "var(--kio-color-surface-muted)",
        }}
        aria-label="Live2D viewer canvas"
      />
      <p
        role="status"
        style={{
          padding: "1rem",
          fontSize: ".875rem",
          color: "var(--kio-color-text-muted)",
        }}
      >
        {status}
      </p>
    </div>
  );
}
