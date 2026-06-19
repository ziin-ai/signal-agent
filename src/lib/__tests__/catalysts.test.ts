import { describe, expect, it } from "vitest";
import { buildUpcomingCatalysts, formatCatalystBadge } from "../catalysts";

describe("formatCatalystBadge", () => {
  it("formats day labels", () => {
    expect(formatCatalystBadge(0)).toBe("D-day");
    expect(formatCatalystBadge(3)).toBe("D-3");
    expect(formatCatalystBadge(-1)).toBe("지남");
  });
});

describe("buildUpcomingCatalysts", () => {
  it("returns future external events sorted by nearness and impact", () => {
    const now = new Date("2026-06-11T12:00:00+09:00");
    const posts = [
      {
        id: "a.md",
        data: {
          title: "A",
          date: now,
          symbol: "005930",
          market: "KRX" as const,
          conviction: 4,
          summary: "s",
          tags: ["t"],
          aiAssisted: false,
          draft: false,
          sources: [
            {
              id: "1",
              tier: 1 as const,
              type: "news" as const,
              title: "n",
              date: now,
              url: "https://example.com",
              excerpt: "e",
            },
          ],
          entities: {},
        },
      },
    ];
    const events = [
      {
        id: "ev-far.md",
        data: {
          id: "ev-far",
          title: "먼 이벤트",
          date: new Date("2026-08-01"),
          category: "other" as const,
          impact: "low" as const,
          summary: "far",
          tags: [],
        },
      },
      {
        id: "ev-soon.md",
        data: {
          id: "ev-soon",
          title: "임박 MSCI",
          date: new Date("2026-06-14"),
          category: "macro" as const,
          impact: "high" as const,
          summary: "soon",
          tags: [],
        },
      },
    ];

    const result = buildUpcomingCatalysts(posts, events, { now, limit: 4 });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.title).toContain("MSCI");
    expect(result[0]?.daysUntil).toBe(3);
  });
});
