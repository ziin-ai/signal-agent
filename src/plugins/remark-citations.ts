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
      ...raw.matchAll(/-\s+id:\s*"([^"]+)"[\s\S]*?\n\s+title:\s*"([^"]+)"[\s\S]*?\n\s+url:\s*"([^"]+)"/g),
    ];
    const sourceById = new Map<string, { title: string; url: string }>(
      sourceBlocks.map((match) => [match[1], { title: match[2], url: match[3] }]),
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
        const html = href
          ? `<a href="${href}" title="${safeTitle}" target="_blank" rel="noopener noreferrer" class="mx-0.5 inline-flex max-w-[220px] truncate rounded border border-info/40 bg-info/10 px-1.5 py-0.5 text-xs text-info hover:bg-info/20">${safeLabel}</a>`
          : `<span title="${safeTitle}" class="mx-0.5 inline-flex max-w-[220px] truncate rounded border border-info/40 bg-info/10 px-1.5 py-0.5 text-xs text-info">${safeLabel}</span>`;
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
