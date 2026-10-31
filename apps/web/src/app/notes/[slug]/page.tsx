import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { notes, readingTime } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return notes.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = notes.find((n) => n.slug === slug);
  return note
    ? {
        title: note.title,
        description: note.summary,
        alternates: { canonical: `/notes/${slug}` },
      }
    : { title: "Note not found" };
}
export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = notes.find((n) => n.slug === slug);
  if (!note) notFound();
  return (
    <article className="site-container section-space">
      <Link href="/notes" className="text-sm text-ink-muted text-link">
        ← All notes
      </Link>
      <header className="mt-10 max-w-3xl">
        <p className="eyebrow">
          {note.category} / {readingTime(note)} min read
        </p>
        <h1 className="mt-5 text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
          {note.title}
        </h1>
        <p className="mt-7 text-lg leading-8 text-ink-muted">
          {note.introduction}
        </p>
      </header>
      <div className="mt-10 grid gap-10 border-t border-edge pt-6 lg:grid-cols-[1fr_15rem] lg:gap-20">
        <div className="article-copy max-w-2xl">
          {note.sections.map((section, index) => (
            <section id={`section-${index}`} key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <div className="mt-12 border-t border-edge pt-8">
            <Link
              href="/projects/kiochan-web"
              className="text-sm text-brand text-link"
            >
              See these ideas in this website’s project →
            </Link>
          </div>
        </div>
        <nav
          aria-label="In this note"
          className="order-first self-start pt-6 lg:order-none lg:sticky lg:top-28"
        >
          <p className="eyebrow">In this note</p>
          <ol className="mt-5 space-y-4 text-sm leading-6 text-ink-muted">
            {note.sections.map((section, index) => (
              <li key={section.heading}>
                <a href={`#section-${index}`} className="text-link">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </article>
  );
}
