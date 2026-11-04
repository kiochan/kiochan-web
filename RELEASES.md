# Runtime release publishing

## Public addresses

- `/projects`: curated project profiles and validated published products in one catalogue.
- `/projects/<slug>`: project introduction plus the latest notes and downloads for both channels. No version history. Curated profiles can exist before their first published package.
- `/releases` redirects to `/projects`; `/releases/<slug>` redirects to the corresponding project page. Missing projects return 404. Existing download, metadata, and media addresses are unchanged.
- `/downloads/<slug>/dev/windows-x64` and `/downloads/<slug>/prod/windows-x64`: stable latest-package URLs; responses use `no-store`, attachment filenames, range requests and strong SHA256 ETags.
- `/api/releases/<slug>/<channel>`: current public metadata, Markdown and download URLs. This endpoint does not implement client auto-installation or package signing.
- `/release-assets/<slug>/<channel>/<revision>/screenshots/<file>`: reviewed PNG, JPEG or WebP screenshots from the current publication only. SVG, HTML and arbitrary files are not served.

The project catalogue, project detail pages, and sitemap read the mount at request time. Other editorial pages remain statically renderable. There is no database dependency, build-time release catalogue, revalidation webhook or in-memory content cache to invalidate.

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

## Tool CI publication

The public MIT-licensed repository `kiochan/photoshop-panel-tools` owns `panel-tools`. Its root `release.md` contains JSON front matter and Markdown; CI fills version, timestamp, commit identity, file sizes and SHA256. Reviewed screenshots belong in its `screenshots/` directory.

Successful dev/prod builds publish only the matching channel's latest Panel Tools package. The restricted Ed25519 key lives in that repository's RELEASE_SSH_KEY Actions Secret; only its public key is tracked here. The server pins the authenticated key to the repository and accepts only panel-tools bundles. Archive traversal, links, malformed metadata, invalid image signatures and mismatched ZIP hashes are rejected before the atomic catalogue switch.

The catalogue preserves unrelated products and channels. Cleanup removes only older publisher-owned versions after a successful switch. Normal publication requires no website rebuild or restart.

Bailey website pages and both channel packages have been withdrawn at the owner's request. Its old publication key is revoked and its repository/product are no longer accepted by the receiver; it distributes through private GitHub tag Releases instead. A missing runtime catalogue entry produces a 404 rather than a placeholder download page.

## Verification

Run `pnpm lint`, `pnpm typecheck`, `node --test scripts/releases.test.mjs`, and `pnpm build`. The release boundary checks use isolated temporary data: channel isolation, SHA mismatch rejection, archive traversal rejection, linked-file rejection, same-process content reload, latest-only cleanup, stable download URLs and safe range/resume behavior.

CI additionally mounts an isolated runtime directory into the already-built production container and runs `scripts/releases-smoke.mjs`. It publishes twice without rebuilding or restarting the container, checks SSR Markdown and screenshots, verifies latest downloads and metadata, and confirms old dev removal without removing prod. Fixture publication is restricted to a temporary mount and a loopback integration server. No fixture is copied into a production image or real release storage.


## Restricted producer identity

Provision the active public key with `setup.py --key <public-key-file> --repository kiochan/photoshop-panel-tools`. This replaces only that key's forced-command entry, preserving unrelated SSH access. Website deployment reprovisions only this active publisher. Never re-enable the retired producer or reconstruct withdrawn catalogue entries from source templates.
