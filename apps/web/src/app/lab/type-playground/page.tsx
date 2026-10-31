import { TypePlayground } from "@kiochan/lab-type-playground";
import type { Metadata } from "next";
import Link from "next/link";
import { experiments } from "@/content/lab";

const experiment = experiments.find((item) => item.slug === "type-playground");
export const metadata: Metadata = {
  title: "Type Playground · Lab",
  description: experiment?.description,
  alternates: { canonical: "/lab/type-playground" },
};

export default function TypePlaygroundPage() {
  return (
    <section className="site-container section-space">
      <Link href="/lab" className="text-sm text-ink-muted text-link">
        ← Back to the lab
      </Link>
      <p className="eyebrow mt-10">Typography / Browser experiment</p>
      <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">
        Type Playground<span className="text-brand">.</span>
      </h1>
      <p className="mt-5 max-w-xl leading-8 text-ink-muted">
        Play with a few words. Adjust the typeface, size, and line height to
        find a different rhythm. Nothing to install or upload.
      </p>
      <div className="mt-10">
        <TypePlayground />
      </div>
      <p className="mt-6 text-xs leading-6 text-ink-muted">
        Uses fonts available on your device. Changes stay in this page and reset
        when you reload.
      </p>
    </section>
  );
}
