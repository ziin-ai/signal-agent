import { describe, expect, it } from "vitest";
import type { CollectionEntry } from "astro:content";
import {
  buildGlobalTimelineEvents,
  buildSymbolTimelineEvents,
  buildTimelineEvents,
  filterEventsToDashboardWindow,
  timelinePostPoints,
} from "../timeline";

function mockPost(
  id: string,
  data: Partial<CollectionEntry<"posts">["data"]>,
): CollectionEntry<"posts"> {
  const base = {
    title: "T",
    date: new Date("2026-05-01"),
    symbol: "000660.KS",
    market: "KRX" as const,
    conviction: 3,
    summary: "Summary text here.",
    tags: ["메모리"],
    aiAssisted: false,
    draft: false,
    sources: [
      {
        id: "s1",
        tier: 1 as const,
        type: "report" as const,
        title: "Src",
        date: new Date("2026-04-01"),
        url: "https://example.com/a",
        excerpt: "ex",
      },
    ],
    entities: {},
  };
  return {
    id: `${id}.md`,
    collection: "posts",
    data: { ...base, ...data } as CollectionEntry<"posts">["data"],
    body: "",
  } as CollectionEntry<"posts">;
}

function mockExternalEvent(
  id: string,
  data: Partial<CollectionEntry<"events">["data"]>,
): CollectionEntry<"events"> {
  const base = {
    id,
    title: "외부 이벤트",
    date: new Date("2026-05-20"),
    market: "GLOBAL" as const,
    category: "macro" as const,
    impact: "mid" as const,
    summary: "External market event summary.",
    tags: ["macro"],
  };
  return {
    id: `${id}.md`,
    collection: "events",
    data: { ...base, ...data } as CollectionEntry<"events">["data"],
    body: "",
  } as CollectionEntry<"events">;
}

describe("timelinePostPoints", () => {
  it("sorts by date ascending and maps slug", () => {
    const a = mockPost("b", { date: new Date("2026-05-02"), conviction: 4 });
    const b = mockPost("a", { date: new Date("2026-05-01"), conviction: 2 });
    const pts = timelinePostPoints([a, b]);
    expect(pts.map((p) => p.slug)).toEqual(["a", "b"]);
    expect(pts[0].conviction).toBe(2);
    expect(pts[1].conviction).toBe(4);
  });
});

describe("buildTimelineEvents", () => {
  it("includes related posts by symbol/tag only", () => {
    const active = mockPost("p1", { symbol: "NVDA", tags: ["AI"] });
    const sameTag = mockPost("p2", { symbol: "OTHER", tags: ["AI"] });
    const sameSymbol = mockPost("p3", { symbol: "NVDA", tags: ["x"] });
    const unrelated = mockPost("p4", { symbol: "MSFT", tags: ["cloud"] });
    const events = buildTimelineEvents([active, sameTag, sameSymbol, unrelated], active);
    const ids = new Set(events.map((e) => e.id));
    expect(ids.has("post-p1")).toBe(true);
    expect(ids.has("post-p2")).toBe(true);
    expect(ids.has("post-p3")).toBe(true);
    expect(ids.has("post-p4")).toBe(false);
  });

  it("includes symbol and global external events", () => {
    const active = mockPost("p1", { symbol: "000660.KS", market: "KRX" });
    const evGlobal = mockExternalEvent("g1", { id: "g1", market: "GLOBAL" });
    const evSymbol = mockExternalEvent("s1", { id: "s1", symbol: "000660.KS", market: "KRX" });
    const evOther = mockExternalEvent("o1", { id: "o1", symbol: "NVDA", market: "NASDAQ" });
    const events = buildTimelineEvents([active], active, [evGlobal, evSymbol, evOther]);
    expect(events.some((e) => e.id === "event-g1")).toBe(true);
    expect(events.some((e) => e.id === "event-s1")).toBe(true);
    expect(events.some((e) => e.id === "event-o1")).toBe(false);
  });
});

describe("buildGlobalTimelineEvents", () => {
  it("merges posts and external events and sorts newest first", () => {
    const p1 = mockPost("old", { date: new Date("2026-01-01") });
    const p2 = mockPost("new", { date: new Date("2026-06-01") });
    const ev = mockExternalEvent("g2", { id: "g2", date: new Date("2026-05-01") });
    const list = buildGlobalTimelineEvents([p1, p2], [ev]);
    expect(list.some((e) => e.id === "event-g2")).toBe(true);
    for (let i = 0; i < list.length - 1; i++) {
      expect(new Date(list[i].at).getTime()).toBeGreaterThanOrEqual(new Date(list[i + 1].at).getTime());
    }
  });
});

describe("buildSymbolTimelineEvents", () => {
  it("includes only posts/events for the symbol", () => {
    const sym = "000660.KS";
    const pMatch = mockPost("match", { symbol: sym, date: new Date("2026-05-01") });
    const pOther = mockPost("other", { symbol: "NVDA", date: new Date("2026-05-02") });
    const marketScoped = mockExternalEvent("m3", { id: "m3", scope: "market", market: "KRX" });
    const marketOther = mockExternalEvent("m4", { id: "m4", scope: "market", market: "NASDAQ" });
    const events = buildSymbolTimelineEvents(sym, [pMatch, pOther], [marketScoped, marketOther], "KRX");
    const ids = new Set(events.map((e) => e.id));
    expect(ids.has("post-match")).toBe(true);
    expect(ids.has("post-other")).toBe(false);
    expect(ids.has("event-m3")).toBe(true);
    expect(ids.has("event-m4")).toBe(false);
  });
});

describe("filterEventsToDashboardWindow", () => {
  it("keeps events inside window and sorts chronologically", () => {
    const anchor = new Date("2026-05-15T12:00:00Z");
    const inside = {
      id: "a",
      at: "2026-05-10T00:00:00.000Z",
      kind: "post" as const,
      title: "In",
      href: "/posts/x",
    };
    const tooOld = {
      id: "b",
      at: "2025-01-01T00:00:00.000Z",
      kind: "post" as const,
      title: "Old",
      href: "/posts/y",
    };
    const { events, todayPct } = filterEventsToDashboardWindow([tooOld, inside], anchor, 30, 60);
    expect(events.some((e) => e.id === "a")).toBe(true);
    expect(events.some((e) => e.id === "b")).toBe(false);
    expect(events[0]?.id).toBe("a");
    expect(todayPct).toBeGreaterThan(0);
    expect(todayPct).toBeLessThan(100);
  });
});
