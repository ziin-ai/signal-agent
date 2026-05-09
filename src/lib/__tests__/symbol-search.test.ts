import { describe, expect, it } from "vitest";
import type { CollectionEntry } from "astro:content";
import { buildSymbolSearchEntries, resolveSymbolFromQuery } from "../symbol-search";

function mockPost(symbol: string, extras: { tags?: string[]; entities?: Record<string, string[]> }): CollectionEntry<"posts"> {
  return {
    id: "x.md",
    collection: "posts",
    data: {
      title: "T",
      date: new Date(),
      symbol,
      market: "KRX",
      conviction: 3,
      summary: "S",
      tags: extras.tags ?? ["tag"],
      aiAssisted: false,
      draft: false,
      sources: [
        {
          id: "s",
          tier: 1,
          type: "news",
          title: "n",
          date: new Date(),
          url: "https://example.com",
          excerpt: "e",
        },
      ],
      entities: extras.entities ?? {},
    },
    body: "",
  };
}

describe("resolveSymbolFromQuery", () => {
  it("resolves exact ticker case-insensitively", () => {
    const entries = buildSymbolSearchEntries([mockPost("NVDA", { tags: [] })], []);
    expect(resolveSymbolFromQuery("nvda", entries)).toBe("NVDA");
  });

  it("resolves Korean company name from entities.company", () => {
    const entries = buildSymbolSearchEntries(
      [mockPost("103590.KS", { tags: [], entities: { company: ["일진전기"] } })],
      [],
    );
    expect(resolveSymbolFromQuery("일진전기", entries)).toBe("103590.KS");
    expect(resolveSymbolFromQuery("일진", entries)).toBe("103590.KS");
  });
});
