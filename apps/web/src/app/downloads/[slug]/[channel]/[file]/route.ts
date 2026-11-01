import "server-only";
import { downloadResponse } from "@/lib/releases/http";
import { isChannel } from "@/lib/releases/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = {
  params: Promise<{ slug: string; channel: string; file: string }>;
};
async function serve(request: Request, context: Context) {
  const { slug, channel, file } = await context.params;
  if (!isChannel(channel))
    return Response.json(
      { error: "Unknown channel" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  return downloadResponse(request, slug, channel, file);
}
export const GET = serve;
export const HEAD = serve;
