import type { CollectionEntry } from "astro:content";
import { calculateScore, type Source } from "../credibility";
import { buildGlobalTimelineEvents, buildSymbolTimelineEvents, rankEventForDashboard } from "../timeline";
import { getYahooChartSeries, resolveYahooChartSymbol } from "../market";
import type { AgentCitation, ContentStore, LlmToolDefinition, ToolCall, ToolName } from "./types";

export function postSlugFromId(id: string): string {
  return id.replace(/\.md$/, "");
}

function publishedPosts(posts: CollectionEntry<"posts">[]): CollectionEntry<"posts">[] {
  return posts.filter((post) => !post.data.draft);
}

function postHref(slug: string): string {
  return `/posts/${slug}`;
}

function postCitation(post: CollectionEntry<"posts">): AgentCitation {
  const slug = postSlugFromId(post.id);
  return {
    slug,
    title: post.data.title,
    href: postHref(slug),
    excerpt: post.data.summary.slice(0, 200),
  };
}

function scorePost(query: string, post: CollectionEntry<"posts">): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const slug = postSlugFromId(post.id).toLowerCase();
  const title = post.data.title.toLowerCase();
  const summary = post.data.summary.toLowerCase();
  const symbol = post.data.symbol.toLowerCase();
  const tags = post.data.tags.map((tag) => tag.toLowerCase());

  let score = 0;
  if (slug.includes(q)) score += 120;
  if (title.includes(q)) score += 80;
  if (summary.includes(q)) score += 40;
  if (symbol === q) score += 100;
  if (tags.some((tag) => tag.includes(q))) score += 30;

  for (const token of q.split(/\s+/).filter((part) => part.length >= 2)) {
    if (title.includes(token)) score += 20;
    if (summary.includes(token)) score += 10;
    if (tags.some((tag) => tag.includes(token))) score += 8;
  }

  score += post.data.conviction;
  return score;
}

export function searchPosts(
  store: ContentStore,
  args: { query: string; symbol?: string; limit?: number },
): { results: AgentCitation[]; raw: unknown } {
  const limit = Math.min(Math.max(args.limit ?? 5, 1), 10);
  const query = args.query.trim();
  const posts = publishedPosts(store.posts);

  const ranked = posts
    .filter((post) => !args.symbol || post.data.symbol === args.symbol)
    .map((post) => ({ post, score: scorePost(query, post) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.date.getTime() - a.post.data.date.getTime())
    .slice(0, limit)
    .map((item) => item.post);

  const results = ranked.map(postCitation);
  return {
    results,
    raw: results.map((item) => ({
      slug: item.slug,
      title: item.title,
      href: item.href,
      excerpt: item.excerpt,
      conviction: ranked.find((post) => postSlugFromId(post.id) === item.slug)?.data.conviction,
    })),
  };
}

export function getPost(
  store: ContentStore,
  args: { slug: string },
): { result: AgentCitation | null; raw: unknown } {
  const slug = args.slug.trim();
  const post = publishedPosts(store.posts).find((entry) => postSlugFromId(entry.id) === slug);
  if (!post) {
    return { result: null, raw: { error: "post_not_found", slug } };
  }

  const citation = postCitation(post);
  return {
    result: citation,
    raw: {
      ...citation,
      date: post.data.date.toISOString(),
      symbol: post.data.symbol,
      market: post.data.market,
      conviction: post.data.conviction,
      tags: post.data.tags,
      sourceCount: post.data.sources.length,
    },
  };
}

export function getTimelineEvents(
  store: ContentStore,
  args: {
    from?: string;
    to?: string;
    symbol?: string;
    category?: string;
    limit?: number;
  },
): { results: AgentCitation[]; raw: unknown } {
  const limit = Math.min(Math.max(args.limit ?? 8, 1), 20);
  const fromMs = args.from ? new Date(args.from).getTime() : undefined;
  const toMs = args.to ? new Date(args.to).getTime() : undefined;
  const now = new Date();

  let events = args.symbol
    ? buildSymbolTimelineEvents(args.symbol, publishedPosts(store.posts), store.events)
    : buildGlobalTimelineEvents(publishedPosts(store.posts), store.events);

  if (args.category) {
    events = events.filter((event) => event.meta?.category === args.category);
  }
  if (fromMs !== undefined) {
    events = events.filter((event) => new Date(event.at).getTime() >= fromMs);
  }
  if (toMs !== undefined) {
    events = events.filter((event) => new Date(event.at).getTime() <= toMs);
  }

  events = [...events]
    .sort((a, b) => rankEventForDashboard(b, now, { symbol: args.symbol }) - rankEventForDashboard(a, now, { symbol: args.symbol }))
    .slice(0, limit);

  const results: AgentCitation[] = events.map((event) => ({
    slug: event.id,
    title: event.title,
    href: event.href ?? "/",
    excerpt: event.summary ?? "",
  }));

  return {
    results,
    raw: events.map((event) => ({
      id: event.id,
      at: event.at,
      kind: event.kind,
      title: event.title,
      summary: event.summary,
      href: event.href,
      impact: event.meta?.impact,
      category: event.meta?.category,
      symbol: event.meta?.symbol,
    })),
  };
}

function tierLabel(tier: Source["tier"]): string {
  if (tier === 0) return "T0 반박(contra)";
  if (tier === 1) return "T1 1차 자료";
  if (tier === 2) return "T2 전문 리포트";
  if (tier === 3) return "T3 언론";
  return "T4 익명/2차";
}

export function explainCredibility(
  store: ContentStore,
  args: { slug: string },
): { result: AgentCitation | null; raw: unknown } {
  const { result, raw: postRaw } = getPost(store, args);
  if (!result) {
    return { result: null, raw: postRaw };
  }

  const post = publishedPosts(store.posts).find((entry) => postSlugFromId(entry.id) === args.slug.trim());
  if (!post) {
    return { result: null, raw: { error: "post_not_found", slug: args.slug } };
  }

  const sources = post.data.sources as Source[];
  const score = calculateScore(sources);
  const tierCounts = sources.reduce<Record<string, number>>((acc, source) => {
    const label = tierLabel(source.tier);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return {
    result,
    raw: {
      slug: result.slug,
      title: result.title,
      score,
      tierCounts,
      contraCount: sources.filter((source) => source.tier === 0).length,
      sources: sources.map((source) => ({
        id: source.id,
        tier: source.tier,
        tierLabel: tierLabel(source.tier),
        title: source.title,
        type: source.type,
      })),
    },
  };
}

export async function getQuote(args: {
  symbol: string;
  market?: string;
}): Promise<{ raw: unknown }> {
  const yahooSymbol = resolveYahooChartSymbol(args.symbol, args.market);
  if (!yahooSymbol) {
    return { raw: { error: "unsupported_symbol", symbol: args.symbol } };
  }

  try {
    const { closes } = await getYahooChartSeries(args.symbol, {
      range: "1mo",
      interval: "1d",
      market: args.market,
    });
    if (closes.length === 0) {
      return { raw: { error: "quote_unavailable", symbol: args.symbol, yahooSymbol } };
    }

    const price = closes[closes.length - 1]!;
    const prev = closes.length >= 2 ? closes[closes.length - 2]! : price;
    const change = price - prev;
    const changePercent = prev !== 0 ? (change / prev) * 100 : 0;

    return {
      raw: {
        symbol: args.symbol,
        yahooSymbol,
        price,
        change,
        changePercent,
        asOf: new Date().toISOString(),
        note: "Yahoo Finance 일봉 기준 근사치",
      },
    };
  } catch {
    return { raw: { error: "quote_fetch_failed", symbol: args.symbol, yahooSymbol } };
  }
}

export const TOOL_DEFINITIONS: LlmToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "search_posts",
      description: "ziin.ai 분석글을 키워드·종목으로 검색한다.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "검색어" },
          symbol: { type: "string", description: "종목 코드 필터 (선택)" },
          limit: { type: "integer", description: "최대 결과 수 (1-10)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_post",
      description: "slug로 특정 분석글 메타데이터를 조회한다.",
      parameters: {
        type: "object",
        properties: {
          slug: { type: "string", description: "분석글 slug" },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_timeline_events",
      description: "분석글·외부 이벤트 타임라인을 기간·종목·카테고리로 조회한다.",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string", description: "ISO 시작일 (선택)" },
          to: { type: "string", description: "ISO 종료일 (선택)" },
          symbol: { type: "string", description: "종목 필터 (선택)" },
          category: {
            type: "string",
            enum: ["macro", "earnings", "product", "policy", "supply-chain", "news", "other"],
          },
          limit: { type: "integer", description: "최대 결과 수 (1-20)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "explain_credibility",
      description: "분석글의 신뢰도 점수와 출처 tier 구성을 해설용 데이터로 조회한다.",
      parameters: {
        type: "object",
        properties: {
          slug: { type: "string", description: "분석글 slug" },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_quote",
      description: "Yahoo Finance 기준 종목 시세 스냅샷을 조회한다.",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "종목 코드" },
          market: { type: "string", enum: ["KRX", "NASDAQ", "NYSE", "AMEX", "OTC"] },
        },
        required: ["symbol"],
      },
    },
  },
];

export async function executeToolCall(
  store: ContentStore,
  call: ToolCall,
): Promise<{ content: string; citations: AgentCitation[] }> {
  const citations: AgentCitation[] = [];

  switch (call.name) {
    case "search_posts": {
      const { results, raw } = searchPosts(store, {
        query: String(call.arguments.query ?? ""),
        symbol: call.arguments.symbol ? String(call.arguments.symbol) : undefined,
        limit: typeof call.arguments.limit === "number" ? call.arguments.limit : undefined,
      });
      citations.push(...results);
      return { content: JSON.stringify(raw), citations };
    }
    case "get_post": {
      const { result, raw } = getPost(store, { slug: String(call.arguments.slug ?? "") });
      if (result) citations.push(result);
      return { content: JSON.stringify(raw), citations };
    }
    case "get_timeline_events": {
      const { results, raw } = getTimelineEvents(store, {
        from: call.arguments.from ? String(call.arguments.from) : undefined,
        to: call.arguments.to ? String(call.arguments.to) : undefined,
        symbol: call.arguments.symbol ? String(call.arguments.symbol) : undefined,
        category: call.arguments.category ? String(call.arguments.category) : undefined,
        limit: typeof call.arguments.limit === "number" ? call.arguments.limit : undefined,
      });
      citations.push(...results.filter((item) => item.href.startsWith("/posts/")));
      return { content: JSON.stringify(raw), citations };
    }
    case "explain_credibility": {
      const { result, raw } = explainCredibility(store, { slug: String(call.arguments.slug ?? "") });
      if (result) citations.push(result);
      return { content: JSON.stringify(raw), citations };
    }
    case "get_quote": {
      const { raw } = await getQuote({
        symbol: String(call.arguments.symbol ?? ""),
        market: call.arguments.market ? String(call.arguments.market) : undefined,
      });
      return { content: JSON.stringify(raw), citations };
    }
    default: {
      const unknown = call.name as string;
      return { content: JSON.stringify({ error: "unknown_tool", name: unknown }), citations };
    }
  }
}

export function parseToolCall(name: string, argsJson: string, id: string): ToolCall | null {
  const toolName = name as ToolName;
  if (!TOOL_DEFINITIONS.some((tool) => tool.function.name === toolName)) {
    return null;
  }

  try {
    const parsed = JSON.parse(argsJson) as Record<string, unknown>;
    return { id, name: toolName, arguments: parsed };
  } catch {
    return null;
  }
}
