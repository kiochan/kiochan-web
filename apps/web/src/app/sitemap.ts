import type { MetadataRoute } from "next";
import { experiments } from "@/content/lab";
import { notes, projects } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/projects",
    "/lab",
    "/notes",
    "/about",
    "/contact",
    ...projects.map((project) => `/projects/${project.slug}`),
    ...experiments.map((experiment) => `/lab/${experiment.slug}`),
    ...notes.map((note) => `/notes/${note.slug}`),
  ].map((path) => ({ url: `https://kiochan.one${path}` }));
}
