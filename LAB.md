# Lab architecture

## Public addresses

- `/lab` is the collection of runnable experiments.
- `/lab/<slug>` opens an experiment directly. Reserve one stable, lowercase kebab-case slug per project.
- `/projects/<slug>` is an optional editorial project profile, not the tool itself.
- `apps/web/src/content/lab.ts` contains only public catalogue metadata. Keep runtime imports in each experiment's route, so opening the home or lab index does not load every experiment's JavaScript.

The first working example is `/lab/type-playground`, owned by `packages/lab-type-playground`. It edits text and typography entirely in the browser. It has no persistence or backend.

## Current collection

Liquid, Lattice, Cubism Workbench, Breakout, Quick Snake, and Type Playground each own a package and README. Routes share the Lab layout, responsive sidebar, navbar, project provenance, canonical metadata, and breadcrumb structured data. Runtime code stays in individual routes.

Liquid is a new lightweight Canvas approximation rather than a wholesale LiquidFun port. Lattice generates SVG directly and credits its upstream design. Breakout and Snake expose the actual engine source in static HTML. Cubism includes a local manifest inspector and an adapter-based viewer boundary; model rendering is not enabled without an authorized SDK adapter and model assets. No original Cubism resources are copied.

Run `node --test scripts/lab-engines.test.mjs` for engine, pattern, and manifest checks, then the standard lint/type/build and production smoke checks. Every added lab package manifest must also be copied in the Docker dependency stage.

## Small React experiments

1. Create `packages/lab-<slug>` with its own package manifest, exports, dependencies, and type checks.
2. Keep reusable experiment code independent of Next.js routing, the website navigation, and shadcn. React experiments embedded in the host share its React runtime; select compatible peer dependencies. This does not require unrelated apps to use matching versions.
3. Use scoped CSS modules and semantic `--kio-*` colors. The host imports the theme. Do not set global styles, duplicate palettes, or reset the document from an experiment.
4. Add a thin route at `apps/web/src/app/lab/<slug>/page.tsx`, import only that experiment, and provide metadata plus a return link.
5. Add catalogue metadata, a workspace dependency, a Next.js `transpilePackages` entry, and the package manifest to the Docker dependency stage. Update the lockfile.
6. Verify the direct URL, client navigation, refresh, assets, empty/error behavior, themes, keyboard operation, and mobile layout. Add the URL to route smoke checks. The sitemap derives lab URLs from the catalogue.

## Larger or different-framework applications

An application that needs Vue, Angular, an incompatible React version, a separate backend, or independent releases belongs in `apps/<name>` with its own build and dependency choices. Do not load its runtime into a React component tree by default.

Keep the public `/lab/<slug>` address and use an explicit reverse-proxy route to that application when it is ready. Configure its router base, asset paths, deep-link fallback, API URLs, and redirects for that full prefix. Namespace assets and APIs per project; do not claim root `/assets`, `/api`, or `/_next` for another application. For a separate Next.js application, configure its build-time base path. Cross-application links use normal document navigation.

This is a migration path, not a configured proxy today. Add services and CI jobs only when an actual project needs them. An old repository can stay independent while its deployment moves behind this path; importing its Git history into this monorepo is a separate choice.

Applications sharing the origin also share origin-level browser storage. Prefix storage keys with the project name and scope cookies where appropriate. Path routing is not a security boundary; use a separate origin if a project needs one. Keep service-worker scope under the project's prefix.

## Data and deployment

Public catalogues and static tools remain independent of PostgreSQL. If an independent application needs data, give it a separate database and restricted role in the shared Kiochan PostgreSQL cluster. Scope an embedded experiment's Prisma models and API handlers deliberately; do not give browser code database credentials.

The current React example ships in the existing website image and release workflow. It adds no service, database, domain, or proxy change. Future independent applications need explicit health checks and image deployment configuration before their catalogue links become public.

References: [Next.js basePath](https://nextjs.org/docs/pages/api-reference/config/next-config-js/basePath), [official multi-zone example](https://github.com/vercel/next.js/blob/canary/examples/with-zones/README.md).
