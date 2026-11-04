import { Localized } from "@/components/language-provider";
import { ReleaseMarkdown } from "@/components/release-markdown";
import { MaterialIcon } from "@/components/ui/material-icon";
import { downloadUrl, type PublishedRelease } from "@/lib/releases/server";

export function ProjectReleases({
  releases,
}: {
  releases: PublishedRelease[];
}) {
  return (
    <section
      id="releases"
      className="mt-16 scroll-mt-10 border-t border-edge pt-10"
    >
      <h2 className="text-3xl font-medium tracking-tight">
        <Localized text="Release notes & downloads" />
      </h2>
      <p className="mt-4 text-sm text-ink-muted">
        <Localized text="Latest only, in each channel" />
      </p>
      {!releases.length && (
        <div className="mt-8 rounded-xl border border-edge bg-surface p-7">
          <h3 className="text-xl font-medium">
            <Localized text="Nothing published yet." />
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-muted">
            <Localized text="When a release is published, its latest downloads and installation notes will appear here. Production and development are kept separate." />
          </p>
        </div>
      )}
      <nav
        aria-label="Release channels"
        className="mt-9 flex flex-wrap gap-6 border-b border-edge pb-5 text-sm"
      >
        {releases.map((release) => (
          <a
            key={release.channel}
            href={`#${release.channel}`}
            className="text-brand text-link"
          >
            {release.channel === "prod" ? "Prod" : "Dev"} · v{" "}
            {release.metadata.version}{" "}
            <MaterialIcon
              name="south"
              className="inline-block size-4 align-[-0.15em]"
            />
          </a>
        ))}
      </nav>
      <div className="divide-y divide-edge">
        {releases.map((release) => (
          <article
            id={release.channel}
            key={release.channel}
            className="scroll-mt-10 py-12 sm:py-16"
          >
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-16">
              <div className="min-w-0">
                <p className="eyebrow">
                  <Localized
                    text={
                      release.channel === "prod"
                        ? "Prod channel"
                        : "Dev channel"
                    }
                  />
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <h3 className="text-3xl font-medium">
                    <Localized text="Version" /> {release.metadata.version}
                  </h3>
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted">
                    {release.metadata.status}
                  </span>
                </div>
                <p className="mt-4 text-xs leading-6 text-ink-muted">
                  <Localized text="Published" />{" "}
                  <time dateTime={release.metadata.publishedAt}>
                    {new Date(release.metadata.publishedAt).toLocaleDateString(
                      "en-GB",
                      { dateStyle: "long", timeZone: "UTC" },
                    )}
                  </time>{" "}
                  · build{" "}
                  <span className="font-mono">
                    {release.metadata.buildCommit.slice(0, 7)}
                  </span>
                </p>
                <div className="mt-9">
                  <ReleaseMarkdown release={release} />
                </div>
              </div>
              <aside className="self-start rounded-2xl border border-edge bg-surface p-6 sm:p-7">
                <h3 className="text-lg font-medium">
                  <Localized text="Latest download" />
                </h3>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  <Localized
                    text={
                      release.channel === "dev"
                        ? "A development build. Expect changes and unverified behavior."
                        : "The current published build. Read its verification notes before installing."
                    }
                  />
                </p>
                <div className="mt-6 space-y-6">
                  {release.metadata.downloads.map((file) => (
                    <div key={file.id}>
                      <a
                        href={downloadUrl(release, file)}
                        className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-brand px-4 py-3 text-sm font-medium text-on-brand"
                      >
                        {file.label}
                        <MaterialIcon name="download" />
                      </a>
                      <p className="mt-3 break-all font-mono text-xs leading-5 text-ink-muted">
                        {file.file} · {(file.bytes / 1048576).toFixed(1)} MB{" "}
                      </p>
                      <details className="mt-3 text-xs text-ink-muted">
                        <summary className="cursor-pointer text-link">
                          <Localized text="SHA256 checksum" />{" "}
                        </summary>
                        <code className="mt-2 block break-all leading-5">
                          {file.sha256}
                        </code>
                      </details>
                    </div>
                  ))}
                </div>
                <h4 className="mt-8 border-t border-edge pt-6 text-sm font-medium">
                  <Localized text="Compatibility targets" />{" "}
                </h4>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-muted">
                  {release.metadata.compatibility.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-6 text-xs leading-6 text-ink-muted">
                  <Localized text="Only the latest build is retained in this channel. This download address stays the same when a new build is published." />{" "}
                </p>
              </aside>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
