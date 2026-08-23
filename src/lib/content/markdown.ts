import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { remarkCitations, type CitationSourceMeta } from "../../plugins/remark-citations";
import type { PostEntry } from "./store";

const htmlCache = new Map<string, string>();

function sourceMeta(post: PostEntry): CitationSourceMeta[] {
  return post.data.sources.map((source) => ({
    id: source.id,
    tier: source.tier,
    title: source.title,
    url: source.url,
  }));
}

export async function renderMarkdownHtml(body: string, sources: CitationSourceMeta[] = []): Promise<string> {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkCitations, { sources })
    .use(remarkHtml, { sanitize: false })
    .process(body);
  return String(file);
}

export async function renderPostHtml(post: PostEntry): Promise<string> {
  const cacheKey = `${post.id}:${post.body.length}:${post.data.date.getTime()}`;
  const cached = htmlCache.get(cacheKey);
  if (cached) return cached;
  const html = await renderMarkdownHtml(post.body, sourceMeta(post));
  htmlCache.set(cacheKey, html);
  if (htmlCache.size > 400) {
    const first = htmlCache.keys().next().value;
    if (first) htmlCache.delete(first);
  }
  return html;
}
