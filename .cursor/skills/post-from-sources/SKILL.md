---
name: post-from-sources
description: >-
  Write a post under src/content/posts from sources or topic research, and when
  the thesis hinges on dated catalysts or milestones, add or update matching
  entries in src/content/events (timeline / 대시보드 외부 이벤트).
  Enforce ziin analysis engine (해석·의견 중심; 단순 데이터 요약 금지),
  anti-AI template voice (no greeting/3-bullet shells), first-person analyst tone,
  causal drivers + author scenarios, evergreen concept block on daily posts,
  Hangul body ≥ ~1,200–1,500 for market posts, search-friendly titles, plain
  language over trader slang, fact/opinion split, valid sources[*].type enum
  only, and AdSense-ready substance (no thin news mashups). Evergreen/교육
  guides omit shorts by default and require depth. For
  each new or revised market/research post, generate frontmatter `shorts` unless
  user opts out or the post is an educational guide. Post body tables must use
  Markdown GFM pipe syntax (`| col |`), not HTML `<table>`. After saving,
  validate content (build or schema) then git add/commit/push per
  _shared/git-publish.md unless opted out. Use when the user provides URLs,
  source summaries, topics, educational guide requests, or asks to draft or
  revise analysis posts for this repo.
disable-model-invocation: true
---

# Post From Sources

## Goal

Create or update one file in `src/content/posts/` that matches the project's post schema and writing style.

When the draft introduces or relies on **concrete calendar catalysts** (실적 일정, 정책·금리 결정, 제품·공장 가동, 규제 마일스톤 등), **also** add or update one or more files in `src/content/events/` so those items appear on the global/symbol timeline and in dashboard filters (`category`, `market`, `impact`). Do not invent dates; only record what sources or the user supplied with reasonable certainty.

Unless the user explicitly asks to skip shorts, **fill `shorts` frontmatter** for market/research posts: a vertical Shorts script derived from the same thesis as the long-form body (hook → tension → explanation → checkpoints → conclusion → CTA). Placement order in YAML is **`sources:` → `shorts:` → `entities:`**. Validate fields against `shortsSchema` in `src/content.config.ts`. In-repo reference: `src/content/posts/2026-05-08-2026-iljin-electric.md`.

**Exception — evergreen / 교육 guides:** omit `shorts` by default (see **Post modes**). User may still request shorts explicitly.

## Post modes (required classification)

Before drafting, classify the post. Do not mix daily-template shells into educational guides.

| Mode | When | Shorts | Structure | Tags |
| --- | --- | --- | --- | --- |
| **Market / research** | Daily outlook, thematic analysis, issuer deep-dive | Required unless user opts out | **ziin analysis engine** (아래 Writing Rules) | Topic tags; no need for `교육` |
| **Evergreen / 교육** | Concept explainers (수급, PER, 사이드카, ETF, 환율…) | **Omit by default** | Framework + worked examples + **확인/포기 조건**; FAQ OK if short | Must include **`교육`** |

### Evergreen / 교육 depth bar (AdSense / low-value review)

Reviewers treat thin AI-looking pages as low-value. For every `교육` post:

1. **Hangul body ≥ ~1,800 characters** (excluding frontmatter). Prefer 2,000+ with tables/examples.
2. Open with a **usable judgment frame** (what mistake the headline causes), not a definition dump.
3. Include **≥1 worked example or rewrite table** (잘못된 문장 → 다시 쓰기, or numeric toy example).
4. Include **`## 확인/포기 조건`** or equivalent (when the frame should be abandoned).
5. Keep YMYL hygiene: “교육용 참고 / 투자 권유 아님” near the top; no buy/sell targets.
6. Prefer official/primary URLs in `sources` (`filing` / `report`); news is secondary color.
7. Do **not** clone yesterday’s daily headings into guides; use the evergreen adaptation of the ziin analysis engine.
8. Reference in-repo: `src/content/posts/2026-07-28-usd-krw-and-korea-equities.md`, `…-how-to-read-foreign-investor-flows.md`.

### Market / research anti-template bar

1. Lead with **해석이 담긴 결론** (answer-first) — not “야간선물 +0.5% → 오늘 상승 출발”급 사실 전달.
2. Every post must include distinct **작성자 판단** + at least one **독자적 분석 각도** (갭 메움 관점, 과거 유사 사례, 장중 30분 대응 등) — not only a wire mashup.
3. Ban AI-shell voice: no greeting/개요 인사, no fixed “서론 → 불렛 3개 → 요약 당부”, no textbook “정리하면/다음과 같습니다” stacks.
4. Every market post ends with a short **개념·원리** block (에버그린) so the page keeps value after the news day ages.
5. Hangul body (excluding frontmatter) **≥ ~1,200 characters**; prefer **1,500+**. Thin date-only notes fail.
6. Vary section titles vs the previous same-series post when substance differs; keep engine order, not yesterday’s cryptic lede.
7. If two drafts share the same skeleton and only swap dates/numbers, merge or rewrite one.
8. Keep `aiAssisted: true` when AI helped; never set `false` without real human rewrite evidence.
9. **Do not mass-rewrite old posts** unless the user asks — apply to **new and newly revised** posts.

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
9. Optional: **shorts 생략** — “shorts 빼줘”, “세로영상 메타 없이” 등으로 명시할 때만 `shorts` 키를 넣지 않는다. **교육 가이드는 기본 생략** (위 Post modes).
10. Optional: **모드** — “교육 가이드”, “evergreen”, “시황”, “분석”이 Ambiguous면 Post modes 표로 확인 후 진행.

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

## 오늘의 결론

...

## 핵심 팩트

| 지표 | 현재 | 의미 |
| --- | --- | --- |
| ... | ... | ... |

## 배경 동인

...

## 데이터 시나리오

| 시나리오 | 조건 | 함의 |
| --- | --- | --- |
| 갭 유지 | ... | ... |
| 갭 메움 | ... | ... |
| 추가 약세/강세 | ... | ... |

## 투자자 유의점

...

## 지인의 판단

...

## 개념 노트

...

## 결론

...
```

## Schema Guardrails

Always satisfy these constraints:

- `summary` is required (do not use `thesis`)
- `sources[*].type` must be **exactly** one of:
  - `filing`, `ir-call`, `report`, `news`, `youtube`, `pdf`, `anonymous`
- **Forbidden types** (break `astro` content sync / build): `data`, `guide`, `article`, `blog`, `web`, `other`, `official`, `stats`, …
- Map ambiguous sources into the enum:

| If it looks like… | Use |
| --- | --- |
| Exchange/regulator portal, DART/EDGAR filing | `filing` |
| Earnings call transcript / IR webcast | `ir-call` |
| Broker note, BOK/FSS explainer, research PDF, data-vendor methodology page | `report` |
| Newspaper / wire story | `news` |
| YouTube | `youtube` |
| Direct `.pdf` without better fit | `pdf` |
| Unclear / aggregator | `anonymous` |

- `sources[*].tier` must be integer 0-4
- `sources[*].date` must be ISO date (`YYYY-MM-DD`)
- `url` must be absolute URL
- Keep `sources` non-empty
- Tags for evergreen must include `교육` when Post mode is Evergreen

**Before git publish:** run `pnpm run build` (or at least confirm content sync does not throw `InvalidContentEntryDataError`). Do not push posts that fail schema validation.
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

- Write as a **personal market analyst** (개인 분석형), not as a news aggregator, assistant, or wire rewriter
- Target mix for market/research: **팩트 ~25% / 설명(개념·인과) ~25% / 분석·의견 ~35% / 결론 ~15%**
- Flow: **핵심 팩트 → 배경 동인(인과) → 데이터 시나리오 → 투자자 유의점 → 지인의 판단 → 개념(에버그린)**
- **현상 : 해석 = 1 : 1** — every factual paragraph (or table row cluster) must be followed by author interpretation; bare fact dumps fail
- Separate **확인된 사실**, **작성자 해석**, **시나리오** with clear headings or labels
- Include downside via **시나리오** (갭 유지 vs 갭 메움, 상승·중립·하락) — not a single hard call
- Avoid invented numbers, quotes, or claims not supported by sources; if citing “과거 유사 갭”/통계, source it or mark as **작성자 경험·가정**
- Prefer Korean prose unless user asks otherwise
- Spine must be **지인의 판단** + causal explanation — cites are evidence, not the article
- Market posts: Hangul body **≥ ~1,200** (prefer **1,500+**) excluding frontmatter
- Follow **Report Writing Style** below

## Report Writing Style

Write like a **completed personal analysis report**, not a news brief, trader memo, or ChatGPT outline. Hierarchy comes from **search-friendly titles, causal narrative, scenario tables, first-person judgment, and an evergreen concept block** — not from bold, slang, or bullet shells.

### Positioning (AdSense / YMYL)

- Site identity: **개인 분석형 금융 콘텐츠** — “이 사람이 시장을 풀어 설명한다”
- Anti-identity: “여러 기사를 AI가 잘 정리한 사이트” / “야간선물 숫자만 바꿔 쓴 일일 요약”
- Thin date-only market notes age out fast in review — every daily post must leave **reusable concept value**
- Keep YMYL hygiene: 교육·참고 / 투자 권유 아님 in 결론; no buy/sell targets
- Apply to **new posts going forward**; do not rewrite the whole archive unless asked
- Site-level trust pages remain **out of scope for this skill**; post-page 작성/면책 chrome is not required in body

### Tone (anti-AI template)

- **해석·의견 중심** + 1인칭 분석가 어조 (“저는 …로 봅니다”, “실제 투자 관점에서는…”, “비슷한 갭을 볼 때 저는…”)
- Open on **핵심 데이터 + 시장 맥락** — no greeting, no “오늘은 ~를 살펴보겠습니다”, no formal 서론
- Short paragraphs (2–4 sentences); one idea per paragraph; prefer connected prose over bullet stacks
- Ban rigid shell: **서론(개요/인사) → 본문 불렛 3개 → 결론(요약·당부)**
- Avoid hype adjectives unless sourced (“역대급”, “폭등”, “대박”)
- Avoid meta-AI phrasing: “읽기 틀”, “한 줄로 정리하면”, “다음과 같이 볼 수 있다”, “종합하면”, “정리하면”, “요약하면” stacked mechanically
- Prefer: “우선 …로 봅니다”, “단정하지 않습니다”, “이 조건이 나오면 해석을 바꿉니다”
- Do not bold for emotional punch; bold is a **structural** tool only (see budget below)

### Ban: thin fact-forward copy

These patterns are **low-quality / undifferentiated** from news & broker notes — rewrite before shipping:

| Fail (단순 전달) | Pass (인과 + 작성자 관점) |
| --- | --- |
| 야간선물이 0.5% 올라 오늘 코스피는 상승 출발할 것으로 보입니다 | 갭의 **원인**(미 증시 섹터·매크로·환율 등)을 밝히고, 시초가 이후 **갭 유지 vs 갭 메움**을 어떤 수급으로 판별할지 제시 |
| 외인이 순매수했습니다. 따라서 긍정적입니다 | 어느 업종/선물·현물인지 분리하고, 프로그램·현물 창구 조건과 작성자 시나리오를 연결 |
| 오늘의 3가지 포인트: … | 순위를 가진 인과 서술 + 표; equal bullet deck 금지 |

**Required author value (pick ≥1 per post, ideally 2+):**

- Gap cause chain (글로벌 매크로, 빅테크 실적, 환율, 섹터 디커플 등)
- Gap-fill / hold scenario with **observable** checks (외국인 선물 순매수, 시초가 이후 30분 등)
- Past analogous episode — only if sourced or explicitly labeled as author memory/hypothesis
- “장 초반 30분” 등 실전 관점의 유의점 (권유·목표가 없이)

### Plain language (required — ban cryptic trader slang)

Trader shorthand may stay **only** if immediately followed by a plain gloss. Prefer rewriting entirely.

| Avoid (암호형) | Prefer (전문용어 + 쉬운 설명) |
| --- | --- |
| 기대의 종가 / 다음 층 / 첫날 | 금요일 종가 기준 기대 / 다음 확인 구간 / 연휴 후 첫 거래일 |
| 이미 깎인 호가 / 호가를 받는다 | 야간선물에 반영된 단기 기대 / 시초가에서 소화한다 |
| 월요일 테이프 / 현금 창구 | 월요일 현물 거래 / 실제 매수·매도 자금 |
| 반대 칸의 주간 시나리오 | 다른 방향으로 가는 주간 시나리오 |
| 서학은 같은 이름을 미국에서 샀다 | 미국 상장 동일 종목(ADR 등) 매수 |
| 야간선물은 기대를 먼저 깎았다 | KOSPI200 야간선물이 −2.29%로 떨어져 월요일 단기 기대가 낮아진 상태입니다 |

**Rule:** if a sentence would confuse a non-trader reader on first pass, rewrite it.

### ziin analysis engine (required for market / research)

Every market/research post must hit these beats **in order** (heading names may vary slightly; order must not):

1. **오늘의 질문 / 검색 의도** — `title` and opening answer a clear question (**no greeting**).
2. **오늘의 결론** — **2–5 sentences** with judgment first (not “야간선물 % → 방향” only).
3. **핵심 팩트** — Sourced facts; lead with a **비교 표 5–7행** (지표 / 현재 / 의미). No number dump in prose.
4. **배경 동인** — **Why the gap/move happened**: US sector moves, macro prints, FX, earnings, etc. Each fact cluster → interpretation (**현상:해석 = 1:1**).
5. **데이터 시나리오** — At least **갭 유지 vs 갭 메움** (and/or 상승·중립·하락) with **observable** flow checks (외국인 선물·현물, 프로그램 등).
6. **투자자 유의점** — e.g. first 30 minutes, what *not* to equate; **no buy/sell targets**.
7. **지인의 판단** — **Required.** First-person author synthesis wires cannot provide.
8. **개념 노트 (에버그린)** — **Required on daily/market posts.** Teach one reusable idea tied to today’s tape (예: 야간선물·베이시스, 스프레드, 프로그램 매매 유입 조건) so the page keeps value after the news day ages.
9. **결론** — Restate answer + what would change the read + brief disclaimer (권유 아님).
10. **출처**

**Evergreen / 교육** (standalone concept guides) adapt:

1. **오늘의 질문** → reading mistake to correct
2. **확인된 사실 / 정의** → sourced definitions + worked example
3. **왜 중요한가** → headline misuse
4. **프레임** → ordered checklist
5. **반대·한계** → when to abandon
6. **독자가 확인할 것**
7. **결론**

**Do less by default:**

- Skip FAQ on daily briefs unless user asks for snippet Q&A
- Skip equal “N대 변수” / “오늘의 3포인트” decks
- Quote at most **one** external analyst inside **지인의 판단**
- Do not ship posts that only reshuffle prior daily titles or wires
- Do not ship posts that only restate overnight futures direction

**Allowed asymmetry:** Clear author judgment + falsifying scenarios beats “balanced” news mashup.

### Fact vs interpretation (YMYL)

Never mix fact and opinion in the same unlabeled paragraph when a reader could confuse them.

| Label | Contains |
| --- | --- |
| **확인된 사실** | Prices, flows, official prints, dated headlines with `{{cite:}}` |
| **작성자 해석** / **지인의 판단** | How to read those facts; what *not* to equate (예: 야간선물 % ≠ 월요일 코스피 예상 등락) |
| **시나리오** | Conditional paths; mark as 시나리오/가정 |
| **독자가 확인할 것** | Forward checklist, not a prediction |

Example pattern:

> **확인된 사실:** 금요일 코스피 종가 6,912.95, KOSPI200 야간선물 −2.29%.{{cite:src-1}}  
> **작성자 해석:** 야간선물 −2.29%를 월요일 시가 환산 하락률로 그대로 쓰지 않습니다.  
> **월요일 확인할 것:** 삼성전자 시가, 외국인 현물 수급, KOSPI200 선물.

### Numbers budget

- **핵심 표에 5–7개** 숫자만 올린다. More numbers ≠ more substance.
- Put comparable figures in GFM pipe tables (`| 지표 | 현재 | 의미 |`); prose explains *why* and *so what*
- Repeat a number in prose only when interpreting it — not when re-listing
- Dump of 10+ index/flow/yield figures in one section is a fail — move extras to appendix-like later paragraphs or cut

### Emphasis budget (critical)

**Default: no bold in body prose.** Most “important” facts belong in a table, heading, or the opening conclusion — not in `**…**`.

| Element | Bold / `<strong>` rule |
| --- | --- |
| **Whole post** | Aim for **≤12** bold spans in body (excluding frontmatter). If over budget, cut bold before cutting content |
| **Opening (오늘의 결론)** | At most **one** bold phrase. Never bold every metric in the lede |
| **Checklist / bullets** | Bold **only** tier labels (`확인된 사실`, `상승 시나리오`) — not tickers or % repeated in tables |
| **Body paragraphs** | No bold on numbers, tickers, dates. Plain text + `{{cite:}}` |
| **GFM tables** | Plain text in cells; `{{cite:src-x}}` allowed per cell when sourced |
| **Blockquotes** | Max **2** per post; no bold inside unless one defined term |
| **Disclaimer** | Plain or italic; do not bold the entire disclaimer |

**Never:** bold a ticker **and** its price **and** the % gap in one sentence; duplicate table figures in bold prose; chain `**A** **B** **C**`.

### Structure (default market / research flow)

Align with this template (names may vary; beats must appear):

1. **Title** — search-friendly (날짜 + 자산/지수 + 핵심 숫자 또는 질문)
2. **오늘의 결론** — judgment + why (not direction-only)
3. **핵심 팩트** — overnight/close levels & gap size in a **비교 표**
4. **배경 동인** — US sectors, macro, FX, earnings that *caused* the gap
5. **데이터 시나리오** — 갭 유지 vs 갭 메움 (and/or 상승·중립·하락) + flow checks
6. **투자자 유의점** — e.g. first-30-minute volatility lens (no advice/targets)
7. **지인의 판단** — required first-person view
8. **개념 노트** — evergreen teaching block tied to today’s theme
9. **결론** + short disclaimer
10. **출처**

Optional: theme deep-dive (삼성전자 등) between 배경 동인 and 시나리오 when material.

FAQ is **optional**. Daily briefs usually omit FAQ.

### Before save — style pass

1. Hangul body length ≥ ~1,200 (prefer 1,500+); if short, expand **배경 동인 / 시나리오 / 개념 노트**, not filler
2. Count body `**` pairs; if >12, strip bold from numbers/tickers first
3. Lead table ≤7 rows; no prose number dumps
4. Every fact block has a matching **해석** sentence/paragraph (1:1)
5. No AI shell (인사/개요 → 불렛3 → 요약 당부); opening is data+context
6. **개념 노트** present on market/daily posts
7. **확인된 사실** vs **지인의 판단** labeled; **시나리오** has ≥2 conditioned paths
8. Search for thin copy (“야간선물 올라 상승 출발”) and slang — rewrite
9. Read opening aloud: if it sounds like a wire rewrite or chatbot outline, rewrite

### Bad vs good

**Bad (단순 전달 = 뉴스와 무차별):**

> 어젯밤 야간선물이 0.5% 상승 마감하여 오늘 주간 코스피는 상승 출발할 것으로 보입니다.

**Good (인과 + 작성자 시나리오):**

> KOSPI200 야간선물이 +0.5%로 마감한 것은 확인된 사실입니다.{{cite:src-1}} 다만 저는 이를 곧바로 “오늘 상승 출발”로 번역하지 않습니다. 갭의 배경이 나스닥 빅테크인지, 환율·금리인지에 따라 시초가 이후 갭 메움 속도가 달라진다고 보기 때문입니다. 장 초반 30분에는 외국인 선물 순매수와 현물 창구가 같이 들어오는지를 먼저 보겠습니다.

**Bad (AI 템플릿):**

> 안녕하세요. 오늘은 세 가지를 정리합니다. 1) … 2) … 3) … 정리하면 신중히 대응하시기 바랍니다.

**Good (바로 맥락 진입 + 1인칭):**

> 월요일 개장에서 제가 먼저 보는 숫자는 야간선물 갭보다, 그 갭을 만든 뉴욕 섹터와 원/달러입니다.

**Bad (암호형 메모):**

> 8/23 휴장: 슈퍼위크는 이번 주 이야기고, 월요일 호가는 야간선물 −2.29%다.

**Good (검색형 + 결론 먼저):**

> **제목:** 8월 24일 코스피 전망: KOSPI200 야간선물 −2.29%, 삼성전자는 어떻게 될까?
> **오늘의 결론:** 월요일은 미국 상승보다 야간선물 −2.29%와 삼성전자 시가를 먼저 봅니다. 급락을 단정하지는 않습니다.

## Visual Enrichment Policy

Every post must include rich visualization. Do not ship a text-only wall.

### Minimum Requirement

- At least **3 distinct visual elements** per post, mixing **2 or more different types** from the supported list below
- At least **1 comparison table** (GFM pipe syntax) when the post discusses competitors, scenarios, regulations, products, or financial metrics
- Place visuals near the section they support, not stacked at the top/bottom
- Add a one-line caption (italic or plain text) under each non-trivial visual, with `{{cite:src-x}}` if data is sourced

### Supported Visual Types

The post body is rendered by `MarkdownViewer.astro`, which supports standard markdown plus inline HTML/SVG and iframes. Use any combination of:

1. **Comparison tables** (Markdown GFM pipe syntax — **not** HTML `<table>`)
   - Use for competitor matrices, before/after policy, scenario tables, financials, KPI breakdowns
   - Include header row and separator (`| --- |`) and at least 3 columns when feasible
   - Keep cells plain text; see **Report Writing Style → Numbers and tables**
   - **`{{cite:src-x}}` in cells** when the row figure is sourced; optional italic caption below when prose does not already cite

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
   - Best for one-line thesis or contrarian counter-thesis — not for re-stating table numbers
   - Use sparingly (max **2** per post); **no bold** inside the quote unless one defined term

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
- Cite the source with `{{cite:src-x}}` in table cells, prose, or italic text below the visual
- Tables of competitive/market share data must show "as of" date if known
- Do not duplicate the same fact across a table and a long paragraph; pick the format that reads better
- Visuals should add information density, not decoration. Remove a visual if it only restates an adjacent sentence

### Not Supported (Do Not Use)

- **HTML `<table>` in post body** — use GFM pipe tables instead (see Supported Visual Types §1)
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
- **Engine first:** enforce **팩트 → 배경 동인 → 시나리오 → 유의점 → 지인의 판단 → 개념 노트** before equal-length wire recaps
- **Anti-AI shell:** no greeting / 3-bullet / summary-당부; use first-person analyst tone
- **Readability over slang and highlighting:** plain language + table-first numbers; do not bold table duplicates
- Keep structural freedom:
  - Rename headings slightly by topic
  - Merge/split optional theme deep-dives
  - Must **not** drop 오늘의 결론, 핵심 팩트, 배경 동인, 시나리오, 지인의 판단, **개념 노트**
  - FAQ / equal “N대 변수” not required
- Keep analysis decisive but calibrated in **지인의 판단**
- Prefer insight density; Hangul ≥ ~1,200 (prefer 1,500+); cut filler and number dumps

## Snippet-Oriented Structure (Google Search)

**Default for market/research posts:** titles and openings already follow search-friendly rules below. Use the full FAQ-heavy variant **only when** the user asks for extra SEO/snippet Q&A.

1. Title includes the core query intent (날짜 + 지수/종목 + 핵심 변수 or 질문)
2. First section (**오늘의 결론**) answers the core question directly
3. At least one **투자자 유의점** or observable checklist
4. Scenario table (갭 유지 vs 갭 메움 and/or 상승·중립·하락) with conditions
5. Optional: one question-style heading (예: `## 야간선물을 월요일 시가로 환산해도 될까?`) + direct answer paragraph
6. Optional: `## 자주 묻는 질문 (FAQ)` with short Q/A when the user requests snippet mode
7. `## 출처` list with source title + URL + date

Guidelines:

- Answer-first over long introductions
- Keep paragraphs short; prefer GFM tables for the 5–7 key facts
- Align title, opening answer, and section headings to the same search intent
- Do not promise rankings or guaranteed featured snippets
- Still include **시나리오** + **지인의 판단** + **개념 노트**

## Title Policy (search-friendly + Naver as discovery only)

When the agent **finds or triages material via Naver**, treat Naver as a **pipeline only**. Readers care about market substance, not where it was fetched.

### Search-friendly titles (default)

Prefer titles a general investor would type or click:

| Bad (암호·메모형) | Good (검색·설명형) |
| --- | --- |
| `8/23 휴장: 슈퍼위크는 이번 주 이야기고, 월요일 호가는 야간선물 −2.29%다` | `8월 24일 코스피 전망: 야간선물 −2.29%, 삼성전자 주가에 미칠 영향은?` |
| `기대의 종가·현금 창구` | `코스피 장전 점검: 외국인 수급과 시초가가 가리키는 것` |

Patterns that work:

- `{월일} {지수/종목} 전망: {핵심 숫자}, {질문}?`
- `{날짜} {테마}: {확인된 사실 한 줄}`

`summary` frontmatter should also be plain-language (1–3 sentences), not trader shorthand.

### Do not put Naver-branded wording in post-facing titles

- Post frontmatter `title`
- Filename slug (`YYYY-MM-DD-<kebab-topic>.md`)
- `shorts.title` / `shorts.thumbnail.headline` (unless the **company** NAVER Corp. is the subject)

Avoid phrases such as: `네이버`, `Naver`, `네이버 리서치`, `네이버 경제`, `네이버 헤드라인`, `naver-economy`, `naver-research`.

**Do** derive titles from **content**: anchor-date market character, dominant catalysts, sector/theme, issuer names, macro calendar.

| Bad (source-branded) | Good (content-based) |
| --- | --- |
| `네이버 리서치 — 단기 체크: 9천피` | `2026년 6월 19일 코스피 전망: 9000선과 코스닥 디커플링` |
| `네이버 경제 헤드라인이 가리키는 MSCI 변수` | `2026년 6월 20일 한국 증시: MSCI·반도체 쏠림이 이번 주 변수인 이유` |
| `naver-research-short-term-brief.md` | `2026-06-19-kospi-nine-thousand-research-brief.md` (thesis kebab) |

`sources[*].url` may still point to Naver; `sources[*].title` stays the **original report/article headline**.

## File Naming

Use:

- `src/content/posts/YYYY-MM-DD-<kebab-topic>.md`

Slug rules:

- lowercase
- numbers and hyphens only
- no spaces or underscores
- **content/thesis kebab**, not search-provider names (`naver-*` forbidden when Naver was only the discovery channel)

## Workflow

1. Classify **Post mode** (market/research vs evergreen/교육) and inspect nearby posts for tone — **and** to avoid cloning the same daily skeleton.
2. If input is topic (+ optional anchor URLs), run Topic-Driven Research Mode as the primary flow, and apply **Topic mode + anchor URLs** to include anchors as required references within that flow. If topic-only with no anchors, run Topic-Driven Research Mode only.
3. Draft frontmatter first and validate schema fields — especially **`sources[*].type` enum** (no `data`/`guide`).
4. For YouTube sources, extract transcript-backed points (or best-effort metadata summary with confidence note).
5. Draft body sections using the **ziin analysis engine** (Report Writing Style): answer-first conclusion, fact table (≤7), plain language, scenarios, reader checklist, **지인의 판단**. For evergreen, meet the **depth bar**.
6. Plan visualization before finalizing body: pick at least 3 visual elements (mixing 2+ types) per Visual Enrichment Policy, and embed them inline at the right sections. (Evergreen may use 2 strong tables + 1 diagram if denser than three decorative visuals.)
7. List or search `src/content/events/` for overlaps; determine event co-updates; create/update event markdown files when policy above applies. **Skip events for pure evergreen concept guides** unless a concrete calendar catalyst is central.
8. Add **`shorts`** after `sources` and before `entities` for market/research posts unless opted out; **omit shorts for 교육 guides** unless the user asks. Derive hook/scenes from the finalized thesis; validate against **Shorts** table.
9. Re-check all source metadata fields and date formats.
10. Verify visuals: GFM tables have header + separator rows, `{{cite:}}` in cells where sourced, SVG has `viewBox`, images use stable URLs, no `mermaid` blocks or HTML `<table>`, citations consistent with prose.
11. **Style pass:** emphasis budget; numbers ≤7 in lead table; slang rewrite; fact/opinion labels; scenarios present.
12. **Schema/build gate:** `pnpm run build` (or content sync) must succeed — fix `InvalidContentEntryDataError` before commit.
13. Save or update the target post file and any event files.
14. **Git publish:** [_shared/git-publish.md](../_shared/git-publish.md) — `git add` → `commit` → `push`. 파일 변경 없거나 사용자 "git 생략" 시 skip.

## Quality checklist (before Final Response)

- [ ] Post mode classified; `교육` tag only on evergreen
- [ ] ziin engine: 결론 · 핵심 팩트 · 배경 동인 · 시나리오 · 투자자 유의점 · 지인의 판단 · **개념 노트** (evergreen adapted)
- [ ] Hangul body ≥ ~1,200 (prefer 1,500+); 현상:해석 1:1; no thin “야간선물→방향” copy
- [ ] Anti-AI shell: no greeting / 3-bullet / summary-당부 template; first-person analyst tone
- [ ] Search-friendly title; plain language (no unexplained trader slang)
- [ ] Lead fact table ≤7 rows; no equal “N대 변수” / no daily FAQ unless requested
- [ ] Fact vs interpretation labeled; not fused in one unlabeled paragraph
- [ ] Every `sources[*].type` ∈ allowed enum
- [ ] Evergreen: body depth bar met; shorts omitted unless requested
- [ ] Market/research: shorts present unless opted out
- [ ] Visual enrichment met (or evergreen exception documented)
- [ ] `pnpm run build` (or equivalent schema check) passed
- [ ] Git publish done or skip reason recorded

## Final Response To User

When done, report:

1. Created/updated file path
2. Any assumed defaults
3. Missing data the user may want to refine (optional)
4. **`shorts`:** one-line note on hook angle and target `duration`, or that shorts was omitted (user request **or** evergreen/교육 default)
5. **Post mode** + (evergreen only) approximate Hangul body length vs depth bar

For URL-only mode, also report:

6. URL -> inferred source mapping (`type`, `tier`, `date` basis)

For topic-driven mode, also report:

7. Discovered-source shortlist and why each was selected

For topic-driven mode **with user anchor URLs**, also report:

8. Anchor URLs (in order) and which `src-n` id each received; confirm every anchor appears in `sources` and is cited in the body

If events were co-updated, also report:

9. Created/updated event file paths and rationale

Always report (unless git skipped):

10. **Build/schema gate** — pass/fail
11. **Git** — commit hash·branch·push result, or skip reason

## Related

- Git after skill: [_shared/git-publish.md](../_shared/git-publish.md)
