import type { CollectionEntry } from "astro:content";
import { buildGlobalTimelineEvents, rankEventForDashboard, type TimelineEvent } from "./timeline";

export type CatalystItem = {
  id: string;
  title: string;
  at: string;
  daysUntil: number;
  impact: "high" | "mid" | "low";
  category: string;
  summary: string;
  href?: string;
  symbol?: string;
  badge: string;
};

export type CatalystOptions = {
  symbol?: string;
  limit?: number;
  horizonDays?: number;
  now?: Date;
};

function daysUntil(at: string, now: Date): number {
  const target = new Date(at);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(target);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

export function formatCatalystBadge(days: number): string {
  if (days < 0) return "지남";
  if (days === 0) return "D-day";
  return `D-${days}`;
}

function impactRank(impact?: string): number {
  if (impact === "high") return 3;
  if (impact === "mid") return 2;
  return 1;
}

function timelineEventToCatalyst(event: TimelineEvent, now: Date): CatalystItem | null {
  if (event.kind !== "external_event") return null;

  const days = daysUntil(event.at, now);
  const impact = (event.meta?.impact ?? "low") as CatalystItem["impact"];

  return {
    id: event.id,
    title: event.title,
    at: event.at,
    daysUntil: days,
    impact,
    category: event.meta?.category ?? "other",
    summary: event.summary ?? "",
    href: event.href,
    symbol: event.meta?.symbol,
    badge: formatCatalystBadge(days),
  };
}

export function buildUpcomingCatalysts(
  posts: CollectionEntry<"posts">[],
  events: CollectionEntry<"events">[],
  options: CatalystOptions = {},
): CatalystItem[] {
  const now = options.now ?? new Date();
  const limit = options.limit ?? 6;
  const horizonDays = options.horizonDays ?? 60;
  const symbol = options.symbol;

  const published = posts.filter((post) => !post.data.draft);
  const timeline = buildGlobalTimelineEvents(published, events);

  const candidates = timeline
    .map((event) => timelineEventToCatalyst(event, now))
    .filter((item): item is CatalystItem => item !== null)
    .filter((item) => item.daysUntil >= 0 && item.daysUntil <= horizonDays);

  const ranked = candidates.sort((a, b) => {
    const toTimeline = (item: CatalystItem): TimelineEvent => ({
      id: item.id,
      at: item.at,
      kind: "external_event",
      title: item.title,
      summary: item.summary,
      meta: { impact: item.impact, category: item.category, symbol: item.symbol },
    });

    const scoreA = rankEventForDashboard(toTimeline(a), now, { symbol });
    const scoreB = rankEventForDashboard(toTimeline(b), now, { symbol });
    if (scoreA !== scoreB) return scoreB - scoreA;
    if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
    return impactRank(b.impact) - impactRank(a.impact);
  });

  return ranked.slice(0, limit);
}

export function findCatalystById(catalysts: CatalystItem[], id: string): CatalystItem | undefined {
  return catalysts.find((item) => item.id === id);
}
