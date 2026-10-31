import styles from "@kiochan/lab-ui/preview.module.css";

const drops = Array.from({ length: 13 }, (_, i) => ({
  x: 72 + ((i * 37) % 218),
  y: 55 + ((i * 17) % 76),
  radius: 4 + (i % 4),
  opacity: 0.35 + (i % 3) * 0.2,
  delay: -i * 0.23,
}));
export function LiquidPreview() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 360 200"
      fill="none"
      aria-hidden="true"
    >
      <rect width="360" height="200" className={styles.base} />
      <path d="M30 25v145h300V25" className={styles.line} strokeWidth="1.5" />
      <g className={`${styles.wave} ${styles.motion}`} fill="currentColor">
        <path
          opacity=".14"
          d="M30 137q25-26 50-4t50 0 50 0 50 0 50 0 76 0v50H30Z"
        />
        <path
          opacity=".25"
          d="M30 151q25-25 50-4t50 0 50 0 50 0 50 0 76 0v32H30Z"
        />
      </g>
      {drops.map((drop) => (
        <circle
          key={drop.x}
          cx={drop.x}
          cy={drop.y}
          r={drop.radius}
          fill="currentColor"
          opacity={drop.opacity}
          className={`${styles.bob} ${styles.motion}`}
          style={{ animationDelay: `${drop.delay}s` }}
        />
      ))}
      <text x="30" y="190" className={styles.label}>
        POUR / GRAVITY / FLOW
      </text>
    </svg>
  );
}
