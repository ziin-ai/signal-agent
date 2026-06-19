#!/usr/bin/env node
/**
 * 지인 Agent LLM 연결·응답 디버그 CLI
 *
 * Usage:
 *   pnpm agent:debug
 *   pnpm agent:debug -- --chat "3줄 요약" --slug 2026-06-11-korea-market-outlook
 *   CHAT_BASE_URL=http://127.0.0.1:4321 pnpm agent:debug -- --probe-only
 */

const base = (process.env.CHAT_BASE_URL || "http://127.0.0.1:4321").replace(/\/$/, "");

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

const probeOnly = process.argv.includes("--probe-only");
const withChat = process.argv.includes("--chat") || arg("chat");
const message = arg("chat") || "LLM 연결 테스트 — 한 줄로 응답해줘";
const slug = arg("slug");
const symbol = arg("symbol");

async function main() {
  console.log(`\n🔍 agent debug → ${base}\n`);

  const healthUrl = new URL(`${base}/api/agent/debug`);
  if (withChat && !probeOnly) {
    healthUrl.searchParams.set("chat", "1");
    healthUrl.searchParams.set("message", message);
    if (slug) healthUrl.searchParams.set("slug", slug);
    if (symbol) healthUrl.searchParams.set("symbol", symbol);
  }

  const healthRes = await fetch(healthUrl);
  const health = await healthRes.json();

  console.log("── GET /api/agent/debug ──");
  console.log(JSON.stringify(health, null, 2));

  if (probeOnly) return;

  console.log("\n── POST /api/chat (debug: true) ──");
  const chatRes = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      debug: true,
      context: { slug, symbol },
    }),
  });

  const chat = await chatRes.json();
  console.log(JSON.stringify(chat, null, 2));

  if (chat.debug) {
    console.log("\n── summary ──");
    console.log(`mode: ${chat.mode}`);
    console.log(`route: ${chat.debug.route}`);
    console.log(`latency: ${chat.debug.latencyMs}ms`);
    if (chat.debug.llmError) console.log(`llmError: ${chat.debug.llmError}`);
    if (chat.debug.toolRounds?.length) {
      console.log(`toolRounds: ${chat.debug.toolRounds.length}`);
      for (const round of chat.debug.toolRounds) {
        console.log(`  #${round.round} tools=${round.toolCalls.map((t) => t.name).join(", ") || "(none)"}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
