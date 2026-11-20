"use client";

import {
  defaultTranslate,
  formatMessage,
  type Translate,
} from "@kiochan/lab-ui/localization";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./image-palette.module.css";
import { extractPalettes, type Palette } from "./palettes";

type Result =
  | { file: File; url: string; palettes: Palette[] }
  | { file: File; error: string };

async function readPalettes(url: string) {
  const image = new Image();
  image.src = url;
  await image.decode();

  const canvas = document.createElement("canvas");
  const scale = Math.min(
    1,
    180 / Math.max(image.naturalWidth, image.naturalHeight),
  );
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return extractPalettes(
    context.getImageData(0, 0, canvas.width, canvas.height).data,
  );
}

function PaletteResults({
  palettes,
  t,
}: {
  palettes: Palette[];
  t: Translate;
}) {
  const [clipboard, setClipboard] = useState<
    { id: string; text: string } | "unavailable" | null
  >(null);
  const copied = clipboard && clipboard !== "unavailable" ? clipboard.id : "";
  const copyRequest = useRef(0);
  const heading = useId();

  async function copy(id: string, text: string) {
    const request = ++copyRequest.current;
    try {
      await navigator.clipboard.writeText(text);
      if (request !== copyRequest.current) return;
      setClipboard({ id, text });
    } catch {
      if (request !== copyRequest.current) return;
      setClipboard("unavailable");
    }
  }

  return (
    <section className={styles.results} aria-labelledby={heading}>
      <h2 id={heading}>{t("Extracted palettes")}</h2>
      {palettes.map(({ name, colors }) => (
        <div className={styles.palette} key={name}>
          <div className={styles.paletteHeader}>
            <h3>{t(name)}</h3>
            <button
              type="button"
              className={styles.copyPalette}
              aria-label={formatMessage(t, "Copy palette · {name}", {
                name: t(name),
              })}
              onClick={() => void copy(name, colors.join(", "))}
            >
              {t(copied === name ? "Copied" : "Copy palette")}
            </button>
          </div>
          <ul className={styles.swatches}>
            {colors.map((color) => {
              const id = `${name} ${color}`;
              return (
                <li key={color}>
                  <button
                    className={styles.swatch}
                    type="button"
                    aria-label={formatMessage(t, "Copy color {color}", {
                      color,
                    })}
                    onClick={() => void copy(id, color)}
                  >
                    <span
                      className={styles.chip}
                      style={{ backgroundColor: color }}
                    />
                    <code>{copied === id ? t("Copied") : color}</code>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <p className={styles.status} role="status">
        {clipboard === "unavailable"
          ? t("Clipboard unavailable. Select a HEX code to copy it manually.")
          : clipboard &&
            formatMessage(t, "Copied to clipboard · {colors}", {
              colors: clipboard.text,
            })}
      </p>
    </section>
  );
}

export function ImagePalette({ t = defaultTranslate }: { t?: Translate } = {}) {
  const input = useRef<HTMLInputElement>(null);
  const instructions = useId();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const current = result?.file === file ? result : null;
  const preview = current && "url" in current ? current : null;

  useEffect(() => {
    function paste(event: ClipboardEvent) {
      const image = Array.from(event.clipboardData?.files ?? []).find(
        ({ type }) => type.startsWith("image/"),
      );
      if (!image || event.defaultPrevented) return;
      event.preventDefault();
      setFile(image);
    }
    window.addEventListener("paste", paste);
    return () => window.removeEventListener("paste", paste);
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    let active = true;
    void readPalettes(url).then(
      (palettes) => {
        if (active) setResult({ file, url, palettes });
      },
      () => {
        if (active)
          setResult({
            file,
            error: "This image could not be opened. Try a PNG, JPEG, or WebP.",
          });
      },
    );
    return () => {
      active = false;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div
      className={styles.workspace}
      data-has-results={Boolean(preview?.palettes.length)}
    >
      <section
        className={styles.source}
        aria-label={t("Source image")}
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          if (!event.dataTransfer.files.length) return;
          event.preventDefault();
          setFile(event.dataTransfer.files[0]);
        }}
      >
        {preview && (
          <figure className={styles.figure}>
            <img
              className={styles.image}
              src={preview.url}
              alt={t("Source image")}
            />
            <figcaption>{preview.file.name}</figcaption>
          </figure>
        )}
        <div className={styles.import}>
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const selected = event.currentTarget.files?.[0];
              if (selected) setFile(selected);
              event.currentTarget.value = "";
            }}
          />
          <button
            className={styles.choose}
            type="button"
            aria-describedby={instructions}
            onClick={() => input.current?.click()}
          >
            {t(preview ? "Replace image" : "Choose an image")}
          </button>
          <p id={instructions}>
            {t("Drop or paste one image. It stays in your browser.")}
          </p>
          {file && !current && <p role="status">{t("Extracting colors…")}</p>}
          {current && "error" in current && (
            <p role="alert">{t(current.error)}</p>
          )}
          {preview?.palettes.length === 0 && (
            <p role="status">{t("This image has no visible colors.")}</p>
          )}
        </div>
      </section>
      {preview && preview.palettes.length > 0 && (
        <PaletteResults key={preview.url} palettes={preview.palettes} t={t} />
      )}
    </div>
  );
}
