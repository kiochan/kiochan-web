import "server-only";
import { projectCatalog } from "@/content/site";
import { channels, readPublishedRelease } from "@/lib/releases/server";

export async function readProject(slug: string) {
  const editorial = projectCatalog.find((project) => project.slug === slug);
  const releases = (
    await Promise.all(
      channels.map((channel) => readPublishedRelease(slug, channel)),
    )
  ).filter((release) => release !== null);
  if (!editorial && !releases.length) return null;
  return {
    slug,
    editorial,
    name: editorial?.name ?? releases[0].metadata.title,
    summary: editorial?.summary ?? releases[0].metadata.summary,
    releases,
  };
}
