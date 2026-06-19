import { visit } from "unist-util-visit";
import type { Root, Text } from "mdast";
import type { Plugin } from "unified";

const CITE_PATTERN = /\{\{cite:([a-zA-Z0-9_-]+)(?:\|([^}]+))?\}\}/g;

export type CitationSourceMeta = {
  id: string;
  tier: number;
  title: string;
  url: string;
};

type RemarkCitationsOptions = {
  sources?: CitationSourceMeta[];
};

type AstroFrontmatter = {
  sources?: Array<{
    id: string;
    tier: number;
    title: string;
    url: string;
  }>;
};

function resolveSources(
  options: RemarkCitationsOptions,
  frontmatter: AstroFrontmatter | undefined,
  raw: string,
): CitationSourceMeta[] {
  if (options.sources && options.sources.length > 0) {
    return options.sources;
  }

  const fromFrontmatter = frontmatter?.sources;
  if (Array.isArray(fromFrontmatter) && fromFrontmatter.length > 0) {
    return fromFrontmatter.map((source) => ({
      id: source.id,
      tier: source.tier,
      title: source.title,
      url: source.url,
    }));
  }

  return [...parseSourcesFromRaw(raw).values()];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function parseSourcesFromRaw(raw: string): Map<string, CitationSourceMeta> {
  const sourceBlocks = [
    ...raw.matchAll(
      /-\s+id:\s*"([^"]+)"[\s\S]*?\n\s+tier:\s*(\d+)[\s\S]*?\n\s+title:\s*"([^"]+)"[\s\S]*?\n\s+url:\s*"([^"]+)"/g,
    ),
  ];
  return new Map(
    sourceBlocks.map((match) => [
      match[1],
      {
        id: match[1],
        tier: Number(match[2]),
        title: match[3],
        url: match[4],
      },
    ]),
  );
}

function sourceNumber(sources: CitationSourceMeta[], citeId: string): number {
  const index = sources.findIndex((source) => source.id === citeId);
  return index >= 0 ? index + 1 : 0;
}

function buildChipHtml(
  citeId: string,
  explicitUrl: string | undefined,
  source: CitationSourceMeta | undefined,
  refNum: number,
): string {
  const href = (explicitUrl || source?.url || "").trim();
  const fullTitle = source?.title || citeId;
  const safeTitle = escapeHtml(fullTitle);
  const tier = source?.tier ?? "";
  const tierAttr = tier !== "" ? ` data-jiin-cite-tier="${escapeHtml(String(tier))}"` : "";
  const num = refNum > 0 ? String(refNum) : escapeHtml(citeId.replace(/^src-/, "#"));
  const ariaLabel = refNum > 0 ? `출처 ${refNum}: ${safeTitle}` : `출처: ${safeTitle}`;

  const ext = href
    ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="jiin-cite-ext" aria-label="${ariaLabel} — 원문" title="원문"><span aria-hidden="true">↗</span></a>`
    : "";

  return `<span class="jiin-cite-item"${tierAttr}><button type="button" data-jiin-cite-id="${escapeHtml(citeId)}" class="jiin-cite-mark" aria-label="${ariaLabel}" title="${safeTitle}"><span class="jiin-cite-num">${num}</span></button>${ext}</span>`;
}

export const remarkCitations: Plugin<[RemarkCitationsOptions?], Root> = (options = {}) => {
  return (tree, file) => {
    const raw = String(file.value ?? "");
    const frontmatter = (file.data as { astro?: { frontmatter?: AstroFrontmatter } } | undefined)?.astro
      ?.frontmatter;
    const sourcesList = resolveSources(options, frontmatter, raw);
    const sourceById = new Map(sourcesList.map((source) => [source.id, source]));

    visit(tree, "text", (node, index, parent) => {
      if (index === undefined || !parent) return;
      const textNode = node as Text;
      if (!CITE_PATTERN.test(textNode.value)) return;

      CITE_PATTERN.lastIndex = 0;
      const children: Root["children"] = [];
      let lastIndex = 0;
      const citeBuffer: string[] = [];

      const flushCiteBuffer = () => {
        if (citeBuffer.length === 0) return;
        const inner = citeBuffer
          .map((item, i) => (i === 0 ? item : `<span class="jiin-cite-sep" aria-hidden="true">·</span>${item}`))
          .join("");
        children.push({
          type: "html",
          value: `<sub class="jiin-cite-group" role="doc-noteref">${inner}</sub>`,
        });
        citeBuffer.length = 0;
      };

      for (const match of textNode.value.matchAll(CITE_PATTERN)) {
        const [full, citeId, explicitUrl] = match;
        const start = match.index ?? 0;
        if (start > lastIndex) {
          flushCiteBuffer();
          children.push({ type: "text", value: textNode.value.slice(lastIndex, start) });
        }
        const source = sourceById.get(citeId);
        const refNum = sourcesList.length > 0 ? sourceNumber(sourcesList, citeId) : 0;
        citeBuffer.push(buildChipHtml(citeId, explicitUrl, source, refNum));
        lastIndex = start + full.length;
      }

      flushCiteBuffer();
      if (lastIndex < textNode.value.length) {
        children.push({ type: "text", value: textNode.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...children);
    });
  };
};
