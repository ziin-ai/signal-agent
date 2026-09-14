import { describe, expect, it } from "vitest";
import {
  FORECAST_SCORE_LABEL,
  hasForecastLoop,
  isScorecardPost,
  latestDailyWithLoop,
} from "../forecast-loop";

describe("forecast loop labels", () => {
  it("maps scores to Korean chips", () => {
    expect(FORECAST_SCORE_LABEL.hit).toBe("맞음");
    expect(FORECAST_SCORE_LABEL.pending).toBe("미채점");
  });
});

describe("latestDailyWithLoop", () => {
  it("skips scorecards and guides", () => {
    const daily = {
      id: "2026-09-13-kospi.md",
      data: {
        date: new Date("2026-09-13"),
        title: "코스피 전망",
        tags: ["코스피"],
        loop: {
          prior: "a",
          result: "b",
          score: "pending" as const,
          note: "c",
          next: "d",
        },
      },
    };
    const card = {
      id: "2026-09-12-jan-may-defense-scorecard.md",
      data: {
        date: new Date("2026-09-14"),
        title: "방산 채점",
        tags: ["코스피"],
        loop: {
          prior: "x",
          result: "y",
          score: "partial" as const,
          note: "z",
          next: "n",
        },
      },
    };
    expect(isScorecardPost(card)).toBe(true);
    expect(hasForecastLoop(daily)).toBe(true);
    expect(latestDailyWithLoop([card as never, daily as never])?.id).toBe(daily.id);
  });
});
