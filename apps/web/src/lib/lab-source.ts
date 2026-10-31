import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
// Only known build-time source files may be embedded in the static pages.
export function readLabSource(game: "breakout" | "snake") {
  return readFile(
    path.resolve(process.cwd(), `../../packages/lab-${game}/src/engine.ts`),
    "utf8",
  );
}
