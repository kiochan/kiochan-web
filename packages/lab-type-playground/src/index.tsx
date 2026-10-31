"use client";

import { useId, useState } from "react";
import styles from "./playground.module.css";

const initialText = "Small ideas deserve a place to play.";
const fonts = {
  sans: "Arial, Helvetica, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
};

export function TypePlayground() {
  const id = useId();
  const [text, setText] = useState(initialText);
  const [family, setFamily] = useState<keyof typeof fonts>("serif");
  const [size, setSize] = useState(48);
  const [leading, setLeading] = useState(1.3);

  function reset() {
    setText(initialText);
    setFamily("serif");
    setSize(48);
    setLeading(1.3);
  }

  return (
    <div className={styles.playground}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor={`${id}-text`}>Your text</label>
          <textarea
            id={`${id}-text`}
            value={text}
            maxLength={500}
            rows={3}
            onChange={(event) => setText(event.target.value)}
          />
          <span className={styles.hint}>
            Up to 500 characters. Everything stays in this page.
          </span>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-family`}>Typeface</label>
          <select
            id={`${id}-family`}
            value={family}
            onChange={(event) =>
              setFamily(event.target.value as keyof typeof fonts)
            }
          >
            <option value="sans">Sans serif</option>
            <option value="serif">Serif</option>
            <option value="mono">Monospace</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-size`}>
            Font size <output htmlFor={`${id}-size`}>{size} px</output>
          </label>
          <input
            id={`${id}-size`}
            type="range"
            min={16}
            max={72}
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-leading`}>
            Line height{" "}
            <output htmlFor={`${id}-leading`}>{leading.toFixed(1)}</output>
          </label>
          <input
            id={`${id}-leading`}
            type="range"
            min={1}
            max={2}
            step={0.1}
            value={leading}
            onChange={(event) => setLeading(Number(event.target.value))}
          />
        </div>
        <button type="button" onClick={reset} className={styles.reset}>
          Reset playground
        </button>
      </div>
      <section aria-label="Typography preview" className={styles.preview}>
        <p className={styles.caption}>The preview</p>
        {text ? (
          <p
            className={styles.sample}
            style={{
              fontFamily: fonts[family],
              fontSize: size,
              lineHeight: leading,
            }}
          >
            {text}
          </p>
        ) : (
          <p className={styles.empty}>Add some text to see it here.</p>
        )}
        <p className={styles.caption}>Aa / Bb / Cc / 0123456789</p>
      </section>
    </div>
  );
}
