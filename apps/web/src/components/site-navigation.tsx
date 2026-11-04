"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Localized } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/lab", label: "Lab" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main navigation"
      className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm sm:gap-x-6"
    >
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            prefetch={href === "/projects" ? false : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "nav-link py-2",
              active ? "text-ink" : "text-ink-muted",
            )}
          >
            <Localized text={label} />
          </Link>
        );
      })}
    </nav>
  );
}
