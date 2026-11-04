import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Localized } from "@/components/language-provider";
import { ProjectReleases } from "@/components/project-releases";
import { ArrowIcon } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { readProject } from "@/lib/projects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await readProject(slug);
  if (!project) notFound();
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/projects/${slug}` },
  };
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await readProject(slug);
  if (!project) notFound();
  const { editorial, releases } = project;
  return (
    <div className="site-container section-space">
      <Link
        href="/projects"
        prefetch={false}
        className="text-sm text-ink-muted text-link"
      >
        <MaterialIcon
          name="arrow_back"
          className="inline-block size-4 align-[-0.15em]"
        />{" "}
        <Localized text="All projects" />
      </Link>
      <article>
        <header className="mt-10 max-w-3xl">
          <p className="eyebrow">
            <Localized text={editorial?.category ?? "Software release"} />
          </p>
          <h1 className="mt-5 text-5xl font-medium tracking-tight sm:text-6xl">
            {project.name}
            <span className="text-brand">.</span>
          </h1>
          <p className="mt-7 text-lg leading-8 text-ink-muted">
            {editorial ? <Localized text={project.summary} /> : project.summary}
          </p>
          {editorial && (
            <p className="mt-5 font-mono text-sm text-ink-muted">
              {editorial.stack.join(" / ")}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href="#releases">
                <Localized text="Release notes & downloads" /> <ArrowIcon />
              </a>
            </Button>
            {editorial && (
              <Button asChild variant="outline">
                <a href={editorial.repository}>
                  <Localized text="Source on GitHub" /> <ArrowIcon diagonal />
                </a>
              </Button>
            )}
          </div>
        </header>
        {editorial && (
          <>
            <aside className="mt-10 rounded-xl border border-edge bg-surface-muted p-6">
              <p className="text-sm font-medium">
                <Localized text={editorial.status} />
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-muted">
                <Localized text={editorial.compatibility} />
              </p>
            </aside>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {editorial.features.map((feature) => (
                <section
                  key={feature.title}
                  className="border-t border-edge pt-6"
                >
                  <h2 className="text-xl font-medium">
                    <Localized text={feature.title} />
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-ink-muted">
                    <Localized text={feature.text} />
                  </p>
                </section>
              ))}
            </div>
          </>
        )}
      </article>
      <ProjectReleases releases={releases} />
    </div>
  );
}
