import { load as loadYaml } from "js-yaml";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export type ParsedMarkdown<T> = {
  data: T;
  body: string;
};

export function splitMarkdownFrontmatter(raw: string): { yaml: string; body: string } {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) {
    throw new Error("missing YAML frontmatter");
  }
  return { yaml: match[1] ?? "", body: (match[2] ?? "").replace(/^\uFEFF/, "") };
}

export function parseMarkdownEntry<T>(raw: string, schema: { parse: (value: unknown) => T }): ParsedMarkdown<T> {
  const { yaml, body } = splitMarkdownFrontmatter(raw);
  const parsed = loadYaml(yaml);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("frontmatter must be a YAML mapping");
  }
  return { data: schema.parse(parsed), body };
}
