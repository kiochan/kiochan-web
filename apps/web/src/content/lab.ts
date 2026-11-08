export const experiments = [
  {
    slug: "texture-array",
    name: "Texture Array",
    category: "Creative tools",
    description:
      "Build seamless square textures from local images with GPU arrays, a movable canvas, and editable project history.",
    stack: "React · WebGL2",
    packageName: "lab-texture-array",
    original: null,
  },
  {
    slug: "liquid",
    name: "Liquid Playground",
    category: "Simulation",
    description:
      "Pour particles, change gravity, and play with a lightweight fluid-like simulation.",
    stack: "React · Canvas",
    packageName: "lab-liquid",
    original: "https://github.com/kiochan/liquid-playground",
  },
  {
    slug: "lattice",
    name: "Lattice Generator",
    category: "Creative tools",
    description:
      "Design a repeating plaid, adjust its rhythm and colors, and export SVG or PNG.",
    stack: "React · SVG",
    packageName: "lab-lattice",
    original: "https://github.com/kiochan/lattice-generator",
  },
  {
    slug: "cubism",
    name: "Cubism Workbench",
    category: "Live2D",
    description:
      "Inspect a local Cubism model manifest and explore the resource-free viewer integration.",
    stack: "React · Local files",
    packageName: "lab-cubism",
    original: "https://github.com/kiochan/react-cubism",
  },
  {
    slug: "breakout",
    name: "Breakout",
    category: "Games",
    description:
      "A small brick-breaking game rebuilt for the browser, with readable TypeScript source.",
    stack: "React · Canvas",
    packageName: "lab-breakout",
    original: "https://github.com/kiochan/breakout",
  },
  {
    slug: "snake",
    name: "Quick Snake",
    category: "Games",
    description:
      "A keyboard and touch-friendly Snake game with food, collision handling, and source to explore.",
    stack: "React · Canvas",
    packageName: "lab-snake",
    original: "https://github.com/kiochan/quick-snake",
  },
] as const;
