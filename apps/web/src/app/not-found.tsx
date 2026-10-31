import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="site-container py-24 sm:py-36">
      <p className="eyebrow">404 / A wrong turn</p>
      <h1 className="mt-6 text-4xl font-medium tracking-tight sm:text-6xl">
        Nothing here. Plenty to explore.
      </h1>
      <p className="mt-6 max-w-lg text-ink-muted leading-8">
        This page may have moved, or the address may be incomplete. Find your
        way back to the projects and notes.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/projects">Explore projects</Link>
        </Button>
      </div>
    </section>
  );
}
