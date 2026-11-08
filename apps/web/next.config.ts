import path from "node:path";
import type { NextConfig } from "next";

const workspaceRoot = path.resolve(import.meta.dirname, "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/releases", destination: "/projects", permanent: false },
      {
        source: "/releases/:slug",
        destination: "/projects/:slug",
        permanent: false,
      },
    ];
  },
  outputFileTracingExcludes: {
    "/*": ["./.releases/**/*", "../../.releases/**/*"],
  },
  outputFileTracingRoot: workspaceRoot,
  turbopack: { root: workspaceRoot },
  transpilePackages: [
    "@kiochan/lab-texture-array",
    "@kiochan/database",
    "@kiochan/lab-ui",
    "@kiochan/lab-liquid",
    "@kiochan/lab-lattice",
    "@kiochan/lab-cubism",
    "@kiochan/lab-breakout",
    "@kiochan/lab-snake",
  ],
  poweredByHeader: false,
};

export default nextConfig;
