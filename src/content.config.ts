import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { eventSchema, mediaSchema, postSchema } from "./lib/content/schemas";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.md" }),
  schema: postSchema,
});

const events = defineCollection({
  loader: glob({ base: "./src/content/events", pattern: "**/*.md" }),
  schema: eventSchema,
});

/** 경제·증시 유튜브 큐레이션 (화이트리스트 채널만) */
const media = defineCollection({
  loader: glob({ base: "./src/content/media", pattern: "**/*.md" }),
  schema: mediaSchema,
});

export const collections = {
  posts,
  events,
  media,
};
