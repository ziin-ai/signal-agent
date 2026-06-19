import { explainCredibility, getPost, getTimelineEvents, searchPosts } from "./tools";
import type { AgentChatRequest, AgentCitation, ContentStore } from "./types";

function monthRangeFromMessage(message: string): { from?: string; to?: string } {
  const monthMatch = message.match(/(\d{1,2})\s*월/);
  if (!monthMatch) return {};

  const month = Number(monthMatch[1]);
  if (!Number.isFinite(month) || month < 1 || month > 12) return {};

  const year = new Date().getFullYear();
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { from: from.toISOString(), to: to.toISOString() };
}

function dedupeCitations(citations: AgentCitation[]): AgentCitation[] {
  const seen = new Set<string>();
  const out: AgentCitation[] = [];
  for (const citation of citations) {
    const key = `${citation.href}|${citation.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(citation);
  }
  return out;
}

/** Cursor·fallback 공용 — posts/events frontmatter JSON 패킷 */
export function gatherJiinToolContext(
  store: ContentStore,
  request: AgentChatRequest,
): { citations: AgentCitation[]; contextJson: string } {
  const citations: AgentCitation[] = [];
  const blocks: Record<string, unknown> = {};

  if (request.context?.slug) {
    const { result, raw } = getPost(store, { slug: request.context.slug });
    if (result) {
      citations.push(result);
      blocks.currentPost = raw;
    }
    const cred = explainCredibility(store, { slug: request.context.slug });
    if (cred.result) {
      citations.push(cred.result);
      blocks.credibility = cred.raw;
    }
  }

  const { results, raw: searchRaw } = searchPosts(store, {
    query: request.message,
    symbol: request.context?.symbol,
    limit: 5,
  });
  citations.push(...results);
  blocks.searchResults = searchRaw;

  const range = monthRangeFromMessage(request.message);
  const { results: eventCites, raw: eventsRaw } = getTimelineEvents(store, {
    ...range,
    symbol: request.context?.symbol,
    limit: 6,
  });
  citations.push(...eventCites.filter((item) => item.href.startsWith("/posts/")));
  blocks.timelineEvents = eventsRaw;

  const contextJson = JSON.stringify(blocks, null, 2).slice(0, 14_000);

  return {
    citations: dedupeCitations(citations),
    contextJson,
  };
}
