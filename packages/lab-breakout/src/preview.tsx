import styles from "@kiochan/lab-ui/preview.module.css";

const bricks = Array.from({ length: 21 }, (_, i) => ({
  x: 34 + (i % 7) * 43,
  y: 26 + Math.floor(i / 7) * 21,
  opacity: 0.28 + Math.floor(i / 7) * 0.22,
}));
export function BreakoutPreview() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 360 200"
      fill="none"
      aria-hidden="true"
    >
      <rect width="360" height="200" className={styles.base} />
      {bricks.map((brick) => (
        <rect
          key={`${brick.x}-${brick.y}`}
          x={brick.x}
          y={brick.y}
          width="34"
          height="13"
          rx="2"
          fill="currentColor"
          opacity={brick.opacity}
        />
      ))}
      <circle
        r="6"
        fill="var(--kio-color-accent)"
        transform="translate(80 145)"
        className={`${styles.ball} ${styles.motion}`}
      />
      <rect
        x="145"
        y="161"
        width="70"
        height="6"
        rx="3"
        fill="currentColor"
        className={`${styles.paddle} ${styles.motion}`}
      />
      <text x="30" y="190" className={styles.label}>
        AIM / BOUNCE / BREAK
      </text>
    </svg>
  );
}
