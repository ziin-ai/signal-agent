---
name: post-from-sources
description: Write a post markdown file from provided source metadata and brief context. Use when the user provides source links or source summaries and asks to draft/update an analysis post under src/content/posts.
disable-model-invocation: true
---

# Post From Sources

## Goal

Create or update one file in `src/content/posts/` that matches the project's post schema and writing style.

## Inputs To Request

Ask for missing items before drafting:

1. Post topic/title
2. Symbol and market (`KRX`, `NASDAQ`, `NYSE`, `AMEX`, `OTC`)
3. Conviction (1-5)
4. Tags (at least one)
5. Source list (id, tier, type, title, date, url, excerpt)
6. Optional constraints (tone, length, Korean/English mix, key risks)

If the user omits some fields, propose sensible defaults and mark them clearly for confirmation.

### URL-Only Fast Mode

If the user provides only a URL list, do not block on missing structured fields. Continue with best-effort extraction and drafting.

Minimum accepted input:

- One or more absolute URLs

In this mode:

1. Infer `sources[*].type` from URL/domain/content pattern
   - YouTube domains -> `youtube`
   - `.pdf` suffix or document endpoints -> `pdf`
   - News/media domains -> `news`
   - IR/filing domains -> `filing` or `ir-call`
   - Equity/broker research PDFs -> `report`
   - Unknown -> `anonymous`
2. Generate stable `id` values as `src-1`, `src-2`, ...
3. Default `tier` to `2`, then adjust if confidence is high:
   - Primary document/official filing -> `1`
   - Secondary report/news -> `2` or `3`
   - Aggregated/unclear source -> `4`
4. Derive `title` from page title or URL slug
5. Set `excerpt` to a concise neutral summary sentence
6. Set `date` using best available evidence:
   - Prefer explicit published date from source
   - Fallback to current date with assumption note
7. Infer post-level defaults if not provided:
   - `title`: topic inferred from dominant entities across URLs
   - `symbol`: dominant ticker/company if clear, else `TBD`
   - `market`: infer from listing context, else `NASDAQ` as temporary default
   - `conviction`: default `3`
   - `tags`: 2-4 inferred tags

When confidence is low, still produce a draft but include a short "assumptions used" note in the final response.

### Topic-Driven Research Mode

If the user provides a topic keyword (or short thesis) without URLs, actively discover sources first, then draft.

Minimum accepted input:

- Topic keyword or question (for example, "블랙웰 수요 둔화", "한국 바이오 CMO 수주 전망")

Research process:

1. Expand the topic into 4-8 search intents:
   - Definition/current status
   - Key driver and counter-driver
   - Company/sector exposure
   - Recent changes (policy, earnings, guidance, pricing, supply chain)
2. Collect diversified sources (target at least 4):
   - Official/primary materials first (filings, earnings releases, IR, policy docs)
   - Then secondary analysis (reputable media, broker/research notes)
   - Include YouTube only when content quality is high and relevant
3. Build `sources` entries from discovered URLs with schema-compliant metadata
4. Assign `tier` by evidence quality:
   - `1`: primary/official documents
   - `2`: high-quality secondary analysis
   - `3`: general news summary
   - `4`: weak/indirect reference
5. Resolve conflicts across sources and reflect uncertainty explicitly in the draft

Quality bar:

- Do not draft from a single weak source
- Prefer recency and source credibility over quantity
- If evidence is too thin, still produce a draft but clearly state low-confidence sections

### YouTube Content Handling

When a source is a YouTube URL, do not treat it as a plain link-only source. Extract and use the video's substantive content in analysis.

Process:

1. Identify video title/channel/published date from available metadata
2. Obtain transcript or reliable summary when possible
3. Extract concrete claims, metrics, guidance, timelines, and caveats
4. Separate speaker opinion from verifiable facts
5. Reflect those points in body analysis as evidence, not as a standalone "video recap"

Fallback:

- If transcript/full content is unavailable, use best-effort summary from available metadata and clearly lower confidence for that source
- Do not invent quotes; if exact wording is uncertain, paraphrase conservatively

## Required Output

Produce frontmatter + body markdown. Use the example as a baseline, not a rigid template:

```markdown
---
title: "..."
date: 2026-05-13
symbol: "NVDA"
market: "NASDAQ"
conviction: 4
summary: "..."
tags: ["..."]
aiAssisted: true
draft: false
sources:
  - id: "src-1"
    tier: 1
    type: "report"
    title: "..."
    date: 2026-05-07
    url: "https://..."
    excerpt: "..."
entities:
  company: ["..."]
  product: ["..."]
---

## 핵심 요약

- ...

![핵심 제품 키비주얼](https://example.com/official/keyvisual.png)
*공식 IR 자료 키비주얼{{cite:src-1}}*

## 투자 포인트

1. ...
2. ...

## 경쟁 구도 비교

| 구분 | A사 | B사 | 자사 |
|---|---|---|---|
| 시장 점유율 | 32% | 24% | 18% |
| 주요 제품 | ... | ... | ... |
| 차별 포인트 | ... | ... | ... |

*자료: 2026 IR 자료 기준{{cite:src-1}}*

## 가치사슬 흐름

<svg viewBox="0 0 320 80" role="img" aria-label="원료-셀-모듈-팩-출하 가치사슬">
  <title>가치사슬 단계</title>
  <desc>원료 → 셀 → 모듈 → 팩 → OEM 출하 단계 흐름</desc>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="4"   y="20" width="56" height="40" rx="6"/>
    <rect x="72"  y="20" width="56" height="40" rx="6"/>
    <rect x="140" y="20" width="56" height="40" rx="6"/>
    <rect x="208" y="20" width="56" height="40" rx="6"/>
  </g>
  <g fill="currentColor" font-size="11" text-anchor="middle">
    <text x="32"  y="44">원료</text>
    <text x="100" y="44">셀</text>
    <text x="168" y="44">모듈/팩</text>
    <text x="236" y="44">OEM 출하</text>
  </g>
  <g stroke="currentColor" stroke-width="1.5" fill="none">
    <path d="M60 40 H72"/>
    <path d="M128 40 H140"/>
    <path d="M196 40 H208"/>
  </g>
</svg>

## 체크할 리스크

- ...

## 결론

...
```

## Schema Guardrails

Always satisfy these constraints:

- `summary` is required (do not use `thesis`)
- `sources[*].type` must be one of:
  - `filing`, `ir-call`, `report`, `news`, `youtube`, `pdf`, `anonymous`
- `sources[*].tier` must be integer 0-4
- `sources[*].date` must be ISO date (`YYYY-MM-DD`)
- `url` must be absolute URL
- Keep `sources` non-empty

If a source is `youtube`, keep it as a normal source item (UI handles embedding).
If a source is `pdf`, keep direct PDF link in `url`.

Event updates must follow the events collection schema in this project:

- Event markdown is stored under `src/content/events/`
- Frontmatter fields must include:
  - `title` (string)
  - `date` (`YYYY-MM-DD`)
  - `category` (valid enum in project schema, including `news`)
  - `importance` (`high` | `medium` | `low`)
  - `market` (`KR` | `US` | `GLOBAL`)
  - `relatedSymbols` (array of strings)

## Writing Rules

- Write like a domain expert analyst, not like an assistant
- Use evidence-backed reasoning tied to `sources`
- Separate facts from interpretation and scenario assumptions
- Include downside/risk and disconfirming signals
- Avoid invented numbers, quotes, or claims not supported by sources
- Prefer Korean prose unless user asks otherwise
- Create genuinely new synthesis from source facts (do not paraphrase each source one-by-one)
- Prioritize causal reasoning, implications, and decision relevance over source recap

## Visual Enrichment Policy

Every post must include rich visualization. Do not ship a text-only wall.

### Minimum Requirement

- At least **3 distinct visual elements** per post, mixing **2 or more different types** from the supported list below
- At least **1 comparison table** when the post discusses competitors, scenarios, regulations, products, or financial metrics
- Place visuals near the section they support, not stacked at the top/bottom
- Add a one-line caption (italic or plain text) under each non-trivial visual, with `{{cite:src-x}}` if data is sourced

### Supported Visual Types

The post body is rendered by `MarkdownViewer.astro`, which supports standard markdown plus inline HTML/SVG and iframes. Use any combination of:

1. **Comparison tables** (Markdown GFM tables)
   - Use for competitor matrices, before/after policy, scenario tables, financials, KPI breakdowns
   - Always include header row and at least 3 columns when feasible

2. **Source images** (`![alt](https://...)`)
   - Prefer official company/IR/government/press images
   - Use only when image URL is stable and the host typically permits hotlinking (company official site, naver news CDN, etc.)
   - Always include meaningful Korean alt text

3. **Inline SVG diagrams** (`<svg viewBox="..." ...>...</svg>`)
   - Best for value chain, supply chain, capital flow, org structure, simple bar/quadrant charts
   - Keep `viewBox` so it scales; use `currentColor` or explicit hex for fills and strokes
   - Add `<title>` and `<desc>` for accessibility
   - Keep node count small (under ~15 shapes) so the diagram stays readable on mobile

4. **ASCII / text flow diagrams** (fenced code blocks)
   - Best for sequential pipeline, decision tree, simple block flow
   - Example:
     ```text
     원료 -> 셀 가공 -> 모듈 -> 팩 -> OEM 출하
     ```

5. **Quote / highlight blocks** (`> ...` blockquotes)
   - Best for one-line thesis, key metric callouts, contrarian counter-thesis
   - Use sparingly so they retain emphasis (max 2-3 per post)

6. **Embedded charts via iframe** (`<iframe src="..." ...>`)
   - TradingView symbol embed, Google Trends embed, FRED graph embed, public Datawrapper iframes
   - Only use when the embed source is stable and the URL is the official embed endpoint
   - Always set `loading="lazy"` and reasonable `height`
   - If unsure whether embed is allowed, fall back to a static image link instead

7. **HTML callout boxes** (small `<div>` or `<aside>` with inline style)
   - Use for "핵심 지표 한 줄" summary or "시나리오별 결론" cards
   - Keep styling minimal; rely on existing prose styles

### Visualization Rules

- Diagrams must reflect facts from `sources`. Do not fabricate numbers in SVG/ASCII to look quantitative
- Mark estimates and scenario figures explicitly (예: `추정`, `시나리오`, `가정치`)
- Cite the source with `{{cite:src-x}}` directly under any visual that uses sourced numbers
- Tables of competitive/market share data must show "as of" date if known
- Do not duplicate the same fact across a table and a long paragraph; pick the format that reads better
- Visuals should add information density, not decoration. Remove a visual if it only restates an adjacent sentence

### Not Supported (Do Not Use)

- ` ```mermaid ``` ` code blocks — Mermaid is not configured in `astro.config.mjs`; these will render as plain text
- External JS-based chart libraries (Chart.js, Recharts) inside markdown — markdown is not a script context
- Image URLs from sources that frequently break hotlinks (e.g., google search image cache, paywalled CDN) — use a stable mirror or omit

## Link Usage Policy

- Do not insert excessive inline links in body sections
- By default, avoid inline URLs in `##` body sections unless a direct citation is necessary for a specific claim
- Keep links concentrated in `## 출처`
- If inline citation is required, use at most one concise reference per subsection
- Never write the body as a link list; write as an original analyst note grounded in source evidence

## Event Co-Update Policy

When drafting/updating a post, evaluate whether new timeline-worthy events should also be added or updated.

Create or update event entries when all are true:

1. The item has a concrete date (or a clearly expected date window)
2. The item can affect price, guidance, policy, demand/supply, regulation, or capital allocation
3. The item is relevant beyond a single sentence in the post body

Typical candidates:

- Earnings release, guidance revision, product launch window
- Regulatory decision/enforcement milestone
- Policy announcement with implementation timeline
- Major contract/capex/plant ramp milestone
- Court ruling or approval calendar

Event drafting rules:

- Keep event text short and factual
- Do not duplicate near-identical existing events; update existing one if overlap is high
- Align `relatedSymbols` with the post focus ticker(s)
- Set `importance` by expected market impact and uncertainty
- If date is uncertain, prefer conservative date handling and mention uncertainty in the event body

## Voice And Freedom

- Never mention AI, model limitations, or that the text is generated
- Avoid formulaic phrasing such as "종합하면", "정리하면" repeated mechanically
- Keep high structural freedom in body sections:
  - You may rename headings or change order by topic
  - You may merge/split sections when it improves readability
  - You are not required to use the exact sample headings
- Keep the analysis decisive but calibrated:
  - State conviction drivers clearly
  - Explicitly note uncertainty boundaries and trigger conditions
- Prioritize insight density over length; remove filler sentences

## Snippet-Oriented Structure (Google Search)

Use this structure by default when the user asks for SEO visibility, snippet exposure, or search-friendly writing:

1. Title includes the core query intent
2. First 1-2 lines answer the core question directly
3. `## 결론 요약 (TL;DR)` with 2-3 bullets
4. At least one question-style heading (for example, `## ~인가?`)
5. Direct answer paragraph immediately below that heading (2-4 sentences)
6. Supporting bullets/table with concrete facts
7. `## 체크할 리스크` or equivalent downside section
8. `## 자주 묻는 질문 (FAQ)` with short Q/A pairs when relevant
9. `## 출처` list with source title + URL + date

Guidelines:

- Prioritize answer-first formatting over long introductions
- Keep paragraphs short and information-dense
- Prefer lists/tables for scannability when facts are structured
- Align title, opening answer, and section headings to the same search intent
- Do not promise rankings or guaranteed featured snippets

## File Naming

Use:

- `src/content/posts/YYYY-MM-DD-<kebab-topic>.md`

Slug rules:

- lowercase
- numbers and hyphens only
- no spaces or underscores

## Workflow

1. Inspect nearby post files in `src/content/posts/` for tone/structure consistency.
2. If input is topic-only, run Topic-Driven Research Mode and assemble `sources`.
3. Draft frontmatter first and validate schema fields.
4. For YouTube sources, extract transcript-backed points (or best-effort metadata summary with confidence note).
5. Draft body sections using source-backed claims and synthesized reasoning.
6. Plan visualization before finalizing body: pick at least 3 visual elements (mixing 2+ types) per Visual Enrichment Policy, and embed them inline at the right sections.
7. Determine whether event co-update is needed; create/update files in `src/content/events/` if applicable.
8. Re-check all source metadata fields and date formats.
9. Verify visuals: tables have headers, SVG has `viewBox`, images use stable URLs, no `mermaid` blocks, captions cite sources where applicable.
10. Save or update the target post file and any event files.

## Final Response To User

When done, report:

1. Created/updated file path
2. Any assumed defaults
3. Missing data the user may want to refine (optional)

For URL-only mode, also report:

4. URL -> inferred source mapping (`type`, `tier`, `date` basis)

For topic-driven mode, also report:

5. Discovered-source shortlist and why each was selected

If events were co-updated, also report:

6. Created/updated event file paths and rationale
