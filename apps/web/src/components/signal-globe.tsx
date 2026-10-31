export function SignalGlobe() {
  return (
    <div className="signal-panel" aria-hidden="true">
      <div className="signal-panel-label">
        <span className="status-light" />
        KIO / EXPLORATION LAB<span>01—∞</span>
      </div>
      <div className="signal-field">
        <svg
          aria-hidden="true"
          className="signal-globe"
          viewBox="0 0 320 320"
          fill="none"
        >
          <circle
            cx="160"
            cy="160"
            r="105"
            stroke="currentColor"
            strokeOpacity=".5"
          />
          <ellipse
            cx="160"
            cy="160"
            rx="105"
            ry="40"
            stroke="currentColor"
            strokeOpacity=".45"
          />
          <ellipse
            cx="160"
            cy="160"
            rx="105"
            ry="78"
            stroke="currentColor"
            strokeOpacity=".25"
          />
          <ellipse
            cx="160"
            cy="160"
            rx="40"
            ry="105"
            stroke="currentColor"
            strokeOpacity=".45"
          />
          <ellipse
            cx="160"
            cy="160"
            rx="78"
            ry="105"
            stroke="currentColor"
            strokeOpacity=".25"
          />
          <path
            d="M55 160h210M160 55v210"
            stroke="currentColor"
            strokeOpacity=".3"
          />
          <g className="signal-ring">
            <ellipse
              cx="160"
              cy="160"
              rx="142"
              ry="55"
              transform="rotate(-35 160 160)"
              stroke="currentColor"
              strokeDasharray="6 8"
            />
            <circle cx="276" cy="91" r="5" fill="currentColor" />
          </g>
          <g className="signal-ring-reverse">
            <circle
              cx="160"
              cy="160"
              r="132"
              stroke="currentColor"
              strokeOpacity=".25"
              strokeDasharray="2 14"
            />
            <circle cx="160" cy="28" r="3" fill="currentColor" />
          </g>
          <circle cx="160" cy="160" r="5" fill="currentColor" />
        </svg>
        <span className="signal-coordinate signal-coordinate-top">
          IDEAS → INTERFACES
        </span>
        <span className="signal-coordinate signal-coordinate-bottom">
          BUILD / PLAY / REPEAT
        </span>
      </div>
      <div className="signal-panel-label">
        <span>OPEN TO EXPLORATION</span>
        <span>kiochan.one ↗</span>
      </div>
    </div>
  );
}
