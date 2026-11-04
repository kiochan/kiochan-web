import type { Metadata } from "next";
import { Localized } from "@/components/language-provider";
import { ArrowIcon } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { profile } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Find Kiochan on GitHub or LinkedIn, or start a conversation about a project.",
  alternates: { canonical: "/contact" },
};
export default function ContactPage() {
  return (
    <section className="site-container section-space">
      <p className="eyebrow">
        <Localized text="Say hello" />
      </p>
      <h1 className="mt-5 text-5xl font-medium tracking-tight sm:text-6xl">
        <Localized text="Good things start" /> <br />
        <Localized text="with a conversation" />
        <span className="text-brand">.</span>
      </h1>
      <p className="mt-7 max-w-xl leading-8 text-ink-muted">
        <Localized text="Have a question, spotted a bug, or want to share an idea? You can find me on GitHub or LinkedIn. For something project-specific, its issue tracker is the best place to start." />{" "}
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button asChild className="h-11 gap-5 px-5">
          <a href={profile.github}>
            <Localized text="Kiochan on GitHub" /> <ArrowIcon diagonal />
          </a>
        </Button>
        <Button asChild variant="outline" className="h-11 gap-5 px-5">
          <a href={profile.linkedin}>
            <Localized text="Connect on LinkedIn" /> <ArrowIcon diagonal />
          </a>
        </Button>
      </div>
      <div className="mt-16 grid gap-10 border-t border-edge pt-10 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <h2 className="text-xl font-medium">
            <Localized text="Start with a project." />
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-7 text-ink-muted">
            <Localized text="A little context makes it easier to have a useful conversation. Include the project, what you tried, and what you expected." />{" "}
          </p>
        </div>
        <div>
          <a
            href={`${profile.source}/issues`}
            className="group flex items-center justify-between gap-6 border-b border-edge py-6 first:pt-0"
          >
            <div>
              <h3 className="font-medium group-hover:text-brand">
                <Localized text="Website issues" />
              </h3>
              <p className="mt-2 text-sm text-ink-muted">
                <Localized text="Questions, ideas, and issue reports" />{" "}
              </p>
            </div>
            <ArrowIcon diagonal className="text-brand" />
          </a>
        </div>
      </div>
    </section>
  );
}
