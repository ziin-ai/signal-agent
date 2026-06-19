import { readAgentEnv } from "./env";

export type InferenceProvider = "none" | "vllm" | "cursor";

/** JIIN_AGENT_PROVIDER: vllm | cursor | auto (default auto = vllm 우선) */
export function resolveInferenceProvider(): InferenceProvider {
  const env = readAgentEnv();
  if (env.AGENT_ENABLED === "false") return "none";

  const pref = env.JIIN_AGENT_PROVIDER ?? "auto";

  if (pref === "cursor") {
    return env.CURSOR_API_KEY ? "cursor" : "none";
  }
  if (pref === "vllm") {
    return env.LLM_BASE_URL ? "vllm" : "none";
  }

  if (env.LLM_BASE_URL) return "vllm";
  if (env.CURSOR_API_KEY) return "cursor";
  return "none";
}

export function isInferenceEnabled(): boolean {
  return resolveInferenceProvider() !== "none";
}
