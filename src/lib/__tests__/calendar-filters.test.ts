import { describe, expect, it } from "vitest";
import {
  filterHomeCalendarEvents,
  hasExplicitHomeCalendarFilters,
  resolveHomeCalendarFilters,
  toggleListMember,
} from "../calendar-filters";
import type { TimelineEvent } from "../timeline";

function ev(partial: Partial<TimelineEvent> & Pick<TimelineEvent, "id" | "kind" | "title">): TimelineEvent {
  return {
    at: "2026-08-01T00:00:00.000Z",
    ...partial,
  };
}

describe("resolveHomeCalendarFilters", () => {
  it("uses curated defaults when no filter params", () => {
    const state = resolveHomeCalendarFilters(new URL("https://example.com/"));
    expect(state.isCustom).toBe(false);
    expect(state.includePosts).toBe(true);
    expect(state.impacts).toEqual(["high"]);
    expect(state.categories).toEqual(["earnings", "macro"]);
  });

  it("reads explicit kind/impact/category", () => {
    const url = new URL(
      "https://example.com/?kind=post&impact=high&category=earnings&category=policy",
    );
    expect(hasExplicitHomeCalendarFilters(url)).toBe(true);
    const state = resolveHomeCalendarFilters(url);
    expect(state.isCustom).toBe(true);
    expect(state.includePosts).toBe(true);
    expect(state.impacts).toEqual(["high"]);
    expect(state.categories).toEqual(["earnings", "policy"]);
  });

  it("turns posts off when kind is present without post", () => {
    const state = resolveHomeCalendarFilters(
      new URL("https://example.com/?kind=external_event&impact=high&category=macro"),
    );
    expect(state.includePosts).toBe(false);
  });
});

describe("filterHomeCalendarEvents", () => {
  const sample: TimelineEvent[] = [
    ev({ id: "p1", kind: "post", title: "분석" }),
    ev({
      id: "e1",
      kind: "external_event",
      title: "실적 High",
      meta: { impact: "high", category: "earnings" },
    }),
    ev({
      id: "e2",
      kind: "external_event",
      title: "매크로 Mid",
      meta: { impact: "mid", category: "macro" },
    }),
    ev({
      id: "e3",
      kind: "external_event",
      title: "정책 High",
      meta: { impact: "high", category: "policy" },
    }),
  ];

  it("matches default curation", () => {
    const out = filterHomeCalendarEvents(sample, {
      includePosts: true,
      impacts: ["high"],
      categories: ["earnings", "macro"],
    });
    expect(out.map((e) => e.id)).toEqual(["p1", "e1"]);
  });

  it("hides events when a filter axis is empty", () => {
    const out = filterHomeCalendarEvents(sample, {
      includePosts: true,
      impacts: ["high"],
      categories: [],
    });
    expect(out.map((e) => e.id)).toEqual(["p1"]);
  });

  it("can include policy with high", () => {
    const out = filterHomeCalendarEvents(sample, {
      includePosts: false,
      impacts: ["high"],
      categories: ["policy"],
    });
    expect(out.map((e) => e.id)).toEqual(["e3"]);
  });
});

describe("toggleListMember", () => {
  it("toggles membership", () => {
    expect(toggleListMember(["a", "b"], "b")).toEqual(["a"]);
    expect(toggleListMember(["a"], "b").sort()).toEqual(["a", "b"]);
  });
});
