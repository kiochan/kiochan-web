import styles from "@kiochan/lab-ui/preview.module.css";

const columns = Array.from({ length: 12 }, (_, i) => 38 + i * 24);
const rows = Array.from({ length: 7 }, (_, i) => 18 + i * 24);
export function SnakePreview() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 360 200"
      fill="none"
      aria-hidden="true"
    >
      <rect width="360" height="200" className={styles.base} />
      <g className={styles.line} opacity=".55">
        {columns.map((x) => (
          <path key={x} d={`M${x} 18v144`} />
        ))}
        {rows.map((y) => (
          <path key={y} d={`M38 ${y}h264`} />
        ))}
      </g>
      <path
        d="M60 35H260V145H60Z"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="90 530"
        className={`${styles.trail} ${styles.motion}`}
      />
      <circle
        cx="182"
        cy="90"
        r="6"
        className={`${styles.accent} ${styles.pulse} ${styles.motion}`}
      />
      <text x="30" y="190" className={styles.label}>
        STEER / GROW / REPEAT
      </text>
    </svg>
  );
}
