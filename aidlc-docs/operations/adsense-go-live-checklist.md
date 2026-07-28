# Operations — AdSense go-live checklist

AI-DLC Operations phase (manual + code hygiene). Code-side follow-ups shipped in the same pass as this doc.

## Already in repo / cluster

| Item | Status |
| --- | --- |
| Privacy / Terms / About / Contact | Live pages + footer |
| robots.txt Allow + Sitemap | `src/pages/robots.txt.ts` |
| sitemap.xml | posts + legal URLs |
| `PUBLIC_ADSENSE_CLIENT_ID` | Set in `k8s/signal-agent-deployment.yaml` (`ca-pub-6929869719862616`) |
| ads.txt endpoint | **Verified live** `https://ziin.ai/ads.txt` (2026-07-28) |
| AdSense script loader | `Base.astro` when env present |
| Header Contact link | Added |
| `/posts` education section | Guides listed first |
| Ad **unit** slots | Intentionally **not** added until after approval |

## Manual checklist (operator)

1. [x] Open https://ziin.ai/ads.txt — expect `google.com, pub-6929869719862616, DIRECT, f08c47fec0942fa0`
2. [ ] Open https://ziin.ai/robots.txt — `Allow: /`, Sitemap line
3. [ ] Google Search Console → property `https://ziin.ai` → submit `https://ziin.ai/sitemap.xml`
4. [ ] URL Inspection on `/`, `/about`, one guide post, one outlook — confirm text in rendered HTML
5. [ ] AdSense application → site URL `https://ziin.ai` (content pages, not only dashboard)
6. [ ] After approval → add ad units on article pages only (separate Construction intent)

## Do not do yet

- Place empty ad placeholders site-wide before approval
- Claim business registration numbers on About without real data
- Flip `aiAssisted: false` without human rewrite evidence
