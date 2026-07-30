# Component Inventory (Scoped)

## Application — content & trust

| Component | Type | AdSense relevance |
| --- | --- | --- |
| HeroCard | Astro | Exposes latest post HTML on home |
| TrustCard | Astro | Trust signals on home |
| PostTrustMeta | Astro | Author / AI / disclaimer |
| MarkdownViewer | Astro | Renders post body + citations |
| SiteDoc | Astro | Legal/about layout |
| Header / Footer | Astro | Navigation / policy discovery |
| DashboardTimelineInteractive | React island | Secondary; not sole content |

## Content corpus (snapshot)

| Bucket | Approx count | Risk |
| --- | --- | --- |
| Published posts | ~50 | Volume OK |
| Evergreen (`교육`) | 3 | Too few / thin |
| Daily / outlook family | ~20+ | Template similarity |
| Thematic analysis | ~20+ | Stronger originality |

## Infrastructure (out of scope for code changes unless requested)

| Asset | Path |
| --- | --- |
| K8s / Argo CD | `k8s/` |
| Env for AdSense | `PUBLIC_ADSENSE_CLIENT_ID`, `PUBLIC_SITE_URL` |
