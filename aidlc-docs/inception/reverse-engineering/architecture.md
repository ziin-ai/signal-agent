# Architecture (Scoped — Crawl & Content Surfaces)

## High-level

```text
  Browser / Googlebot
           |
           v
  +---------------------+
  | Astro Node (hybrid) |
  | output: server      |
  +----------+----------+
             |
     +-------+--------+------------------+
     |                |                  |
     v                v                  v
  Prerendered      SSR HTML          Client islands
  / , /posts/*     /about,privacy    Timeline, chat
  /dashboard/*     /terms,contact    (JS after HTML)
                   /posts index
```

## Content flow

```text
  src/content/posts/*.md
        |
        v
  Astro content collection + remark citations
        |
        +---> /posts/[slug] (prerender)
        +---> Home HeroCard (latest body, prerender)
        +---> sitemap.xml.ts (published slugs)
```

## AdSense integration points

| Layer | Location | Role |
| --- | --- | --- |
| Meta + script | `src/layouts/Base.astro` | Account meta + pagead loader if env set |
| ads.txt | `src/pages/ads.txt.ts` | Publisher authorization |
| Policy copy | `src/pages/privacy.astro`, `terms.astro` | Cookie/AdSense disclosure |
| Ad units | — | Not implemented |

## Crawler assessment

- Articles and home deliver readable HTML without login.
- Legal pages are SSR but return full HTML text on request.
- Interactive timeline does not gate article HTML.
