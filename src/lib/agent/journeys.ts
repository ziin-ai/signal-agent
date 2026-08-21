import { AGENT_DISCLAIMER } from "./persona";
import { appendDisclaimer } from "./guardrail";
import {
  explainCredibility,
  getPost,
  getTimelineEvents,
  postSlugFromId,
  searchPosts,
} from "./tools";
import type {
  AgentChatRequest,
  AgentChatResponse,
  AgentCitation,
  AgentJourneyId,
  ContentStore,
  JourneyStep,
} from "./types";

function publishedPosts(store: ContentStore) {
  return store.posts.filter((post) => !post.data.draft);
}

function latestPost(store: ContentStore, symbol?: string) {
  return publishedPosts(store)
    .filter((post) => !symbol || post.data.symbol === symbol)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())[0];
}

function baseResponse(
  partial: Omit<AgentChatResponse, "disclaimer" | "grounded"> & { citations: AgentCitation[] },
): AgentChatResponse {
  return {
    ...partial,
    disclaimer: AGENT_DISCLAIMER,
    grounded: partial.citations.length > 0,
    text: appendDisclaimer(partial.text, AGENT_DISCLAIMER),
  };
}

function journeyBriefing60(store: ContentStore, request: AgentChatRequest): AgentChatResponse {
  const post = request.context?.slug
    ? publishedPosts(store).find((entry) => postSlugFromId(entry.id) === request.context!.slug)
    : latestPost(store, request.context?.symbol);

  const now = new Date();
  const weekAhead = new Date(now);
  weekAhead.setDate(weekAhead.getDate() + 7);

  const { raw: eventsRaw } = getTimelineEvents(store, {
    from: now.toISOString(),
    to: weekAhead.toISOString(),
    symbol: request.context?.symbol,
    limit: 3,
  });
  const events = eventsRaw as Array<{ at: string; title: string; impact?: string }>;

  const citations: AgentCitation[] = [];
  const steps: JourneyStep[] = [];

  if (post) {
    const slug = postSlugFromId(post.id);
    const cite = getPost(store, { slug }).result;
    if (cite) citations.push(cite);
    steps.push({
      title: "오늘의 핵심",
      body: post.data.summary,
    });
    steps.push({
      title: "확신도",
      body: `현재 conviction ${post.data.conviction} / 5 · ${post.data.symbol}`,
    });
  }

  if (events.length > 0) {
    steps.push({
      title: "7일 내 촉매",
      body: events
        .map((event) => `${new Date(event.at).toLocaleDateString("ko-KR")} — ${event.title}`)
        .join("\n"),
    });
  } else {
    steps.push({
      title: "7일 내 촉매",
      body: "등록된 임박 일정이 많지 않아요. 캘린더에서 더 볼 수 있어요.",
    });
  }

  return baseResponse({
    text: "60초 장전 브리핑이에요. 카드를 넘기며 확인해 주세요.",
    citations,
    mode: "fallback",
    journey: "briefing-60",
    steps,
  });
}

function journeyCatalysts(store: ContentStore, request: AgentChatRequest): AgentChatResponse {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 60);

  const { results, raw } = getTimelineEvents(store, {
    from: now.toISOString(),
    to: horizon.toISOString(),
    symbol: request.context?.symbol,
    limit: 6,
  });

  const events = raw as Array<{ at: string; title: string; summary?: string; impact?: string }>;
  const steps: JourneyStep[] = events.map((event) => ({
    title: `${new Date(event.at).toLocaleDateString("ko-KR")} · ${event.title}`,
    body: `${event.summary ?? ""}${event.impact ? `\n\nimpact: ${event.impact}` : ""}`.trim(),
  }));

  if (steps.length === 0) {
    steps.push({
      title: "촉매 없음",
      body: "60일 내 등록된 촉매가 적어요. 캘린더 전체를 확인해 보세요.",
    });
  }

  return baseResponse({
    text: "앞으로 볼 일정을 카드로 정리했어요.",
    citations: results.filter((item) => item.href.startsWith("/posts/")),
    mode: "fallback",
    journey: "catalysts",
    steps,
  });
}

function journeyContra(store: ContentStore, request: AgentChatRequest): AgentChatResponse {
  const slug = request.context?.slug;
  const citations: AgentCitation[] = [];
  const steps: JourneyStep[] = [];

  if (slug) {
    const { result, raw } = explainCredibility(store, { slug });
    if (result) citations.push(result);
    const post = publishedPosts(store).find((entry) => postSlugFromId(entry.id) === slug);
    const contra = post?.data.sources.filter((source) => source.tier === 0) ?? [];

    if (contra.length === 0) {
      steps.push({
        title: "T0 반박 없음",
        body: "이 글에는 T0(반박) 출처가 없어요. 다른 관점 글도 함께 찾아볼게요.",
      });
    } else {
      for (const source of contra) {
        steps.push({
          title: source.title,
          body: source.excerpt,
        });
      }
    }

    const score = (raw as { score?: number }).score;
    steps.push({
      title: "신뢰도 맥락",
      body: `종합 신뢰도 ${score ?? "?"} / 10 — 반박 출처를 반드시 함께 읽어 주세요.`,
    });
  } else {
    const { results } = searchPosts(store, {
      query: request.context?.symbol ?? "반박",
      symbol: request.context?.symbol,
      limit: 3,
    });
    citations.push(...results);
    for (const item of results) {
      steps.push({ title: item.title, body: item.excerpt });
    }
  }

  return baseResponse({
    text: "반박 근거만 모았어요. Contra-first 읽기 모드예요.",
    citations,
    mode: "fallback",
    journey: "contra",
    steps,
  });
}

function journeySummary3(store: ContentStore, request: AgentChatRequest): AgentChatResponse {
  const slug = request.context?.slug;
  const citations: AgentCitation[] = [];
  let steps: JourneyStep[] = [];

  if (slug) {
    const { result } = getPost(store, { slug });
    if (result) {
      citations.push(result);
      const sentences = result.excerpt
        .split(/(?<=[.!?])\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 3);
      steps = sentences.map((sentence, index) => ({
        title: `${index + 1}줄`,
        body: sentence,
      }));
    }
  } else {
    const post = latestPost(store, request.context?.symbol);
    if (post) {
      const slugFromId = postSlugFromId(post.id);
      const { result } = getPost(store, { slug: slugFromId });
      if (result) citations.push(result);
      steps = [{ title: "핵심", body: post.data.summary }];
    }
  }

  if (steps.length === 0) {
    steps = [{ title: "요약 없음", body: "요약할 분석 글을 찾지 못했어요." }];
  }

  return baseResponse({
    text: "3줄 요약이에요. 카드별로 확인해 주세요.",
    citations,
    mode: "fallback",
    journey: "summary-3",
    steps,
  });
}

export function runJourney(store: ContentStore, journeyId: AgentJourneyId, request: AgentChatRequest): AgentChatResponse {
  switch (journeyId) {
    case "briefing-60":
      return journeyBriefing60(store, request);
    case "catalysts":
      return journeyCatalysts(store, request);
    case "contra":
      return journeyContra(store, request);
    case "summary-3":
      return journeySummary3(store, request);
    default:
      return journeyBriefing60(store, request);
  }
}

export function runJourneyIfRequested(store: ContentStore, request: AgentChatRequest): AgentChatResponse | null {
  if (!request.journey || request.journey === "scenario") return null;
  return runJourney(store, request.journey, request);
}
