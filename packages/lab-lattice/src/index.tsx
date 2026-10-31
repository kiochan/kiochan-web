"use client";
import styles from "@kiochan/lab-ui/styles.module.css";
import { useEffect, useState } from "react";
import { patternSvg } from "./pattern";

export function LatticeGenerator() {
  const [repeat, setRepeat] = useState(72);
  const [stripe, setStripe] = useState(18);
  const [cross, setCross] = useState(true);
  const [colors, setColors] = useState<[string, string, string] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    setColors([
      css.getPropertyValue("--kio-pattern-base").trim(),
      css.getPropertyValue("--kio-pattern-stripe").trim(),
      css.getPropertyValue("--kio-pattern-line").trim(),
    ]);
  }, []);
  const svg = colors ? patternSvg({ repeat, stripe, cross, colors }) : "";
  function download(content: Blob, filename: string) {
    const url = URL.createObjectURL(content);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function exportPng() {
    try {
      setError("");
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 440;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas export is unavailable.");
      context.drawImage(image, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Could not create the PNG.");
      download(blob, "kiochan-lattice.png");
    } catch {
      setError("PNG export failed. Try downloading the SVG instead.");
    }
  }
  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <label className={styles.field}>
          Repeat: {repeat}px
          <input
            type="range"
            min={24}
            max={160}
            value={repeat}
            onChange={(e) => setRepeat(Number(e.target.value))}
          />
        </label>
        <label className={styles.field}>
          Stripe: {stripe}px
          <input
            type="range"
            min={2}
            max={36}
            value={stripe}
            onChange={(e) => setStripe(Number(e.target.value))}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={cross}
            onChange={(e) => setCross(e.target.checked)}
          />{" "}
          Cross stripes
        </label>
        {colors?.map((color, i) => (
          <label className={styles.field} key={["base", "stripe", "line"][i]}>
            {["Base color", "Stripe color", "Line color"][i]}
            <input
              type="color"
              value={color}
              onChange={(e) =>
                setColors((current) =>
                  current
                    ? (current.map((c, index) =>
                        index === i ? e.target.value : c,
                      ) as [string, string, string])
                    : null,
                )
              }
            />
          </label>
        ))}
      </div>
      <div className={styles.body}>
        {svg ? (
          <img
            className={styles.preview}
            width={720}
            height={440}
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
            alt="Live preview of your repeating plaid pattern"
          />
        ) : (
          <p>Preparing your pattern…</p>
        )}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          disabled={!svg}
          className={styles.button}
          onClick={() =>
            download(
              new Blob([svg], { type: "image/svg+xml" }),
              "kiochan-lattice.svg",
            )
          }
        >
          Download SVG
        </button>
        <button
          type="button"
          disabled={!svg}
          className={styles.button}
          onClick={exportPng}
        >
          Download PNG
        </button>
      </div>
      {error && (
        <p role="alert" className={styles.status}>
          {error}
        </p>
      )}
      <p className={styles.status}>
        A fresh SVG implementation inspired by Lattice-Generator. Original
        design by MoonMoonCha; upstream work by Torrekie.{" "}
        <a href="https://github.com/kiochan/lattice-generator">
          Original project
        </a>{" "}
        ·{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/">
          CC BY 4.0 attribution
        </a>
        . No images leave your browser.
      </p>
    </div>
  );
}
