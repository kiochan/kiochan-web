import type { Metadata } from "next";
import Link from "next/link";
import { FeaturedProject } from "@/components/featured-project";
import { Localized } from "@/components/language-provider";
import { ArrowIcon, ContactInvitation } from "@/components/site-shell";
import { MaterialIcon } from "@/components/ui/material-icon";
import { colorPicker, profile, runActions } from "@/content/site";

import { listReleaseGroups } from "@/lib/releases/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Projects",
  description:
    "Panel Tools for Photoshop, runnable experiments, and public source code.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const groups = await listReleaseGroups();
  return (
    <>
      <section className="site-container section-space">
        <p className="eyebrow">
          <Localized text="The work" />
        </p>
        <h1 className="mt-5 text-5xl font-medium tracking-tight sm:text-6xl">
          <Localized text="Tools to use. Ideas to explore." />
        </h1>
        <p className="mt-6 max-w-xl leading-8 text-ink-muted">
          <Localized text="Read the source, try an experiment, or explore Panel Tools for Photoshop." />{" "}
        </p>
        <div className="mt-12">
          <FeaturedProject />
          {[colorPicker, runActions].map((project) => (
            <article
              key={project.slug}
              className="mt-6 rounded-2xl border border-edge bg-surface p-7 sm:p-10"
            >
              <h2 className="text-3xl font-medium tracking-tight">
                <Link
                  href={`/projects/${project.slug}`}
                  prefetch={false}
                  className="text-link"
                >
                  {project.name}
                </Link>
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-ink-muted">
                <Localized text={project.summary} />
              </p>
              <Link
                href={`/projects/${project.slug}`}
                prefetch={false}
                className="mt-7 inline-flex items-center gap-3 text-sm text-brand text-link"
              >
                <Localized text="View project" /> <ArrowIcon />
              </Link>
            </article>
          ))}
          {groups
            .filter(
              ({ slug }) =>
                slug !== colorPicker.slug && slug !== runActions.slug,
            )
            .map(({ slug, releases }) =>
              slug === "panel-tools" ? (
                <div key={slug} className="mt-4 flex flex-wrap gap-3">
                  {releases.map((release) => (
                    <Link
                      key={release.channel}
                      href={`/projects/${slug}#${release.channel}`}
                      prefetch={false}
                      className="rounded-full border border-edge px-4 py-2 text-sm text-brand text-link"
                    >
                      {release.channel === "prod" ? "Prod" : "Dev"} · v
                      {release.metadata.version}
                    </Link>
                  ))}
                </div>
              ) : (
                <article
                  key={slug}
                  className="mt-6 rounded-2xl border border-edge bg-surface p-7 sm:p-10"
                >
                  <h2 className="text-3xl font-medium tracking-tight">
                    <Link
                      href={`/projects/${slug}`}
                      prefetch={false}
                      className="text-link"
                    >
                      {releases[0].metadata.title}
                    </Link>
                  </h2>
                  <p className="mt-5 max-w-2xl leading-8 text-ink-muted">
                    {releases[0].metadata.summary}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 text-xs text-ink-muted">
                    {releases.map((release) => (
                      <span
                        key={release.channel}
                        className="rounded-full border border-edge px-3 py-1.5"
                      >
                        {release.channel === "prod" ? "Prod" : "Dev"} · v
                        {release.metadata.version}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/projects/${slug}`}
                    prefetch={false}
                    className="mt-7 inline-flex items-center gap-3 text-sm text-brand text-link"
                  >
                    <Localized text="View project" /> <ArrowIcon />
                  </Link>
                </article>
              ),
            )}
        </div>
        <div className="mt-12 border-y border-edge py-9">
          <a
            href={profile.source}
            className="inline-flex items-center gap-4 text-xl font-medium text-brand text-link"
          >
            <Localized text="Source on GitHub" /> <ArrowIcon diagonal />
          </a>
          <p className="mt-4 text-sm leading-7 text-ink-muted">
            <Localized text="The source for this website is available on GitHub." />
          </p>
        </div>
        <p className="mt-14 border-t border-edge pt-7 text-sm text-ink-muted">
          <a
            href={`${profile.github}?tab=repositories`}
            className="text-brand text-link"
          >
            <Localized text="Browse public repositories" />{" "}
            <MaterialIcon
              name="north_east"
              className="inline-block size-4 align-[-0.15em]"
            />{" "}
          </a>
        </p>
      </section>
      <ContactInvitation />
    </>
  );
}
