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
  ChecklistItem,
  ContentStore,
  ScenarioCard,
} from "./types";

const JUDGMENT_PATTERN =
  /(?:사도|팔아|매수|매도|오를까|내릴까|올까|갈까|될까|추천|사야|팔아야|담을까|청산)/i;

export function isJudgmentQuestion(message: string): boolean {
  return JUDGMENT_PATTERN.test(message.trim());
}

function publishedPosts(store: ContentStore) {
  return store.posts.filter((post) => !post.data.draft);
}

function latestPostForSymbol(store: ContentStore, symbol?: string) {
  const posts = publishedPosts(store)
    .filter((post) => !symbol || post.data.symbol === symbol)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return posts[0];
}

function resolvePrimaryPost(store: ContentStore, request: AgentChatRequest) {
  const slug = request.context?.slug;
  if (slug) {
    const found = getPost(store, { slug });
    if (found.result) {
      const post = publishedPosts(store).find((entry) => postSlugFromId(entry.id) === slug);
      return { citation: found.result, post };
    }
  }

  const symbol = request.context?.symbol;
  const latest = latestPostForSymbol(store, symbol);
  if (latest) {
    const slugFromId = postSlugFromId(latest.id);
    const { result } = getPost(store, { slug: slugFromId });
    return { citation: result ?? undefined, post: latest };
  }

  const { results } = searchPosts(store, {
    query: request.message,
    symbol,
    limit: 1,
  });
  if (results[0]) {
    const post = publishedPosts(store).find((entry) => postSlugFromId(entry.id) === results[0]!.slug);
    return { citation: results[0], post };
  }

  return { citation: undefined, post: undefined };
}

function upcomingHighImpactEvents(store: ContentStore, symbol?: string) {
  const now = new Date();
  const future = new Date(now);
  future.setDate(future.getDate() + 90);

  const { raw } = getTimelineEvents(store, {
    from: now.toISOString(),
    to: future.toISOString(),
    symbol,
    limit: 8,
  });

  return (raw as Array<{ at: string; title: string; impact?: string; summary?: string; href?: string }>)
    .filter((event) => event.impact === "high" || event.impact === "mid")
    .slice(0, 4);
}

function formatEventLine(event: { at: string; title: string; impact?: string }): string {
  const date = new Date(event.at).toLocaleDateString("ko-KR");
  return `• ${date} — ${event.title}${event.impact ? ` (${event.impact})` : ""}`;
}

export function buildScenarioJourney(
  store: ContentStore,
  request: AgentChatRequest,
): AgentChatResponse {
  const { citation, post } = resolvePrimaryPost(store, request);
  const citations: AgentCitation[] = citation ? [citation] : [];
  const symbol = request.context?.symbol ?? post?.data.symbol;
  const slug = citation?.slug ?? (post ? postSlugFromId(post.id) : undefined);

  const events = upcomingHighImpactEvents(store, symbol);
  const credibility = slug ? explainCredibility(store, { slug }) : null;
  if (credibility?.result && !citations.some((item) => item.slug === credibility.result!.slug)) {
    citations.push(credibility.result);
  }

  const realContra = post
    ? post.data.sources
        .filter((source) => source.tier === 0)
        .map((source) => `• ${source.title}: ${source.excerpt.slice(0, 120)}`)
    : [];

  const conviction = post?.data.conviction;
  const summary = post?.data.summary ?? citation?.excerpt ?? "관련 분석을 아직 찾지 못했어요.";
  const title = post?.data.title ?? citation?.title ?? "관련 분석";

  const bullBody =
    events.length > 0
      ? `긍정 시나리오에선 다가오는 촉매가 변수를 줄 수 있어요.\n\n${events.map(formatEventLine).join("\n")}\n\n${summary.split(".")[0] ?? summary}.`
      : `${summary.split(".")[0] ?? summary}. 다만 지인은 단정하지 않아요 — 아래 반박·일정도 함께 보세요.`;

  const baseBody = `${title} 기준으로는 이렇게 정리할 수 있어요.\n\n${summary}\n\n확신도 ${conviction ?? "?"} / 5 · 촉매 ${events.length}건(90일).`;

  const bearBody =
    realContra.length > 0
      ? `신중 시나리오에선 반박 근거를 먼저 봐야 해요.\n\n${realContra.join("\n")}`
      : events.length > 0
        ? `하방 시나리오에선 일정 리스크를 염두에 두세요.\n\n${events.map(formatEventLine).join("\n")}`
        : "반박 출처(T0)가 이 글에선 적어요. 그래도 확신도·일정 변동성은 스스로 확인해 주세요.";

  const scenarios: ScenarioCard[] = [
    { kind: "bull", title: "상향 시나리오", body: bullBody },
    { kind: "base", title: "기본 시나리오", body: baseBody },
    { kind: "bear", title: "신중 시나리오", body: bearBody },
  ];

  const score = (credibility?.raw as { score?: number })?.score;
  const contraCount = post?.data.sources.filter((source) => source.tier === 0).length ?? 0;

  const timelineHref = symbol ? `/timeline?symbol=${encodeURIComponent(symbol)}` : "/timeline";
  const postHref = slug ? `/posts/${slug}` : undefined;

  const checklist: ChecklistItem[] = [
    {
      id: "contra",
      label: "반박(T0) 출처 확인",
      hint: contraCount > 0 ? `T0 ${contraCount}건 — 본문·출처 사이드바` : "이 글에 T0가 없어요. 다른 각도 글도 검색해 보세요.",
      href: postHref,
    },
    {
      id: "catalyst",
      label: "다가오는 촉매 일정",
      hint: events.length > 0 ? `90일 내 ${events.length}건 — 타임라인에서 확인` : "등록된 촉매가 적어요.",
      href: timelineHref,
    },
    {
      id: "conviction",
      label: "확신도(conviction) 확인",
      hint: conviction ? `현재 ${conviction} / 5${score ? ` · 신뢰도 ${score}/10` : ""}` : "확신도 메타데이터 없음",
      href: postHref,
    },
    {
      id: "disclaimer",
      label: "면책: 투자 판단은 본인 책임",
      hint: "지인은 매수·매도를 추천하지 않아요.",
    },
  ];

  const intro =
    "단정적 예측은 어려워요. 지인이 다룬 분석·일정 기준으로 세 가지 시나리오를 정리했어요.";

  return {
    text: appendDisclaimer(intro, AGENT_DISCLAIMER),
    citations,
    grounded: citations.length > 0,
    disclaimer: AGENT_DISCLAIMER,
    mode: "fallback",
    journey: "scenario",
    scenarios,
    checklist,
  };
}

export function shouldRunScenarioJourney(request: AgentChatRequest): boolean {
  if (request.journey === "scenario") return true;
  return isJudgmentQuestion(request.message);
}

export function isKnownJourney(journey: string): journey is AgentJourneyId {
  return ["scenario", "briefing-60", "catalysts", "contra", "summary-3"].includes(journey);
}
