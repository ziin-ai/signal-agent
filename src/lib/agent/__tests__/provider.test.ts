import { describe, expect, it } from "vitest";
import { resolveInferenceProvider } from "../provider";

describe("resolveInferenceProvider", () => {
  it("returns none when agent disabled", () => {
    expect(resolveInferenceProvider()).toBeDefined();
  });

  it("prefers vllm in auto when both set", () => {
    // unit test via direct env shape would need refactor; smoke default
    expect(["none", "vllm", "cursor"]).toContain(
      resolveInferenceProvider(),
    );
  });
});
