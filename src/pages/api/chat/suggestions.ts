import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import {
  suggestChatPrompts,
  type SuggestPromptContext,
  type SuggestPromptHistoryItem,
} from "../../../lib/agent/suggest-prompts";

type SuggestionsBody = {
  context?: {
    slug?: unknown;
    symbol?: unknown;
    title?: unknown;
    url?: unknown;
  };
  history?: unknown;
};

function parseHistory(body: SuggestionsBody): SuggestPromptHistoryItem[] | undefined {
  if (!Array.isArray(body.history)) return undefined;

  return body.history
    .filter(
      (item): item is SuggestPromptHistoryItem =>
        !!item &&
        typeof item === "object" &&
        ((item as { role?: unknown }).role === "user" || (item as { role?: unknown }).role === "assistant") &&
        typeof (item as { content?: unknown }).content === "string",
    )
    .slice(-8);
}

function parseContext(body: SuggestionsBody): SuggestPromptContext {
  const ctx = body.context;
  if (!ctx || typeof ctx !== "object") return {};

  return {
    slug: typeof ctx.slug === "string" ? ctx.slug : undefined,
    symbol: typeof ctx.symbol === "string" ? ctx.symbol : undefined,
    title: typeof ctx.title === "string" ? ctx.title : undefined,
    url: typeof ctx.url === "string" ? ctx.url : undefined,
  };
}

export const POST: APIRoute = async ({ request }) => {
  let body: SuggestionsBody;
  try {
    body = (await request.json()) as SuggestionsBody;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [posts, events] = await Promise.all([getCollection("posts"), getCollection("events")]);
  const store = { posts, events };
  const context = parseContext(body);
  const history = parseHistory(body);
  const { prompts, mode } = await suggestChatPrompts(store, context, history);

  return new Response(JSON.stringify({ prompts, mode }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify({ error: "method_not_allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
};
