import styles from "@kiochan/lab-ui/preview.module.css";

export function ImagePalettePreview() {
  return (
    <svg className={styles.scene} viewBox="0 0 360 200" aria-hidden="true">
      <rect width="360" height="200" className={styles.base} />
      <rect
        x="59"
        y="48"
        width="113"
        height="104"
        rx="10"
        className={styles.surface}
      />
      <path d="m67 133 32-35 20 23 25-31 20 24v30H67z" fill="currentColor" />
      <circle cx="124" cy="82" r="9" className={styles.accent} />
      <path
        d="M181 100h16m-5-5 5 5-5 5"
        fill="none"
        className={styles.line}
        strokeWidth="2"
      />
      <g className={`${styles.pulse} ${styles.motion}`}>
        <rect
          x="205"
          y="71"
          width="30"
          height="25"
          rx="4"
          fill="currentColor"
        />
        <rect
          x="238"
          y="71"
          width="30"
          height="25"
          rx="4"
          className={styles.accent}
        />
        <rect
          x="271"
          y="71"
          width="30"
          height="25"
          rx="4"
          className={styles.surface}
        />
      </g>
      <rect
        x="205"
        y="104"
        width="30"
        height="25"
        rx="4"
        className={styles.surface}
      />
      <rect
        x="238"
        y="104"
        width="30"
        height="25"
        rx="4"
        fill="currentColor"
        opacity=".6"
      />
      <rect x="271" y="104" width="30" height="25" rx="4" fill="currentColor" />
    </svg>
  );
}
