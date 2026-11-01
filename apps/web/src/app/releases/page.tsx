import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/site-shell";
import { listReleaseGroups } from "@/lib/releases/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Releases",
  description:
    "The latest downloads and release notes from Kiochan, with separate production and development channels.",
  alternates: { canonical: "/releases" },
};

export default async function ReleasesPage() {
  const groups = await listReleaseGroups();
  return (
    <section className="site-container section-space">
      <div className="max-w-3xl">
        <p className="eyebrow">Built to be used</p>
        <h1 className="mt-5 text-5xl font-medium tracking-tight sm:text-6xl">
          Fresh builds<span className="text-brand">.</span>
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-ink-muted">
          Downloads, release notes, and the details worth reading before you
          install.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-3 text-xs text-ink-muted">
        <span className="rounded-full border border-edge px-4 py-2">
          Prod · publication channel
        </span>
        <span className="rounded-full border border-edge px-4 py-2">
          Dev · development builds
        </span>
        <span className="rounded-full bg-surface-muted px-4 py-2">
          Latest only, in each channel
        </span>
      </div>
      {groups.length ? (
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {groups.map(({ slug, releases }) => {
            const primary = releases[0].metadata;
            return (
              <article
                key={slug}
                className="flex flex-col rounded-2xl border border-edge bg-surface p-7 sm:p-9"
              >
                <p className="eyebrow">Software release</p>
                <h2 className="mt-4 text-3xl font-medium tracking-tight">
                  <Link
                    href={`/releases/${slug}`}
                    prefetch={false}
                    className="text-link"
                  >
                    {primary.title}
                  </Link>
                </h2>
                <p className="mt-5 flex-1 leading-7 text-ink-muted">
                  {primary.summary}
                </p>
                <div className="mt-8 divide-y divide-edge border-y border-edge">
                  {releases.map((release) => (
                    <div
                      key={release.channel}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <span className="text-sm font-medium">
                        {release.channel === "prod" ? "Prod" : "Dev"}{" "}
                        <span className="ml-2 text-xs font-normal text-ink-muted">
                          {release.metadata.status}
                        </span>
                      </span>
                      <span className="font-mono text-sm text-ink-muted">
                        v{release.metadata.version}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/releases/${slug}`}
                  prefetch={false}
                  className="mt-7 inline-flex items-center justify-between gap-4 text-sm font-medium text-brand text-link"
                >
                  Release notes & downloads <ArrowIcon />
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-14 rounded-2xl border border-edge bg-surface p-9 sm:p-12">
          <h2 className="text-2xl font-medium">Nothing published yet.</h2>
          <p className="mt-4 max-w-xl leading-7 text-ink-muted">
            When a release is published, its latest downloads and installation
            notes will appear here. Production and development are kept
            separate.
          </p>
          <Link
            href="/projects"
            className="mt-7 inline-flex items-center gap-3 text-sm text-brand text-link"
          >
            Explore the projects <ArrowIcon />
          </Link>
        </div>
      )}
      <p className="mt-10 max-w-2xl text-sm leading-7 text-ink-muted">
        A successful build is not the same as runtime compatibility. Check the
        release notes for supported targets, verification status, and known
        limitations.
      </p>
    </section>
  );
}
