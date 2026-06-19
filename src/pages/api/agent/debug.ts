import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { agentEnvSnapshot, readAgentEnv } from "../../../lib/agent/env";
import { createDebugTrace, isAgentDebugEnabled, probeLlmConnection } from "../../../lib/agent/debug";
import { getLlmConfigFromEnv } from "../../../lib/agent/llm-client";
import { isInferenceEnabled, resolveInferenceProvider } from "../../../lib/agent/provider";
import { runAgentChat } from "../../../lib/agent/orchestrator";

export const GET: APIRoute = async ({ url }) => {
  if (!isAgentDebugEnabled()) {
    return new Response(JSON.stringify({ error: "debug_disabled", hint: "Set AGENT_DEBUG=true" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const trace = createDebugTrace();
  const config = getLlmConfigFromEnv();

  if (config) {
    trace.probe = await probeLlmConnection(config);
  }

  const sampleMessage = url.searchParams.get("message")?.trim() || "ping — LLM 연결 테스트";
  const sampleSlug = url.searchParams.get("slug")?.trim() || undefined;
  const sampleSymbol = url.searchParams.get("symbol")?.trim() || undefined;

  let sample: Awaited<ReturnType<typeof runAgentChat>> | undefined;
  if (url.searchParams.get("chat") === "1") {
    const [posts, events] = await Promise.all([getCollection("posts"), getCollection("events")]);
    sample = await runAgentChat(
      { posts, events },
      {
        message: sampleMessage,
        debug: true,
        context: { slug: sampleSlug, symbol: sampleSymbol },
      },
    );
  }

  return new Response(
    JSON.stringify(
      {
        ok: isInferenceEnabled(),
        inferenceEnabled: isInferenceEnabled(),
        provider: resolveInferenceProvider(),
        probe: trace.probe,
        llmConfig: trace.llmConfig,
        env: agentEnvSnapshot(),
        sample,
        usage: {
          health: "GET /api/agent/debug",
          chat: 'POST /api/chat with { "debug": true, "message": "..." }',
          cli: "pnpm agent:debug",
        },
      },
      null,
      2,
    ),
    { headers: { "Content-Type": "application/json" } },
  );
};
