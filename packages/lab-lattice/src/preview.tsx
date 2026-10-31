import styles from "@kiochan/lab-ui/preview.module.css";
import { useId } from "react";
export function LatticePreview() {
  const id = useId();
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 360 200"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
          <rect width="44" height="44" className={styles.surface} />
          <path
            d="M16 0v44M0 16h44"
            stroke="currentColor"
            strokeWidth="13"
            opacity=".3"
          />
          <path
            d="M34 0v44M0 34h44"
            stroke="var(--kio-color-accent)"
            strokeWidth="2"
            opacity=".6"
          />
        </pattern>
      </defs>
      <rect width="360" height="200" className={styles.base} />
      <g className={`${styles.weave} ${styles.motion}`}>
        <rect
          x="28"
          y="17"
          width="304"
          height="155"
          rx="4"
          fill={`url(#${id})`}
        />
      </g>
      <text x="28" y="190" className={styles.label}>
        REPEAT / WEAVE / EXPORT
      </text>
    </svg>
  );
}
