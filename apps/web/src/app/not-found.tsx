import Link from "next/link";
import { Localized } from "@/components/language-provider";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="site-container py-24 sm:py-36">
      <p className="eyebrow">
        <Localized text="404 / A wrong turn" />
      </p>
      <h1 className="mt-6 text-4xl font-medium tracking-tight sm:text-6xl">
        <Localized text="Nothing here. Plenty to explore." />{" "}
      </h1>
      <p className="mt-6 max-w-lg text-ink-muted leading-8">
        <Localized text="This page may have moved, or the address may be incomplete. Find your way back to the projects and experiments." />{" "}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/">
            <Localized text="Back home" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/projects">
            <Localized text="Explore projects" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
