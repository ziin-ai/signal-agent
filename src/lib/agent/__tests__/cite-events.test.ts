import { describe, expect, it } from "vitest";
import { explainSourceChip, tierLabel } from "../cite-events";

describe("cite-events", () => {
  it("labels tiers", () => {
    expect(tierLabel(0)).toContain("반박");
    expect(tierLabel(1)).toContain("T1");
  });

  it("explains source chip", () => {
    const explained = explainSourceChip({
      id: "src-1",
      tier: 1,
      type: "news",
      title: "연합뉴스",
      excerpt: "코스피 하락",
      url: "https://example.com",
    });
    expect(explained.title).toContain("src-1");
    expect(explained.body).toContain("연합뉴스");
  });
});
