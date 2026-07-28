# Code Structure (Scoped)

## Key paths for this intent

| Path | Role |
| --- | --- |
| `src/content/posts/` | Published articles (primary AdSense content) |
| `src/pages/index.astro` | Home / dashboard (prerender) |
| `src/pages/posts/[slug].astro` | Article pages (prerender) |
| `src/pages/posts/index.astro` | Article list |
| `src/pages/{about,privacy,contact,terms}.astro` | Policy / identity |
| `src/components/layout/{Header,Footer}.astro` | Nav + policy links |
| `src/components/post/PostTrustMeta.astro` | AI-assist / E-E-A-T strip |
| `src/components/layout/SiteDoc.astro` | Legal page chrome |
| `src/pages/robots.txt.ts` | Crawl rules |
| `src/pages/sitemap.xml.ts` | URL inventory |
| `.cursor/skills/post-from-sources/SKILL.md` | Expert voice (call/priority/guardrail) |
| `.cursor/skills/korea-daily-news/SKILL.md` | Daily structure aligned to expert voice |

## Patterns

- Content is file-based MD, not DB.
- Hybrid Astro: critical content routes prerendered; policy pages SSR.
- Skills govern future daily drafts; historical dailies may still use older templates.
