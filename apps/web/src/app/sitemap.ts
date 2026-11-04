import type { MetadataRoute } from "next";
import { experiments } from "@/content/lab";
import { projectCatalog } from "@/content/site";

import { listReleaseGroups } from "@/lib/releases/server";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const releases = await listReleaseGroups();
  const projectSlugs = new Set([
    ...projectCatalog.map((project) => project.slug),
    ...releases.map((release) => release.slug),
  ]);
  return [
    "",
    "/projects",
    ...[...projectSlugs].map((slug) => `/projects/${slug}`),
    "/lab",
    "/about",
    "/contact",
    ...experiments.map((experiment) => `/lab/${experiment.slug}`),
  ].map((path) => ({ url: `https://kiochan.one${path}` }));
}
