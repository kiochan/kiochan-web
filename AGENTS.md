# Project instructions

## Language and scope

- Use English for code, comments, documentation, UI copy, and commit messages.
- The first release is a Hello World website. Do not add speculative product features.
- Do not deploy, push commits, or change production infrastructure without user authorization.

## Architecture

- Use pnpm workspaces without Nx. Turborepo is not required.
- `apps/web` is the Next.js App Router application using React and TypeScript.
- `packages/database` contains server-side PostgreSQL access through `pg`.
- Keep dependencies in the package that uses them. Applications may use different dependency versions.
- Future Vue or Angular applications belong in separate workspace packages. Choose integration when a concrete requirement exists.
- Prefer Server Components. Add client components only when interaction requires them.
- Keep the home page independent of database availability. Never query PostgreSQL while building the static home page.

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

## Deployment

- Follow the existing Sovia pattern: independent PostgreSQL and website Compose projects, Nginx in front, persistent database storage.
- The website's proposed host port is `127.0.0.1:4095`; verify availability before deployment.
- Use the standalone Next.js production output and a non-root container user.
- Prefer building images in CI rather than on the 2-vCPU, 4-GB production server.
- CI currently validates and builds only. It must not deploy automatically.
- Production deployments use the `deploy` Linux account. Runtime files live in `/opt/kiochan-web`; shared database infrastructure lives in `/opt/kiochan-postgres`.
- `/opt/kiochan-web/env/prod.env` selects the website image and database URL. `/opt/kiochan-postgres/.env` holds administrator and website database passwords. Both must be mode 600 and must never be printed.
- Run `/opt/kiochan-web/deploy.sh` to replace the website with health checks and image rollback. It must never recreate or remove the shared PostgreSQL volume.
- `/opt/kiochan-postgres/backup.sh` creates a private full-cluster logical backup, including roles. Keep backups private and copy them off the server before relying on them for disaster recovery.
- Preserve Sovia, Connectric, Hitekcircuits, existing databases, and unrelated services.
