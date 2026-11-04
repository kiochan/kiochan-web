import type { Metadata } from "next";
import { Localized } from "@/components/language-provider";
import { ArrowIcon, ContactInvitation } from "@/components/site-shell";
import { MaterialIcon } from "@/components/ui/material-icon";
import { about, profile } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: about.introduction,
  alternates: { canonical: "/about" },
};
export default function AboutPage() {
  return (
    <>
      <section className="site-container section-space">
        <header className="max-w-3xl">
          <p className="eyebrow">
            <Localized text="Skills in practice" />
          </p>
          <h1 className="mt-5 text-5xl font-medium tracking-tight sm:text-6xl">
            <Localized text="Hello, I’m Kiochan" />
            <span className="text-brand">.</span>
          </h1>
          <div className="article-copy mt-8">
            <p>
              <Localized text={about.introduction} />
            </p>
            <p>
              <Localized text={about.perspective} />
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-brand">
            <a href={profile.github} className="text-link">
              <Localized text="Find me on GitHub" />{" "}
              <MaterialIcon
                name="north_east"
                className="inline-block size-4 align-[-0.15em]"
              />
            </a>
            <a href={profile.linkedin} className="text-link">
              <Localized text="Connect on LinkedIn" />{" "}
              <MaterialIcon
                name="north_east"
                className="inline-block size-4 align-[-0.15em]"
              />
            </a>
          </div>
        </header>
        <h2 className="mt-16 text-2xl font-medium tracking-tight">
          <Localized text="Grounded in public code" />
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {about.skills.map((skill) => (
            <section
              key={skill.title}
              className="flex flex-col rounded-2xl border border-edge bg-surface p-7 sm:p-8"
            >
              <h3 className="text-xl font-medium">
                <Localized text={skill.title} />
              </h3>
              <p className="mt-4 flex-1 text-sm leading-7 text-ink-muted">
                <Localized text={skill.text} />
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technology">
                {skill.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-surface-muted px-3 py-1.5 text-xs text-ink-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <a
                href={skill.url}
                className="mt-6 inline-flex items-center gap-3 text-sm text-brand text-link"
              >
                <Localized text="View the code" /> · {skill.evidence}{" "}
                <ArrowIcon diagonal />
              </a>
            </section>
          ))}
        </div>
        <aside className="mt-10 max-w-3xl border-t border-edge pt-7">
          <h2 className="text-sm font-medium">
            <Localized text="Origins & attribution" />
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            <Localized text={about.attribution} />
          </p>
          <a
            href={about.attributionUrl}
            className="mt-4 inline-block text-sm text-brand text-link"
          >
            Lattice Generator{" "}
            <MaterialIcon
              name="north_east"
              className="inline-block size-4 align-[-0.15em]"
            />
          </a>
        </aside>
      </section>
      <ContactInvitation />
    </>
  );
}
