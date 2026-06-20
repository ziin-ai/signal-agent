---
name: korea-daily-news
description: >-
  Search today's major Korean news (KST) on economy, stocks, and macro,
  triage by market impact, and draft analysis posts or briefs for signal-agent.
  After saving files, run git add, commit, and push per _shared/git-publish.md
  unless the user opts out or there are no changes.
  Use when the user asks for 오늘 한국 뉴스, 당일 증시·경제 헤드라인, 코스피/코스닥
  시장 요약, 네이버·연합뉴스 경제 섹션 정리, or daily Korea market outlook from
  current news. Chains into post-from-sources for file output under src/content/posts/.
disable-model-invocation: true
---

# Korea Daily News (경제·주식)

## Goal

**오늘(KST) 날짜** 기준으로 한국 주요 뉴스를 검색·선별하고, **경제·주식·거시**에 시장 영향이 큰 내용만 골라 분석 글로 정리한다.

최종 산출물을 레포 파일로 저장할 때는 이 스킬의 리서치 결과를 바탕으로 **[post-from-sources](../post-from-sources/SKILL.md)** 스키마·작성 규칙을 따른다.

## When To Use

- "오늘 한국 경제/증시 뉴스 정리"
- "네이버 뉴스 헤드라인 기준 시장 전망"
- "코스피/코스닥 당일 이슈 브리핑"
- "오늘 날짜 관련 한국 주요 뉴스 검색 후 글 작성"

**Do not use** for: 특정 종목 심층 리포트, URL-only 소스 변환, 비한국 시장 단독 분석 → `post-from-sources` 직접 사용.

## Step 0: Anchor The Date

1. **기준일 = KST 오늘** (사용자가 `YYYY-MM-DD`를 명시하면 그 날짜).
2. 장중/장마감 구분:
   - **09:00~15:30 KST**: 장중 — "장 전/장중" 표현, 전일 종가·선물·환율 중심.
   - **15:30 이후**: 장 마감 — 마감 지수·수급·환율 마감가 우선.
   - **익일 장 전(06:00~08:59)**: 전일 마감 + 당일 장 전 헤드라인(모닝 리포트) 혼합, 혼동 금지.
3. 응답 첫 줄에 **기준일·시각대(장전/장중/장마감)** 를 명시.

## Step 1: Parallel News Search

`WebSearch`를 **병렬**로 실행한다. 최소 **6~10개** 서로 다른 검색 의도. 모든 쿼리에 **기준일(한국어)** 포함.

### Search intent matrix

| # | Intent | Example query (replace `{date}`) |
| --- | --- | --- |
| 1 | 코스피·코스닥 마감/장중 | `코스피 코스닥 {date} 마감` |
| 2 | 수급·외국인 | `외국인 순매수 {date} 코스피` |
| 3 | 증권가 전망 | `{date} 증시 전망 모닝 브리핑` |
| 4 | 네이버 경제 헤드라인 | `site:n.news.naver.com 경제 {date}` |
| 5 | 연합뉴스 마켓 | `site:yna.co.kr 증시 {date}` |
| 6 | 거시·정책 | `{date} 한국은행 환율 CPI GDP` |
| 7 | 섹터·특징주 | `{date} 특징주 반도체` |
| 8 | 글로벌 연동 | `{date} 미국 증시 한국 증시` |
| 9 | 기업·이슈 | `{date} 실적 공시 과징금 파업` |
| 10 | 변동성·파생 | `VKOSPI {date}` 또는 `서킷브레이커 {date}` |

`{date}` 예: `2026년 6월 10일`, `2026-06-10`.

### Preferred sources (tier bias)

| Tier | Outlets |
| --- | --- |
| 1 | 한국은행·금융위·거래소·DART 공시, 공식 IR |
| 2 | 연합뉴스, 머니투데이, 한국경제, 매일경제, 이데일리, 아시아경제, 파이낸셜뉴스, 한국경제TV |
| 3 | 네이버 뉴스 경제/IT/증권 섹션 집계, 증권사 모닝 리포트 요약 |
| 4 | 블로그·커뮤니티 — **본문 근거로 사용 금지**, 후속 검색 힌트만 |

검색 후 **`WebFetch`** 로 핵심 기사 3~5건 본문 확인(숫자·인용·날짜 검증).

## Step 2: Triage — What Matters For Markets

헤드라인 전부가 아니라 **시장 가격·수급·밸류에 재료가 되는 것**만 남긴다.

### Include (high priority)

- 지수·환율·금리·VKOSPI 등 **확정 수치**
- 외국인·기관·개인 **순매수/순매도** (종목·섹터 단위)
- **당일·당주** 일정: CPI, FOMC, BOK, 실적, 규제 심의, MSCI 등
- 대형주·지수 비중 종목: 실적, CAPEX, 파업, 과징금, M&A
- 정책·법안 **시행일·심의일**이 명확한 것
- 전일/당일 **±3% 이상** 지수·섹터·종목 변동

### Deprioritize / skip

- 연예·스포츠·단순 인사
- 중복 보도(동일 팩트 3건 → 1 source)
- 날짜 불명·"추후 발표"만 있는 루머
- 출처 없는 SNS 떡밥

### Rank into buckets

1. **매크로** — CPI, 금리, 환율, 유가, 지정학
2. **시장 미시** — 수급, 변동성, ETF 괴리, 프로그램
3. **섹터** — 반도체, 바이오, 플랫폼, 자동차 등
4. **종목** — 시총·지수 비중 또는 당일 ±5% 이상
5. **캘린더** — 오늘~7일 내 확정 일정

목표: **3~7개 "오늘 장을 가르는 변수"** (5±2). 너무 많으면 독자가 핵심을 잃는다.

## Step 3: Synthesis Rules

- **팩트와 해석 분리**: 수치는 출처와 함께, 전망은 "증권가는 ~", "시나리오상 ~".
- **인과 > 나열**: "무슨 일이 있었나" 다음에 "코스피/환율/섹터에 왜 중요한가".
- **상충 신호 명시**: 차익실현 vs 수출 호재처럼 방향이 갈리면 표로 정리.
- **숫자 금지**: 검색·본문에서 확인되지 않은 지수·%·금액은 쓰지 않는다.
- **한국어** 분석 톤. AI·생성 언급 금지(본문). frontmatter `aiAssisted: true`는 유지.
- 기존 레포 톤 참고:
  - `src/content/posts/2026-05-14-korea-equity-market-daily-summary.md` (장 마감형)
  - `src/content/posts/2026-06-10-naver-economy-market-outlook.md` (장 전·헤드라인형)

## Step 4: Output Modes

사용자 요청이 없으면 **Mode B(포스트 파일)** 를 기본으로 한다.

### Mode A — Quick brief (채팅만)

```markdown
## {YYYY-MM-DD} 한국 경제·증시 브리핑 ({장전|장중|장마감})

### 한 줄
...

### 오늘의 5대 변수
1. ...
2. ...

### 확정 숫자
| 항목 | 값 | 출처 |
| --- | --- | --- |

### 내일·이번 주 체크
- ...

### 출처
- [제목](URL) — tier N, YYYY-MM-DD
```

### Mode B — Full post file (default)

1. 이 스킬 Step 1~3으로 `sources` 후보 **최소 6건** 수집.
2. **[post-from-sources](../post-from-sources/SKILL.md)** 전체 규칙 적용해 `src/content/posts/` 에 저장.

**Daily post defaults:**

| Field | Default |
| --- | --- |
| `symbol` | `^KS11` |
| `market` | `KRX` |
| `conviction` | `3` (마감 요약) / `4` (장 전 전망+다수 촉매) |
| `tags` | `코스피`, `한국증시` + 당일 핵심 섹터 2~4개 |
| `aiAssisted` | `true` |
| `draft` | `false` (사용자가 검토 전이면 `true`) |

**Filename:**

- 장 마감: `YYYY-MM-DD-korea-equity-market-daily-summary.md`
- 장 전/전망: `YYYY-MM-DD-korea-market-outlook.md` 또는 주제 kebab slug
- 네이버 헤드라인 중심: `YYYY-MM-DD-naver-economy-market-outlook.md`

**Body structure (daily — adapt freely):**

1. 첫 1~2문장: 오늘 장의 **성격** (예: 차익실현, CPI 전 관망)
2. `## 결론 요약 (TL;DR)` — 3~5 bullets, 숫자 포함
3. `## 오늘 장에서 확정된 숫자` — GFM 표
4. `## {N}대 시장 변수` — 변수별 소제목, 인과·시나리오
5. `## 수급·섹터` — 표 또는 ASCII/SVG (Visual Enrichment Policy 준수)
6. `## 체크할 리스크`
7. `## 출처`

`shorts` frontmatter: post-from-sources와 동일 — **`sources` 다음, `entities` 앞**. 사용자가 생략 요청 시만 제외.

### Mode C — Research only

`sources` YAML 초안 + triage 표 + 추천 제목 3개만 반환. 파일 생성 없음.

## Step 5: Events Co-Update

당일 글에서 **날짜가 확정된 촉매**가 나오면 `src/content/events/` 동시 기록. 규칙은 [post-from-sources Event Co-Update Policy](../post-from-sources/SKILL.md#event-co-update-policy) 와 동일.

예: BOK 금통위, CPI 발표, 과징금 심의, 실적 발표, MSCI 리밸런싱.

## Step 6: Git Publish

Mode B 등 **파일 생성·수정**이 있으면 [_shared/git-publish.md](../_shared/git-publish.md) 실행 (`git add` → `commit` → `push`).

Mode A·C 등 워킹 트리 변경 없으면 skip. 사용자 "git 생략" 시 skip.

## Quality Checklist

작업 완료 전 확인:

- [ ] 모든 핵심 숫자가 `sources` 또는 fetch 본문과 일치
- [ ] 기준일(KST)과 기사 게시일 혼동 없음 (전일 장 / 당일 장 전 구분)
- [ ] `sources` 6건 이상, tier·type·ISO date·absolute url
- [ ] Mode B면 visual 3종 이상(post-from-sources Visual Enrichment Policy)
- [ ] Mode B면 `shorts` 포함(명시적 생략 제외)
- [ ] 투자 권유·목표가 단정 표현 없음
- [ ] Mode B면 git publish 완료 또는 skip 사유 기록

## Final Response To User

1. **기준일·시각대** (KST)
2. **선정한 3~7 변수** 한 줄씩
3. **생성/수정 파일 경로** (Mode B) 또는 브리핑 요약 (Mode A)
4. **sources shortlist** — 왜 포함했는지 1줄씩
5. **low-confidence 구간** — 확인 못한 숫자·충돈 보도
6. **events** co-update 목록 (해당 시)
7. **shorts** 훅 각도 (Mode B)
8. **Git** — commit hash·branch·push 결과 또는 skip 사유

## Trigger Examples

```text
`korea-daily-news` 스킬로 오늘 한국 경제·증시 뉴스 검색해서 포스트 작성해줘.
```

```text
`korea-daily-news` — 2026-06-10 기준, 장 전 브리핑만 채팅으로.
```

```text
`korea-daily-news`로 리서치만 — sources YAML 초안이랑 5대 변수 표.
```

## Related

- Post schema & shorts: [post-from-sources](../post-from-sources/SKILL.md)
- Git after skill: [_shared/git-publish.md](../_shared/git-publish.md)
- Usage copy-paste: [guidebook/skill-usage-examples.md](../../../guidebook/skill-usage-examples.md)
- Search query expansion: [search-queries.md](search-queries.md)
