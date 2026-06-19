export type ChatCitation = {
  slug: string;
  title: string;
  href: string;
  excerpt: string;
};

export type ChatResponse = {
  text: string;
  citations: ChatCitation[];
  grounded: boolean;
  disclaimer: string;
  mode: "llm" | "fallback" | "cursor";
  debug?: {
    route: string;
    llmEnabled: boolean;
    llmError?: string;
    latencyMs: number;
    toolRounds?: Array<{ round: number; toolCalls: Array<{ name: string }> }>;
  };
  journey?: "scenario" | "briefing-60" | "catalysts" | "contra" | "summary-3";
  scenarios?: Array<{ kind: "bull" | "base" | "bear"; title: string; body: string }>;
  checklist?: Array<{ id: string; label: string; hint: string; href?: string }>;
  steps?: Array<{ title: string; body: string }>;
};

export type ChatRequest = {
  message: string;
  journey?: ChatResponse["journey"];
  context?: {
    slug?: string;
    symbol?: string;
    url?: string;
    title?: string;
  };
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

export type SuggestedPrompt = {
  label: string;
  message: string;
};

export type SuggestionsResponse = {
  prompts: SuggestedPrompt[];
  mode: "llm" | "cursor" | "heuristic";
};

function apiUrl(basePath: string): string {
  const root = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return `${root}api/chat`;
}

function suggestionsApiUrl(basePath: string): string {
  const root = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return `${root}api/chat/suggestions`;
}

export async function fetchChatSuggestions(
  basePath: string,
  context?: ChatRequest["context"],
  history?: ChatRequest["history"],
): Promise<SuggestionsResponse> {
  const response = await fetch(suggestionsApiUrl(basePath), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, history }),
  });

  if (!response.ok) {
    throw new Error(`suggestions_${response.status}`);
  }

  return (await response.json()) as SuggestionsResponse;
}

export async function sendChatMessage(basePath: string, body: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(apiUrl(basePath), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `chat_${response.status}`);
  }

  return (await response.json()) as ChatResponse;
}

export function withBasePath(basePath: string, href: string): string {
  if (!href.startsWith("/")) return href;
  const root = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  if (!root || root === "/") return href;
  return `${root}${href}`;
}

export const JIIN_OPEN_EVENT = "jiin:open";

export type JiinOpenDetail = {
  message?: string;
  journey?: ChatRequest["journey"];
};

export function openJiinChat(detail?: JiinOpenDetail): void {
  window.dispatchEvent(new CustomEvent(JIIN_OPEN_EVENT, { detail: detail ?? {} }));
}

export function readPageAgentContext(): { slug?: string; symbol?: string; url?: string; title?: string } {
  if (typeof document === "undefined") {
    return {};
  }
  const slug = document.querySelector('meta[name="ziin-agent-slug"]')?.getAttribute("content") ?? undefined;
  const symbol = document.querySelector('meta[name="ziin-agent-symbol"]')?.getAttribute("content") ?? undefined;
  const title = document.querySelector('meta[name="ziin-agent-title"]')?.getAttribute("content") ?? undefined;
  return {
    slug: slug || undefined,
    symbol: symbol || undefined,
    title: title || undefined,
    url: window.location.pathname + window.location.search,
  };
}
