# Runtime release publishing

## Public addresses

- `/releases`: published software, with separate production and development channels.
- `/releases/<slug>`: the latest notes and downloads for both channels. No version history.
- `/downloads/<slug>/dev/windows-x64` and `/downloads/<slug>/prod/windows-x64`: stable latest-package URLs; responses use `no-store`, attachment filenames, range requests and strong SHA256 ETags.
- `/api/releases/<slug>/<channel>`: current public metadata, Markdown and download URLs. This endpoint does not implement client auto-installation or package signing.
- `/release-assets/<slug>/<channel>/<revision>/screenshots/<file>`: reviewed PNG, JPEG or WebP screenshots from the current publication only. SVG, HTML and arbitrary files are not served.

The release pages and sitemap read the mount at request time. Other editorial pages remain statically renderable. There is no database dependency, build-time release catalogue, revalidation webhook or in-memory content cache to invalidate.

## Persistent storage

```text
/opt/kiochan-web/releases-data/
  channels/
    dev/
      catalog.json
      products/panel-tools/versions/<publication-id>/
        release.md
        downloads/panel-tools-0.1.0.zip
        screenshots/overview.png
    prod/
      catalog.json
      products/...
```

Compose mounts this directory read-only at `/releases` and sets `RELEASES_ROOT=/releases`. The default mount is prepared by the website deployment workflow. Files are public release material and readable by the non-root website container; publication keys, database credentials and source archives do not belong here. Local development can set `RELEASES_ROOT` to an isolated local directory. `.releases/` is ignored by Git and Docker.

## Markdown format

`release.md` starts with JSON between `---` delimiters, followed by ordinary Markdown. JSON front matter is deliberately used instead of executable templates or permissive YAML engines.

```markdown
---

{
"slug": "panel-tools",
"title": "Panel Tools",
"summary": "A Photoshop panel tool.",
"version": "0.1.0",
"publishedAt": "2026-11-01T00:00:00Z",
"buildCommit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
"status": "trial",
"compatibility": ["Windows x64", "Photoshop 2019+ target; runtime unverified"],
"downloads": [{
    "id": "windows-x64", "file": "panel-tools-0.1.0.zip",
    "label": "Download for Windows x64", "bytes": 123,
    "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }]
}
---

## Changes

Describe what changed and what has actually been verified.

![Workspace overview](screenshots/overview.png)
```

The sizes, digests and commit above are format examples, not a downloadable release. Real metadata is generated from checked build packages. `status` is `trial`, `experimental` or `stable`; a `prod` publication does not by itself mean runtime compatibility is certified.

Put reviewed raster screenshots beside the document under `screenshots/`. Keep screenshot text free of chat identities, private documents, credentials and personal paths. Markdown raw HTML is skipped and external images are not fetched. The document limit is 256 KiB, each screenshot is at most 8 MiB, and at most 32 screenshots are accepted.

## Plugin CI publication

The private plugin repository maintains `.github/releases/panel-tools.md` and `.github/releases/bailey-workspace.md`. The notes contain human-written front matter and Markdown; CI fills version, timestamp, build identity, file sizes and SHA256 values. Add approved images to `.github/releases/<slug>/screenshots/` and reference them from the notes.

After each successful `dev` or `prod` push build, the CI publication job downloads that run's artifacts, prepares `bundle.json` plus `products/<slug>/release.md`, packages and screenshots, and sends one bounded tar.gz stream over pinned-host SSH. The private key is a repository Secret, never website source, client JavaScript, logs or the bundle.

The dedicated SSH key is installed with `restrict` and a forced receiver command. Only `publish dev <sha>-<run>-<attempt>` or the corresponding `prod` command is accepted. The receiver accepts only the two approved plugin product IDs, validates metadata, raster signatures and package hashes, then atomically replaces a whole channel catalogue. A failed upload never switches the catalogue. Old version removal only touches managed directories with matching ownership markers after the switch; the opposite channel and unrelated products remain intact. If interrupted after promotion but before the catalogue switch, a later successful publication cleans the unreachable managed revision.

Only current revision directories are retained. Updating notes or screenshots through another valid publication does not require rebuilding the website. Direct operator edits should use an atomic temporary-file replacement and preserve the metadata contract; do not edit or replace ZIP files in an active revision in place.

## Verification

Run `pnpm lint`, `pnpm typecheck`, `node --test scripts/releases.test.mjs`, and `pnpm build`. The release boundary checks use isolated temporary data: channel isolation, SHA mismatch rejection, archive traversal rejection, linked-file rejection, same-process content reload, latest-only cleanup, stable download URLs and safe range/resume behavior.

CI additionally mounts an isolated runtime directory into the already-built production container and runs `scripts/releases-smoke.mjs`. It publishes twice without rebuilding or restarting the container, checks SSR Markdown and screenshots, verifies latest downloads and metadata, and confirms old dev removal without removing prod. Fixture publication is restricted to a temporary mount and a loopback integration server. No fixture is copied into a production image or real release storage.
