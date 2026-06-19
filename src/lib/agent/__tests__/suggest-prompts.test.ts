import { describe, expect, it } from "vitest";
import { buildFollowUpHeuristic, buildHeuristicSuggestions } from "../suggest-prompts";
import type { ContentStore } from "../types";

function mockPost(overrides: Record<string, unknown> = {}) {
  return {
    id: "2026-06-19-korea-q2-earnings-surprise-candidates.md",
    data: {
      title: "2분기 어닝 서프라이즈 후보",
      date: new Date("2026-06-19"),
      symbol: "^KS11",
      market: "KRX" as const,
      conviction: 2,
      summary: "컨센서스 대비 서프라이즈 종목을 정리한다.",
      tags: ["어닝", "실적"],
      aiAssisted: true,
      draft: false,
      sources: [
        {
          id: "src-0",
          tier: 0 as const,
          type: "news" as const,
          title: "반박",
          date: new Date("2026-06-18"),
          url: "https://example.com/b",
          excerpt: "과열 우려",
        },
      ],
      entities: {},
      ...overrides,
    },
  };
}

describe("buildHeuristicSuggestions", () => {
  it("suggests post-aware chips when slug is present", () => {
    const store: ContentStore = {
      posts: [mockPost()],
      events: [],
    };

    const prompts = buildHeuristicSuggestions(store, {
      slug: "2026-06-19-korea-q2-earnings-surprise-candidates",
    });

    expect(prompts.some((item) => item.message.includes("3줄"))).toBe(true);
    expect(prompts.some((item) => item.label.includes("반박"))).toBe(true);
    expect(prompts.some((item) => item.message.includes("어닝"))).toBe(true);
  });

  it("suggests dashboard chips without slug", () => {
    const store: ContentStore = { posts: [mockPost()], events: [] };
    const prompts = buildHeuristicSuggestions(store, { symbol: "^KS11", title: "코스피 대시보드" });

    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts[0]?.label).toBe("이 페이지");
  });

  it("suggests follow-up chips from conversation", () => {
    const store: ContentStore = {
      posts: [mockPost()],
      events: [],
    };

    const prompts = buildFollowUpHeuristic(
      store,
      { slug: "2026-06-19-korea-q2-earnings-surprise-candidates" },
      [
        { role: "user", content: "이 글 핵심 3줄 요약" },
        { role: "assistant", content: "핵심은 서프라이즈 후보와 컨센서스 갭입니다." },
      ],
    );

    expect(prompts.some((item) => item.label.includes("더 자세히") || item.message.includes("구체"))).toBe(true);
    expect(prompts.some((item) => item.message.includes("반박"))).toBe(true);
  });
});
