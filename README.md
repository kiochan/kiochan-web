# Kiochan

A personal website built with Next.js, React, TypeScript, Prisma, PostgreSQL, and Biome in a pnpm monorepo. It includes public projects, engineering notes, an about page, and working GitHub contact paths.

## Website content

The home page introduces Kiochan and leads to `/projects`, `/notes`, `/about`, and `/contact`. Projects and notes have individual static detail pages. Edit typed content in `apps/web/src/content/site.ts`; route generation and the sitemap use the same content. Only verified public repositories are featured. Project artwork is illustrative, not a claim about a hosted demo.

Public pages work without a database, account, or third-party API request. Contact links lead to GitHub profiles or the relevant repository issue tracker. The release includes responsive navigation, persistent theme selection, keyboard focus styles, a skip link, metadata, a sitemap, and a recovery page for unknown URLs. See [SITE_PLAN.md](SITE_PLAN.md) for scope and editorial boundaries.

## Requirements

- Node.js 24
- pnpm 10.34.9 (declared in `package.json`)
- Docker with Compose v2 for PostgreSQL and container development

## Quick start

```sh
corepack enable
corepack prepare pnpm@10.34.9 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. The home page works without PostgreSQL.

## Workspace

```text
apps/web/                  Next.js website
packages/database/         Prisma schema, migrations, and server-side client
packages/theme/            Framework-independent semantic CSS tokens
infrastructure/postgres/   Independent shared PostgreSQL service
infrastructure/web/        Website container configuration
```

Each package declares its own dependencies. Framework versions do not need to match across future applications. No Nx or generators are required.

## Theme and UI

The website uses Tailwind CSS and local shadcn/ui components. `packages/theme` is the source of truth for color and control-radius tokens. It ships only plain CSS and has no framework or UI-library dependencies.

```text
packages/theme/src/tokens.css       Kiochan palette and semantic --kio-* tokens
apps/web/src/styles/shadcn.css      Application-owned shadcn variable adapter
apps/web/src/styles/tailwind.css    Application-owned Tailwind utility mapping
apps/web/src/components/ui/         Local shadcn component source
```

Edit shared palette values in `packages/theme`, not in components or vendor configuration. The root follows system light/dark preference unless `data-theme="light"` or `data-theme="dark"` is set. A future Vue/Angular application can import `@kiochan/theme/tokens.css` without adopting shadcn or Tailwind.

The website's Theme selector offers Light, Dark, and System. System is the default. The application uses `next-themes` to remember the selection in browser local storage (`kiochan-theme`), synchronize tabs, and react to operating-system changes when System is selected. Its pre-hydration script applies the saved choice before the page paints. Palette values and the CSS `color-scheme` remain exclusively in `packages/theme`; no user preference is stored in PostgreSQL.

`apps/web/components.json` supports adding shadcn components when needed; initial setup does not require a generator. Review any generated CSS and keep literal palettes out of the website. See [the theme package documentation](packages/theme/README.md) for the token contract.

## Quality checks

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format
```

After building, `pnpm start` runs the standalone production server with its static assets. It also reads `apps/web/.env.local` when present.

Biome handles both linting and formatting. CI checks types, builds production and migration containers, applies Prisma migrations, and verifies the page, PostgreSQL connection, and restricted role in isolated runner containers. CI runs on non-production pushes and pull requests and is reused by the production workflow.

With the production server running locally, `node scripts/smoke-test.mjs` verifies the page and graceful database-unavailable response. Set `EXPECT_DATABASE=connected` when checking a configured database. `BASE_URL` defaults to `http://127.0.0.1:3000`.

## Kiochan PostgreSQL

The shared PostgreSQL cluster has its own lifecycle and persistent volume. The website gets a dedicated database and login role, both named `kiochan_web`. Future applications should receive their own databases and roles rather than reuse website credentials.

1. Copy `.env.example` to `.env` at the repository root.
2. Replace both placeholder passwords with different randomly generated values. Hex passwords make connection URL configuration straightforward.
3. Start the cluster:

```sh
pnpm db:up
```

4. Copy `apps/web/.env.example` to `apps/web/.env.local`, replace the website password with the matching value, and restart the development server.
5. Apply migrations with `pnpm db:migrate`. Set `DATABASE_URL` in your shell to the same local connection URL before running this command; Prisma CLI does not read Next.js environment files automatically.
6. Open http://localhost:3000/api/health/database to verify connectivity through Prisma.

`pnpm db:generate` generates Prisma Client without connecting to PostgreSQL. Development, type checking, and production builds run generation automatically. The initial migration creates no business tables. Add future models to `packages/database/prisma/schema.prisma` and create migrations with `pnpm --filter @kiochan/database migrate:dev` against a development database only.

Host tools connect to `127.0.0.1:5434`. Containers attached to `kiochan-data` connect to `kiochan-postgres:5432`. The administrator is `kiochan_admin`; the website never uses that role.

`pnpm db:stop` stops PostgreSQL without deleting its volume. Initialization runs only on an empty volume. Editing `.env` after initialization does not rotate existing PostgreSQL passwords. Apply later schema or credential changes explicitly; never delete shared data to rerun initialization.

## Production container preparation

The following commands build a local website image for container verification:

```sh
docker build -t kiochan-web:local .
```

Copy `infrastructure/web/.env.example` to `infrastructure/web/.env` and set the website database password in `DATABASE_URL`. The shared PostgreSQL service must be running first.

```sh
docker compose --env-file infrastructure/web/.env -f infrastructure/web/compose.yaml up -d --wait
```

The website listens on `127.0.0.1:4095`, ready for an Nginx reverse proxy. Verify this port is available before using it on a server. PostgreSQL remains a separate Compose project when the website is replaced or stopped.

- `/api/health` checks the web process without requiring the database.
- `/api/health/database` checks a real PostgreSQL query and returns 503 on failure without exposing credentials or internal errors.
- Keep environment files out of Git and Docker build contexts.
- Back up the cluster before adding production data. Define and test backup/restore procedures before relying on it for other applications.

See [AGENTS.md](AGENTS.md) for development and infrastructure conventions.

## Server deployment

Production uses the `deploy` account and follows the existing Sovia layout:

```text
/home/deploy/kiochan-web/       Source checkout or release snapshot
/opt/kiochan-web/              compose.yaml, deploy.sh, env/prod.env
/opt/kiochan-postgres/         compose.yaml, .env, init/, backup.sh, backups/
```

Build and tag an immutable website image before changing `KIOCHAN_WEB_IMAGE` in `/opt/kiochan-web/env/prod.env`. Database secrets are generated on the server; never reuse the SSH password. Keep secret files at mode 600 and their directories private.

Start the independent cluster with:

```sh
cd /opt/kiochan-postgres
docker compose --env-file .env -f compose.yaml up -d --wait
```

Deploy the already built website image with:

```sh
/opt/kiochan-web/deploy.sh
```

The script locks concurrent deployments, backs up the shared cluster, applies checked-in migrations when a migration image is selected, and then replaces the website. It checks both health endpoints and restores the previous website image on failure when one exists. Only a healthy release is saved in `env/prod.env`. Migrations are not rolled back automatically; changes must remain compatible with the previous image. The script never deletes database storage. The Nginx reference configuration is `infrastructure/web/nginx.conf`; validate with `nginx -t` before reloading.

Run `/opt/kiochan-postgres/backup.sh` for a private full-cluster logical backup. A successful dump is not a restore test or an off-server backup. Scheduled off-server backups are not enabled by this repository.

## GitHub Actions production releases

Push to `prod` to run `.github/workflows/deploy.yml`:

1. Run the reusable CI workflow, including a fresh PostgreSQL migration test.
2. Publish `ghcr.io/kiochan/kiochan-web:sha-<commit>` and `:migrate-<commit>` to GHCR, plus convenience tags `prod` and `prod-migrate`.
3. Upload the runtime Compose file and deployment scripts using the `deploy` account with verified SSH host keys.
4. Authenticate to GHCR using the job's temporary token, run migrations and deployment, and remove registry credentials afterward.
5. Check the public pages, detail routes, 404 responses, CSS, and database health endpoint through HTTPS.

Configure the repository Actions Secret `PROD_SSH_KEY` with a dedicated Ed25519 private key whose public key is installed for the server's `deploy` account. Never use the SSH password as a permanent CI secret. `PROD_HOST` is an optional repository variable, defaulting to `ip.kiochan.one`. If the server's host key legitimately changes, verify it independently before updating `infrastructure/web/known_hosts`.

No personal access token is needed for GHCR. Publishing requires job-level `packages: write`; deployment uses `packages: read`. Private packages must grant this repository's Actions access. The shared PostgreSQL service, secrets, Nginx, and unrelated applications are not replaced by the release workflow.
