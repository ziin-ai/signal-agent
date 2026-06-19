import { useCallback, useEffect, useState } from "react";
import type { ChatResponse } from "./chat-client";
import {
  fetchChatSuggestions,
  readPageAgentContext,
  sendChatMessage,
  type SuggestedPrompt,
} from "./chat-client";
import type { ChecklistItem, JourneyStep, ScenarioCard } from "./types";

export type JiinChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatResponse["citations"];
  mode?: ChatResponse["mode"];
  journey?: ChatResponse["journey"];
  scenarios?: ScenarioCard[];
  checklist?: ChecklistItem[];
  steps?: JourneyStep[];
};

export const JIIN_CHAT_GREETING =
  "안녕하세요, 곁에 있는 지인이에요. 아래 여정을 고르거나 직접 물어봐도 돼요.";

/** FAB 위젯 오프닝 */
export function buildWidgetGreeting(title?: string): string {
  if (title) {
    const short = title.length > 32 ? `${title.slice(0, 29)}…` : title;
    return `지금 보시는 ${short} 글이요? 궁금한 거 물어보세요.`;
  }
  return "궁금한 거 물어보세요. 분석·시나리오 기준으로 답해드릴게요.";
}

export const WIDGET_GREETING_PROMPTS: SuggestedPrompt[] = [
  { label: "핵심이 뭐야?", message: "이 글 핵심 3줄 요약" },
  { label: "반박 있어?", message: "반박 근거" },
];

/** 대시보드·글 컨텍스트 오프닝 — 1인칭 대화 톤 */
export function buildJiinOpening(whisper: string, symbol?: string): string {
  const hook = whisper.length > 140 ? `${whisper.slice(0, 137)}…` : whisper;
  const scope = symbol ? `${symbol} 글` : "오늘 글";
  return [
    `안녕, ${scope} 같이 읽고 있어.`,
    "",
    `한 줄로 요약하면 — ${hook}`,
    "",
    "궁금한 건 아래에 적어줘. 칩을 눌러도 돼.",
  ].join("\n");
}

export const JIIN_JOURNEY_LAUNCHERS: Array<{
  id: NonNullable<ChatResponse["journey"]>;
  label: string;
  message: string;
}> = [
  { id: "briefing-60", label: "60초 장전", message: "60초 장전 브리핑" },
  { id: "catalysts", label: "촉매", message: "앞으로 볼 촉매 정리" },
  { id: "contra", label: "반박만", message: "반박 근거만 보기" },
  { id: "summary-3", label: "3줄 요약", message: "3줄 요약" },
  { id: "scenario", label: "판단 프레임", message: "판단 프레임 보기" },
];

function nextId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function stripJiinDisclaimer(text: string): string {
  const marker = "\n\n---\n";
  const idx = text.indexOf(marker);
  return idx >= 0 ? text.slice(0, idx).trim() : text.trim();
}

function greetingMessage(text: string): JiinChatMessage {
  return { id: "greeting", role: "assistant", content: text };
}

function toSuggestionHistory(messages: JiinChatMessage[]) {
  return messages
    .filter((msg) => msg.id !== "greeting")
    .slice(-8)
    .map((msg) => ({ role: msg.role, content: msg.content }));
}

type Options = {
  basePath: string;
  slug?: string;
  symbol?: string;
  greeting?: string;
};

export function useJiinChat({ basePath, slug, symbol, greeting = JIIN_CHAT_GREETING }: Options) {
  const [messages, setMessages] = useState<JiinChatMessage[]>(() => [greetingMessage(greeting)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsMode, setPromptsMode] = useState<"llm" | "cursor" | "heuristic" | null>(null);

  const refreshSuggestions = useCallback(
    async (historyMessages: JiinChatMessage[]) => {
      const page = readPageAgentContext();
      const history = toSuggestionHistory(historyMessages);

      setPromptsLoading(true);
      try {
        const result = await fetchChatSuggestions(
          basePath,
          {
            slug,
            symbol,
            title: page.title,
            url: page.url,
          },
          history.length > 0 ? history : undefined,
        );
        if (result.prompts.length > 0) {
          setSuggestedPrompts(result.prompts);
        }
        setPromptsMode(result.mode);
      } catch {
        setPromptsMode("heuristic");
      } finally {
        setPromptsLoading(false);
      }
    },
    [basePath, slug, symbol],
  );

  const reset = useCallback(() => {
    setMessages([greetingMessage(greeting)]);
    setInput("");
    setError(null);
    setLoading(false);
    void refreshSuggestions([greetingMessage(greeting)]);
  }, [greeting, refreshSuggestions]);

  useEffect(() => {
    const initial = [greetingMessage(greeting)];
    setMessages(initial);
    void refreshSuggestions(initial);
  }, [greeting, refreshSuggestions]);

  const appendAssistant = useCallback((message: Omit<JiinChatMessage, "id" | "role">) => {
    setMessages((prev) => {
      const next = [...prev, { id: nextId(), role: "assistant" as const, ...message }];
      void refreshSuggestions(next);
      return next;
    });
  }, [refreshSuggestions]);

  const send = useCallback(
    async (text: string, journey?: ChatResponse["journey"]) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      setLoading(true);
      setSuggestedPrompts([]);
      setInput("");

      const userMessage: JiinChatMessage = { id: nextId(), role: "user", content: trimmed };
      const withUser = [...messages, userMessage];
      setMessages(withUser);

      const history = toSuggestionHistory(withUser);

      try {
        const response = await sendChatMessage(basePath, {
          message: trimmed,
          journey,
          context: { ...readPageAgentContext(), slug, symbol },
          history: history.slice(0, -1),
        });

        const assistantMessage: JiinChatMessage = {
          id: nextId(),
          role: "assistant",
          content: stripJiinDisclaimer(response.text),
          citations: response.citations,
          mode: response.mode,
          journey: response.journey,
          scenarios: response.scenarios,
          checklist: response.checklist,
          steps: response.steps,
        };

        const withAssistant = [...withUser, assistantMessage];
        setMessages(withAssistant);
        void refreshSuggestions(withAssistant);
      } catch {
        setError("잠시 연결이 어려워요. 잠깐 후 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    },
    [basePath, loading, messages, refreshSuggestions, slug, symbol],
  );

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    send,
    reset,
    appendAssistant,
    suggestedPrompts,
    promptsLoading,
    promptsMode,
  };
}
