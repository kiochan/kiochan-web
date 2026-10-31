import type { Metadata } from "next";
import { NoteCard } from "@/components/content-cards";
import { ContactInvitation } from "@/components/site-shell";
import { notes } from "@/content/site";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Notes on web development, design systems, and the decisions behind Kiochan's projects.",
  alternates: { canonical: "/notes" },
};
export default function NotesPage() {
  return (
    <>
      <section className="site-container section-space">
        <p className="eyebrow">The notebook</p>
        <h1 className="mt-5 text-5xl font-medium tracking-tight sm:text-6xl">
          Thinking out loud<span className="text-brand">.</span>
        </h1>
        <p className="mt-6 max-w-xl leading-8 text-ink-muted">
          Short notes on design decisions, useful boundaries, and the process of
          making things for the web.
        </p>
        <div className="mt-12 max-w-3xl">
          {notes.map((note) => (
            <NoteCard key={note.slug} note={note} heading="h2" />
          ))}
        </div>
      </section>
      <ContactInvitation />
    </>
  );
}
