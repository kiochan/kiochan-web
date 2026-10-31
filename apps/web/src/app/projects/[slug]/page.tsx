import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectArt } from "@/components/project-art";
import { ArrowIcon } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { projects } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return project
    ? {
        title: project.name,
        description: project.summary,
        alternates: { canonical: `/projects/${slug}` },
      }
    : { title: "Project not found" };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <article className="site-container section-space">
      <Link href="/projects" className="text-sm text-ink-muted text-link">
        ← All projects
      </Link>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_0.7fr]">
        <div>
          <p className="eyebrow">
            {project.category} / {project.status}
          </p>
          <h1 className="mt-5 text-5xl font-medium tracking-tight sm:text-6xl">
            {project.name}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-ink-muted">
            {project.title}
          </p>
        </div>
        <div className="flex flex-col items-start justify-end gap-5">
          <p className="text-sm leading-7 text-ink-muted">
            {project.stack.join(" / ")}
          </p>
          <Button asChild>
            <a href={project.repository}>
              Explore the source <ArrowIcon diagonal />
            </a>
          </Button>
        </div>
      </div>
      <div className="mt-12">
        <ProjectArt kind={project.artwork} />
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
        <h2 className="text-sm font-medium">A closer look</h2>
        <div className="article-copy max-w-2xl">
          <p className="!mt-0">{project.overview}</p>
          {project.details.map((detail) => (
            <section key={detail.title}>
              <h2>{detail.title}</h2>
              <p>{detail.text}</p>
            </section>
          ))}
          <div className="mt-12 border-t border-edge pt-8">
            <a
              href={`${project.repository}/issues`}
              className="inline-flex items-center gap-3 text-sm text-brand text-link"
            >
              Questions about this project? <ArrowIcon diagonal />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
