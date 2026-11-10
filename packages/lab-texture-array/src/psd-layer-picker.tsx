import { useEffect, useId, useRef, useState } from "react";
import type { TextureTranslator } from "./localization";
import type { PsdLayerChoice } from "./psd-import";
import styles from "./texture-array.module.css";

export function PsdLayerPicker({
  layers,
  limit,
  busy,
  error,
  translate: t,
  onImport,
  onCancel,
}: {
  layers: PsdLayerChoice[];
  limit: number;
  busy: boolean;
  error: string;
  translate: TextureTranslator;
  onImport: (ids: number[]) => void;
  onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [selected, setSelected] = useState<number[]>([]);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.psdDialog}
      aria-labelledby={title}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id={title}>{t("Choose PSD layers")}</h2>
      {busy && (
        <p className={styles.hint} role="status">
          {t("Processing local files…")}
        </p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {t(error)}
        </p>
      )}
      <p className={styles.hint}>
        {t(
          "Selected layers become independent images. PSD group compositing, masks, effects, blend modes, and document positions are not reproduced.",
        )}
      </p>
      <p className={styles.hint}>
        {t(
          "Hidden layers can also be selected. Imported layers start visible.",
        )}
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            setSelected(
              layers
                .filter((layer) => layer.available)
                .slice(0, limit)
                .map((layer) => layer.id),
            )
          }
        >
          {t("Select available")}
        </button>
        <button type="button" disabled={busy} onClick={() => setSelected([])}>
          {t("Clear selection")}
        </button>
        <span>
          {selected.length} / {limit}
        </span>
      </div>
      <div className={styles.psdChoices}>
        {layers.map((layer) => (
          <label key={layer.id} className={styles.psdChoice}>
            <input
              type="checkbox"
              checked={selected.includes(layer.id)}
              disabled={
                busy ||
                !layer.available ||
                (!selected.includes(layer.id) && selected.length >= limit)
              }
              onChange={(event) =>
                setSelected((ids) =>
                  event.target.checked
                    ? [...ids, layer.id]
                    : ids.filter((id) => id !== layer.id),
                )
              }
            />
            <span>
              <strong>{layer.path}</strong>
              <small>
                {layer.width} × {layer.height}
                {layer.hidden ? ` · ${t("Hidden")}` : ""}
                {!layer.available ? ` · ${t("No importable pixels")}` : ""}
              </small>
            </span>
          </label>
        ))}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          disabled={busy || !selected.length}
          onClick={() => onImport(selected)}
        >
          {t("Import selected layers")}
        </button>
        <button type="button" onClick={onCancel}>
          {t("Cancel PSD import")}
        </button>
      </div>
    </dialog>
  );
}
