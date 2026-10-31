import Link from "next/link";
import { type Note, type Project, readingTime } from "@/content/site";
import { ProjectArt } from "./project-art";
import { ArrowIcon } from "./site-shell";

export function ProjectCard({
  project,
  index,
  heading = "h3",
}: {
  project: Project;
  index: number;
  heading?: "h2" | "h3";
}) {
  const Heading = heading;
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="project-card group block rounded-xl"
      data-reveal
      aria-labelledby={`project-${project.slug}`}
    >
      <article>
        <ProjectArt kind={project.artwork} />
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="eyebrow">
            {String(index + 1).padStart(2, "0")} / {project.category}
          </p>
          <ArrowIcon
            diagonal
            className="text-ink-muted transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </div>
        <Heading
          id={`project-${project.slug}`}
          className="mt-3 text-2xl font-medium tracking-tight group-hover:text-brand"
        >
          {project.name}
        </Heading>
        <p className="mt-3 max-w-lg text-sm leading-7 text-ink-muted">
          {project.summary}
        </p>
        <p className="mt-4 text-xs text-ink-muted">
          {project.stack.join(" / ")}
        </p>
      </article>
    </Link>
  );
}

export function NoteCard({
  note,
  heading = "h3",
}: {
  note: Note;
  heading?: "h2" | "h3";
}) {
  const Heading = heading;
  return (
    <article data-reveal className="border-t border-edge py-7">
      <p className="eyebrow">
        {note.category} <span aria-hidden="true">/</span> {readingTime(note)}{" "}
        min read
      </p>
      <Heading className="mt-3 text-xl font-medium leading-snug tracking-tight">
        <Link className="text-link" href={`/notes/${note.slug}`}>
          {note.title}
        </Link>
      </Heading>
      <p className="mt-3 max-w-xl text-sm leading-7 text-ink-muted">
        {note.summary}
      </p>
    </article>
  );
}
