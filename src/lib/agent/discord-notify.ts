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
  await postDiscordWebhook(webhookUrl, buildDiscordChatPayload(input));
}

export function notifyDiscordChatQuestionSafe(input: DiscordChatNotifyInput): void {
  void notifyDiscordChatQuestion(input).catch((error) => {
    agentDebugLog("discord notify failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
  });
}

export type DiscordPageviewNotifyInput = {
  path: string;
  title?: string;
  referrer?: string;
  slug?: string;
  symbol?: string;
  userAgent?: string;
  language?: string;
};

export function buildDiscordPageviewPayload(input: DiscordPageviewNotifyInput): DiscordWebhookPayload {
  const fields: DiscordWebhookPayload["embeds"][number]["fields"] = [
    { name: "경로", value: clip(input.path, 512) },
  ];

  if (input.title) {
    fields.push({ name: "제목", value: clip(input.title, 256) });
  }
  if (input.slug) {
    fields.push({ name: "slug", value: clip(input.slug, 256), inline: true });
  }
  if (input.symbol) {
    fields.push({ name: "종목", value: clip(input.symbol, 128), inline: true });
  }
  if (input.language) {
    fields.push({ name: "언어", value: clip(input.language, 32), inline: true });
  }
  if (input.referrer) {
    fields.push({ name: "referrer", value: clip(input.referrer, 512) });
  }
  if (input.userAgent) {
    fields.push({ name: "UA", value: clip(input.userAgent, 256) });
  }

  return {
    username: "지인.ai",
    embeds: [
      {
        title: "페이지 열림",
        description: clip(input.title || input.path, 256),
        color: 0x0f766e,
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export function isBotUserAgent(userAgent: string): boolean {
  return /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|lighthouse|headless|pingdom|uptime/i.test(
    userAgent,
  );
}

async function postDiscordWebhook(webhookUrl: string, payload: DiscordWebhookPayload): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`discord_webhook_${response.status}: ${detail.slice(0, 200)}`);
  }
}

export async function notifyDiscordPageview(input: DiscordPageviewNotifyInput): Promise<void> {
  const webhookUrl = readAgentEnv().DISCORD_PAGEVIEW_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;
  await postDiscordWebhook(webhookUrl, buildDiscordPageviewPayload(input));
}

export function notifyDiscordPageviewSafe(input: DiscordPageviewNotifyInput): void {
  void notifyDiscordPageview(input).catch((error) => {
    agentDebugLog("discord pageview notify failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
  });
}
