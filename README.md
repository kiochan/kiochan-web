# Kiochan

A personal website built with Next.js, React, TypeScript, and Biome in a pnpm monorepo. The first release contains a Hello World page.

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
packages/database/         Server-side PostgreSQL connection pool
infrastructure/postgres/   Independent shared PostgreSQL service
infrastructure/web/        Website container configuration
```

Each package declares its own dependencies. Framework versions do not need to match across future applications. No Nx or generators are required.

## Quality checks

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm format
```

After building, `pnpm start` runs the standalone production server with its static assets. It also reads `apps/web/.env.local` when present.

Biome handles both linting and formatting. CI runs the checks, builds a production container, and verifies the page, PostgreSQL connection, and restricted database role in isolated runner containers. It does not publish or deploy anything.

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
5. Open http://localhost:3000/api/health/database to verify connectivity.

Host tools connect to `127.0.0.1:5434`. Containers attached to `kiochan-data` connect to `kiochan-postgres:5432`. The administrator is `kiochan_admin`; the website never uses that role.

`pnpm db:stop` stops PostgreSQL without deleting its volume. Initialization runs only on an empty volume. Editing `.env` after initialization does not rotate existing PostgreSQL passwords. Apply later schema or credential changes explicitly; never delete shared data to rerun initialization.

## Production container preparation

No production deployment is enabled. The following commands are for an explicitly authorized deployment or local container verification:

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
