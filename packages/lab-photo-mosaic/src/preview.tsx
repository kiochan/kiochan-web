import styles from "@kiochan/lab-ui/preview.module.css";

export function PhotoMosaicPreview() {
  return (
    <svg className={styles.scene} viewBox="0 0 360 200" aria-hidden="true">
      <rect width="360" height="200" className={styles.base} />
      <g transform="translate(82 28)">
        <rect width="196" height="144" className={styles.surface} />
        <path d="M0 0h90v85H0z" fill="currentColor" opacity=".4" />
        <path d="M0 85h90v59H0z" className={styles.accent} opacity=".45" />
        <path d="M90 0h106v43H90z" className={styles.accent} opacity=".7" />
        <path d="M90 43h106v101H90z" fill="currentColor" opacity=".7" />
        <path
          d="M0 85h90M90 0v144m0-101h106"
          fill="none"
          className={styles.line}
        />
        <circle cx="26" cy="25" r="9" className={styles.base} />
        <path
          d="m0 77 28-28 12 12 23-23 27 27v20H0z"
          className={styles.base}
          opacity=".65"
        />
        <path
          d="m90 120 33-36 22 22 25-31 26 30v39H90z"
          className={styles.base}
          opacity=".55"
        />
        <circle
          cx="90"
          cy="85"
          r="6"
          className={`${styles.accent} ${styles.pulse} ${styles.motion}`}
        />
      </g>
    </svg>
  );
}
