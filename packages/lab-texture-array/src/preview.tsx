import styles from "@kiochan/lab-ui/preview.module.css";
import { useId } from "react";

export function TextureArrayPreview() {
  const id = useId();
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 360 200"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M12 3 21 12 12 21 3 12Z M36 27 45 36 36 45 27 36Z"
            fill="var(--kio-color-brand)"
            opacity=".8"
          />
          <circle cx="36" cy="12" r="4" fill="var(--kio-color-accent)" />
          <circle cx="12" cy="36" r="4" fill="var(--kio-color-accent)" />
        </pattern>
      </defs>
      <rect width="360" height="200" className={styles.base} />
      <g className={`${styles.weave} ${styles.motion}`}>
        <rect x="82" y="16" width="156" height="156" fill={`url(#${id})`} />
        <path
          d="M82 68h156M82 120h156M134 16v156M186 16v156"
          stroke="var(--kio-color-brand)"
          opacity=".25"
        />
      </g>
      <text x="28" y="190" className={styles.label}>
        IMAGE / ARRAY / SEAMLESS
      </text>
    </svg>
  );
}
