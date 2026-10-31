import Link from "next/link";
import { NoteCard, ProjectCard } from "@/components/content-cards";
import { ArrowIcon, ContactInvitation } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { notes, projects } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <section className="site-container grid gap-14 py-16 sm:py-24 lg:grid-cols-[1.5fr_0.7fr] lg:items-center lg:gap-20">
        <div>
          <p className="eyebrow">A personal corner of the internet</p>
          <h1 className="mt-7 max-w-3xl text-[clamp(3.5rem,7vw,6.6rem)] leading-[1.02] font-medium tracking-[-0.065em]">
            Curiosity,
            <br />
            turned into{" "}
            <span className="font-serif font-normal italic text-brand">
              code.
            </span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-8 text-ink-muted">
            Hi, I’m Kiochan. I build things for the web, explore practical
            ideas, and keep notes along the way.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild className="h-11 gap-5 px-5">
              <Link href="/lab">
                Explore the lab <ArrowIcon />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-5">
              <Link href="/about">A little about me</Link>
            </Button>
          </div>
        </div>
        <aside aria-label="On the workbench" className="max-w-sm">
          <div className="flex aspect-square items-center justify-center rounded-[3rem_0.75rem_3rem_0.75rem] border border-edge bg-surface-muted">
            <div className="relative flex size-48 items-center justify-center rounded-full border border-brand/25 text-brand">
              <span
                className="font-serif text-[8rem] leading-none italic"
                aria-hidden="true"
              >
                k.
              </span>
              <span className="absolute -right-2 top-6 flex size-10 items-center justify-center rounded-full border border-edge bg-canvas">
                <ArrowIcon diagonal />
              </span>
            </div>
          </div>
          <div className="mt-5 flex justify-between gap-3 text-xs text-ink-muted">
            <span>On the workbench</span>
            <Link href="/projects/kiochan-web" className="text-link">
              This little website ↗
            </Link>
          </div>
        </aside>
      </section>

      <section className="site-container section-space border-t border-edge">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">01 / Selected work</p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Things I’ve been making.
            </h2>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-3 text-sm text-link"
          >
            All projects <ArrowIcon />
          </Link>
        </div>
        <div className="grid gap-12 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="border-y border-edge bg-surface-muted/45">
        <div className="site-container section-space grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <p className="eyebrow">A few guiding principles</p>
          <div>
            <h2 className="max-w-2xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
              Useful over complicated.
              <br />
              <span className="text-brand">Room to keep exploring.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-ink-muted">
              Clear interfaces, small boundaries, and tools that earn their
              place. This site is a place to put those ideas into practice.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-3 text-sm text-brand text-link"
            >
              More about this space <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="site-container section-space">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">02 / From the notebook</p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Notes on the process.
            </h2>
          </div>
          <Link
            href="/notes"
            className="inline-flex items-center gap-3 text-sm text-link"
          >
            All notes <ArrowIcon />
          </Link>
        </div>
        <div className="grid gap-x-12 md:grid-cols-2">
          {notes.map((note) => (
            <NoteCard key={note.slug} note={note} />
          ))}
        </div>
      </section>
      <ContactInvitation />
    </>
  );
}
