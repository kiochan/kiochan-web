# Project instructions

## Language and scope

- Use English for code, comments, documentation, UI copy, and commit messages.
- The website contains a home page, public project profiles, engineering notes, an about page, and GitHub contact paths. Do not invent personal history, claims, testimonials, contact details, or project capabilities.
- Keep editorial content in `apps/web/src/content/site.ts`. Feature only verified public repositories. Private repository access does not authorize publication.
- Do not add temporary demonstration projects to the committed website. The Type Playground example and Modbus Monitor profile have been withdrawn by the user. Keep the requested game source disclosures.
- Keep public pages statically renderable and independent of PostgreSQL. Add routes to the sitemap and route smoke checks when expanding the site.
- Explicit exception: `/releases`, release metadata/download/media routes, and the sitemap read public Markdown packages from the read-only runtime mount. They must bypass build-time and request caching, remain independent of PostgreSQL, and reflect content updates without rebuilding the website. Other public pages remain statically renderable.
- Releases have independent `dev` and `prod` channels. Expose only the latest version in each channel, with stable download addresses; do not add a history browser. Private source access never authorizes publishing source, chat material, secrets, or unselected screenshots.
- Only validated publication bundles may change the catalogue. Switch the complete channel catalogue atomically before removing old publisher-owned versions; never clean the other channel or unrelated products. Keep raw HTML and remote screenshot loading disabled.
- Do not deploy, push commits, or change production infrastructure without user authorization.

## Architecture

- Use pnpm workspaces without Nx. Turborepo is not required.
- `apps/web` is the Next.js App Router application using React and TypeScript.
- `packages/database` contains server-side Prisma Client access through the PostgreSQL driver adapter. Use Prisma ORM 7, with `prisma`, client, and adapter versions pinned together.
- Keep dependencies in the package that uses them. Applications may use different dependency versions.
- Future Vue or Angular applications belong in separate workspace packages. Choose integration when a concrete requirement exists.
- Prefer Server Components. Add client components only when interaction requires them.
- `/lab/<slug>` is the stable public address for runnable experiments; `/projects/<slug>` is an optional introduction. Follow `LAB.md` for integration and migration.
- Small embedded React experiments live in independent `packages/lab-*` workspaces with host-compatible React peers and scoped CSS. Keep runtime imports in individual routes and only metadata in the lab catalogue.
- Lab routes share `app/lab/layout.tsx`, the global navbar, and the responsive project sidebar. Do not replace website chrome inside an experiment. Every experiment package needs its own English README with origin, behavior, maintenance location, and verification.
- Never import Cubism SDK binaries, vendor resources, sample models, or third-party model assets. The resource-free viewer accepts an explicitly supplied authorized adapter; the public manifest inspector must not claim to render models.
- Keep game engines independent of React, expose their actual source for reading, and scope keyboard input to focused game controls. Cancel animation and release resources on unmount.
- Different-framework or independently deployed apps belong in `apps/*`; introduce prefix-aware proxy routing only for a concrete app. Do not assume a URL prefix isolates origin-level storage or security.
- Keep the home page independent of database availability. Never query PostgreSQL while building the static home page.

## Theme and UI boundaries

- Use Tailwind CSS for website styling and local shadcn/ui component source in `apps/web/src/components/ui`.
- `packages/theme` owns framework-independent `--kio-*` semantic CSS tokens and light/dark palettes. It must not depend on React, Tailwind, Radix, or shadcn and must not expose shadcn variable names.
- The website owns integration adapters: `src/styles/shadcn.css` maps theme tokens to shadcn names; `src/styles/tailwind.css` registers Tailwind utilities. Keep palette literals exclusively in the shared theme.
- Application layout should use brand tokens or its own semantic utilities. Keep vendor-specific component variants inside the local UI boundary rather than spreading them through business logic.
- Add components as needed. Do not run shadcn initialization over the existing theme or accept generated palette overrides without review. CLI generation is optional.
- Future Vue/Angular applications may import the theme CSS directly and provide their own UI adapters without installing shadcn.
- Use `data-theme="light"` or `data-theme="dark"` for explicit mode selection; without an attribute the theme follows the operating system.
- Theme preference behavior belongs to the web application, not `packages/theme`. Its `next-themes` provider stores `light`, `dark`, or `system` under the browser-local `kiochan-theme` key and resolves the preference to `data-theme` on the document root.
- Keep `enableColorScheme` disabled in the provider: the shared theme CSS owns `color-scheme` and all palette values. Do not duplicate colors in JavaScript or switch the provider to shadcn's `.dark` convention.
- Preserve the provider's pre-hydration theme script and the root's `suppressHydrationWarning`. Theme-dependent controls must render the same initial server/client markup before reading the saved selection.
- Navigation feedback uses the app-router BProgress provider. Do not delay real navigation for animation. Keep reduced-motion support, static page metadata, loading boundaries, and per-experiment dynamic imports; do not put every experiment runtime in the main layout.
- Motion must preserve readable server-rendered content. Scroll reveals are progressive enhancement and must clean up observers and animations. Never hide content until JavaScript runs.
- Lab card previews belong to each project's ./preview export and must remain independent of its full runtime. Keep illustrative previews truthful, pause offscreen/background/reduced-motion playback, and provide a separate touch-friendly play button outside the navigation link.

## Quality checks

- Use Biome for linting, formatting, and import organization. Do not introduce ESLint or Prettier.
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm build` before committing.
- Commit the pnpm lockfile. Use the Node and pnpm versions declared in this repository.
- Validate database and container changes with Docker when available. Report any unverified runtime behavior.
- Keep meaningful tests focused on behavior and infrastructure boundaries.

## PostgreSQL

- Kiochan PostgreSQL is independent shared infrastructure, not a disposable website dependency.
- Its Compose project is `kiochan-postgres`, container is `kiochan-postgres`, volume is `kiochan-postgres-data`, and network is `kiochan-data`.
- PostgreSQL 18 data is mounted at `/var/lib/postgresql`. Do not use an older version's mount layout.
- Give each future application a separate database and restricted login role. Share the cluster, not the website credentials.
- The website uses `kiochan_web`; it must never use the `kiochan_admin` superuser.
- Never expose PostgreSQL publicly. The optional host connection is bound to `127.0.0.1:5434`.
- Never delete database volumes, use `down -v`, change the PostgreSQL major version, or reset shared data without explicit authorization.
- Initialization scripts run only for a new data volume. Later changes require reviewed migrations.
- Keep secrets in ignored environment files or the deployment secret store. Never commit real credentials or print connection strings.
- Use parameterized SQL for application data. Keep database imports out of client components.
- Keep the Prisma schema and immutable SQL migrations in `packages/database/prisma`. Generate the client before type checks or builds; never commit generated client files.
- Run `prisma migrate deploy` from the migration image before replacing the website. Never run `migrate dev`, `db push`, or a reset against production.
- Schema changes must remain compatible with the previous website image. Image rollback does not undo migrations; restore or destructive schema changes require explicit review.

## Deployment

- Follow the existing Sovia pattern: independent PostgreSQL and website Compose projects, Nginx in front, persistent database storage.
- The website's proposed host port is `127.0.0.1:4095`; verify availability before deployment.
- Use the standalone Next.js production output and a non-root container user.
- Prefer building images in CI rather than on the 2-vCPU, 4-GB production server.
- Pushes to `prod` run reusable CI, publish website and migration images to GHCR, and deploy through the `deploy` account. Other branches and pull requests run checks without publishing or deploying.
- Deploy the immutable `sha-<commit>` and `migrate-<commit>` image pair. Never select a release using a mutable tag alone. Serialize production deployments and do not cancel an active deployment.
- The dedicated deployment key belongs in the repository's `PROD_SSH_KEY` Actions Secret. Pin the verified server public key in `infrastructure/web/known_hosts`. Never disable SSH host verification or store the temporary SSH password in GitHub.
- Registry authentication uses the deployment job's short-lived `GITHUB_TOKEN` and a temporary server-side Docker configuration. Do not reuse Sovia credentials or persist registry tokens on the server.
- Production deployments use the `deploy` Linux account. Runtime files live in `/opt/kiochan-web`; shared database infrastructure lives in `/opt/kiochan-postgres`.
- `/opt/kiochan-web/env/prod.env` selects the website image and database URL. `/opt/kiochan-postgres/.env` holds administrator and website database passwords. Both must be mode 600 and must never be printed.
- Run `/opt/kiochan-web/deploy.sh` to replace the website with health checks and image rollback. It must never recreate or remove the shared PostgreSQL volume.
- `/opt/kiochan-postgres/backup.sh` creates a private full-cluster logical backup, including roles. Keep backups private and copy them off the server before relying on them for disaster recovery.
- Preserve Sovia, Connectric, Hitekcircuits, existing databases, and unrelated services.
- Cloudflare for `kiochan.one` uses Full (strict). Preserve original `X-Forwarded-Proto` handling in Nginx for proxy compatibility. Do not weaken TLS or change other zones as part of a deployment.
