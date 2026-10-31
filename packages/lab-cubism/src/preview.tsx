import styles from "@kiochan/lab-ui/preview.module.css";
export function CubismPreview() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 360 200"
      fill="none"
      aria-hidden="true"
    >
      <rect width="360" height="200" className={styles.base} />
      <rect
        x="45"
        y="22"
        width="270"
        height="145"
        rx="7"
        className={styles.surface}
      />
      <text x="65" y="45" className={styles.label}>
        MODEL MANIFEST
      </text>
      <path
        d="M65 59h230M86 76v58m0-48h20m-20 23h20m-20 23h20"
        className={styles.line}
      />
      <g className={styles.label}>
        <text x="119" y="88">
          MOC
        </text>
        <text x="119" y="111">
          TEXTURES
        </text>
        <text x="119" y="134">
          MOTIONS
        </text>
      </g>
      <g className={`${styles.scan} ${styles.motion}`}>
        <rect
          x="57"
          y="64"
          width="246"
          height="23"
          rx="3"
          fill="currentColor"
          opacity=".12"
        />
        <path d="M57 64h246" stroke="currentColor" opacity=".6" />
      </g>
      <text x="30" y="190" className={styles.label}>
        MANIFEST ONLY / NO MODEL ASSETS
      </text>
    </svg>
  );
}
