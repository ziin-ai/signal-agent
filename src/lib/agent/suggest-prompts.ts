import { gatherJiinToolContext } from "./context-pack";
import { runCursorJiinSuggestionPrompt } from "./cursor-agent-client";
import { agentDebugLog } from "./debug";
import { createTextCompletion, getLlmConfigFromEnv } from "./llm-client";
import { buildSystemPrompt } from "./persona";
import { resolveInferenceProvider } from "./provider";
import { explainCredibility, getPost, getTimelineEvents, searchPosts } from "./tools";
import type { AgentChatRequest, AgentMessage, ContentStore } from "./types";

export type SuggestedPrompt = {
  label: string;
  message: string;
};

export type SuggestPromptContext = {
  slug?: string;
  symbol?: string;
  title?: string;
  url?: string;
};

export type SuggestPromptHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type SuggestPromptMode = "llm" | "cursor" | "heuristic";

type PostSnapshot = {
  title: string;
  summary: string;
  symbol: string;
  conviction: number;
  tags: string[];
  tier0Count: number;
};

const SUGGESTION_RULES = `
## 이번 작업: 질문 칩 제안
- 사용자가 누를 후속 질문 3개를 제안한다.
- TOOL_CONTEXT와 recentConversation만 근거로 한다.
- 이미 사용자가 한 질문은 반복하지 않는다.
- label: 12자 이내 한국어
- message: 한 문장 질문(한국어)
- 매수/매도 권유 금지
- 출력은 JSON 배열만: [{"label":"...","message":"..."}]`;

function dedupePrompts(items: SuggestedPrompt[], limit = 4): SuggestedPrompt[] {
  const seen = new Set<string>();
  const out: SuggestedPrompt[] = [];
  for (const item of items) {
    const label = item.label.trim();
    const message = item.message.trim();
    if (!label || !message) continue;
    const key = message.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      label: label.length > 14 ? `${label.slice(0, 12)}…` : label,
      message,
    });
    if (out.length >= limit) break;
  }
  return out;
}

function toAgentRequest(
  context: SuggestPromptContext,
  history?: SuggestPromptHistoryItem[],
): AgentChatRequest {
  return {
    message: history?.length ? "follow-up suggestion" : "opening suggestion",
    context: {
      slug: context.slug,
      symbol: context.symbol,
      url: context.url,
    },
    history: history?.map((item) => ({ role: item.role, content: item.content })),
  };
}

function loadPostSnapshot(store: ContentStore, slug?: string): PostSnapshot | null {
  if (!slug) return null;
  const { result, raw } = getPost(store, { slug });
  if (!result || !raw || typeof raw !== "object") return null;

  const post = raw as {
    title?: string;
    summary?: string;
    symbol?: string;
    conviction?: number;
    tags?: string[];
  };

  const cred = explainCredibility(store, { slug });
  const credRaw = cred.raw as { contraCount?: number; tierCounts?: Record<string, number> } | null;
  const tier0Count = credRaw?.contraCount ?? credRaw?.tierCounts?.T0 ?? 0;

  return {
    title: post.title ?? result.title,
    summary: post.summary ?? result.excerpt,
    symbol: post.symbol ?? "",
    conviction: post.conviction ?? 0,
    tags: post.tags ?? [],
    tier0Count,
  };
}

export function buildHeuristicSuggestions(
  store: ContentStore,
  context: SuggestPromptContext,
): SuggestedPrompt[] {
  const post = loadPostSnapshot(store, context.slug);
  const items: SuggestedPrompt[] = [];

  if (post) {
    items.push({ label: "핵심 3줄", message: "이 글 핵심 3줄 요약" });

    const haystack = `${post.title} ${post.summary} ${post.tags.join(" ")}`.toLowerCase();

    if (post.tier0Count > 0) {
      items.push({ label: "반박 근거", message: "반박 근거만 정리해줘" });
    }

    if (post.conviction <= 3) {
      items.push({ label: "확신도는?", message: "이 글 확신도가 낮은 이유를 설명해줘" });
    }

    if (/어닝|실적|서프라이즈|컨센/.test(haystack)) {
      items.push({ label: "서프라이즈?", message: "어닝 서프라이즈 포인트가 뭐야?" });
    } else if (/촉매|일정|이벤트|fomc|금리/.test(haystack)) {
      items.push({ label: "다음 촉매", message: "앞으로 볼 촉매를 이 글 기준으로 정리해줘" });
    } else if (/반도체|ai|메모리|hbm/.test(haystack)) {
      items.push({ label: "업황 전망", message: "이 글에서 말하는 업황 전망을 짧게 정리해줘" });
    } else {
      items.push({ label: "왜 그렇게 봐?", message: "이 글 핵심 논지를 조금 더 풀어줘" });
    }

    const events = getTimelineEvents(store, {
      symbol: post.symbol || context.symbol,
      limit: 4,
    });
    if (events.results.length > 0 && !items.some((item) => item.label === "다음 촉매")) {
      items.push({ label: "다음 촉매", message: "앞으로 볼 촉매를 이 글 기준으로 정리해줘" });
    }
  } else {
    items.push(
      { label: "장 전망", message: "오늘 한국 증시 핵심 이슈만 짧게 정리해줘" },
      { label: "촉매", message: "앞으로 볼 촉매 정리" },
    );

    if (context.symbol) {
      const { results } = searchPosts(store, { query: context.symbol, symbol: context.symbol, limit: 1 });
      if (results[0]) {
        items.push({
          label: "관련 글",
          message: `${results[0].title} 글과 연결해서 설명해줘`,
        });
      }
    }

    if (context.title) {
      const short = context.title.length > 24 ? `${context.title.slice(0, 22)}…` : context.title;
      items.unshift({ label: "이 페이지", message: `${short} 관련해서 궁금한 점 정리해줘` });
    }
  }

  return dedupePrompts(items);
}

function wasAsked(history: SuggestPromptHistoryItem[], pattern: RegExp): boolean {
  return history.some((item) => item.role === "user" && pattern.test(item.content));
}

function pushIfNew(
  items: SuggestedPrompt[],
  history: SuggestPromptHistoryItem[],
  label: string,
  message: string,
): void {
  const normalized = message.trim().toLowerCase();
  const duplicate = history.some(
    (item) =>
      item.role === "user" &&
      (item.content.trim().toLowerCase() === normalized || item.content.includes(message.slice(0, 14))),
  );
  if (duplicate) return;
  items.push({ label, message });
}

export function buildFollowUpHeuristic(
  store: ContentStore,
  context: SuggestPromptContext,
  history: SuggestPromptHistoryItem[],
): SuggestedPrompt[] {
  const items: SuggestedPrompt[] = [];
  const lastUser = [...history].reverse().find((item) => item.role === "user")?.content ?? "";
  const lastAssistant = [...history].reverse().find((item) => item.role === "assistant")?.content ?? "";
  const post = loadPostSnapshot(store, context.slug);

  if (/요약|핵심|3줄/.test(lastUser)) {
    pushIfNew(items, history, "더 자세히", "방금 요약을 조금 더 구체적으로 풀어줘");
    pushIfNew(items, history, "근거는?", "방금 말한 내용의 근거 출처를 알려줘");
  } else if (/반박/.test(lastUser)) {
    pushIfNew(items, history, "시나리오", "상·기본·하향 시나리오를 짧게 정리해줘");
    pushIfNew(items, history, "확신도", "반박을 반영하면 확신도가 어떻게 달라져?");
  } else if (/촉매|일정/.test(lastUser)) {
    pushIfNew(items, history, "영향", "이 촉매가 관련 종목에 미치는 영향을 정리해줘");
  } else if (/시나리오|판단/.test(lastUser)) {
    pushIfNew(items, history, "체크리스트", "판단할 때 확인할 체크리스트를 알려줘");
  } else {
    pushIfNew(items, history, "핵심 정리", "지금까지 대화 핵심만 3줄로 정리해줘");
    pushIfNew(items, history, "더 깊게", "방금 답변을 조금 더 깊게 설명해줘");
  }

  if (lastAssistant && /tier|신뢰|출처|근거/.test(lastAssistant) && !wasAsked(history, /출처|근거/)) {
    pushIfNew(items, history, "출처 더", "방금 답변에 쓴 출처를 더 자세히 알려줘");
  }

  if (post?.tier0Count && post.tier0Count > 0 && !wasAsked(history, /반박/)) {
    pushIfNew(items, history, "반박 근거", "반박 근거만 정리해줘");
  }

  if (post && !wasAsked(history, /촉매/)) {
    pushIfNew(items, history, "다음 촉매", "앞으로 볼 촉매를 정리해줘");
  }

  if (!wasAsked(history, /확신|신뢰|믿/)) {
    pushIfNew(items, history, "확신도", "이 분석의 확신도와 한계를 알려줘");
  }

  if (items.length < 2) {
    return dedupePrompts([...items, ...buildHeuristicSuggestions(store, context)]);
  }

  return dedupePrompts(items);
}

function parseSuggestionJson(text: string): SuggestedPrompt[] | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();
  const match = candidate.match(/\[[\s\S]*\]/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]) as unknown;
    if (!Array.isArray(parsed)) return null;

    const items = parsed
      .filter((item): item is { label?: unknown; message?: unknown } => !!item && typeof item === "object")
      .map((item) => ({
        label: typeof item.label === "string" ? item.label.trim() : "",
        message: typeof item.message === "string" ? item.message.trim() : "",
      }))
      .filter((item) => item.label && item.message);

    const normalized = dedupePrompts(items);
    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

async function buildLlmSuggestions(
  store: ContentStore,
  context: SuggestPromptContext,
  history?: SuggestPromptHistoryItem[],
): Promise<SuggestedPrompt[] | null> {
  const config = getLlmConfigFromEnv();
  if (!config) return null;

  const request = toAgentRequest(context, history);
  const { contextJson } = gatherJiinToolContext(store, request);
  const followUp = Boolean(history && history.length > 0);

  const messages: AgentMessage[] = [
    {
      role: "system",
      content: `${buildSystemPrompt(request.context)}\n${SUGGESTION_RULES}`,
    },
    {
      role: "user",
      content: [
        `TOOL_CONTEXT:\n${contextJson}`,
        followUp ? "\n위 대화 흐름을 이어갈 질문 칩 3개를 제안하세요." : "\n이 페이지에서 처음 물어볼 질문 칩 3개를 제안하세요.",
      ].join(""),
    },
  ];

  const text = await createTextCompletion(config, messages, { maxTokens: 400, temperature: 0.45 });
  return parseSuggestionJson(text);
}

async function buildCursorSuggestions(
  store: ContentStore,
  context: SuggestPromptContext,
  history?: SuggestPromptHistoryItem[],
): Promise<SuggestedPrompt[] | null> {
  const request = toAgentRequest(context, history);
  const { contextJson } = gatherJiinToolContext(store, request);
  const cwd = typeof process !== "undefined" ? process.cwd() : ".";

  const text = await runCursorJiinSuggestionPrompt({
    contextJson,
    history,
    cwd,
  });
  return parseSuggestionJson(text);
}

export async function suggestChatPrompts(
  store: ContentStore,
  context: SuggestPromptContext,
  history?: SuggestPromptHistoryItem[],
): Promise<{ prompts: SuggestedPrompt[]; mode: SuggestPromptMode }> {
  const hasHistory = Boolean(history && history.length > 0);
  const fallback = hasHistory
    ? buildFollowUpHeuristic(store, context, history!)
    : buildHeuristicSuggestions(store, context);

  const provider = resolveInferenceProvider();
  if (provider === "none") {
    agentDebugLog("suggestions", { route: "heuristic", reason: "inference disabled" });
    return { prompts: fallback, mode: "heuristic" };
  }

  try {
    if (provider === "vllm") {
      const llm = await buildLlmSuggestions(store, context, history);
      if (llm && llm.length > 0) {
        agentDebugLog("suggestions", { route: "llm", count: llm.length });
        return { prompts: llm, mode: "llm" };
      }
      agentDebugLog("suggestions", { route: "heuristic", reason: "llm empty or parse failed" });
    }

    if (provider === "cursor") {
      const cursor = await buildCursorSuggestions(store, context, history);
      if (cursor && cursor.length > 0) {
        agentDebugLog("suggestions", { route: "cursor", count: cursor.length });
        return { prompts: cursor, mode: "cursor" };
      }
      agentDebugLog("suggestions", { route: "heuristic", reason: "cursor empty or parse failed" });
    }
  } catch (error) {
    agentDebugLog("suggestions", {
      route: "heuristic",
      reason: error instanceof Error ? error.message : "inference error",
    });
  }

  return { prompts: fallback, mode: "heuristic" };
}
