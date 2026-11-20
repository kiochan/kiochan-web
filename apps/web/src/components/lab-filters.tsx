"use client";

import { Fragment, type ReactNode, useState } from "react";
import { Localized, useLanguage } from "@/components/language-provider";

export function LabFilters({
  entries,
}: {
  entries: { slug: string; tags: string[]; card: ReactNode }[];
}) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const tags = [...new Set(entries.flatMap((entry) => entry.tags))].sort();
  const visible = entries.filter(
    (entry) => selected === null || entry.tags.includes(selected),
  );

  return (
    <div className="mt-10">
      <fieldset>
        <legend className="text-sm font-medium">
          <Localized text="Filter by tag" />
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[null, ...tags].map((tag) => (
            <button
              key={tag ?? ""}
              type="button"
              aria-pressed={tag === selected}
              onClick={() => setSelected(tag)}
              className="min-h-11 cursor-pointer rounded-full border border-edge bg-surface px-4 text-sm font-medium text-ink not-aria-pressed:hover:bg-surface-muted aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-on-brand"
            >
              <Localized text={tag ?? "All experiments"} />
            </button>
          ))}
        </div>
      </fieldset>
      <p role="status" className="mt-4 text-sm text-ink-muted">
        {t("{count} of {total} experiments")
          .replace("{count}", String(visible.length))
          .replace("{total}", String(entries.length))}
      </p>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        {visible.map(({ slug, card }) => (
          <Fragment key={slug}>{card}</Fragment>
        ))}
      </div>
    </div>
  );
}
