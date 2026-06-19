import { describe, expect, it } from "vitest";
import { buildScenarioJourney, isJudgmentQuestion, shouldRunScenarioJourney } from "../scenario";
import type { ContentStore } from "../types";

function mockPost(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    data: {
      title: "코스피 전망",
      date: new Date("2026-06-11"),
      symbol: "^KS11",
      market: "KRX" as const,
      conviction: 4,
      summary: "외국인 매도와 변동성이 크다. 반등은 수급 개선에 달려 있다.",
      tags: ["코스피"],
      aiAssisted: true,
      draft: false,
      sources: [
        {
          id: "s1",
          tier: 1 as const,
          type: "news" as const,
          title: "연합",
          date: new Date("2026-06-10"),
          url: "https://example.com/1",
          excerpt: "코스피 하락",
        },
        {
          id: "s0",
          tier: 0 as const,
          type: "news" as const,
          title: "반박 리포트",
          date: new Date("2026-06-10"),
          url: "https://example.com/0",
          excerpt: "반등 여지는 있다",
        },
      ],
      entities: {},
      ...overrides,
    },
  };
}

describe("isJudgmentQuestion", () => {
  it("detects buy/sell style questions", () => {
    expect(isJudgmentQuestion("지금 사도 될까?")).toBe(true);
    expect(isJudgmentQuestion("오를까?")).toBe(true);
    expect(isJudgmentQuestion("MSCI가 뭐야?")).toBe(false);
  });
});

describe("buildScenarioJourney", () => {
  it("returns three scenarios and checklist", () => {
    const store: ContentStore = {
      posts: [mockPost("2026-06-11-korea-market-outlook.md")],
      events: [],
    };

    const response = buildScenarioJourney(store, {
      message: "판단 프레임",
      context: { slug: "2026-06-11-korea-market-outlook", symbol: "^KS11" },
    });

    expect(response.journey).toBe("scenario");
    expect(response.scenarios).toHaveLength(3);
    expect(response.checklist?.length).toBeGreaterThanOrEqual(4);
    expect(response.scenarios?.[2]?.body).toContain("반박");
    expect(shouldRunScenarioJourney({ message: "매수할까?" })).toBe(true);
  });
});
