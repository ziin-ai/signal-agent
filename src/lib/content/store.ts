import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { CollectionEntry } from "astro:content";
import type { ContentStore } from "../agent/types";
import { collectionDir, resolveContentRoot } from "./paths";
import { parseMarkdownEntry } from "./parse";
import { eventSchema, mediaSchema, postSchema } from "./schemas";

export type PostEntry = CollectionEntry<"posts">;
export type EventEntry = CollectionEntry<"events">;
export type MediaEntry = CollectionEntry<"media">;

export type ContentLoadError = {
  collection: "posts" | "events" | "media";
  file: string;
  message: string;
};

export type ContentSnapshot = {
  root: string;
  fingerprint: string;
  posts: PostEntry[];
  events: EventEntry[];
  media: MediaEntry[];
  errors: ContentLoadError[];
};

type Cache = ContentSnapshot;

let cache: Cache | null = null;

function listMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("."))
    .sort()
    .map((name) => join(dir, name));
}

function fingerprintRoot(root: string): string {
  const parts = (["posts", "events", "media"] as const).flatMap((collection) => {
    const dir = join(root, collection);
    return listMarkdownFiles(dir).map((file) => {
      const stat = statSync(file);
      return `${collection}/${file.split("/").pop()}:${stat.mtimeMs}:${stat.size}`;
    });
  });
  return `${root}\n${parts.join("\n")}`;
}

function fileId(filePath: string): string {
  return filePath.split("/").pop() ?? filePath;
}

function loadCollection<C extends "posts" | "events" | "media", T>(
  collection: C,
  schema: { parse: (value: unknown) => T },
): { entries: Array<CollectionEntry<C>>; errors: ContentLoadError[] } {
  const dir = collectionDir(collection);
  const entries: Array<CollectionEntry<C>> = [];
  const errors: ContentLoadError[] = [];

  for (const file of listMarkdownFiles(dir)) {
    const id = fileId(file);
    try {
      const raw = readFileSync(file, "utf8");
      const parsed = parseMarkdownEntry(raw, schema as never);
      entries.push({
        id,
        collection,
        data: parsed.data,
        body: parsed.body,
      } as CollectionEntry<C>);
    } catch (error) {
      errors.push({
        collection,
        file: id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { entries, errors };
}

function loadSnapshot(): ContentSnapshot {
  const root = resolveContentRoot();
  const fingerprint = existsSync(root) ? fingerprintRoot(root) : `${root}:missing`;
  if (cache && cache.fingerprint === fingerprint) {
    return cache;
  }

  const posts = loadCollection("posts", postSchema);
  const events = loadCollection("events", eventSchema);
  const media = loadCollection("media", mediaSchema);
  const errors = [...posts.errors, ...events.errors, ...media.errors];

  if (errors.length > 0) {
    for (const error of errors) {
      console.warn(`[content] skip ${error.collection}/${error.file}: ${error.message}`);
    }
  }

  cache = {
    root,
    fingerprint,
    posts: posts.entries,
    events: events.entries,
    media: media.entries,
    errors,
  };
  return cache;
}

export function invalidateContentCache(): void {
  cache = null;
}

export function getContentSnapshot(): ContentSnapshot {
  return loadSnapshot();
}

export async function getPosts(): Promise<PostEntry[]> {
  return loadSnapshot().posts;
}

export async function getEvents(): Promise<EventEntry[]> {
  return loadSnapshot().events;
}

export async function getMedia(): Promise<MediaEntry[]> {
  return loadSnapshot().media;
}

export function postSlugFromId(id: string): string {
  return id.replace(/\.md$/, "");
}

export function selectPublished<T extends { data: { draft?: boolean } }>(entries: T[]): T[] {
  const published = entries.filter((entry) => entry.data.draft !== true);
  return published.length > 0 ? published : entries;
}

export async function getPublishedPosts(): Promise<PostEntry[]> {
  return selectPublished(await getPosts());
}

export async function getPostBySlug(slug: string): Promise<PostEntry | undefined> {
  const needle = postSlugFromId(slug.trim());
  if (!needle) return undefined;
  return (await getPosts()).find((post) => postSlugFromId(post.id) === needle);
}

export async function loadContentStore(): Promise<ContentStore> {
  const snapshot = loadSnapshot();
  return { posts: snapshot.posts, events: snapshot.events };
}

export function validateContentOrThrow(snapshot = loadSnapshot()): ContentSnapshot {
  if (snapshot.errors.length > 0) {
    const details = snapshot.errors.map((error) => `${error.collection}/${error.file}: ${error.message}`).join("\n");
    throw new Error(`Content schema errors:\n${details}`);
  }
  return snapshot;
}
