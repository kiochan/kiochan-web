export function ProjectArt({ kind }: { kind: "web" | "monitor" }) {
  return (
    <div className="project-art" aria-hidden="true">
      <svg
        aria-hidden="true"
        viewBox="0 0 560 300"
        fill="none"
        className="h-full w-full text-brand"
      >
        {kind === "web" ? (
          <>
            <rect
              x="133"
              y="37"
              width="304"
              height="197"
              rx="10"
              stroke="currentColor"
              opacity=".25"
            />
            <rect
              x="104"
              y="60"
              width="304"
              height="197"
              rx="10"
              className="art-surface"
              stroke="currentColor"
            />
            <path d="M104 92h304" stroke="currentColor" opacity=".3" />
            <circle cx="123" cy="77" r="3" fill="currentColor" />
            <circle cx="135" cy="77" r="3" fill="currentColor" opacity=".5" />
            <text
              x="129"
              y="132"
              fill="currentColor"
              fontFamily="Arial, sans-serif"
              fontSize="11"
              letterSpacing="2"
            >
              A PERSONAL SPACE
            </text>
            <text
              x="126"
              y="187"
              fill="currentColor"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize="42"
            >
              Hello, world.
            </text>
            <path d="M129 215h97m15 0h34" stroke="currentColor" opacity=".35" />
            <path
              d="M455 82v36m-18-18h36M68 199v20m-10-10h20"
              stroke="currentColor"
              opacity=".4"
            />
          </>
        ) : (
          <>
            <rect
              x="73"
              y="80"
              width="155"
              height="145"
              rx="10"
              stroke="currentColor"
              opacity=".65"
            />
            <rect
              x="330"
              y="80"
              width="155"
              height="145"
              rx="10"
              className="art-surface"
              stroke="currentColor"
            />
            <path d="M228 150h102m-9-6 9 6-9 6" stroke="currentColor" />
            <path
              d="m92 151 17-25 18 49 18-34 20 19 18-32 25 23"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <text
              x="106"
              y="201"
              fill="currentColor"
              fontFamily="monospace"
              fontSize="10"
              letterSpacing="2"
            >
              PROTOCOL
            </text>
            <text
              x="356"
              y="201"
              fill="currentColor"
              fontFamily="monospace"
              fontSize="10"
              letterSpacing="2"
            >
              INTERFACE
            </text>
            <path
              d="M352 106h111m-111 15h74m-74 24h111m-111 15h51"
              stroke="currentColor"
              opacity=".5"
            />
            <circle cx="280" cy="53" r="3" fill="currentColor" opacity=".5" />
          </>
        )}
      </svg>
    </div>
  );
}
