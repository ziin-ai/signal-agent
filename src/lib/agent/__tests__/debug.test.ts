import { describe, expect, it } from "vitest";
import { createDebugTrace, shouldIncludeDebug } from "../debug";

describe("shouldIncludeDebug", () => {
  it("requires request flag and env flag", () => {
    expect(shouldIncludeDebug(false)).toBe(false);
  });
});

describe("createDebugTrace", () => {
  it("includes llmEnabled flag", () => {
    const trace = createDebugTrace();
    expect(trace).toMatchObject({
      llmEnabled: expect.any(Boolean),
      toolRounds: [],
      route: "fallback_disabled",
    });
    expect(trace.at).toBeTruthy();
  });
});
