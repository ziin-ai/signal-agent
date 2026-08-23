import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseMarkdownEntry } from "../parse";
import { postSchema } from "../schemas";
import {
  getPostBySlug,
  getPublishedPosts,
  invalidateContentCache,
  resolveContentRoot,
  validateContentOrThrow,
} from "../index";

const SAMPLE_POST = `---
title: "테스트 글"
date: 2026-08-23
symbol: "^KS11"
market: "KRX"
conviction: 3
summary: "런타임 로더 검증용 샘플입니다."
tags:
  - "테스트"
aiAssisted: true
draft: false
sources:
  - id: "src-1"
    tier: 2
    type: "news"
    title: "예시"
    date: 2026-08-23
    url: "https://example.com/a"
    excerpt: "발췌"
entities: {}
---

확인된 사실입니다.{{cite:src-1}}
`;

describe("parseMarkdownEntry", () => {
  it("parses frontmatter and body", () => {
    const parsed = parseMarkdownEntry(SAMPLE_POST, postSchema);
    expect(parsed.data.title).toBe("테스트 글");
    expect(parsed.data.sources[0]?.id).toBe("src-1");
    expect(parsed.body).toContain("확인된 사실");
  });

  it("rejects missing frontmatter", () => {
    expect(() => parseMarkdownEntry("# no fm\n", postSchema)).toThrow(/frontmatter/);
  });
});

describe("disk content store", () => {
  const previousRoot = process.env.CONTENT_ROOT;

  afterEach(() => {
    if (previousRoot === undefined) delete process.env.CONTENT_ROOT;
    else process.env.CONTENT_ROOT = previousRoot;
    invalidateContentCache();
  });

  it("loads published posts from the repo content tree", async () => {
    delete process.env.CONTENT_ROOT;
    invalidateContentCache();
    const snapshot = validateContentOrThrow();
    expect(snapshot.posts.length).toBeGreaterThan(0);
    const kospi = await getPostBySlug("2026-08-23-kospi-night-futures-gap");
    expect(kospi?.data.symbol).toBe("^KS11");
    expect(resolveContentRoot()).toContain("content");
    expect((await getPublishedPosts()).length).toBeGreaterThan(0);
  });

  it("skips invalid files instead of throwing at read time", async () => {
    const root = mkdtempSync(join(tmpdir(), "ziin-content-"));
    mkdirSync(join(root, "posts"), { recursive: true });
    mkdirSync(join(root, "events"), { recursive: true });
    mkdirSync(join(root, "media"), { recursive: true });
    writeFileSync(join(root, "posts", "ok.md"), SAMPLE_POST);
    writeFileSync(join(root, "posts", "bad.md"), "---\ntitle: broken\n---\n");

    process.env.CONTENT_ROOT = root;
    invalidateContentCache();

    const posts = await getPublishedPosts();
    expect(posts.map((post) => post.id)).toEqual(["ok.md"]);
    expect(() => validateContentOrThrow()).toThrow(/bad.md/);
  });
});
