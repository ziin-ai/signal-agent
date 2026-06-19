import { describe, expect, it } from "vitest";
import { applyGuardrail, appendDisclaimer } from "../guardrail";
import { explainCredibility, postSlugFromId, searchPosts } from "../tools";
import type { ContentStore } from "../types";

function mockPost(overrides: Partial<ContentStore["posts"][number]["data"]> & { id?: string } = {}) {
  const { id = "2026-06-11-korea-market-outlook.md", ...dataOverrides } = overrides;
  return {
    id,
    data: {
      title: "코스피 장전 브리핑",
      date: new Date("2026-06-11"),
      symbol: "^KS11",
      market: "KRX" as const,
      conviction: 4,
      summary: "외국인 연속 매도와 선물 만기가 변수다.",
      tags: ["코스피", "매크로"],
      aiAssisted: true,
      draft: false,
      sources: [
        {
          id: "src-1",
          tier: 1 as const,
          type: "news" as const,
          title: "연합뉴스",
          date: new Date("2026-06-10"),
          url: "https://example.com/a",
          excerpt: "코스피 하락",
        },
        {
          id: "src-0",
          tier: 0 as const,
          type: "news" as const,
          title: "반박",
          date: new Date("2026-06-10"),
          url: "https://example.com/b",
          excerpt: "반등 가능",
        },
      ],
      entities: {},
      ...dataOverrides,
    },
  };
}

describe("postSlugFromId", () => {
  it("strips markdown extension", () => {
    expect(postSlugFromId("2026-06-11-korea-market-outlook.md")).toBe("2026-06-11-korea-market-outlook");
  });
});

describe("searchPosts", () => {
  it("ranks posts by query relevance", () => {
    const store: ContentStore = {
      posts: [
        mockPost({ id: "a.md", title: "MSCI 관찰대상국", summary: "지수 리밸런싱", tags: ["MSCI"] }),
        mockPost({ id: "b.md", title: "코스피 브리핑", summary: "외국인 매도", tags: ["코스피"] }),
      ],
      events: [],
    };

    const { results } = searchPosts(store, { query: "MSCI", limit: 2 });
    expect(results[0]?.slug).toBe("a");
  });

  it("excludes draft posts", () => {
    const store: ContentStore = {
      posts: [mockPost({ draft: true, title: "비공개 MSCI" })],
      events: [],
    };

    const { results } = searchPosts(store, { query: "MSCI" });
    expect(results).toHaveLength(0);
  });
});

describe("explainCredibility", () => {
  it("returns score and tier counts", () => {
    const store: ContentStore = {
      posts: [mockPost({ id: "2026-06-11-korea-market-outlook.md" })],
      events: [],
    };

    const { raw, result } = explainCredibility(store, {
      slug: "2026-06-11-korea-market-outlook",
    });

    expect(result?.slug).toBe("2026-06-11-korea-market-outlook");
    expect((raw as { score: number }).score).toBeGreaterThan(0);
    expect((raw as { contraCount: number }).contraCount).toBe(1);
  });
});

describe("applyGuardrail", () => {
  it("rewrites buy/sell directives", () => {
    const result = applyGuardrail("지금 무조건 사세요.");
    expect(result.rewritten).toBe(true);
    expect(result.text).toContain("단정적 예측");
  });

  it("appends disclaimer once", () => {
    const disclaimer = "본 답변은 투자 권유가 아닙니다.";
    const text = appendDisclaimer("안녕하세요.", disclaimer);
    expect(text).toContain(disclaimer);
    expect(appendDisclaimer(text, disclaimer)).toBe(text);
  });
});

describe("withBasePath", () => {
  it("resolves absolute static asset paths from site root", async () => {
    const { withBasePath } = await import("../chat-client");
    expect(withBasePath("/", "/images/jiin-avatar.png")).toBe("/images/jiin-avatar.png");
    expect(withBasePath("/app/", "/images/jiin-avatar.png")).toBe("/app/images/jiin-avatar.png");
  });
});
