import { visit } from "unist-util-visit";
import type { Root, Text } from "mdast";
import type { Plugin } from "unified";

const CITE_PATTERN = /\{\{cite:([a-zA-Z0-9_-]+)(?:\|([^}]+))?\}\}/g;

export const remarkCitations: Plugin<[], Root> = () => {
  return (tree, file) => {
    const escapeHtml = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;");

    const raw = String(file.value ?? "");
    const sourceBlocks = [
      ...raw.matchAll(
        /-\s+id:\s*"([^"]+)"[\s\S]*?\n\s+tier:\s*(\d+)[\s\S]*?\n\s+title:\s*"([^"]+)"[\s\S]*?\n\s+url:\s*"([^"]+)"/g,
      ),
    ];
    const sourceById = new Map<string, { tier: string; title: string; url: string }>(
      sourceBlocks.map((match) => [match[1], { tier: match[2], title: match[3], url: match[4] }]),
    );

    visit(tree, "text", (node, index, parent) => {
      if (index === undefined || !parent) return;
      const textNode = node as Text;
      if (!CITE_PATTERN.test(textNode.value)) return;

      CITE_PATTERN.lastIndex = 0;
      const children: Root["children"] = [];
      let lastIndex = 0;

      for (const match of textNode.value.matchAll(CITE_PATTERN)) {
        const [full, citeId, explicitUrl] = match;
        const start = match.index ?? 0;
        if (start > lastIndex) {
          children.push({ type: "text", value: textNode.value.slice(lastIndex, start) });
        }
        const source = sourceById.get(citeId);
        const href = (explicitUrl || source?.url || "").trim();
        const badgeContent = explicitUrl ? source?.title || citeId : source?.title || citeId;
        const safeLabel = escapeHtml(badgeContent);
        const safeTitle = escapeHtml(badgeContent);
        const tier = source?.tier ?? "";
        const tierAttr = tier !== "" ? ` data-jiin-cite-tier="${escapeHtml(tier)}"` : "";
        const html = href
          ? `<button type="button" data-jiin-cite-id="${escapeHtml(citeId)}"${tierAttr} title="${safeTitle}" class="jiin-cite-chip mx-0.5 inline-flex max-w-[220px] truncate rounded border border-info/40 bg-info/10 px-1.5 py-0.5 text-xs text-info hover:bg-info/20">${safeLabel}</button><a href="${href}" target="_blank" rel="noopener noreferrer" class="jiin-cite-ext ml-0.5 inline-flex align-middle text-[10px] text-slate-400 hover:text-info" aria-label="원문 열기" title="원문">↗</a>`
          : `<button type="button" data-jiin-cite-id="${escapeHtml(citeId)}"${tierAttr} title="${safeTitle}" class="jiin-cite-chip mx-0.5 inline-flex max-w-[220px] truncate rounded border border-info/40 bg-info/10 px-1.5 py-0.5 text-xs text-info hover:bg-info/20">${safeLabel}</button>`;
        children.push({
          type: "html",
          value: html,
        });
        lastIndex = start + full.length;
      }

      if (lastIndex < textNode.value.length) {
        children.push({ type: "text", value: textNode.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...children);
    });
  };
};
