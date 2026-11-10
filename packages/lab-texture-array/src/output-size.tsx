import { useId, useState } from "react";
import { Icon } from "./icon";
import type { TextureTranslator } from "./localization";
import styles from "./texture-array.module.css";

export function OutputSize({
  value,
  disabled,
  translate: t,
  onChange,
}: {
  value: number;
  disabled: boolean;
  translate: TextureTranslator;
  onChange: (size: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  function finish() {
    const number = draft?.trim() ? Number(draft) : NaN;
    if (Number.isFinite(number)) {
      const next = Math.max(1, Math.min(4096, Math.round(number)));
      if (next !== value) onChange(next);
    }
    setDraft(null);
  }
  return (
    <fieldset className={styles.outputPanel} disabled={disabled}>
      <legend>
        <Icon name="download" />
        {t("Export size")}
      </legend>
      <div className={styles.outputRow}>
        <label className={styles.field} htmlFor={id}>
          {t("Square side (px)")}
          <input
            id={id}
            type="number"
            min={1}
            max={4096}
            step={1}
            value={draft ?? value}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={finish}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                event.preventDefault();
                setDraft(null);
              }
            }}
          />
        </label>
        <output className={styles.outputSummary} htmlFor={id}>
          {value} × {value}
          <small>{t("Pixels · PSD / PNG ZIP")}</small>
        </output>
      </div>
      <div className={styles.sizePresets}>
        {[256, 512, 1024, 2048, 4096].map((size) => (
          <button
            type="button"
            key={size}
            aria-pressed={value === size}
            onClick={() => {
              setDraft(null);
              if (value !== size) onChange(size);
            }}
          >
            {size}
          </button>
        ))}
      </div>
      <p className={styles.hint}>
        {t(
          "Choose any whole-number side from 1 to 4096 px. Width and height stay equal.",
        )}
      </p>
    </fieldset>
  );
}
