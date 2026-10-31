import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/site-shell";
import { experiments } from "@/content/lab";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Small tools, playful experiments, and ideas you can try in your browser.",
  alternates: { canonical: "/lab" },
};

export default function LabPage() {
  return (
    <section className="py-2">
      <p className="eyebrow">The lab</p>
      <h1 className="mt-5 text-5xl font-medium tracking-tight sm:text-6xl">
        Small ideas. Open tabs<span className="text-brand">.</span>
      </h1>
      <p className="mt-6 max-w-xl leading-8 text-ink-muted">
        A home for the useful, the curious, and the just-for-fun. These are
        little projects to open and play with, all in one place.
      </p>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {experiments.map((experiment) => (
          <Link
            key={experiment.slug}
            href={`/lab/${experiment.slug}`}
            className="group rounded-2xl border border-edge bg-surface p-7 sm:p-9"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">
                {experiment.category} / {experiment.stack}
              </p>
              <ArrowIcon diagonal className="text-brand" />
            </div>
            <h2 className="mt-8 text-2xl font-medium tracking-tight group-hover:text-brand">
              {experiment.name}
            </h2>
            <p className="mt-4 text-sm leading-7 text-ink-muted">
              {experiment.description}
            </p>
            <p className="mt-8 text-sm font-medium text-brand">
              Open experiment →
            </p>
          </Link>
        ))}
      </div>
      <p className="mt-10 text-sm text-ink-muted">
        An evolving collection. More experiments will find their way here.
      </p>
    </section>
  );
}
