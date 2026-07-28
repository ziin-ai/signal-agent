# Business Overview (Scoped — AdSense / Publisher)

## Business purpose

**지인.ai (ziin.ai)** publishes Korean equity/macro analysis with citations, a dashboard timeline, and investment disclaimers. Monetization intent includes Google AdSense; content must look like a credible publisher to crawlers and reviewers.

## Primary business transactions (content/publisher path)

1. **Author/publish analysis** — Markdown in `src/content/posts/` → Astro content collection → `/posts/{slug}` HTML.
2. **Reader discovers content** — Home hero (latest post body), `/posts` index, header/footer nav, sitemap.
3. **Trust / policy check** — About, Privacy (AdSense/cookies), Terms, Contact.
4. **Ads readiness** — Optional `PUBLIC_ADSENSE_CLIENT_ID` loads AdSense script + `/ads.txt`; no ad units yet.

## AdSense-relevant dictionary

| Term | Meaning on this site |
| --- | --- |
| Evergreen / guide | Educational posts (tag `교육`); currently 3 thin pieces |
| Daily / outlook | Recurring market briefs; high structural similarity |
| aiAssisted | Frontmatter flag; all posts currently `true` |
| Prerender | Build-time HTML for home + post/dashboard slug pages |
| SiteDoc | Shared layout for legal/about pages |

## Gap vs desired AdSense posture

| Area | Current | Desired (from prior analysis) |
| --- | --- | --- |
| Evergreen depth | 3 short guides | 10–15+ substantive guides |
| Daily voice | Template-heavy | Call / priority / guardrail (skill already updated) |
| About identity | Team placeholder, no business registry | Stronger publisher identity |
| Home | Dashboard-first | Static intro + guide links for reviewers |
| Ad units | None | After approval only |
