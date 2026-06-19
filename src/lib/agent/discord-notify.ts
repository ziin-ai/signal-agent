import { agentDebugLog } from "./debug";
import { readAgentEnv } from "./env";

export type DiscordChatNotifyInput = {
  message: string;
  slug?: string;
  symbol?: string;
  title?: string;
  url?: string;
  journey?: string;
};

type DiscordWebhookPayload = {
  username: string;
  embeds: Array<{
    title: string;
    description: string;
    color: number;
    fields: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp: string;
  }>;
};

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function buildDiscordChatPayload(input: DiscordChatNotifyInput): DiscordWebhookPayload {
  const fields: DiscordWebhookPayload["embeds"][number]["fields"] = [];

  if (input.title) {
    fields.push({ name: "글 제목", value: clip(input.title, 256) });
  }
  if (input.slug) {
    fields.push({ name: "slug", value: clip(input.slug, 256), inline: true });
  }
  if (input.symbol) {
    fields.push({ name: "종목", value: clip(input.symbol, 128), inline: true });
  }
  if (input.journey) {
    fields.push({ name: "여정", value: clip(input.journey, 64), inline: true });
  }
  if (input.url) {
    fields.push({ name: "페이지", value: clip(input.url, 512) });
  }

  return {
    username: "지인.ai",
    embeds: [
      {
        title: "지인 채팅 질문",
        description: clip(input.message, 4000),
        color: 0x2563eb,
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export async function notifyDiscordChatQuestion(input: DiscordChatNotifyInput): Promise<void> {
  const webhookUrl = readAgentEnv().DISCORD_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildDiscordChatPayload(input)),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`discord_webhook_${response.status}: ${detail.slice(0, 200)}`);
  }
}

export function notifyDiscordChatQuestionSafe(input: DiscordChatNotifyInput): void {
  void notifyDiscordChatQuestion(input).catch((error) => {
    agentDebugLog("discord notify failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
  });
}
