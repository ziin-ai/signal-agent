---
name: post-from-sources
description: >-
  Write a post under src/content/posts from sources or topic research, and when
  the thesis hinges on dated catalysts or milestones, add or update matching
  entries in src/content/events (timeline / 대시보드 외부 이벤트).
  For each new or revised post, generate frontmatter `shorts` (YouTube Shorts-style
  hook, scenes, thumbnail, hashtags) after `sources` and before `entities`, aligned
  with src/content.config.ts. In topic-driven mode, include and cite user-supplied
  anchor URLs as required references, while keeping topic research and source
  diversification as the primary method. After saving files, run git add, commit,
  and push per _shared/git-publish.md unless the user opts out or there are no changes.
  Use when the user provides URLs, source
  summaries, topics, or asks to draft or revise analysis posts for this repo.
disable-model-invocation: true
---

# Post From Sources

## Goal

Create or update one file in `src/content/posts/` that matches the project's post schema and writing style.

When the draft introduces or relies on **concrete calendar catalysts** (실적 일정, 정책·금리 결정, 제품·공장 가동, 규제 마일스톤 등), **also** add or update one or more files in `src/content/events/` so those items appear on the global/symbol timeline and in dashboard filters (`category`, `market`, `impact`). Do not invent dates; only record what sources or the user supplied with reasonable certainty.

Unless the user explicitly asks to skip shorts, **fill `shorts` frontmatter** for every post: a vertical Shorts script derived from the same thesis as the long-form body (hook → tension → explanation → checkpoints → conclusion → CTA). Placement order in YAML is **`sources:` → `shorts:` → `entities:`**. Validate fields against `shortsSchema` in `src/content.config.ts`. In-repo reference: `src/content/posts/2026-05-08-2026-iljin-electric.md`.

## Inputs To Request

Ask for missing items before drafting:

1. Post topic/title
2. Symbol and market (`KRX`, `NASDAQ`, `NYSE`, `AMEX`, `OTC`)
3. Conviction (1-5)
4. Tags (at least one)
5. Source list (id, tier, type, title, date, url, excerpt)
6. Optional constraints (tone, length, Korean/English mix, key risks)
7. Optional: explicit **calendar catalysts** to record as `events` (date + kind — 실적, FOMC, 규제 등). If omitted, infer from sources while drafting.
8. **Topic 모드 전용:** 사용자가 “꼭 참조할 URL”“반드시 포함” 등으로 넘긴 **앵커 URL** 목록(0개 이상). 있으면 아래 **Topic mode + anchor URLs** 절의 규칙을 따른다.
9. Optional: **shorts 생략** — “shorts 빼줘”, “세로영상 메타 없이” 등으로 명시할 때만 `shorts` 키를 넣지 않는다. 그 외에는 항상 생성한다.

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

If the user provides a topic keyword (or short thesis), actively discover sources, then draft. **If they also supply anchor URLs**, run topic research as the main flow and include those anchors as mandatory references — see the next subsection.

Minimum accepted input:

- Topic keyword or question (for example, "블랙웰 수요 둔화", "한국 바이오 CMO 수주 전망")
- Optional: one or more anchor URLs the user wants cited (same message or labeled as required references)

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

### Topic mode + anchor URLs

When the user gives a **topic** (or thesis) **and** one or more **URLs they insist on referencing**, treat those URLs as **required references inside topic research**: anchors must appear in `sources` and be cited in the body, but they are not the sole center of analysis.

Process:

1. **Define topic research frame first**: expand the topic into intents and evidence needs (drivers, counters, exposure, recent changes).
2. **Normalize anchors**: absolute `https?://` URLs only; dedupe; strip tracking params when safe.
3. **Ingest anchors as mandatory subset**: build full `sources` entries (`id`, `tier`, `type`, `title`, `date`, `url`, `excerpt`) with honest tiering.
4. **Run broad Topic-Driven Research** to fill gaps and diversify evidence; do not stop at anchors.
5. **Merge sources with clear provenance**: keep all anchors in final `sources`, then append supplemental discoveries (`src-n` ordering can keep anchors first for readability, but research breadth is the priority).
6. **Synthesis priority**: conclusions come from weighted evidence across all quality sources; anchors are required inputs, not automatic top-weight evidence.
7. **Conflict handling**: if an anchor conflicts with stronger primary sources, keep the anchor, cite both, and explain why the conclusion weights one side more.
8. **Broken/inaccessible anchor**: still keep a best-effort `sources` row and disclose lowered confidence for claims depending on it.

Trigger phrases (non-exhaustive): “이 URL 꼭”, “반드시 참고”, “must read”, “anchor”, “primary link”, “아래 링크 위주로”, topic + pasted URLs in the same message.

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
shorts:
  enabled: true
  platform:
    - "youtube"
  format: "9:16"
  duration: 30
  hook: "첫 3초 훅 한 줄 (본문과 동일 논지)"
  title: "숏츠 제목 (검색·추천용, 길게 쓰지 않음)"
  description: |
    2~4줄 요약 + 마지막 줄에 해시태그 문자열(본문 thesis와 정합).
    톤은 분석형, 과장 금지.

    #키워드1 #키워드2 #키워드3
  hashtags:
    - "#티커또는테마"
    - "#섹터"
    - "#주식분석"
    - "#THEME"
  thumbnail:
    headline: "썸네일 메인 카피"
    subline: "보조 한 줄"
    style: "브랜딩/레이아웃 힌트 (예: 차트 + 강조 텍스트)"
  scenes:
    - t: "0-3s"
      role: "hook"
      visual: "화면에 무엇이 보이는지 (구체적으로)"
      caption: "자막 한 줄"
      vo: "나레이션 한 줄"
    - t: "3-8s"
      role: "problem"
      visual: "..."
      caption: "..."
      vo: "..."
    # 권장: 총 6컷 전후, duration(초)과 시간축 `t`가 맞을 것
    # role 예: hook | problem | explanation | checkpoints | conclusion | cta
  cta:
    type: "blog_link"
    target: "본문 포스트"
  tone: "analytical_calm"
  bgm: "minimal_beat_no_climax"
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

**Shorts (`shorts`, optional in Zod but standard for new posts here):**

When present, all of the following must satisfy `shortsSchema` in `src/content.config.ts`:

| Field | Type | Notes |
| --- | --- | --- |
| `enabled` | boolean | Usually `true`; `false` only if user wants metadata stub without publishing intent |
| `platform` | non-empty string array | e.g. `- "youtube"` |
| `format` | string | Vertical: `"9:16"` unless user specifies otherwise |
| `duration` | positive integer | Seconds; typically `30`, aligned with `scenes[*].t` ranges |
| `hook` | string | Opening line; must not contradict `summary` / thesis |
| `title` | string | Shorts-specific title (can differ from post `title`) |
| `description` | string | Often multiline `\|` block; may repeat hashtag line for platform copy-paste |
| `hashtags` | non-empty string array | Each entry usually includes leading `#` |
| `thumbnail` | object | `headline`, `subline`, `style` — all required strings |
| `scenes` | non-empty array | Each scene: `t`, `role`, `visual` required; `caption`, `vo` optional |
| `cta` | object | `type`, `target` (e.g. `blog_link` / `본문 포스트`) |
| `tone` | string | e.g. `analytical_calm` |
| `bgm` | string | e.g. `minimal_beat_no_climax` |

**Authoring rules for `scenes`:**

- Order time ranges (`t`) monotonically and cover roughly `0`–`duration` seconds.
- Default arc for analysis posts: `hook` → `problem` (or tension) → `explanation` → `checkpoints` → `conclusion` → `cta`.
- `visual` / `caption` / `vo` must be faithful to the post’s sourced claims; do not invent figures or quotes.
- Keep `vo` readable aloud in ~1–2 short sentences per segment.

If a source is `youtube`, keep it as a normal source item (UI handles embedding).
If a source is `pdf`, keep direct PDF link in `url`.

Companion **events** must follow `src/content.config.ts` — collection `events` (glob: `src/content/events/**/*.md`):

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Stable slug-like id, unique across events (e.g. `nvda-earnings-2026-05`) |
| `title` | yes | Short headline shown on timeline |
| `date` | yes | `YYYY-MM-DD` — event day or known scheduled day |
| `summary` | yes | One or two sentences; why it matters for markets or the thesis |
| `category` | yes | One of: `macro`, `earnings`, `product`, `policy`, `supply-chain`, `news`, `other` |
| `impact` | yes | `low` \| `mid` \| `high` |
| `symbol` | no | Ticker when the event is **issuer-specific** (e.g. `NVDA`) |
| `market` | no | `KRX` \| `NASDAQ` \| `NYSE` \| `AMEX` \| `OTC` \| `GLOBAL` |
| `scope` | no | `all` \| `symbol` \| `market` — who sees this on the dashboard timeline |
| `sourceUrl` | no | Official calendar, IR, regulator, or primary link |
| `tags` | no | Keywords for search/consistency |

**Scope without guessing:** If you omit `scope`, the app infers it: `symbol` if `symbol` is set; else `market` if `market` is set and not `GLOBAL`; else `all`. Set `scope` explicitly when that inference would be wrong (e.g. Korea-wide macro with a `KRX` label).

Reference examples in-repo: `src/content/events/2026-01-15-bok-rate-decision.md` (`scope: market`, `category: macro`), `src/content/events/2026-02-26-nvda-earnings.md` (`scope: symbol`, `category: earnings`).

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

While drafting or revising a post, **scan** `src/content/events/` for the same catalyst (same issuer + same kind of milestone + same approximate date). Prefer **updating** an existing file (title/summary/impact/tags/sourceUrl) over adding a duplicate.

**Add or update an event file when:**

1. The post cites or depends on a **specific dated** catalyst (not vague “나중에”).
2. That catalyst is **material** to valuation, guidance, regulation, supply/demand, or liquidity for the covered symbol or market.
3. Recording it helps readers on the **타임라인** or **대시보드 최근 흐름** (filtered by `category` / 시장).

**Typical candidates:**

- 분기·연간 실적, 컨퍼런스 콜, 가이던스
- FOMC·CPI·고용 등 매크로 일정 (글/시장과 연결될 때)
- 규제 승인·재판·공시 마감, tariff/정책 시행일
- 공장 가동, 제품 출시, 대형 수주·CAPEX 가시화 일정

**Skip separate event files when:**

- The date is unknown and cannot be narrowed without fabrication — mention uncertainty in the post only.
- The item is purely background with no calendar anchor.

**Per-event file:**

- Path pattern: `src/content/events/YYYY-MM-DD-<kebab-description>.md` (match existing repo style).
- Frontmatter must validate against the table above; body can be one short factual paragraph (optional) after `---`.
- Set `impact` from likely **cross-asset** or **issuer** repricing, not from hype wording in the post.
- For the post’s primary ticker, set `symbol` + `market` from post frontmatter when the event is name-specific; use `scope: market` or `GLOBAL` + `category: macro` for broad Korea/US events without a single ticker.

```markdown
---
id: "example-catalyst-2026-05"
title: "…"
date: 2026-05-20
symbol: "NVDA"
market: "NASDAQ"
scope: "symbol"
category: "earnings"
impact: "high"
summary: "…"
sourceUrl: "https://…"
tags: ["실적", "가이던스"]
---

한 줄 보조 설명(선택).
```

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
2. If input is topic (+ optional anchor URLs), run Topic-Driven Research Mode as the primary flow, and apply **Topic mode + anchor URLs** to include anchors as required references within that flow. If topic-only with no anchors, run Topic-Driven Research Mode only.
3. Draft frontmatter first and validate schema fields.
4. For YouTube sources, extract transcript-backed points (or best-effort metadata summary with confidence note).
5. Draft body sections using source-backed claims and synthesized reasoning.
6. Plan visualization before finalizing body: pick at least 3 visual elements (mixing 2+ types) per Visual Enrichment Policy, and embed them inline at the right sections.
7. List or search `src/content/events/` for overlaps; determine event co-updates; create/update event markdown files when policy above applies.
8. Unless the user opted out, add **`shorts`** after `sources` and before `entities`: derive hook/scenes/thumbnail from the finalized thesis and `summary`; match `duration` to scene timeline; validate against **Shorts** table above.
9. Re-check all source metadata fields and date formats.
10. Verify visuals: tables have headers, SVG has `viewBox`, images use stable URLs, no `mermaid` blocks, captions cite sources where applicable.
11. Save or update the target post file and any event files.
12. **Git publish:** [_shared/git-publish.md](../_shared/git-publish.md) — `git add` → `commit` → `push`. 파일 변경 없거나 사용자 "git 생략" 시 skip.

## Final Response To User

When done, report:

1. Created/updated file path
2. Any assumed defaults
3. Missing data the user may want to refine (optional)
4. **`shorts`:** one-line note on hook angle and target `duration`, or that shorts was omitted per user request

For URL-only mode, also report:

5. URL -> inferred source mapping (`type`, `tier`, `date` basis)

For topic-driven mode, also report:

6. Discovered-source shortlist and why each was selected

For topic-driven mode **with user anchor URLs**, also report:

7. Anchor URLs (in order) and which `src-n` id each received; confirm every anchor appears in `sources` and is cited in the body

If events were co-updated, also report:

8. Created/updated event file paths and rationale

Always report (unless git skipped):

9. **Git** — commit hash·branch·push result, or skip reason

## Related

- Git after skill: [_shared/git-publish.md](../_shared/git-publish.md)
