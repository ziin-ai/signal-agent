import { describe, expect, it } from "vitest";
import { buildJiinOpening } from "../use-jiin-chat";

describe("buildJiinOpening", () => {
  it("uses first-person conversational tone with symbol", () => {
    const text = buildJiinOpening("메모리 업황이 핵심입니다.", "005930.KS");
    expect(text).toContain("005930.KS 글");
    expect(text).toContain("같이 읽고 있어");
    expect(text).toContain("메모리 업황이 핵심입니다.");
  });

  it("truncates long whispers", () => {
    const long = "가".repeat(200);
    const text = buildJiinOpening(long);
    expect(text).toContain("…");
  });
});
