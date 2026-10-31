import type { MetadataRoute } from "next";
import { notes, projects } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/projects",
    "/notes",
    "/about",
    "/contact",
    ...projects.map((project) => `/projects/${project.slug}`),
    ...notes.map((note) => `/notes/${note.slug}`),
  ].map((path) => ({ url: `https://kiochan.one${path}` }));
}
