import { useState } from "react";
import styles from "./texture-array.module.css";

export function NumberField({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  function finish() {
    if (draft !== null && draft.trim() !== "") {
      const number = Number(draft);
      if (Number.isFinite(number)) {
        const next = Math.max(
          min,
          Math.min(max, step === 1 ? Math.round(number) : number),
        );
        if (next !== value) onChange(next);
      }
    }
    setDraft(null);
  }
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
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
      <input
        className={styles.slider}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          setDraft(null);
          const next = event.target.valueAsNumber;
          if (next !== value) onChange(next);
        }}
      />
    </div>
  );
}
