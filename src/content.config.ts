import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const sourceSchema = z
  .object({
    id: z.string().min(1),
    tier: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    type: z.enum(["filing", "ir-call", "report", "news", "youtube", "pdf", "anonymous"]),
    title: z.string().min(1),
    date: z.coerce.date(),
    url: z.string().url(),
    excerpt: z.string().min(1),
  })
  .strict();

const shortsSceneSchema = z
  .object({
    t: z.string().min(1),
    role: z.string().min(1),
    visual: z.string().min(1),
    caption: z.string().optional(),
    vo: z.string().optional(),
  })
  .strict();

const shortsSchema = z
  .object({
    enabled: z.boolean(),
    platform: z.array(z.string().min(1)).min(1),
    format: z.string().min(1),
    duration: z.number().int().positive(),
    hook: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    hashtags: z.array(z.string().min(1)).min(1),
    thumbnail: z
      .object({
        headline: z.string().min(1),
        subline: z.string().min(1),
        style: z.string().min(1),
      })
      .strict(),
    scenes: z.array(shortsSceneSchema).min(1),
    cta: z
      .object({
        type: z.string().min(1),
        target: z.string().min(1),
      })
      .strict(),
    tone: z.string().min(1),
    bgm: z.string().min(1),
  })
  .strict();

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.md" }),
  schema: z
    .object({
      title: z.string().min(1),
      date: z.coerce.date(),
      symbol: z.string().min(1),
      market: z.enum(["KRX", "NASDAQ", "NYSE", "AMEX", "OTC"]),
      conviction: z.number().int().min(1).max(5),
      summary: z.string().min(1),
      tags: z.array(z.string().min(1)).min(1),
      aiAssisted: z.boolean(),
      draft: z.boolean(),
      sources: z.array(sourceSchema).min(1),
      entities: z.record(z.string(), z.array(z.string().min(1))).default({}),
      shorts: shortsSchema.optional(),
    })
    .strict(),
});

const events = defineCollection({
  loader: glob({ base: "./src/content/events", pattern: "**/*.md" }),
  schema: z
    .object({
      id: z.string().min(1),
      title: z.string().min(1),
      date: z.coerce.date(),
      symbol: z.string().min(1).optional(),
      market: z.enum(["KRX", "NASDAQ", "NYSE", "AMEX", "OTC", "GLOBAL"]).optional(),
      scope: z.enum(["all", "symbol", "market"]).optional(),
      category: z.enum(["macro", "earnings", "product", "policy", "supply-chain", "news", "other"]),
      impact: z.enum(["low", "mid", "high"]),
      summary: z.string().min(1),
      sourceUrl: z.string().url().optional(),
      tags: z.array(z.string().min(1)).default([]),
    })
    .strict(),
});

/** 경제·증시 유튜브 큐레이션 (화이트리스트 채널만) */
const media = defineCollection({
  loader: glob({ base: "./src/content/media", pattern: "**/*.md" }),
  schema: z
    .object({
      title: z.string().min(1),
      /** 영상 공개일 (또는 큐레이션 기준일) */
      publishedAt: z.coerce.date(),
      youtubeId: z.string().min(6).max(20),
      channel: z.enum(["hankyung-tv", "yonhap-infomax", "federal-reserve", "bok-official"]),
      category: z.enum(["macro", "earnings", "product", "policy", "supply-chain", "news", "other"]),
      impact: z.enum(["low", "mid", "high"]),
      /** 지인이 고른 이유 (1–2문장) */
      why: z.string().min(1),
      /** AI/편집 3줄 핵심 요약 (브리프 카드) */
      summaryBullets: z.array(z.string().min(1)).max(5).default([]),
      /** 인라인 플레이어 점프용 타임스탬프 */
      timestamps: z
        .array(
          z.object({
            label: z.string().min(1),
            timeSeconds: z.number().int().nonnegative(),
          }),
        )
        .default([]),
      marketSentiment: z.enum(["hawkish", "dovish", "neutral", "mixed"]).optional(),
      relatedAssets: z.array(z.string().min(1)).default([]),
      /** 큐레이션 시점 라이브 스트림 여부 (API 없이 수동) */
      live: z.boolean().default(false),
      durationSec: z.number().int().positive().optional(),
      lang: z.enum(["ko", "en"]).default("ko"),
      relatedPost: z.string().min(1).optional(),
      relatedEvent: z.string().min(1).optional(),
      draft: z.boolean().default(false),
      tags: z.array(z.string().min(1)).default([]),
    })
    .strict(),
});

export const collections = {
  posts,
  events,
  media,
};
