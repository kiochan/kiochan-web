"use client";

import { formatMessage, type Translate } from "@kiochan/lab-ui/localization";
import { type PointerEvent, useEffect, useId, useRef, useState } from "react";
import type { WaterfallLayout } from "./layout";
import styles from "./waterfall.module.css";

type Target = { column: number; before: number | undefined; y: number };
type Drag = {
  id: number;
  index: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
};

function insertionTarget(
  layout: WaterfallLayout,
  column: number,
  y: number,
  index: number,
): Target {
  const tiles = layout.columns[column].tiles.filter(
    (tile) => tile.index !== index,
  );
  const next = tiles.find((tile) => y < tile.y + tile.height / 2);
  const last = tiles.at(-1);
  const edge = last ? last.y + last.height : layout.height / 2;
  return { column, before: next?.index, y: next?.y ?? edge };
}

export function PreviewBoard({
  layout,
  photos,
  transparent,
  paint,
  onMove,
  t,
}: {
  layout: WaterfallLayout;
  photos: readonly { id: number; name: string }[];
  transparent: boolean;
  paint: (canvas: HTMLCanvasElement, scale: number) => void;
  onMove: (index: number, column: number, before: number | undefined) => void;
  t: Translate;
}) {
  const board = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<Drag | null>(null);
  const frame = useRef(0);
  const help = useId();
  const [active, setActive] = useState<number | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const scale = Math.min(1, 1200 / layout.width, 2400 / layout.height);

  useEffect(() => {
    if (canvas.current) paint(canvas.current, scale);
  }, [paint, scale]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function targetAt(x: number, y: number, index: number) {
    const rect = board.current?.getBoundingClientRect();
    const stage = board.current?.parentElement?.getBoundingClientRect();
    if (
      !rect ||
      !stage ||
      x < rect.left ||
      x > rect.right ||
      y < stage.top ||
      y > stage.bottom
    )
      return null;
    const left = ((x - rect.left) / rect.width) * layout.width;
    const top = ((y - rect.top) / rect.height) * layout.height;
    const column = layout.columns.findIndex(
      (item) => left < item.x + item.width,
    );
    return insertionTarget(
      layout,
      column < 0 ? layout.columns.length - 1 : column,
      top,
      index,
    );
  }

  function showTarget(next: Target | null) {
    setTarget((current) =>
      current?.column === next?.column &&
      current?.before === next?.before &&
      current?.y === next?.y
        ? current
        : next,
    );
  }

  function scrollWhileDragging() {
    frame.current = 0;
    const pointer = drag.current;
    const stage = board.current?.parentElement;
    if (!pointer || !stage) return;
    const rect = stage.getBoundingClientRect();
    const edge = 36;
    if (pointer.y < rect.top || pointer.y > rect.bottom) return;
    const speed =
      Math.max(0, pointer.y - (rect.bottom - edge)) -
      Math.max(0, rect.top + edge - pointer.y);
    if (!speed) return;
    const previous = stage.scrollTop;
    stage.scrollTop += Math.sign(speed) * Math.ceil(Math.abs(speed) / 3);
    if (previous === stage.scrollTop) return;
    showTarget(targetAt(pointer.x, pointer.y, pointer.index));
    frame.current = requestAnimationFrame(scrollWhileDragging);
  }

  function start(event: PointerEvent<HTMLButtonElement>, index: number) {
    const element = board.current;
    if (!element || event.button !== 0 || drag.current) return;
    if (
      event.pointerType === "touch" &&
      !(
        event.target instanceof HTMLElement &&
        event.target.hasAttribute("data-grip")
      )
    )
      return;
    drag.current = {
      id: event.pointerId,
      index,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
    element.setPointerCapture(event.pointerId);
  }

  function finish(event: PointerEvent<HTMLDivElement>, apply: boolean) {
    const pointer = drag.current;
    if (pointer?.id !== event.pointerId) return;
    drag.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    setTarget(null);
    setActive(null);
    if (!apply || !pointer.moved) return;
    const next = targetAt(event.clientX, event.clientY, pointer.index);
    if (next) onMove(pointer.index, next.column, next.before);
  }

  const percentX = (value: number) => `${(100 * value) / layout.width}%`;
  const percentY = (value: number) => `${(100 * value) / layout.height}%`;

  return (
    <div
      ref={board}
      className={styles.board}
      data-transparent={transparent || undefined}
      data-moving={active !== null || undefined}
      style={{ width: Math.max(1, Math.round(layout.width * scale)) }}
      onPointerMove={(event) => {
        const pointer = drag.current;
        if (pointer?.id !== event.pointerId) return;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        if (!pointer.moved) {
          if (
            Math.hypot(pointer.x - pointer.startX, pointer.y - pointer.startY) <
            4
          )
            return;
          pointer.moved = true;
          setActive(pointer.index);
        }
        showTarget(targetAt(pointer.x, pointer.y, pointer.index));
        if (!frame.current)
          frame.current = requestAnimationFrame(scrollWhileDragging);
      }}
      onPointerUp={(event) => finish(event, true)}
      onPointerCancel={(event) => finish(event, false)}
      onLostPointerCapture={(event) => finish(event, false)}
    >
      <canvas
        ref={canvas}
        width={Math.max(1, Math.round(layout.width * scale))}
        height={Math.max(1, Math.round(layout.height * scale))}
        aria-label={t("Waterfall collage preview")}
      />
      <span id={help} className={styles.srOnly}>
        {t(
          "Use the arrow keys to reorder this photo or move it to another column.",
        )}
      </span>
      {layout.columns.flatMap(({ tiles }, column) =>
        tiles.map((tile, position) => (
          <button
            type="button"
            key={photos[tile.index].id}
            className={styles.tile}
            data-active={tile.index === active || undefined}
            style={{
              left: percentX(tile.x),
              top: percentY(tile.y),
              width: percentX(tile.width),
              height: percentY(tile.height),
            }}
            aria-label={formatMessage(
              t,
              "{name}, column {column}, position {position}",
              {
                name: photos[tile.index].name,
                column: column + 1,
                position: position + 1,
              },
            )}
            aria-describedby={help}
            onPointerDown={(event) => start(event, tile.index)}
            onKeyDown={(event) => {
              switch (event.key) {
                case "ArrowUp":
                  if (position > 0)
                    onMove(tile.index, column, tiles[position - 1].index);
                  break;
                case "ArrowDown":
                  if (position + 1 < tiles.length)
                    onMove(tile.index, column, tiles[position + 2]?.index);
                  break;
                case "ArrowLeft":
                case "ArrowRight": {
                  const destination =
                    column + (event.key === "ArrowLeft" ? -1 : 1);
                  if (destination >= 0 && destination < layout.columns.length) {
                    const next = insertionTarget(
                      layout,
                      destination,
                      tile.y + tile.height / 2,
                      tile.index,
                    );
                    onMove(tile.index, destination, next.before);
                  }
                  break;
                }
                default:
                  return;
              }
              event.preventDefault();
            }}
          >
            <span className={styles.grip} data-grip="" aria-hidden="true">
              ⠿
            </span>
          </button>
        )),
      )}
      {target && (
        <span
          className={styles.dropIndicator}
          aria-hidden="true"
          style={{
            left: percentX(layout.columns[target.column].x),
            width: percentX(layout.columns[target.column].width),
            top: percentY(target.y),
          }}
        />
      )}
    </div>
  );
}
