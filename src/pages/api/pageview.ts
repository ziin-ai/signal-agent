import type { APIRoute } from "astro";
import { isBotUserAgent, notifyDiscordPageviewSafe } from "../../lib/agent/discord-notify";

export const prerender = false;

type PageviewBody = {
  path?: unknown;
  title?: unknown;
  referrer?: unknown;
  slug?: unknown;
  symbol?: unknown;
  language?: unknown;
};

function asTrimmedString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function parsePath(value: unknown): string | undefined {
  const path = asTrimmedString(value, 512);
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/api/")) {
    return undefined;
  }
  return path;
}

export const POST: APIRoute = async ({ request }) => {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBotUserAgent(userAgent)) {
    return new Response(null, { status: 204 });
  }

  let body: PageviewBody = {};
  try {
    body = JSON.parse(await request.text()) as PageviewBody;
  } catch {
    return new Response(null, { status: 204 });
  }

  const path = parsePath(body.path);
  if (!path) {
    return new Response(null, { status: 204 });
  }

  notifyDiscordPageviewSafe({
    path,
    title: asTrimmedString(body.title, 256),
    referrer: asTrimmedString(body.referrer, 512),
    slug: asTrimmedString(body.slug, 256),
    symbol: asTrimmedString(body.symbol, 64),
    language: asTrimmedString(body.language, 32),
    userAgent: userAgent.slice(0, 256) || undefined,
  });

  return new Response(null, { status: 204 });
};
