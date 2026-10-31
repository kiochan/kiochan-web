"use client";
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

export function CubismWorkbench() {
  const [summary, setSummary] = useState<ModelSummary | null>(null);
  const [error, setError] = useState("");
  const request = useRef(0);
  return (
    <div className={styles.panel}>
      <div className={styles.body}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 500 }}>
          Bring your own model manifest
        </h2>
        <p
          style={{
            margin: "1rem 0",
            lineHeight: 1.8,
            color: "var(--kio-color-text-muted)",
          }}
        >
          Inspect a local .model3.json file. This reads reference names only; it
          does not upload files, fetch textures, execute scripts, or render a
          model.
        </p>
        <label className={styles.field}>
          Model manifest
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
                const result = inspectManifest(await file.text());
                if (currentRequest === request.current) setSummary(result);
              } catch (err) {
                if (currentRequest === request.current)
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Could not read the manifest.",
                  );
              }
            }}
          />
        </label>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {summary && (
          <div style={{ marginTop: "1.5rem", overflowWrap: "anywhere" }}>
            <h3>Manifest references</h3>
            <dl>
              <dt>Model</dt>
              <dd>{summary.moc}</dd>
              <dt>Textures</dt>
              <dd>{summary.textures.length}</dd>
              <dt>Motions</dt>
              <dd>{summary.motions}</dd>
              <dt>Expressions</dt>
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
        Viewer integration is available in the package. Actual rendering
        requires an authorized Cubism runtime adapter and model assets. This
        website includes neither SDK binaries nor third-party models.
      </p>
    </div>
  );
}
