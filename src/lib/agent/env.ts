/** Astro `.env` → import.meta.env · shell/K8s → process.env */
function readEnv(name: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env[name]?.trim() : undefined;
  if (fromProcess) return fromProcess;

  try {
    const meta = import.meta.env as Record<string, unknown>;
    const value = meta[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  } catch {
    // ignore
  }

  return undefined;
}

export type AgentEnv = {
  LLM_BASE_URL?: string;
  LLM_MODEL?: string;
  LLM_API_KEY?: string;
  LLM_MAX_TOKENS?: string;
  LLM_TIMEOUT_MS?: string;
  AGENT_ENABLED?: string;
  AGENT_DEBUG?: string;
  /** vllm | cursor | auto (default) */
  JIIN_AGENT_PROVIDER?: string;
  CURSOR_API_KEY?: string;
  CURSOR_MODEL?: string;
  /** cloud runtime: owner/repo e.g. ziin-ai/signal-agent */
  CURSOR_CLOUD_REPO?: string;
  /** Discord incoming webhook — 지인 채팅 사용자 질문 알림 */
  DISCORD_WEBHOOK_URL?: string;
};

export function readAgentEnv(): AgentEnv {
  return {
    LLM_BASE_URL: readEnv("LLM_BASE_URL"),
    LLM_MODEL: readEnv("LLM_MODEL"),
    LLM_API_KEY: readEnv("LLM_API_KEY"),
    LLM_MAX_TOKENS: readEnv("LLM_MAX_TOKENS"),
    LLM_TIMEOUT_MS: readEnv("LLM_TIMEOUT_MS"),
    AGENT_ENABLED: readEnv("AGENT_ENABLED"),
    AGENT_DEBUG: readEnv("AGENT_DEBUG"),
    JIIN_AGENT_PROVIDER: readEnv("JIIN_AGENT_PROVIDER"),
    CURSOR_API_KEY: readEnv("CURSOR_API_KEY"),
    CURSOR_MODEL: readEnv("CURSOR_MODEL"),
    CURSOR_CLOUD_REPO: readEnv("CURSOR_CLOUD_REPO"),
    DISCORD_WEBHOOK_URL: readEnv("DISCORD_WEBHOOK_URL"),
  };
}

export function agentEnvSnapshot(): Record<string, string> {
  const env = readAgentEnv();
  return {
    LLM_BASE_URL: env.LLM_BASE_URL ? "(set)" : "(unset)",
    LLM_MODEL: env.LLM_MODEL ?? "(unset)",
    AGENT_ENABLED: env.AGENT_ENABLED ?? "(unset)",
    AGENT_DEBUG: env.AGENT_DEBUG ?? "(unset)",
    JIIN_AGENT_PROVIDER: env.JIIN_AGENT_PROVIDER ?? "auto",
    CURSOR_API_KEY: env.CURSOR_API_KEY ? "(set)" : "(unset)",
    CURSOR_MODEL: env.CURSOR_MODEL ?? "composer-2.5",
    CURSOR_CLOUD_REPO: env.CURSOR_CLOUD_REPO ?? "(unset)",
    DISCORD_WEBHOOK_URL: env.DISCORD_WEBHOOK_URL ? "(set)" : "(unset)",
    source: env.LLM_BASE_URL && !process.env.LLM_BASE_URL ? "import.meta.env" : "process.env",
  };
}
