import Link from "next/link";
import { panelTools } from "@/content/site";
import { Localized } from "./language-provider";
import { ArrowIcon } from "./site-shell";
import { Button } from "./ui/button";

export function FeaturedProject() {
  return (
    <article className="rounded-2xl border border-edge bg-surface p-7 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow">
          <Localized text="Selected project" />
        </p>
        <span className="rounded-full bg-surface-muted px-3 py-1.5 text-xs text-ink-muted">
          <Localized text={panelTools.status} />
        </span>
      </div>
      <h2 className="mt-6 text-3xl font-medium tracking-tight sm:text-4xl">
        <Link
          href="/projects/panel-tools"
          prefetch={false}
          className="text-link"
        >
          {panelTools.name}
        </Link>
      </h2>
      <p className="mt-5 max-w-2xl leading-8 text-ink-muted">
        <Localized text={panelTools.summary} />
      </p>
      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technology">
        {panelTools.stack.map((item) => (
          <li
            key={item}
            className="rounded-full border border-edge px-3 py-1.5 text-xs"
          >
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-2xl text-xs leading-6 text-ink-muted">
        <Localized text={panelTools.compatibility} />
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/projects/panel-tools" prefetch={false}>
            <Localized text="View project" /> <ArrowIcon />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <a href={panelTools.repository}>
            <Localized text="Source on GitHub" /> <ArrowIcon diagonal />
          </a>
        </Button>
      </div>
    </article>
  );
}
