import { describe, expect, it } from "vitest";
import { renderMarkdownHtml } from "../markdown";

describe("renderMarkdownHtml", () => {
  it("renders GFM tables and citation chips", async () => {
    const html = await renderMarkdownHtml("본문{{cite:src-1}}\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n", [
      { id: "src-1", tier: 2, title: "연합뉴스", url: "https://example.com/a" },
    ]);
    expect(html).toContain("jiin-cite-mark");
    expect(html).toContain("연합뉴스");
    expect(html).toContain("<table>");
  });
});
