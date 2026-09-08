import { describe, expect, it } from "vitest";
import {
  buildDiscordChatPayload,
  buildDiscordPageviewPayload,
  isBotUserAgent,
} from "../discord-notify";

describe("buildDiscordChatPayload", () => {
  it("includes user message and page context", () => {
    const payload = buildDiscordChatPayload({
      message: "이 글 핵심 3줄 요약",
      slug: "2026-06-19-korea-q2-earnings-surprise-candidates",
      symbol: "^KS11",
      title: "2분기 어닝 서프라이즈 후보",
      url: "/posts/2026-06-19-korea-q2-earnings-surprise-candidates/",
      journey: "summary-3",
    });

    expect(payload.username).toBe("지인.ai");
    expect(payload.embeds[0]?.description).toContain("이 글 핵심 3줄 요약");
    expect(payload.embeds[0]?.fields.some((field) => field.name === "글 제목")).toBe(true);
    expect(payload.embeds[0]?.fields.some((field) => field.value === "summary-3")).toBe(true);
  });
});

describe("buildDiscordPageviewPayload", () => {
  it("includes path title slug and referrer", () => {
    const payload = buildDiscordPageviewPayload({
      path: "/posts/2026-08-23-kospi-night-futures-gap",
      title: "8월 24일 코스피 전망 | 내 곁에 지인",
      slug: "2026-08-23-kospi-night-futures-gap",
      symbol: "^KS11",
      referrer: "https://www.google.com/",
      language: "ko-KR",
    });

    expect(payload.embeds[0]?.title).toBe("페이지 열림");
    expect(payload.embeds[0]?.fields.some((field) => field.value.includes("night-futures-gap"))).toBe(true);
    expect(payload.embeds[0]?.fields.some((field) => field.name === "종목")).toBe(true);
    expect(payload.embeds[0]?.fields.some((field) => field.name === "referrer")).toBe(true);
  });
});

describe("isBotUserAgent", () => {
  it("flags crawlers and allows browsers", () => {
    expect(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBotUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120")).toBe(false);
  });
});

