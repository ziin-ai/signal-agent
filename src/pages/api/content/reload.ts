import type { APIRoute } from "astro";
import { getContentSnapshot, invalidateContentCache } from "../../../lib/content";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = process.env.CONTENT_RELOAD_TOKEN?.trim();
  if (token) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${token}`) {
      return new Response("unauthorized", { status: 401 });
    }
  }

  invalidateContentCache();
  const snapshot = getContentSnapshot();
  return Response.json({
    ok: true,
    root: snapshot.root,
    posts: snapshot.posts.length,
    events: snapshot.events.length,
    media: snapshot.media.length,
    errors: snapshot.errors.length,
  });
};
