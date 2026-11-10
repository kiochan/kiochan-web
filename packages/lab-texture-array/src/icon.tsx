const paths = {
  add: "M12 5v14M5 12h14",
  image:
    "M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm-1 13 5-5 4 4 3-3 6 6M8 7h.01",
  layers: "m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5",
  folder: "M3 7V5h6l2 2h10v13H3V7Z",
  save: "M4 3h13l4 4v14H3V3h1Zm3 0v6h10V3M7 21v-8h10v8",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  replace: "M4 7h15l-4-4m5 14H5l4 4M3 7v5m18 5v-5",
  duplicate: "M9 9h12v12H9V9ZM5 15H3V3h12v2",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
  copy: "M9 8h12v13H9V8ZM5 16H3V3h12v2",
  paste: "M9 4H5v17h14V4h-4M9 2h6v5H9V2Zm0 10h6m-6 4h6",
  all: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 3h7m-3-3v7",
  up: "m6 14 6-6 6 6",
  down: "m6 10 6 6 6-6",
  undo: "M9 5 3 11l6 6M3 11h11a7 7 0 0 1 7 7",
  redo: "m15 5 6 6-6 6m6-6H10a7 7 0 0 0-7 7",
  grid: "M3 3h18v18H3V3Zm6 0v18m6-18v18M3 9h18M3 15h18",
  fit: "M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6",
  reset: "M3 4v6h6M3 10a9 9 0 1 1 1 8",
  close: "m6 6 12 12M6 18 18 6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  hidden:
    "m3 3 18 18M9 5c1-.2 2-.3 3-.3 6 0 10 7.3 10 7.3a22 22 0 0 1-4 4M6 6a23 23 0 0 0-4 6s4 7 10 7a13 13 0 0 0 5-1",
} as const;

export function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
