import {
  agentDebugLog,
  createDebugTrace,
  shouldIncludeDebug,
  type AgentDebugTrace,
} from "./debug";
import { agentEnvSnapshot } from "./env";
import { AGENT_DISCLAIMER, buildSystemPrompt } from "./persona";
import { appendDisclaimer, applyGuardrail } from "./guardrail";
import { createChatCompletion, getLlmConfigFromEnv } from "./llm-client";
import { runCursorJiinPrompt } from "./cursor-agent-client";
import { gatherJiinToolContext } from "./context-pack";
import { isInferenceEnabled, resolveInferenceProvider } from "./provider";
import { buildScenarioJourney, shouldRunScenarioJourney } from "./scenario";
import { runJourneyIfRequested } from "./journeys";
import {
  executeToolCall,
  explainCredibility,
  getPost,
  getTimelineEvents,
  searchPosts,
  TOOL_DEFINITIONS,
} from "./tools";
import type {
  AgentChatRequest,
  AgentChatResponse,
  AgentCitation,
  AgentMessage,
  ContentStore,
} from "./types";

const MAX_TOOL_ROUNDS = 4;

function dedupeCitations(citations: AgentCitation[]): AgentCitation[] {
  const seen = new Set<string>();
  const out: AgentCitation[] = [];
  for (const citation of citations) {
    const key = `${citation.href}|${citation.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(citation);
  }
  return out;
}

function monthRangeFromMessage(message: string): { from?: string; to?: string } {
  const monthMatch = message.match(/(\d{1,2})\s*월/);
  if (!monthMatch) return {};

  const month = Number(monthMatch[1]);
  if (!Number.isFinite(month) || month < 1 || month > 12) return {};

  const year = new Date().getFullYear();
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { from: from.toISOString(), to: to.toISOString() };
}

function buildFallbackResponse(store: ContentStore, request: AgentChatRequest): AgentChatResponse {
  const message = request.message.trim();
  const contextSlug = request.context?.slug;
  const citations: AgentCitation[] = [];
  let text = "";

  const wantsSummary = /요약|3줄|핵심/.test(message);
  const wantsSchedule = /일정|언제|촉매|이벤트|뭐\s*봐/.test(message);
  const wantsCredibility = /신뢰|믿|등급|출처/.test(message);
  const wantsQuote = /시세|주가|가격|얼마/.test(message);

  if ((wantsSummary || message.includes("이 글")) && contextSlug) {
    const { result, raw } = getPost(store, { slug: contextSlug });
    if (result) {
      citations.push(result);
      const payload = raw as { summary?: string; conviction?: number; symbol?: string };
      text = `지인이 보기에 이 글(${result.title})의 핵심은 이래요.\n\n${result.excerpt}\n\n확신도는 ${payload.conviction ?? "?"} / 5입니다. 자세한 근거는 본문과 출처 사이드바를 확인해 주세요.`;
    }
  } else if (wantsCredibility && contextSlug) {
    const { result, raw } = explainCredibility(store, { slug: contextSlug });
    if (result) {
      citations.push(result);
      const payload = raw as { score?: number; tierCounts?: Record<string, number> };
      const tiers = payload.tierCounts
        ? Object.entries(payload.tierCounts)
            .map(([tier, count]) => `${tier} ${count}건`)
            .join(", ")
        : "구성 정보 없음";
      text = `이 글의 신뢰도 점수는 ${payload.score ?? "?"} / 10이에요. 출처 구성은 ${tiers}입니다.`;
    }
  } else if (wantsSchedule) {
    const range = monthRangeFromMessage(message);
    const { results, raw } = getTimelineEvents(store, {
      ...range,
      symbol: request.context?.symbol,
      limit: 6,
    });
    citations.push(...results.filter((item) => item.href.startsWith("/posts/")));
    const events = raw as Array<{ at: string; title: string; impact?: string }>;
    if (events.length === 0) {
      text = "해당 조건에 맞는 일정을 아직 다루지 않았어요. 타임라인 페이지에서 전체 이벤트를 확인해 보세요.";
    } else {
      const lines = events.map((event) => {
        const date = new Date(event.at).toLocaleDateString("ko-KR");
        return `- ${date}: ${event.title}${event.impact ? ` (${event.impact})` : ""}`;
      });
      text = `지인이 타임라인에서 찾은 주요 일정이에요.\n\n${lines.join("\n")}`;
    }
  } else if (wantsQuote && request.context?.symbol) {
    text = "시세는 실시간 도구 연동 전이라, 관련 분석글 근거를 먼저 확인하는 편이 안전해요.";
    const { results } = searchPosts(store, { query: request.context.symbol, symbol: request.context.symbol, limit: 2 });
    citations.push(...results);
  } else {
    const { results } = searchPosts(store, {
      query: message,
      symbol: request.context?.symbol,
      limit: 3,
    });
    citations.push(...results);
    if (results.length === 0) {
      text = "그 주제는 아직 ziin.ai에서 다루지 않았어요. 다른 키워드로 다시 물어봐 주세요.";
    } else {
      const lines = results.map((item) => `- ${item.title}: ${item.excerpt}`);
      text = `지인이 관련 분석글을 찾았어요.\n\n${lines.join("\n\n")}`;
    }
  }

  const guarded = applyGuardrail(text);
  return {
    text: appendDisclaimer(guarded.text, AGENT_DISCLAIMER),
    citations: dedupeCitations(citations),
    grounded: citations.length > 0,
    disclaimer: AGENT_DISCLAIMER,
    mode: "fallback",
  };
}

async function runToolLoop(
  store: ContentStore,
  seedMessages: AgentMessage[],
  trace?: AgentDebugTrace,
): Promise<{ messages: AgentMessage[]; citations: AgentCitation[]; finalText: string }> {
  const config = getLlmConfigFromEnv();
  if (!config) {
    throw new Error("LLM config missing");
  }

  const messages = [...seedMessages];
  const citations: AgentCitation[] = [];
  let finalText = "";

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const completion = await createChatCompletion(config, messages, TOOL_DEFINITIONS);
    agentDebugLog(`llm round ${round + 1}`, {
      finishReason: completion.finishReason,
      toolCalls: completion.toolCalls.map((call) => call.name),
      contentPreview: completion.content.slice(0, 120),
    });

    if (trace) {
      trace.toolRounds.push({
        round: round + 1,
        finishReason: completion.finishReason,
        toolCalls: completion.toolCalls.map((call) => ({
          name: call.name,
          arguments: call.arguments,
        })),
        contentPreview: completion.content.slice(0, 160),
      });
    }

    if (completion.toolCalls.length === 0) {
      finalText = completion.content;
      break;
    }

    messages.push({
      role: "assistant",
      content: completion.content || "",
      toolCalls: completion.toolCalls,
    });

    for (const call of completion.toolCalls) {
      const result = await executeToolCall(store, call);
      citations.push(...result.citations);
      agentDebugLog(`tool ${call.name}`, {
        arguments: call.arguments,
        citationCount: result.citations.length,
      });
      messages.push({
        role: "tool",
        content: result.content,
        toolCallId: call.id,
        name: call.name,
      });
    }
  }

  if (!finalText) {
    const completion = await createChatCompletion(config, messages, []);
    finalText = completion.content;
    agentDebugLog("llm final synthesis", { contentPreview: completion.content.slice(0, 120) });
  }

  return { messages, citations, finalText };
}

async function runCursorResponse(
  store: ContentStore,
  request: AgentChatRequest,
): Promise<{ citations: AgentCitation[]; finalText: string }> {
  const { citations, contextJson } = gatherJiinToolContext(store, request);
  const cwd = typeof process !== "undefined" ? process.cwd() : ".";
  const finalText = await runCursorJiinPrompt({
    request,
    contextJson,
    cwd,
  });
  return { citations, finalText };
}

function withDebug(
  response: AgentChatResponse,
  trace: AgentDebugTrace | undefined,
  started: number,
): AgentChatResponse {
  if (!trace) return response;
  trace.latencyMs = Date.now() - started;
  return { ...response, debug: trace };
}

export async function runAgentChat(
  store: ContentStore,
  request: AgentChatRequest,
): Promise<AgentChatResponse> {
  const started = Date.now();
  const trace = shouldIncludeDebug(request.debug) ? createDebugTrace() : undefined;

  const journeyResponse = runJourneyIfRequested(store, request);
  if (journeyResponse) {
    if (trace) {
      trace.route = "journey";
      trace.journey = journeyResponse.journey;
    }
    return withDebug(journeyResponse, trace, started);
  }

  if (shouldRunScenarioJourney(request)) {
    const scenario = buildScenarioJourney(store, request);
    if (trace) trace.route = "scenario";
    return withDebug(scenario, trace, started);
  }

  if (!isInferenceEnabled()) {
    if (trace) trace.route = "fallback_disabled";
    agentDebugLog("route", {
      reason: "Inference disabled — tool fallback",
      provider: resolveInferenceProvider(),
      env: agentEnvSnapshot(),
    });
    return withDebug(buildFallbackResponse(store, request), trace, started);
  }

  const provider = resolveInferenceProvider();

  if (provider === "cursor") {
    try {
      const { citations, finalText } = await runCursorResponse(store, request);
      const guarded = applyGuardrail(finalText || "관련 근거를 찾지 못했어요.");
      const deduped = dedupeCitations(citations);
      if (trace) trace.route = "cursor";
      return withDebug(
        {
          text: appendDisclaimer(guarded.text, AGENT_DISCLAIMER),
          citations: deduped,
          grounded: deduped.length > 0,
          disclaimer: AGENT_DISCLAIMER,
          mode: "cursor",
        },
        trace,
        started,
      );
    } catch (error) {
      const cursorError = error instanceof Error ? error.message : String(error);
      agentDebugLog("cursor error", cursorError);
      if (trace) {
        trace.route = "cursor_error_fallback";
        trace.llmError = cursorError;
      }
      return withDebug(buildFallbackResponse(store, request), trace, started);
    }
  }

  const history: AgentMessage[] = (request.history ?? []).map((item) => ({
    role: item.role,
    content: item.content,
  }));

  const seedMessages: AgentMessage[] = [
    { role: "system", content: buildSystemPrompt(request.context) },
    ...history,
    { role: "user", content: request.message.trim() },
  ];

  try {
    const { citations, finalText } = await runToolLoop(store, seedMessages, trace);
    const guarded = applyGuardrail(finalText || "관련 근거를 찾지 못했어요.");
    const deduped = dedupeCitations(citations);

    if (trace) trace.route = "llm";
    return withDebug(
      {
        text: appendDisclaimer(guarded.text, AGENT_DISCLAIMER),
        citations: deduped,
        grounded: deduped.length > 0,
        disclaimer: AGENT_DISCLAIMER,
        mode: "llm",
      },
      trace,
      started,
    );
  } catch (error) {
    const llmError = error instanceof Error ? error.message : String(error);
    agentDebugLog("llm error", llmError);
    if (trace) {
      trace.route = "llm_error_fallback";
      trace.llmError = llmError;
    }
    return withDebug(buildFallbackResponse(store, request), trace, started);
  }
}

export async function* streamAgentChat(
  store: ContentStore,
  request: AgentChatRequest,
): AsyncGenerator<
  | { type: "meta"; data: Pick<AgentChatResponse, "citations" | "grounded" | "mode" | "disclaimer"> }
  | { type: "token"; text: string }
  | { type: "done"; data: AgentChatResponse }
> {
  const response = await runAgentChat(store, request);
  yield {
    type: "meta",
    data: {
      citations: response.citations,
      grounded: response.grounded,
      mode: response.mode,
      disclaimer: response.disclaimer,
    },
  };

  for (const char of response.text) {
    yield { type: "token", text: char };
  }

  yield { type: "done", data: response };
}
