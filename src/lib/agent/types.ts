import type { CollectionEntry } from "astro:content";

export type AgentRole = "user" | "assistant" | "system" | "tool";

export type AgentMessage = {
  role: AgentRole;
  content: string;
  toolCallId?: string;
  name?: string;
  toolCalls?: ToolCall[];
};

export type PageContext = {
  slug?: string;
  symbol?: string;
  url?: string;
};

export type AgentCitation = {
  slug: string;
  title: string;
  href: string;
  excerpt: string;
};

export type AgentJourneyId = "scenario" | "briefing-60" | "catalysts" | "contra" | "summary-3";

export type ScenarioKind = "bull" | "base" | "bear";

export type ScenarioCard = {
  kind: ScenarioKind;
  title: string;
  body: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  hint: string;
  href?: string;
};

export type JourneyStep = {
  title: string;
  body: string;
};

export type AgentChatRequest = {
  message: string;
  stream?: boolean;
  journey?: AgentJourneyId;
  context?: PageContext;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  /** AGENT_DEBUG=true 또는 dev에서만 trace 반환 */
  debug?: boolean;
};

export type AgentDebugTrace = import("./debug").AgentDebugTrace;

export type AgentChatResponse = {
  text: string;
  citations: AgentCitation[];
  grounded: boolean;
  disclaimer: string;
  mode: "llm" | "fallback" | "cursor";
  journey?: AgentJourneyId;
  scenarios?: ScenarioCard[];
  checklist?: ChecklistItem[];
  steps?: JourneyStep[];
  debug?: AgentDebugTrace;
};

export type ContentStore = {
  posts: CollectionEntry<"posts">[];
  events: CollectionEntry<"events">[];
};

export type ToolName =
  | "search_posts"
  | "get_post"
  | "get_timeline_events"
  | "explain_credibility"
  | "get_quote";

export type ToolCall = {
  id: string;
  name: ToolName;
  arguments: Record<string, unknown>;
};

export type LlmToolDefinition = {
  type: "function";
  function: {
    name: ToolName;
    description: string;
    parameters: Record<string, unknown>;
  };
};
