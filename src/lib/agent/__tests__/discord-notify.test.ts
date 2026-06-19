import { describe, expect, it } from "vitest";
import { buildDiscordChatPayload } from "../discord-notify";

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
