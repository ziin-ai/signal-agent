import { isInferenceEnabled, resolveInferenceProvider } from "./provider";
import { getLlmConfigFromEnv, type LlmConfig } from "./llm-client";
import { agentEnvSnapshot, readAgentEnv } from "./env";

export type LlmProbeResult = {
  ok: boolean;
  latencyMs: number;
  models?: string[];
  error?: string;
};

export type AgentDebugToolRound = {
  round: number;
  finishReason: string | null;
  toolCalls: Array<{ name: string; arguments: Record<string, unknown> }>;
  contentPreview: string;
};

export type AgentDebugTrace = {
  at: string;
  llmEnabled: boolean;
  llmConfig: {
    baseUrl: string;
    model: string;
    maxTokens: number;
    timeoutMs: number;
    hasApiKey: boolean;
  } | null;
  route: "journey" | "scenario" | "fallback_disabled" | "llm" | "llm_error_fallback" | "cursor" | "cursor_error_fallback";
  journey?: string;
  llmError?: string;
  toolRounds: AgentDebugToolRound[];
  latencyMs: number;
  probe?: LlmProbeResult;
};

export function isAgentDebugEnabled(env = readAgentEnv()): boolean {
  if (env.AGENT_DEBUG === "true") return true;
  try {
    return import.meta.env.DEV === true;
  } catch {
    return false;
  }
}

export function shouldIncludeDebug(requestDebug?: boolean): boolean {
  return Boolean(requestDebug) && isAgentDebugEnabled();
}

export function agentDebugLog(label: string, detail: unknown): void {
  if (!isAgentDebugEnabled()) return;
  console.info(`[agent:debug] ${label}`, detail);
}

export function createDebugTrace(): AgentDebugTrace {
  const config = getLlmConfigFromEnv();
  return {
    at: new Date().toISOString(),
    llmEnabled: isInferenceEnabled(),
    llmConfig: config
      ? {
          baseUrl: config.baseUrl,
          model: config.model,
          maxTokens: config.maxTokens,
          timeoutMs: config.timeoutMs,
          hasApiKey: Boolean(config.apiKey),
        }
      : null,
    route: "fallback_disabled",
    toolRounds: [],
    latencyMs: 0,
  };
}

export async function probeLlmConnection(config: LlmConfig): Promise<LlmProbeResult> {
  const started = Date.now();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  try {
    const modelsRes = await fetch(`${config.baseUrl}/models`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(Math.min(config.timeoutMs, 10_000)),
    });

    if (modelsRes.ok) {
      const json = (await modelsRes.json()) as { data?: Array<{ id?: string }> };
      const models = (json.data ?? []).map((item) => item.id).filter(Boolean) as string[];
      return {
        ok: models.length === 0 || models.includes(config.model),
        latencyMs: Date.now() - started,
        models: models.slice(0, 20),
        error:
          models.length > 0 && !models.includes(config.model)
            ? `configured model "${config.model}" not in /models list`
            : undefined,
      };
    }

    const ping = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 8,
        temperature: 0,
      }),
      signal: AbortSignal.timeout(Math.min(config.timeoutMs, 15_000)),
    });

    if (!ping.ok) {
      const body = await ping.text();
      return {
        ok: false,
        latencyMs: Date.now() - started,
        error: `chat/completions ${ping.status}: ${body.slice(0, 200)}`,
      };
    }

    return { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
