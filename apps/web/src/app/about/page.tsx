import type { Metadata } from "next";
import Link from "next/link";
import { ContactInvitation } from "@/components/site-shell";
import { profile } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "A little about Kiochan and this personal space for code, projects, and ideas.",
  alternates: { canonical: "/about" },
};
export default function AboutPage() {
  return (
    <>
      <section className="site-container section-space">
        <p className="eyebrow">Behind the projects</p>
        <div className="mt-5 grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-20">
          <div>
            <h1 className="text-5xl font-medium tracking-tight sm:text-6xl">
              Hello, I’m Kiochan<span className="text-brand">.</span>
            </h1>
            <div className="article-copy mt-8 max-w-2xl">
              <p>
                This is where I collect what I’m building and write down the
                ideas worth keeping.
              </p>
              <p>
                My interests meet around web development, practical tools, and
                making software easier to live with. Some projects start with a
                useful problem; others start with a simple question: what
                happens if I try this?
              </p>
              <p>
                Think of this space as a working notebook. Projects have
                context, notes describe actual decisions, and there is always
                room for the next experiment.
              </p>
            </div>
            <a
              href={profile.github}
              className="mt-8 inline-block text-sm text-brand text-link"
            >
              Find me on GitHub ↗
            </a>
          </div>
          <aside className="rounded-2xl border border-edge bg-surface-muted p-7">
            <p className="eyebrow">About this space</p>
            <h2 className="mt-5 text-xl font-medium">
              Small pieces. Clear boundaries.
            </h2>
            <ul className="mt-6 space-y-5 text-sm leading-7 text-ink-muted">
              <li>A shared palette, independent of the UI library.</li>
              <li>Public pages that do not need a database to render.</li>
              <li>
                A remembered theme preference, with system mode by default.
              </li>
              <li>Versioned releases, with checks before deployment.</li>
            </ul>
            <Link
              href="/projects/kiochan-web"
              className="mt-7 inline-block text-sm text-brand text-link"
            >
              Explore the site project →
            </Link>
          </aside>
        </div>
      </section>
      <ContactInvitation />
    </>
  );
}
