import type { Metadata } from "next";
import { ProjectCard } from "@/components/content-cards";
import { ContactInvitation } from "@/components/site-shell";
import { profile, projects } from "@/content/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A small collection of web projects and practical experiments by Kiochan.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <section className="site-container section-space">
        <p className="eyebrow">The work</p>
        <h1 className="mt-5 text-5xl font-medium tracking-tight sm:text-6xl">
          Projects & experiments<span className="text-brand">.</span>
        </h1>
        <p className="mt-6 max-w-xl leading-8 text-ink-muted">
          A curated look at things I’ve built and explored. Each project has a
          little context and a path to the source.
        </p>
        <div className="mt-14 grid gap-x-12 gap-y-16 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              heading="h2"
            />
          ))}
        </div>
        <p className="mt-14 border-t border-edge pt-7 text-sm text-ink-muted">
          There’s more in the archive.{" "}
          <a
            href={`${profile.github}?tab=repositories`}
            className="text-brand text-link"
          >
            Browse public repositories ↗
          </a>
        </p>
      </section>
      <ContactInvitation />
    </>
  );
}
