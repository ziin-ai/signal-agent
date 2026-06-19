import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { notifyDiscordChatQuestionSafe } from "../../lib/agent/discord-notify";
import { runAgentChat, streamAgentChat } from "../../lib/agent/orchestrator";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY = 20;

type ChatBody = {
  message?: unknown;
  stream?: unknown;
  debug?: unknown;
  journey?: unknown;
  context?: {
    slug?: unknown;
    symbol?: unknown;
    url?: unknown;
    title?: unknown;
  };
  history?: unknown;
};

const JOURNEY_IDS = new Set(["scenario", "briefing-60", "catalysts", "contra", "summary-3"]);

function parseChatBody(body: ChatBody) {
  const journey = typeof body.journey === "string" && JOURNEY_IDS.has(body.journey) ? body.journey : undefined;
  const messageRaw = typeof body.message === "string" ? body.message.trim() : "";
  const message =
    messageRaw ||
    (journey === "scenario"
      ? "판단 프레임 보기"
      : journey
        ? "여정 시작"
        : "");

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return { error: "invalid_message" as const };
  }

  const stream = body.stream === true;
  const debug = body.debug === true;
  const context =
    body.context && typeof body.context === "object"
      ? {
          slug: typeof body.context.slug === "string" ? body.context.slug : undefined,
          symbol: typeof body.context.symbol === "string" ? body.context.symbol : undefined,
          url: typeof body.context.url === "string" ? body.context.url : undefined,
          title: typeof body.context.title === "string" ? body.context.title : undefined,
        }
      : undefined;

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (item): item is { role: "user" | "assistant"; content: string } =>
            !!item &&
            typeof item === "object" &&
            (item as { role?: unknown }).role !== undefined &&
            ((item as { role?: unknown }).role === "user" ||
              (item as { role?: unknown }).role === "assistant") &&
            typeof (item as { content?: unknown }).content === "string",
        )
        .slice(-MAX_HISTORY)
    : undefined;

  return { message, stream, debug, context, history, journey };
}

export const POST: APIRoute = async ({ request }) => {
  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = parseChatBody(body);
  if ("error" in parsed) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [posts, events] = await Promise.all([getCollection("posts"), getCollection("events")]);
  const store = { posts, events };

  notifyDiscordChatQuestionSafe({
    message: parsed.message,
    slug: parsed.context?.slug,
    symbol: parsed.context?.symbol,
    title: parsed.context?.title,
    url: parsed.context?.url,
    journey: parsed.journey,
  });

  if (parsed.stream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamAgentChat(store, parsed)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          const message = error instanceof Error ? error.message : "stream_failed";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const response = await runAgentChat(store, parsed);
  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify({ error: "method_not_allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
};
