import { readAgentEnv } from "./env";
import { buildSystemPrompt } from "./persona";
import type { AgentChatRequest } from "./types";

export type CursorJiinPromptInput = {
  request: AgentChatRequest;
  contextJson: string;
  cwd: string;
};

function buildCursorPrompt({ request, contextJson }: CursorJiinPromptInput): string {
  const history = (request.history ?? [])
    .slice(-8)
    .map((item) => `${item.role === "user" ? "사용자" : "지인"}: ${item.content}`)
    .join("\n");

  return [
    buildSystemPrompt(request.context),
    "",
    "## Cursor Agent 제약",
    "- 읽기 전용 모드입니다. 파일을 수정·생성·삭제하거나 git 커밋하지 마세요.",
    "- 아래 TOOL_CONTEXT와 필요 시 src/content/posts, src/content/events만 근거로 답하세요.",
    "- 수치·날짜·등급은 TOOL_CONTEXT JSON을 우선 인용하세요.",
    "- 한국어로, 지인 톤으로 답하세요.",
    "",
    "## TOOL_CONTEXT (ziin.ai frontmatter)",
    contextJson,
    history ? `\n## 이전 대화\n${history}` : "",
    "",
    `## 사용자 질문\n${request.message.trim()}`,
  ].join("\n");
}

export async function runCursorJiinPrompt(input: CursorJiinPromptInput): Promise<string> {
  const env = readAgentEnv();
  const apiKey = env.CURSOR_API_KEY;
  if (!apiKey) {
    throw new Error("CURSOR_API_KEY is not set");
  }

  const modelId = env.CURSOR_MODEL?.trim() || "composer-2.5";
  const prompt = buildCursorPrompt(input);

  const { Agent } = await import("@cursor/sdk");

  const cloudRepo = env.CURSOR_CLOUD_REPO?.trim();

  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: modelId },
    ...(cloudRepo
      ? {
          cloud: {
            repos: [cloudRepo],
          },
        }
      : {
          local: {
            cwd: input.cwd,
            settingSources: [],
          },
        }),
  });

  if (result.status === "error") {
    throw new Error(`Cursor agent run failed (${result.id ?? "unknown"})`);
  }

  const text = typeof result.result === "string" ? result.result.trim() : "";
  if (!text) {
    throw new Error("Cursor agent returned empty result");
  }

  return text;
}

export async function runCursorJiinSuggestionPrompt(input: {
  contextJson: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  cwd: string;
}): Promise<string> {
  const env = readAgentEnv();
  const apiKey = env.CURSOR_API_KEY;
  if (!apiKey) {
    throw new Error("CURSOR_API_KEY is not set");
  }

  const modelId = env.CURSOR_MODEL?.trim() || "composer-2.5";
  const history = (input.history ?? [])
    .slice(-6)
    .map((item) => `${item.role === "user" ? "사용자" : "지인"}: ${item.content}`)
    .join("\n");

  const prompt = [
    "당신은 ziin.ai 지인 분석 어시스턴트입니다.",
    "아래 TOOL_CONTEXT와 recentConversation만 보고, 사용자가 이어서 물어볼 질문 칩 3개를 제안하세요.",
    "규칙:",
    "- 한국어, 매수/매도 권유 금지",
    "- label: 12자 이내",
    "- message: 한 문장 질문",
    "- 이미 한 질문은 반복하지 마세요",
    '- JSON 배열만 출력: [{"label":"...","message":"..."}]',
    "",
    "## TOOL_CONTEXT",
    input.contextJson,
    history ? `\n## recentConversation\n${history}` : "",
  ].join("\n");

  const { Agent } = await import("@cursor/sdk");
  const cloudRepo = env.CURSOR_CLOUD_REPO?.trim();

  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: modelId },
    ...(cloudRepo
      ? { cloud: { repos: [cloudRepo] } }
      : { local: { cwd: input.cwd, settingSources: [] } }),
  });

  if (result.status === "error") {
    throw new Error(`Cursor suggestion run failed (${result.id ?? "unknown"})`);
  }

  const text = typeof result.result === "string" ? result.result.trim() : "";
  if (!text) {
    throw new Error("Cursor suggestion returned empty result");
  }

  return text;
}
