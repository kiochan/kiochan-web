import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReleaseMarkdown } from "@/components/release-markdown";
import { ArrowIcon } from "@/components/site-shell";
import {
  channels,
  downloadUrl,
  readPublishedRelease,
} from "@/lib/releases/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Props = { params: Promise<{ slug: string }> };

async function releasesFor(slug: string) {
  const values = await Promise.all(
    channels.map((channel) => readPublishedRelease(slug, channel)),
  );
  return values.filter((value) => value !== null);
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = (await releasesFor(slug))[0];
  if (!release) notFound();
  return {
    title: release.metadata.title,
    description: release.metadata.summary,
    alternates: { canonical: `/releases/${slug}` },
  };
}
export default async function ReleasePage({ params }: Props) {
  const { slug } = await params;
  const releases = await releasesFor(slug);
  if (!releases.length) notFound();
  const primary = releases[0].metadata;
  return (
    <section className="site-container section-space">
      <Link
        href="/releases"
        prefetch={false}
        className="inline-flex items-center gap-2 text-sm text-ink-muted text-link"
      >
        ← All releases
      </Link>
      <div className="mt-10 max-w-3xl">
        <p className="eyebrow">The latest, in two channels</p>
        <h1 className="mt-5 text-4xl font-medium tracking-tight sm:text-6xl">
          {primary.title}
          <span className="text-brand">.</span>
        </h1>
        <p className="mt-7 text-lg leading-8 text-ink-muted">
          {primary.summary}
        </p>
      </div>
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
            {release.channel === "prod" ? "Prod" : "Dev"} · v
            {release.metadata.version} ↓
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
                  {release.channel === "prod" ? "Prod channel" : "Dev channel"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <h2 className="text-3xl font-medium">
                    Version {release.metadata.version}
                  </h2>
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted">
                    {release.metadata.status}
                  </span>
                </div>
                <p className="mt-4 text-xs leading-6 text-ink-muted">
                  Published{" "}
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
                <h3 className="text-lg font-medium">Latest download</h3>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  {release.channel === "dev"
                    ? "A development build. Expect changes and unverified behavior."
                    : "The current published build. Read its verification notes before installing."}
                </p>
                <div className="mt-6 space-y-6">
                  {release.metadata.downloads.map((file) => (
                    <div key={file.id}>
                      <a
                        href={downloadUrl(release, file)}
                        className="inline-flex w-full items-center justify-between gap-3 rounded-lg bg-brand px-4 py-3 text-sm font-medium text-on-brand"
                      >
                        {file.label}
                        <ArrowIcon />
                      </a>
                      <p className="mt-3 break-all font-mono text-xs leading-5 text-ink-muted">
                        {file.file} · {(file.bytes / 1048576).toFixed(1)} MB
                      </p>
                      <details className="mt-3 text-xs text-ink-muted">
                        <summary className="cursor-pointer text-link">
                          SHA256 checksum
                        </summary>
                        <code className="mt-2 block break-all leading-5">
                          {file.sha256}
                        </code>
                      </details>
                    </div>
                  ))}
                </div>
                <h4 className="mt-8 border-t border-edge pt-6 text-sm font-medium">
                  Compatibility targets
                </h4>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-muted">
                  {release.metadata.compatibility.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-6 text-xs leading-6 text-ink-muted">
                  Only the latest build is retained in this channel. This
                  download address stays the same when a new build is published.
                </p>
              </aside>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
