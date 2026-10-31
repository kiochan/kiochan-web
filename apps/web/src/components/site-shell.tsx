import Link from "next/link";
import { profile } from "@/content/site";
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={`size-5 shrink-0 ${className}`}
    >
      <path
        d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-edge">
      <div className="site-container flex flex-wrap items-center justify-between gap-x-8 gap-y-5 py-6">
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
        <div className="order-3 w-full lg:order-none lg:w-auto">
          <SiteNavigation />
        </div>
        <ThemeSwitcher />
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
            Kiochan<span className="text-brand">.</span>
          </Link>
          <p className="mt-2 text-ink-muted">
            Made with care. Always a work in progress.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-6 text-ink-muted"
        >
          <a href={profile.github} className="text-link">
            GitHub ↗
          </a>
          <Link href="/contact" className="text-link">
            Get in touch
          </Link>
          <Link href="/notes/a-theme-without-a-framework" className="text-link">
            About this site
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
          <p className="eyebrow">Keep in touch</p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
            A question, an idea, a hello.
          </h2>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-4 text-sm font-medium text-brand text-link"
        >
          Find a way to connect <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
