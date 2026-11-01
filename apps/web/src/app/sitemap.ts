import type { MetadataRoute } from "next";
import { experiments } from "@/content/lab";
import { notes, projects } from "@/content/site";

import { listReleaseGroups } from "@/lib/releases/server";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const releases = await listReleaseGroups();
  return [
    "",
    "/projects",
    "/releases",
    ...releases.map((release) => `/releases/${release.slug}`),
    "/lab",
    "/notes",
    "/about",
    "/contact",
    ...projects.map((project) => `/projects/${project.slug}`),
    ...experiments.map((experiment) => `/lab/${experiment.slug}`),
    ...notes.map((note) => `/notes/${note.slug}`),
  ].map((path) => ({ url: `https://kiochan.one${path}` }));
}
