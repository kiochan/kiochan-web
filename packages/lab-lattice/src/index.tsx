"use client";
import styles from "@kiochan/lab-ui/styles.module.css";
import { useEffect, useState } from "react";
import { generatePalette, HARMONIES, type Harmony } from "./palette";
import {
  PATTERN_LAYERS,
  type PatternLayer,
  patternGeometry,
  patternSvg,
} from "./pattern";
import local from "./styles.module.css";

export function LatticeGenerator() {
  const [repeat, setRepeat] = useState(72);
  const [stripe, setStripe] = useState(18);
  const [cross, setCross] = useState(true);
  const [colors, setColors] = useState<[string, string, string] | null>(null);
  const [harmony, setHarmony] = useState<Harmony>("analogous");
  const [tiles, setTiles] = useState(8);
  const [layer, setLayer] = useState<PatternLayer | "all">("all");
  const [repeated, setRepeated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    setColors([
      css.getPropertyValue("--kio-pattern-base").trim(),
      css.getPropertyValue("--kio-pattern-stripe").trim(),
      css.getPropertyValue("--kio-pattern-line").trim(),
    ]);
  }, []);
  const { extent, band } = patternGeometry(repeat, stripe, tiles);
  const svg = colors
    ? patternSvg({ repeat, stripe, cross, colors }, { tiles, layer })
    : "";
  const imageUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const filename = `kiochan-lattice-${layer}-${extent}x${extent}`;

  function download(content: Blob, name: string) {
    const url = URL.createObjectURL(content);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function exportPng() {
    setExporting(true);
    setError("");
    try {
      const image = new Image();
      image.src = imageUrl;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = extent;
      canvas.height = extent;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas export is unavailable.");
      context.drawImage(image, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Could not create the PNG.");
      download(blob, `${filename}.png`);
    } catch {
      setError("PNG export failed. Try downloading the SVG instead.");
    } finally {
      setExporting(false);
    }
  }
  function autoPalette() {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    setColors(generatePalette(seed, harmony));
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
          Stripe: {band}px
          <input
            type="range"
            min={2}
            max={Math.min(36, repeat / 2)}
            value={band}
            onChange={(e) => setStripe(Number(e.target.value))}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={cross}
            onChange={(e) => {
              setCross(e.target.checked);
              if (!e.target.checked && layer === "horizontal") setLayer("all");
            }}
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
        <label className={styles.field}>
          Color harmony
          <select
            value={harmony}
            onChange={(e) => setHarmony(e.target.value as Harmony)}
          >
            {HARMONIES.map((item) => (
              <option value={item} key={item}>
                {item[0].toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={styles.button}
          onClick={autoPalette}
          disabled={!colors}
        >
          Auto palette
        </button>
      </div>
      <div className={styles.toolbar}>
        <label className={styles.field}>
          Square tile
          <select
            value={tiles}
            onChange={(e) => setTiles(Number(e.target.value))}
          >
            {[1, 4, 8, 16].map((count) => (
              <option value={count} key={count}>
                {count} × {count} repeats · {repeat * count} × {repeat * count}
                px
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Preview / export layer
          <select
            value={layer}
            onChange={(e) => setLayer(e.target.value as PatternLayer | "all")}
          >
            <option value="all">All layers</option>
            {PATTERN_LAYERS.map(({ id, label }) => (
              <option
                value={id}
                key={id}
                disabled={id === "horizontal" && !cross}
              >
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={repeated}
            onChange={(e) => setRepeated(e.target.checked)}
          />{" "}
          Preview 3 × 3 tiles
        </label>
      </div>
      <div className={styles.body}>
        {svg ? (
          <div className={local.artboard}>
            <div
              className={local.artwork}
              role="img"
              aria-label={`${repeated ? "Three by three seamless repeat" : "Square tile"} preview: ${layer === "all" ? "all layers" : PATTERN_LAYERS.find((item) => item.id === layer)?.label}`}
              style={{
                backgroundImage: `url("${imageUrl}")`,
                backgroundSize: repeated
                  ? "33.333333% 33.333333%"
                  : "100% 100%",
              }}
            />
          </div>
        ) : (
          <p>Preparing your pattern…</p>
        )}
      </div>
      <p className={styles.status}>
        {extent} × {extent}px seamless square. The 3 × 3 preview repeats this
        tile; downloads always contain one square. Select an individual layer to
        download it separately. Stripe and fine-line PNGs have transparent
        backgrounds. All-layer SVGs retain named, editable layers.
      </p>
      <div className={styles.controls}>
        <button
          type="button"
          disabled={!svg || exporting}
          className={styles.button}
          onClick={() =>
            download(
              new Blob([svg], { type: "image/svg+xml" }),
              `${filename}.svg`,
            )
          }
        >
          {layer === "all" ? "Download layered SVG" : "Download layer SVG"}
        </button>
        <button
          type="button"
          disabled={!svg || exporting}
          className={styles.button}
          onClick={exportPng}
        >
          {exporting
            ? "Exporting PNG…"
            : layer === "all"
              ? "Download square PNG"
              : "Download layer PNG"}
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
