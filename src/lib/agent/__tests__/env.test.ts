import { describe, expect, it } from "vitest";
import { getLlmConfigFromEnv, isLlmEnabled } from "../llm-client";

describe("isLlmEnabled", () => {
  it("returns false when AGENT_ENABLED is false", () => {
    expect(isLlmEnabled({ LLM_BASE_URL: "http://x/v1", AGENT_ENABLED: "false" })).toBe(false);
  });

  it("returns true when URL set and agent enabled", () => {
    expect(isLlmEnabled({ LLM_BASE_URL: "http://x/v1", AGENT_ENABLED: "true" })).toBe(true);
  });

  it("returns false when URL missing", () => {
    expect(isLlmEnabled({ AGENT_ENABLED: "true" })).toBe(false);
  });
});

describe("getLlmConfigFromEnv", () => {
  it("normalizes base URL", () => {
    expect(getLlmConfigFromEnv({ LLM_BASE_URL: "http://x/v1/" })?.baseUrl).toBe("http://x/v1");
  });
});
