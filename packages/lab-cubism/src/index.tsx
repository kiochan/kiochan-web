"use client";
import { defaultTranslate, type Translate } from "@kiochan/lab-ui/localization";
import styles from "@kiochan/lab-ui/styles.module.css";
import { useRef, useState } from "react";
import { inspectManifest, type ModelSummary } from "./manifest";

export type { CubismBindings } from "./adapter";
export { createCubismAdapter } from "./adapter";
export type {
  CubismAdapter,
  CubismSession,
  Live2DViewerProps,
  ViewTransform,
} from "./viewer";
export { Live2DViewer } from "./viewer";

export function CubismWorkbench({
  t = defaultTranslate,
}: {
  t?: Translate;
} = {}) {
  const [summary, setSummary] = useState<ModelSummary | null>(null);
  const [error, setError] = useState("");
  const request = useRef(0);
  return (
    <div className={styles.panel}>
      <div className={styles.body}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 500 }}>
          {t("Bring your own model manifest")}
        </h2>
        <p
          style={{
            margin: "1rem 0",
            lineHeight: 1.8,
            color: "var(--kio-color-text-muted)",
          }}
        >
          {t(
            "Inspect the reference names in a local .model3.json file. Inspection takes place entirely in your browser.",
          )}
        </p>
        <label className={styles.field}>
          {t("Model manifest")}
          <input
            type="file"
            accept=".model3.json,.json,application/json"
            onChange={async (e) => {
              const file = e.currentTarget.files?.[0];
              const currentRequest = ++request.current;
              setSummary(null);
              setError("");
              if (!file) return;
              try {
                if (file.size > 1024 * 1024)
                  throw new Error("Choose a manifest smaller than 1 MB.");
                const text = await file.text().catch(() => {
                  throw new Error("Could not read the manifest.");
                });
                const result = inspectManifest(text);
                if (currentRequest === request.current) setSummary(result);
              } catch (err) {
                if (currentRequest === request.current)
                  setError(
                    err instanceof SyntaxError
                      ? "The manifest is not valid JSON."
                      : err instanceof Error
                        ? err.message
                        : "Could not read the manifest.",
                  );
              }
            }}
          />
        </label>
        {error && (
          <p role="alert" className={styles.error}>
            {t(error)}
          </p>
        )}
        {summary && (
          <div style={{ marginTop: "1.5rem", overflowWrap: "anywhere" }}>
            <h3>{t("Manifest references")}</h3>
            <dl>
              <dt>{t("Model")}</dt>
              <dd>{summary.moc}</dd>
              <dt>{t("Textures")}</dt>
              <dd>{summary.textures.length}</dd>
              <dt>{t("Motions")}</dt>
              <dd>{summary.motions}</dd>
              <dt>{t("Expressions")}</dt>
              <dd>{summary.expressions}</dd>
            </dl>
            <ul>
              {[...new Set(summary.textures)].map((texture) => (
                <li key={texture}>{texture}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className={styles.status}>
        {t(
          "The package includes viewer integration. Model rendering requires an authorized Cubism runtime adapter and your own authorized model assets.",
        )}
      </p>
    </div>
  );
}
