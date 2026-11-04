"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Localized } from "@/components/language-provider";
import { experiments } from "@/content/lab";

function Links() {
  const pathname = usePathname();
  return (
    <nav aria-label="Lab projects" className="space-y-1">
      {[
        { href: "/lab", name: "All experiments" },
        ...experiments.map((item) => ({
          href: `/lab/${item.slug}`,
          name: item.name,
        })),
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className={`block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted ${pathname === item.href ? "bg-surface-muted font-medium text-brand" : "text-ink-muted"}`}
        >
          <Localized text={item.name} />
        </Link>
      ))}
    </nav>
  );
}
export function LabNavigation() {
  const pathname = usePathname();
  return (
    <>
      <aside className="hidden lg:block" aria-label="Lab sidebar">
        <div className="sticky top-28">
          <p className="eyebrow px-3 mb-5">Kiochan / Lab</p>
          <Links />
          <p className="mt-8 px-3 text-xs leading-6 text-ink-muted">
            <Localized text="Small projects, one home." /> <br />
            <Localized text="An evolving collection of things to try." />{" "}
          </p>
        </div>
      </aside>
      <details
        key={pathname}
        className="rounded-xl border border-edge bg-surface px-4 py-3 lg:hidden"
      >
        <summary className="cursor-pointer text-sm font-medium">
          <Localized text="Switch experiment" />{" "}
        </summary>
        <div className="mt-3">
          <Links />
        </div>
      </details>
    </>
  );
}
