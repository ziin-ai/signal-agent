import { describe, expect, it } from "vitest";
import { runJourney } from "../journeys";

function mockStore() {
  const now = new Date("2026-06-11");
  return {
    posts: [
      {
        id: "2026-06-11-korea-market-outlook.md",
        data: {
          title: "코스피 브리핑",
          date: now,
          symbol: "^KS11",
          market: "KRX" as const,
          conviction: 4,
          summary: "첫 줄. 둘째 줄. 셋째 줄.",
          tags: ["코스피"],
          aiAssisted: true,
          draft: false,
          sources: [
            {
              id: "s0",
              tier: 0 as const,
              type: "news" as const,
              title: "반박",
              date: now,
              url: "https://example.com/0",
              excerpt: "반등 가능성",
            },
          ],
          entities: {},
        },
      },
    ],
    events: [],
  };
}

describe("runJourney", () => {
  it("returns steps for summary-3", () => {
    const response = runJourney(mockStore(), "summary-3", {
      message: "3줄",
      context: { slug: "2026-06-11-korea-market-outlook" },
    });
    expect(response.journey).toBe("summary-3");
    expect(response.steps?.length).toBeGreaterThan(0);
  });

  it("returns contra steps", () => {
    const response = runJourney(mockStore(), "contra", {
      message: "반박",
      context: { slug: "2026-06-11-korea-market-outlook" },
    });
    expect(response.journey).toBe("contra");
    expect(response.steps?.some((step) => step.title.includes("반박"))).toBe(true);
  });
});
