import { describe, expect, it } from "vitest";
import { calculateScore, type Source } from "../credibility";

function source(tier: Source["tier"]): Source {
  return {
    id: `s-${tier}-${Math.random()}`,
    tier,
    type: "report",
    title: "sample",
    date: "2026-05-07",
    url: "https://example.com",
    excerpt: "sample excerpt",
  };
}

describe("calculateScore", () => {
  it("returns 0 for empty input", () => {
    expect(calculateScore([])).toBe(0);
  });

  it("calculates weighted score from tiers", () => {
    const sources = [source(1), source(2), source(4)];
    expect(calculateScore(sources)).toBe(6.33);
  });

  it("adds bonus when contra sources are two or more", () => {
    const withoutExtraContra = [source(1), source(0)];
    const withExtraContra = [source(1), source(0), source(0)];

    expect(calculateScore(withExtraContra)).toBeGreaterThan(calculateScore(withoutExtraContra));
  });
});
