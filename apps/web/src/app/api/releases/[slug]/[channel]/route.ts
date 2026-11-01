import {
  isChannel,
  publicRelease,
  readPublishedRelease,
} from "@/lib/releases/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; channel: string }> },
) {
  const { slug, channel } = await params;
  const release = isChannel(channel)
    ? await readPublishedRelease(slug, channel)
    : null;
  return Response.json(
    release ? publicRelease(release) : { error: "Release unavailable" },
    {
      status: release ? 200 : 404,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
