"use client";
import {
  defaultTranslate,
  formatMessage,
  type Translate,
} from "@kiochan/lab-ui/localization";
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

const colorLabels = ["Base color", "Stripe color", "Line color"];
const harmonyLabels = {
  analogous: "Analogous",
  complementary: "Complementary",
  triadic: "Triadic",
  monochrome: "Monochrome",
} satisfies Record<Harmony, string>;

export function LatticeGenerator({
  t = defaultTranslate,
}: {
  t?: Translate;
} = {}) {
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
          {formatMessage(t, "Repeat: {size}px", { size: repeat })}
          <input
            type="range"
            min={24}
            max={160}
            value={repeat}
            onChange={(e) => setRepeat(Number(e.target.value))}
          />
        </label>
        <label className={styles.field}>
          {formatMessage(t, "Stripe: {size}px", { size: band })}
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
          {t("Cross stripes")}
        </label>
        {colors?.map((color, i) => (
          <label className={styles.field} key={colorLabels[i]}>
            {t(colorLabels[i])}
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
          {t("Color harmony")}
          <select
            value={harmony}
            onChange={(e) => setHarmony(e.target.value as Harmony)}
          >
            {HARMONIES.map((item) => (
              <option value={item} key={item}>
                {t(harmonyLabels[item])}
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
          {t("Auto palette")}
        </button>
      </div>
      <div className={styles.toolbar}>
        <label className={styles.field}>
          {t("Square tile")}
          <select
            value={tiles}
            onChange={(e) => setTiles(Number(e.target.value))}
          >
            {[1, 4, 8, 16].map((count) => (
              <option value={count} key={count}>
                {formatMessage(
                  t,
                  "{count} × {count} repeats · {size} × {size}px",
                  {
                    count,
                    size: repeat * count,
                  },
                )}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          {t("Preview / export layer")}
          <select
            value={layer}
            onChange={(e) => setLayer(e.target.value as PatternLayer | "all")}
          >
            <option value="all">{t("All layers")}</option>
            {PATTERN_LAYERS.map(({ id, label }) => (
              <option
                value={id}
                key={id}
                disabled={id === "horizontal" && !cross}
              >
                {t(label)}
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
          {t("Preview 3 × 3 tiles")}
        </label>
      </div>
      <div className={styles.body}>
        {svg ? (
          <div className={local.artboard}>
            <div
              className={local.artwork}
              role="img"
              aria-label={formatMessage(t, "{view} preview: {layer}", {
                view: t(
                  repeated ? "Three by three seamless repeat" : "Square tile",
                ),
                layer: t(
                  PATTERN_LAYERS.find((item) => item.id === layer)?.label ??
                    "all layers",
                ),
              })}
              style={{
                backgroundImage: `url("${imageUrl}")`,
                backgroundSize: repeated
                  ? "33.333333% 33.333333%"
                  : "100% 100%",
              }}
            />
          </div>
        ) : (
          <p>{t("Preparing your pattern…")}</p>
        )}
      </div>
      <p className={styles.status}>
        {formatMessage(
          t,
          "{size} × {size}px seamless square. The 3 × 3 preview repeats this tile. Each download contains a single square. Select an individual layer to download it separately. Stripe and fine-line PNGs have transparent backgrounds. All-layer SVGs retain named, editable layers.",
          { size: extent },
        )}
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
          {t(layer === "all" ? "Download layered SVG" : "Download layer SVG")}
        </button>
        <button
          type="button"
          disabled={!svg || exporting}
          className={styles.button}
          onClick={exportPng}
        >
          {t(
            exporting
              ? "Exporting PNG…"
              : layer === "all"
                ? "Download square PNG"
                : "Download layer PNG",
          )}
        </button>
      </div>
      {error && (
        <p role="alert" className={styles.status}>
          {t(error)}
        </p>
      )}
      <p className={styles.status}>
        {t(
          "An SVG implementation inspired by Lattice-Generator, with original design by MoonMoonCha and upstream work by Torrekie.",
        )}{" "}
        <a href="https://github.com/kiochan/lattice-generator">
          {t("Original project")}
        </a>{" "}
        ·{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/">
          {t("CC BY 4.0 attribution")}
        </a>
        {". "}
        {t("No images leave your browser.")}
      </p>
    </div>
  );
}
