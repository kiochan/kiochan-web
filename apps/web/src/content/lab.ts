export const experiments = [
  {
    slug: "image-palette",
    name: "Image Palette",
    category: "Creative tools",
    tags: ["Color design"],
    description:
      "Extract several color palettes from one image and copy the HEX codes.",
    stack: "React · Canvas",
    packageName: "lab-image-palette",
    original: null,
  },
  {
    slug: "photo-waterfall",
    name: "Photo Waterfall",
    category: "Creative tools",
    tags: ["Photo collages"],
    description:
      "Arrange full photos in balanced columns, choose a background color, and download a PNG collage.",
    stack: "React · Canvas",
    packageName: "lab-photo-waterfall",
    original: null,
  },
  {
    slug: "photo-mosaic",
    name: "Photo Mosaic",
    category: "Creative tools",
    tags: ["Photo collages"],
    description:
      "Drop in local photos, move and resize tiles, and shuffle the layout around locked photos.",
    stack: "React · Canvas",
    packageName: "lab-photo-mosaic",
    original: null,
  },
  {
    slug: "texture-array",
    name: "Texture Array",
    category: "Creative tools",
    tags: ["Pattern design"],
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
    tags: ["Physics"],
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
    tags: ["Pattern design"],
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
    tags: ["Model inspection"],
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
    tags: ["Arcade"],
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
    tags: ["Arcade"],
    description:
      "A keyboard and touch-friendly Snake game with food, collision handling, and source to explore.",
    stack: "React · Canvas",
    packageName: "lab-snake",
    original: "https://github.com/kiochan/quick-snake",
  },
] as const;
