import { cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("../apps/web/", import.meta.url));
const output = path.join(webRoot, ".next/standalone/apps/web");

cpSync(path.join(webRoot, "public"), path.join(output, "public"), {
  recursive: true,
});
cpSync(path.join(webRoot, ".next/static"), path.join(output, ".next/static"), {
  recursive: true,
});

console.log("Standalone assets prepared.");
