import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col p-[clamp(1.5rem,5vw,4rem)]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xl font-bold tracking-[-0.05em]">
          Kiochan
          <span aria-hidden="true" className="text-brand">
            .
          </span>
        </p>
        <ThemeSwitcher />
      </header>
      <div className="my-auto py-20">
        <h1 className="text-[clamp(3rem,10vw,8rem)] leading-[1.05] font-medium tracking-[-0.07em]">
          Hello, world.
        </h1>
        <p className="mt-6 text-[clamp(1rem,2vw,1.25rem)] text-ink-muted">
          A new beginning.
        </p>
      </div>
      <footer>
        <Button
          asChild
          variant="link"
          className="h-auto p-0 text-xs font-normal tracking-wide text-ink-muted"
        >
          <Link href="/" aria-label="Kiochan home">
            kiochan.one
          </Link>
        </Button>
      </footer>
    </main>
  );
}
