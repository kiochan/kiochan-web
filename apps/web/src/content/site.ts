export const profile = {
  name: "Kiochan",
  github: "https://github.com/kiochan",
  description:
    "Web projects, practical experiments, and notes from the process of building them.",
};

export const projects = [
  {
    slug: "kiochan-web",
    name: "Kiochan Web",
    title: "A home for the things I build.",
    category: "Personal website",
    summary:
      "An evolving personal site with a shared visual language and a straightforward path from code to production.",
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
    repository: "https://github.com/kiochan/kiochan-web",
    status: "This website",
    artwork: "web",
    overview:
      "This is the project you are visiting: a place to collect work and document the decisions behind it. The website uses Next.js and React, with a pnpm workspace that leaves room for other applications.",
    details: [
      {
        title: "One visual language",
        text: "A framework-independent CSS package owns the palette. The website adapts its tokens to Tailwind and local shadcn/ui components. Future applications can share the colors without sharing a UI runtime.",
      },
      {
        title: "A production foundation",
        text: "Prisma provides PostgreSQL access. Website and database containers have separate lifecycles, while GitHub Actions checks and deploys versioned images with migration and health checks.",
      },
      {
        title: "Content first",
        text: "Public pages render statically and remain available without a database connection. Light, dark, or system preference is remembered in the browser.",
      },
    ],
  },
  {
    slug: "modbus-monitor",
    name: "Modbus Monitor",
    title: "A web interface meets a different kind of network.",
    category: "Protocol experiment",
    summary:
      "An earlier JavaScript exploration of Modbus monitoring, combining a React web interface with protocol-oriented tooling.",
    stack: ["JavaScript", "React", "Next.js", "Modbus"],
    repository: "https://github.com/kiochan/modbus-monitor",
    status: "Public source",
    artwork: "monitor",
    overview:
      "A public repository exploring a browser-facing interface for Modbus monitoring. Its source combines Next.js, React, Evergreen UI, and modbus-stream.",
    details: [
      {
        title: "An experiment across boundaries",
        text: "The project brings web interface work into contact with protocol-level tools: an exploration of an unfamiliar domain through a small, inspectable application.",
      },
      {
        title: "Explore the source",
        text: "The repository is the reference for implementation and setup. This page describes the source project; it does not offer a hosted demo or promise support for a particular device.",
      },
    ],
  },
] as const;

export const notes = [
  {
    slug: "a-theme-without-a-framework",
    title: "A shared theme should not choose your framework.",
    category: "Design systems",
    summary:
      "Separating the visual language from the components that happen to use it.",
    introduction:
      "A consistent website does not require every application to use the same component library. The useful boundary is between the visual decisions and the code that consumes them.",
    sections: [
      {
        heading: "Start with meaning",
        paragraphs: [
          "A canvas color, readable text, and a brand accent describe what a design needs. They do not describe a React component. Here, these decisions are plain CSS variables with a --kio- prefix, distributed by packages/theme.",
          "That package has no React, Tailwind, or shadcn dependencies. Another application can import the stylesheet and keep its own rendering model.",
        ],
      },
      {
        heading: "Let the application do the adapting",
        paragraphs: [
          "The Next.js application maps shared tokens to Tailwind utilities and shadcn variable names. These adapters belong to the application. Replacing a component library should change an adapter, not redefine the brand palette.",
          "The dependency runs in one direction: the application depends on the theme, while the theme knows nothing about the application.",
        ],
      },
      {
        heading: "Keep preference separate from color",
        paragraphs: [
          "Light, dark, and system are user preferences. The website remembers the choice locally and resolves it to a data-theme attribute. CSS supplies the colors from the shared package.",
          "JavaScript decides which mode is active; it does not duplicate the palette. That small contract remains useful when the rest of the stack changes.",
        ],
      },
    ],
  },
  {
    slug: "from-commit-to-production",
    title: "Making a small deployment predictable.",
    category: "Building for the web",
    summary:
      "Versioned images, migrations before replacement, and checks that ask useful questions.",
    introduction:
      "A personal website still deserves a repeatable release process. This site's deployment separates a few responsibilities so a release is easier to understand and recover from.",
    sections: [
      {
        heading: "Identify the release",
        paragraphs: [
          "A production push runs lint, TypeScript checks, a build, and container integration checks. The workflow publishes a website image and a migration image identified by the same commit SHA.",
          "The server deploys that exact pair. A mutable tag is convenient, but a commit-specific tag answers the important question: which code is actually being deployed?",
        ],
      },
      {
        heading: "Give the database its own lifecycle",
        paragraphs: [
          "PostgreSQL is an independent service with persistent storage. The website has its own database and restricted login. Replacing a web container does not recreate the database service.",
          "Deployment creates a backup and applies checked-in Prisma migrations before replacing the website. Schema changes must remain compatible with the previous image, because an image rollback does not undo a migration.",
        ],
      },
      {
        heading: "Check more than the process",
        paragraphs: [
          "The release checks web health, a real database query, the public page, and its generated stylesheet through HTTPS.",
          "If local health checks fail, the previous website image is restored when available. Backups still need an off-server copy and a tested restore procedure before they become a disaster-recovery plan.",
        ],
      },
    ],
  },
] as const;

export type Project = (typeof projects)[number];
export type Note = (typeof notes)[number];

export function readingTime(note: Note) {
  const text = [
    note.introduction,
    ...note.sections.flatMap((s) => s.paragraphs),
  ].join(" ");
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}
