import styles from "@kiochan/lab-ui/preview.module.css";

export function PhotoWaterfallPreview() {
  return (
    <svg className={styles.scene} viewBox="0 0 360 200" aria-hidden="true">
      <rect width="360" height="200" className={styles.base} />
      <g transform="translate(84 26)">
        <rect width="192" height="148" className={styles.surface} />
        <path
          d="M0 0h64v57H0zM64 89h64v59H64zM128 0h64v46h-64zM128 103h64v28h-64z"
          className={styles.accent}
          opacity=".75"
        />
        <path
          d="M0 57h64v81H0zM64 0h64v89H64zM128 46h64v57h-64z"
          fill="currentColor"
          opacity=".55"
        />
        <path
          d="m0 46 20-18 9 9 15-17 20 18v19H0zm64 22 23-31 13 13 9-10 19 18v31H64zm64 23 16-18 12 12 14-15 22 21v12h-64z"
          className={styles.base}
          opacity=".55"
        />
        <circle
          cx="107"
          cy="24"
          r="7"
          className={`${styles.base} ${styles.pulse} ${styles.motion}`}
        />
      </g>
    </svg>
  );
}
