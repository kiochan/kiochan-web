import Link from "next/link";
import { FeaturedProject } from "@/components/featured-project";
import { Localized } from "@/components/language-provider";
import { ArrowIcon } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { home, profile } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <section
        aria-labelledby="home-projects"
        className="hero site-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14"
      >
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-light" aria-hidden="true" />
            <Localized text="Built to be used" />
          </p>
          <h1
            id="home-projects"
            className="mt-6 max-w-xl text-[clamp(3rem,5.6vw,5.5rem)] leading-[1.06] font-medium tracking-[-0.055em]"
          >
            <Localized text={home.title} />
            <span className="text-brand">.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-ink-muted">
            <Localized text={home.introduction} />
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="h-11 gap-4 px-5">
              <Link href="/projects" prefetch={false}>
                <Localized text="All projects" />
                <ArrowIcon />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-5">
              <Link href="/lab">
                <Localized text="Explore the lab" />
              </Link>
            </Button>
          </div>
        </div>
        <FeaturedProject />
      </section>
      <section
        id="about"
        aria-labelledby="home-about"
        className="border-t border-edge bg-surface-muted/45"
      >
        <div className="site-container grid gap-6 py-10 sm:py-14 lg:grid-cols-[0.65fr_1.35fr] lg:gap-14">
          <div>
            <p className="eyebrow">
              <Localized text="A little about me" />
            </p>
            <h2
              id="home-about"
              className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl"
            >
              <Localized text={home.aboutTitle} />
            </h2>
          </div>
          <div>
            <p className="max-w-2xl text-base leading-8 text-ink-muted">
              <Localized text={home.aboutIntroduction} />
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <Link
                href="/about"
                className="inline-flex items-center gap-3 font-medium text-brand text-link"
              >
                <Localized text="More about me" />
                <ArrowIcon />
              </Link>
              <a href={profile.github} className="text-ink-muted text-link">
                GitHub{" "}
                <MaterialIcon
                  name="north_east"
                  className="inline-block size-4 align-[-0.15em]"
                />
              </a>
              <a href={profile.linkedin} className="text-ink-muted text-link">
                LinkedIn{" "}
                <MaterialIcon
                  name="north_east"
                  className="inline-block size-4 align-[-0.15em]"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
