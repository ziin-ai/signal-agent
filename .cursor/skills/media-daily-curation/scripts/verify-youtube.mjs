#!/usr/bin/env node
/**
 * Verify YouTube video IDs via oEmbed (+ optional length/publish from watch HTML).
 * Usage: node verify-youtube.mjs <id> [<id>...]
 * Exit 0 always; prints JSON lines. Agent must reject non-whitelist authors.
 */

const ids = process.argv.slice(2).filter(Boolean);
if (ids.length === 0) {
  console.error("Usage: node verify-youtube.mjs <youtubeId> [<youtubeId>...]");
  process.exit(1);
}

const WHITELIST_AUTHOR_HINTS = [
  "federal reserve",
  "한국경제tv",
  "한국은행",
  "연합인포맥스",
  "yonhap",
  "infomax",
  "bank of korea",
  "bloomberg",
  "cnbc",
  "reuters",
  "wall street journal",
  "wsj",
  "financial times",
  "yahoo finance",
  "삼프로",
  "3pro",
  "슈카",
  "달란트",
  "소수몽키",
  "머니투데이",
  "mtn",
];

async function oembed(id) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`oembed ${res.status}`);
  return res.json();
}

async function watchMeta(id) {
  const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
    headers: { "Accept-Language": "en-US,en;q=0.9" },
  });
  const html = await res.text();
  const length = html.match(/"lengthSeconds":"(\d+)"/)?.[1];
  const publish =
    html.match(/"publishDate":"([^"]+)"/)?.[1] ||
    html.match(/"uploadDate":"([^"]+)"/)?.[1];
  return {
    durationSec: length ? Number(length) : null,
    publishDate: publish || null,
  };
}

function likelyWhitelisted(authorName) {
  const a = String(authorName || "").toLowerCase();
  return WHITELIST_AUTHOR_HINTS.some((h) => a.includes(h));
}

for (const id of ids) {
  try {
    const oe = await oembed(id);
    const meta = await watchMeta(id);
    const row = {
      ok: true,
      youtubeId: id,
      title: oe.title,
      author_name: oe.author_name,
      author_url: oe.author_url,
      whitelistHint: likelyWhitelisted(oe.author_name),
      durationSec: meta.durationSec,
      publishDate: meta.publishDate,
    };
    console.log(JSON.stringify(row));
  } catch (e) {
    console.log(
      JSON.stringify({
        ok: false,
        youtubeId: id,
        error: e instanceof Error ? e.message : String(e),
      }),
    );
  }
}
