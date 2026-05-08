import type { CollectionEntry } from "astro:content";

export type TimelineEventKind = "post" | "external_event";

export type TimelineEvent = {
  id: string;
  at: string;
  kind: TimelineEventKind;
  title: string;
  summary?: string;
  href?: string;
  meta?: {
    symbol?: string;
    impact?: string;
    category?: string;
    market?: string;
    scope?: string;
  };
};

function resolveEventScope(event: CollectionEntry<"events">["data"]): "all" | "symbol" | "market" {
  if (event.scope) return event.scope;
  if (event.symbol) return "symbol";
  if (event.market && event.market !== "GLOBAL") return "market";
  return "all";
}

function shouldIncludeExternalEvent(
  event: CollectionEntry<"events">,
  context: { symbol?: string; market?: string },
): boolean {
  const scope = resolveEventScope(event.data);
  if (scope === "all") return true;
  if (scope === "symbol") return !!context.symbol && event.data.symbol === context.symbol;
  return !!context.market && event.data.market === context.market;
}

export function rankEventForDashboard(
  event: TimelineEvent,
  now = new Date(),
  context?: { symbol?: string },
): number {
  const t = new Date(event.at).getTime();
  const daysDiff = Math.abs(t - now.getTime()) / (24 * 60 * 60 * 1000);
  const recencyWeight = Math.max(0, 20 - daysDiff * 0.2);

  if (event.kind !== "external_event") return 18 + recencyWeight;

  const impactWeight =
    event.meta?.impact === "high" ? 60 : event.meta?.impact === "mid" ? 30 : 10;
  const categoryWeight =
    event.meta?.category === "earnings"
      ? 8
      : event.meta?.category === "product"
        ? 8
        : event.meta?.category === "macro"
          ? 6
        : event.meta?.category === "news"
          ? 5
          : event.meta?.category === "policy"
            ? 4
            : 2;
  const symbolWeight = !event.meta?.symbol
    ? 10
    : context?.symbol && event.meta.symbol === context.symbol
      ? 30
      : -10;

  return impactWeight + categoryWeight + symbolWeight + recencyWeight;
}

export function buildTimelineEvents(
  relatedPosts: CollectionEntry<"posts">[],
  activePost: CollectionEntry<"posts">,
  externalEvents: CollectionEntry<"events">[] = [],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const activeTags = new Set(activePost.data.tags.map((tag) => tag.trim().toLowerCase()));

  for (const post of relatedPosts) {
    const hasSameTag = post.data.tags.some((tag) => activeTags.has(tag.trim().toLowerCase()));
    const hasSameSymbol = post.data.symbol === activePost.data.symbol;
    if (!hasSameTag && !hasSameSymbol) continue;
    const slug = post.id.replace(/\.md$/, "");
    events.push({
      id: `post-${slug}`,
      at: post.data.date.toISOString(),
      kind: "post",
      title: post.data.title,
      summary: post.data.summary.slice(0, 96),
      href: `/posts/${slug}`,
    });
  }

  const sym = activePost.data.symbol;
  const market = activePost.data.market;
  for (const ev of externalEvents) {
    if (!shouldIncludeExternalEvent(ev, { symbol: sym, market })) continue;
    events.push({
      id: `event-${ev.data.id}`,
      at: ev.data.date.toISOString(),
      kind: "external_event",
      title: ev.data.title,
      summary: ev.data.summary,
      href: ev.data.sourceUrl,
      meta: {
        ...(ev.data.symbol ? { symbol: ev.data.symbol } : {}),
        impact: ev.data.impact,
        category: ev.data.category,
        ...(ev.data.market ? { market: ev.data.market } : {}),
        scope: resolveEventScope(ev.data),
      },
    });
  }

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function timelinePostPoints(posts: CollectionEntry<"posts">[]) {
  return [...posts]
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime())
    .map((post) => ({
      slug: post.id.replace(/\.md$/, ""),
      date: post.data.date.toISOString(),
      conviction: post.data.conviction,
      title: post.data.title,
    }));
}

/** 전역 타임라인: 모든 분석글·외부 이벤트(컨텍스트 필터 없음), 최신순 */
export function buildGlobalTimelineEvents(
  posts: CollectionEntry<"posts">[],
  externalEvents: CollectionEntry<"events">[] = [],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const post of posts) {
    const slug = post.id.replace(/\.md$/, "");
    events.push({
      id: `post-${slug}`,
      at: post.data.date.toISOString(),
      kind: "post",
      title: post.data.title,
      summary: post.data.summary.slice(0, 120),
      href: `/posts/${slug}`,
      meta: {
        symbol: post.data.symbol,
      },
    });
  }

  for (const ev of externalEvents) {
    events.push({
      id: `event-${ev.data.id}`,
      at: ev.data.date.toISOString(),
      kind: "external_event",
      title: ev.data.title,
      summary: ev.data.summary,
      href: ev.data.sourceUrl,
      meta: {
        ...(ev.data.symbol ? { symbol: ev.data.symbol } : {}),
        impact: ev.data.impact,
        category: ev.data.category,
        ...(ev.data.market ? { market: ev.data.market } : {}),
        scope: resolveEventScope(ev.data),
      },
    });
  }

  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

/** 특정 심볼: 해당 글·외부 이벤트만 묶어 타임라인 (최신순) */
export function buildSymbolTimelineEvents(
  symbol: string,
  posts: CollectionEntry<"posts">[],
  externalEvents: CollectionEntry<"events">[] = [],
  market?: CollectionEntry<"posts">["data"]["market"],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const symPosts = posts.filter((p) => p.data.symbol === symbol);

  for (const post of symPosts) {
    const slug = post.id.replace(/\.md$/, "");
    events.push({
      id: `post-${slug}`,
      at: post.data.date.toISOString(),
      kind: "post",
      title: post.data.title,
      summary: post.data.summary.slice(0, 120),
      href: `/posts/${slug}`,
      meta: {
        symbol: post.data.symbol,
      },
    });
  }

  for (const ev of externalEvents) {
    if (!shouldIncludeExternalEvent(ev, { symbol, market })) continue;
    events.push({
      id: `event-${ev.data.id}`,
      at: ev.data.date.toISOString(),
      kind: "external_event",
      title: ev.data.title,
      summary: ev.data.summary,
      href: ev.data.sourceUrl,
      meta: {
        ...(ev.data.symbol ? { symbol: ev.data.symbol } : {}),
        impact: ev.data.impact,
        category: ev.data.category,
        ...(ev.data.market ? { market: ev.data.market } : {}),
        scope: resolveEventScope(ev.data),
      },
    });
  }

  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

/** 대시보드용: Today 기준 과거 N일·미래 M일 안의 이벤트만, 시간순(과거→미래) */
export function filterEventsToDashboardWindow(
  events: TimelineEvent[],
  now = new Date(),
  pastDays = 30,
  futureDays = 60,
): {
  events: TimelineEvent[];
  windowStart: Date;
  windowEnd: Date;
  todayPct: number;
} {
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - pastDays);
  windowStart.setHours(0, 0, 0, 0);
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + futureDays);
  windowEnd.setHours(23, 59, 59, 999);
  const span = Math.max(1, windowEnd.getTime() - windowStart.getTime());
  const todayPct = Math.min(100, Math.max(0, ((now.getTime() - windowStart.getTime()) / span) * 100));
  const filtered = events.filter((e) => {
    const t = new Date(e.at).getTime();
    return t >= windowStart.getTime() && t <= windowEnd.getTime();
  });
  filtered.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return { events: filtered, windowStart, windowEnd, todayPct };
}
