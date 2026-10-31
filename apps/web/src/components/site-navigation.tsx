"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/lab", label: "Lab" },
  { href: "/projects", label: "Projects" },
  { href: "/notes", label: "Notes" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main navigation"
      className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm sm:gap-x-8"
    >
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "nav-link py-2",
              active ? "text-ink" : "text-ink-muted",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
