import Link from "next/link";

import { Localized } from "@/components/language-provider";
import { MaterialIcon } from "@/components/ui/material-icon";
import { profile } from "@/content/site";
import { LanguageSwitcher } from "./language-switcher";
import { SiteNavigation } from "./site-navigation";
import { ThemeSwitcher } from "./theme-switcher";

export function ArrowIcon({
  className = "",
  diagonal = false,
}: {
  className?: string;
  diagonal?: boolean;
}) {
  return (
    <MaterialIcon
      name={diagonal ? "north_east" : "arrow_forward"}
      className={`size-5 ${className}`}
    />
  );
}

export function SiteHeader() {
  return (
    <header className="site-header border-b border-edge">
      <div className="site-container grid grid-cols-[auto_1fr] items-center gap-x-8 gap-y-4 py-5 lg:grid-cols-[auto_1fr_auto]">
        <Link
          href="/"
          aria-label="Kiochan home"
          className="text-xl font-bold tracking-tight"
        >
          Kiochan
          <span className="text-brand" aria-hidden="true">
            .
          </span>
        </Link>
        <div className="order-3 col-span-2 w-full lg:order-2 lg:col-span-1 lg:w-auto lg:justify-self-end">
          <SiteNavigation />
        </div>
        <div className="order-2 flex items-center justify-self-end gap-3 lg:order-3">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-edge">
      <div className="site-container flex flex-col gap-6 py-9 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="font-semibold text-ink">
            Kiochan
            <span className="text-brand">.</span>
          </Link>
          <p className="mt-2 text-ink-muted">
            <Localized text="Made with care. Always a work in progress." />{" "}
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-6 text-ink-muted"
        >
          <a href={profile.github} className="text-link">
            GitHub{" "}
            <MaterialIcon
              name="north_east"
              className="inline-block size-4 align-[-0.15em]"
            />{" "}
          </a>
          <a href={profile.linkedin} className="text-link">
            LinkedIn{" "}
            <MaterialIcon
              name="north_east"
              className="inline-block size-4 align-[-0.15em]"
            />
          </a>
          <Link href="/contact" className="text-link">
            <Localized text="Get in touch" />{" "}
          </Link>
          <Link href={profile.source} className="text-link">
            <Localized text="Source on GitHub" />{" "}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function ContactInvitation() {
  return (
    <section className="site-container section-space">
      <div className="flex flex-col justify-between gap-8 border-t border-edge pt-12 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">
            <Localized text="Keep in touch" />
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
            <Localized text="A question, an idea, a hello." />{" "}
          </h2>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-4 text-sm font-medium text-brand text-link"
        >
          <Localized text="Find a way to connect" /> <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
