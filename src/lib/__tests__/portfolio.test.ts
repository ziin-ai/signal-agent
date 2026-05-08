import { describe, expect, it } from "vitest";
import {
  calculateHitRate,
  calculateMDD,
  calculateReturns,
  calculateSharpe,
  type Trade,
} from "../portfolio";

describe("calculateReturns", () => {
  it("returns percentage gain from first to last value", () => {
    expect(calculateReturns([100, 120])).toBe(20);
  });

  it("returns negative percentage for losses", () => {
    expect(calculateReturns([100, 90])).toBe(-10);
  });

  it("returns 0 when values are insufficient", () => {
    expect(calculateReturns([100])).toBe(0);
  });
});

describe("calculateSharpe", () => {
  it("returns 0 when no returns are provided", () => {
    expect(calculateSharpe([])).toBe(0);
  });

  it("returns positive Sharpe for stable excess returns", () => {
    expect(calculateSharpe([0.03, 0.02, 0.01], 0.005)).toBeGreaterThan(0);
  });

  it("returns 0 when volatility is zero", () => {
    expect(calculateSharpe([0.02, 0.02, 0.02], 0.02)).toBe(0);
  });
});

describe("calculateMDD", () => {
  it("computes max drawdown from peak to trough", () => {
    expect(calculateMDD([100, 120, 90, 110])).toBe(25);
  });

  it("returns 0 for monotonic increase", () => {
    expect(calculateMDD([100, 110, 120])).toBe(0);
  });

  it("returns 0 for insufficient values", () => {
    expect(calculateMDD([100])).toBe(0);
  });
});

describe("calculateHitRate", () => {
  it("returns ratio of profitable trades", () => {
    const trades: Trade[] = [
      { entryPrice: 100, exitPrice: 110 },
      { entryPrice: 100, exitPrice: 90 },
      { entryPrice: 50, exitPrice: 70 },
    ];
    expect(calculateHitRate(trades)).toBe(66.67);
  });

  it("returns 0 for empty trades", () => {
    expect(calculateHitRate([])).toBe(0);
  });

  it("treats breakeven trades as non-hit", () => {
    const trades: Trade[] = [{ entryPrice: 100, exitPrice: 100 }];
    expect(calculateHitRate(trades)).toBe(0);
  });
});
