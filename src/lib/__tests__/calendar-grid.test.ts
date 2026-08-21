import { describe, expect, it } from "vitest";
import {
  buildGregorianMonthGrid,
  localIsoKey,
  shiftMonth,
  weekIsoKeysContaining,
  weekRangeLabel,
} from "../calendar-grid";

describe("buildGregorianMonthGrid", () => {
  it("always returns 42 cells (6 weeks)", () => {
    expect(buildGregorianMonthGrid(2026, 5)).toHaveLength(42);
    expect(buildGregorianMonthGrid(2024, 2)).toHaveLength(42);
  });

  it("marks days inside the requested month", () => {
    const grid = buildGregorianMonthGrid(2026, 5);
    const inMay = grid.filter((c) => c.inMonth);
    expect(inMay.length).toBe(31);
    expect(inMay[0].day).toBe(1);
    expect(inMay[inMay.length - 1].day).toBe(31);
  });

  it("uses Sunday-first column order", () => {
    const grid = buildGregorianMonthGrid(2026, 5);
    const may1 = grid.find((c) => c.inMonth && c.day === 1);
    expect(may1).toBeDefined();
    const idx = grid.indexOf(may1!);
    expect(idx % 7).toBe(new Date(2026, 4, 1).getDay());
  });
});

describe("localIsoKey", () => {
  it("formats YYYY-MM-DD", () => {
    expect(localIsoKey(2026, 4, 9)).toBe("2026-05-09");
  });
});

describe("shiftMonth", () => {
  it("moves across year boundary", () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2025, 12, 1)).toEqual({ year: 2026, month: 1 });
  });
});

describe("weekIsoKeysContaining", () => {
  it("returns Sunday–Saturday week for a Wednesday", () => {
    // 2026-05-06 is Wednesday
    const keys = weekIsoKeysContaining("2026-05-06");
    expect(keys).toHaveLength(7);
    expect(keys[0]).toBe("2026-05-03");
    expect(keys[6]).toBe("2026-05-09");
  });
});

describe("weekRangeLabel", () => {
  it("formats same-month range", () => {
    const keys = weekIsoKeysContaining("2026-05-06");
    expect(weekRangeLabel(keys)).toMatch(/5월/);
  });
});
