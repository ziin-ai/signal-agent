import type { AgentMessage, LlmToolDefinition, ToolCall } from "./types";
import { readAgentEnv, type AgentEnv } from "./env";
import { parseToolCall } from "./tools";

export type LlmConfig = {
  baseUrl: string;
  model: string;
  apiKey?: string;
  maxTokens: number;
  timeoutMs: number;
};

export type LlmCompletionResult = {
  content: string;
  toolCalls: ToolCall[];
  finishReason: string | null;
};

type OpenAiMessage = {
  role: string;
  content: string | null;
  tool_call_id?: string;
  name?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}

export function getLlmConfigFromEnv(env: AgentEnv = readAgentEnv()): LlmConfig | null {
  const baseUrl = env.LLM_BASE_URL?.trim();
  if (!baseUrl) return null;

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    model: env.LLM_MODEL?.trim() || "ziin-jiin-7b",
    apiKey: env.LLM_API_KEY?.trim(),
    maxTokens: Number(env.LLM_MAX_TOKENS ?? 1024),
    timeoutMs: Number(env.LLM_TIMEOUT_MS ?? 60_000),
  };
}

export function isLlmEnabled(env: AgentEnv = readAgentEnv()): boolean {
  if (env.AGENT_ENABLED === "false") return false;
  return Boolean(env.LLM_BASE_URL?.trim());
}

export async function createTextCompletion(
  config: LlmConfig,
  messages: AgentMessage[],
  options?: { maxTokens?: number; temperature?: number },
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  const payload = {
    model: config.model,
    messages: toOpenAiMessages(messages),
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? config.maxTokens,
  };

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`LLM ${response.status}: ${body.slice(0, 300)}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{
        message?: OpenAiMessage;
      }>;
    };

    return json.choices?.[0]?.message?.content?.trim() ?? "";
  } finally {
    clearTimeout(timeout);
  }
}

export async function createChatCompletion(
  config: LlmConfig,
  messages: AgentMessage[],
  tools: LlmToolDefinition[],
): Promise<LlmCompletionResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  const payload = {
    model: config.model,
    messages: toOpenAiMessages(messages),
    tools,
    tool_choice: "auto" as const,
    temperature: 0.3,
    max_tokens: config.maxTokens,
  };

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`LLM ${response.status}: ${body.slice(0, 300)}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{
        finish_reason?: string;
        message?: OpenAiMessage;
      }>;
    };

    const message = json.choices?.[0]?.message;
    const content = message?.content?.trim() ?? "";
    const toolCalls: ToolCall[] = [];

    for (const call of message?.tool_calls ?? []) {
      const parsed = parseToolCall(call.function.name, call.function.arguments, call.id);
      if (parsed) toolCalls.push(parsed);
    }

    return {
      content,
      toolCalls,
      finishReason: json.choices?.[0]?.finish_reason ?? null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function toOpenAiMessages(messages: AgentMessage[]): OpenAiMessage[] {
  return messages.map((message) => {
    if (message.role === "tool") {
      return {
        role: "tool",
        content: message.content,
        tool_call_id: message.toolCallId,
        name: message.name,
      };
    }
    if (message.role === "assistant" && message.toolCalls && message.toolCalls.length > 0) {
      return {
        role: "assistant",
        content: message.content || null,
        tool_calls: message.toolCalls.map((call) => ({
          id: call.id,
          type: "function" as const,
          function: {
            name: call.name,
            arguments: JSON.stringify(call.arguments),
          },
        })),
      };
    }
    return {
      role: message.role,
      content: message.content,
    };
  });
}

export async function* streamChatCompletion(
  config: LlmConfig,
  messages: AgentMessage[],
  tools: LlmToolDefinition[],
): AsyncGenerator<{ type: "token"; text: string } | { type: "done"; result: LlmCompletionResult }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  const payload = {
    model: config.model,
    messages: toOpenAiMessages(messages),
    tools,
    tool_choice: "auto" as const,
    temperature: 0.3,
    max_tokens: config.maxTokens,
    stream: true,
  };

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      const body = await response.text();
      throw new Error(`LLM stream ${response.status}: ${body.slice(0, 300)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    const toolCallBuffers = new Map<number, { id: string; name: string; arguments: string }>();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;

        let chunk: {
          choices?: Array<{
            delta?: {
              content?: string;
              tool_calls?: Array<{
                index?: number;
                id?: string;
                function?: { name?: string; arguments?: string };
              }>;
            };
            finish_reason?: string;
          }>;
        };

        try {
          chunk = JSON.parse(data);
        } catch {
          continue;
        }

        const delta = chunk.choices?.[0]?.delta;
        if (delta?.content) {
          content += delta.content;
          yield { type: "token", text: delta.content };
        }

        for (const toolDelta of delta?.tool_calls ?? []) {
          const index = toolDelta.index ?? 0;
          const current = toolCallBuffers.get(index) ?? { id: "", name: "", arguments: "" };
          if (toolDelta.id) current.id = toolDelta.id;
          if (toolDelta.function?.name) current.name = toolDelta.function.name;
          if (toolDelta.function?.arguments) current.arguments += toolDelta.function.arguments;
          toolCallBuffers.set(index, current);
        }
      }
    }

    const toolCalls: ToolCall[] = [];
    for (const buffered of toolCallBuffers.values()) {
      const parsed = parseToolCall(buffered.name, buffered.arguments, buffered.id);
      if (parsed) toolCalls.push(parsed);
    }

    yield {
      type: "done",
      result: {
        content,
        toolCalls,
        finishReason: toolCalls.length > 0 ? "tool_calls" : "stop",
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
