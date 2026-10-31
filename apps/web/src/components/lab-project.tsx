import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { experiments } from "@/content/lab";
export function labMetadata(slug: string): Metadata {
  const project = experiments.find((item) => item.slug === slug);
  if (!project) throw new Error("Unknown lab project");
  return {
    title: `${project.name} · Lab`,
    description: project.description,
    alternates: { canonical: `/lab/${slug}` },
    openGraph: {
      title: `${project.name} — Kiochan Lab`,
      description: project.description,
      url: `/lab/${slug}`,
      type: "website",
    },
  };
}
export function LabProject({
  slug,
  children,
  source,
}: {
  slug: string;
  children: ReactNode;
  source?: string;
}) {
  const project = experiments.find((item) => item.slug === slug);
  if (!project) throw new Error("Unknown lab project");
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Kiochan",
        item: "https://kiochan.one/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Lab",
        item: "https://kiochan.one/lab",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.name,
        item: `https://kiochan.one/lab/${slug}`,
      },
    ],
  };
  return (
    <article>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumb).replaceAll("<", "\\u003c")}
      </script>
      <p className="eyebrow">{project.category} / Kiochan Lab</p>
      <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">
        {project.name}
        <span className="text-brand">.</span>
      </h1>
      <p className="mt-5 mb-9 max-w-2xl text-base leading-8 text-ink-muted">
        {project.description}
      </p>
      {children}
      {source && (
        <details className="mt-8 rounded-xl border border-edge p-5">
          <summary className="cursor-pointer text-sm font-medium">
            Read the game engine source · TypeScript
          </summary>
          <p className="my-4 text-sm leading-7 text-ink-muted">
            This is the engine running above. Input, rendering, and React
            controls live alongside it in the project package.
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-surface-muted p-5 text-xs leading-6">
            <code>{source}</code>
          </pre>
        </details>
      )}
      <footer className="mt-10 border-t border-edge pt-6 text-sm leading-7 text-ink-muted">
        <p>Further development continues here, in the Kiochan monorepo.</p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {project.original && (
            <a className="text-link text-brand" href={project.original}>
              Original project ↗
            </a>
          )}
          <a
            className="text-link text-brand"
            href={`https://github.com/kiochan/kiochan-web/tree/prod/packages/${project.packageName}`}
          >
            Package source & README ↗
          </a>
          <Link className="text-link" href="/lab">
            All experiments
          </Link>
        </div>
      </footer>
    </article>
  );
}
