---
name: korea-weekly-macro
description: >-
  Synthesizes a Mon–Fri (KST) week of Korea/US macro, equity flows, and sector
  data into a weekly macro terrain map and next-week investment strategy report.
  Applies signal-vs-noise triage, causal trend analysis, and a fixed four-section
  template. Saves under src/content/posts/ via post-from-sources schema (shorts,
  visuals, events). After saving files, run git add, commit, and push per
  _shared/git-publish.md unless the user opts out or there are no changes.
  Use when the user asks for 주간 매크로, weekly macro strategy, 차주 투자 전략,
  주간 지형도, W주차 리포트, weekly KOSPI/KOSDAQ outlook, or end-of-week market wrap.
disable-model-invocation: true
---

# Korea Weekly Macro (주간 매크로 지형도)

## Role

글로벌 매크로·대한민국 주식시장(KOSPI/KOSDAQ)·기술 섹터(반도체/AI/방산 등) **수석 투자 전략가·데이터 애널리스트** 톤으로, 한 주간 데이터를 **차주 포지션 설정**에 쓸 수 있는 **주간 매크로 지형도 및 전략 리포트**를 작성한다.

## Goal

**월~금(KST) 한 주**의 뉴스·지표·수급·섹터 흐름을 **인과·추세** 중심으로 재구성하고, [report-template.md](report-template.md) 구조에 맞춰 **`src/content/posts/`** 포스트까지 저장한다(기본).

파일 저장 시 **[post-from-sources](../post-from-sources/SKILL.md)** 스키마·shorts·Visual Enrichment·Title Policy·Event Co-Update를 따른다.

## When To Use

- "이번 주 매크로 지형도 / 주간 리포트"
- "차주 투자 전략 정리"
- "W주차 코스피·코스닥 주간 wrap"
- "금요일 마감 기준 주간 매크로 + 다음 주 시나리오"

**Do not use** for: 당일 장중 브리핑 only → `korea-daily-news`. 증권사 리서치 단기 브리핑 only → `naver-research-short-term`. 단일 종목 딥다이브 → `post-from-sources` 직접.

## Step 0: Anchor The Week

1. **기준 주 = KST 월~금** (사용자가 `YYYY-MM-DD` 한 날만 주면 → 그 주의 **금요일 마감 주**로 정규화).
2. 응답 첫 줄: **`weekStart`–`weekEnd` (KST), W{n}주차`** 명시.
3. **W주차 라벨**: 해당 월의 ISO-style 주차 또는 "6월 2주차" 등 — 제목·파일 slug와 **동일 표기** 유지.
4. 토·일 실행 시: **직전 거래 주(금요일 마감)** 를 anchor. `fallback: 직전 거래 주` 한 줄 표기.

## Step 1: Collect Inputs

병렬로 데이터를 모은다. **최소 8건** 서로 다른 근거, **sources ≥ 10건** 목표.

### 1A. Repo scan (same week)

`src/content/posts/`·`src/content/events/`에서 `weekStart`~`weekEnd` 날짜의 **일간 포스트·이벤트**가 있으면 우선 인용 후보로 사용.

### 1B. Parallel search

[search-queries.md](search-queries.md) 의도 매트릭스 실행. `WebFetch`로 핵심 기사·보도 **3~6건** 본문 확인.

### 1C. Required data buckets

| Bucket | Must capture |
| --- | --- |
| 지수 | 코스피·코스닥 **주간 등락**, 금요일 종가, 주간 고/저 |
| 수급 | 외국인·기관·개인 **주간 누적** (가능하면 대금·섹터/종목 특징) |
| 매크로 | CPI·FOMC·BOK·환율·美 10Y·유가·VKOSPI 등 **주간 변화** |
| 섹터 | 주도/소외 섹터, 반도체·AI·방산·플랫폼 등 **상대 수익률** |
| 캘린더 | **차주** 확정 일정 (KST) |

**규칙:** 확인되지 않은 숫자·%·확률은 쓰지 않는다. 시나리오 확률은 **근거(시장 가격·컨센·과거 유사 국면)** 가 있을 때만 부여; 없으면 `근거 부족 — 정성 서술` 명시.

## Step 2: Signal vs Noise Triage

### Signal (중심)

- 차주·수주간 **재료**가 되는 매크로·정책·실적·지수 편입·수급 구조 변화
- **2일 이상** 지속되거나 **지표·수급이 같은 방향**을 확인하는 추세
- 섹터 **자금 이동 경로**가 명확한 것 (예: 대형 반도체 쏠림 → 중소형 이탈)

### Noise (축소·1문장 이하)

- 단일 헤드라인·루머·1일 테마
- 확인 전 목표가·SNS 떡밥
- 주간 방향과 **모순**되는 일별 변동 (단, 변동성 자체는 Signal)

**금지:** 월~금 **일별 연대기 나열**. 대신 주간 **하나의 narrative arc**(예: "9천피 돌파 → CPI 전 숨고르기 → MSCI 대기")로 묶는다.

## Step 3: Synthesis Rules

1. **단순 요약 금지:** 일별 뉴스 연대기 나열 금지. **인과관계·추세(Trend)** 도출.
2. **소음과 신호 분리:** 단기 테마(Noise) 축소, 차주·수주 Signal 중심.
3. **명확한 시각화:** 텍스트 밀도 낮춤 — 표·불릿·레이블. post-from-sources Visual Enrichment (**≥3 visuals, 2+ types**) 준수.
4. **데이터 기반 어조:** "~인 것 같다", "~카더라" 금지. 지표·수급·컨센에 기반.
5. **팩트 vs 해석 분리:** 수치는 출처, 전망·확률은 근거와 함께.
6. **한국어** 분석 톤. 본문에 AI·생성 언급 금지. `aiAssisted: true` 유지.
7. **Title Policy:** [post-from-sources Title Policy](../post-from-sources/SKILL.md#title-policy-naver-as-search--discovery-source) — 네이버는 수집 경로일 뿐; `title`·slug·shorts에 `네이버`/`naver-*` 금지.

## Step 4: Write Report (default)

1. [report-template.md](report-template.md) **Output Format Template** 구조·톤 **엄격 준수**.
2. 본문 **맨 위 H1** = 템플릿 제목 (`## [Weekly] …` → 실제 `#` 제목으로 렌더).
3. **Deep Dive 이슈 2~3개** — 각각 **현상 → 원인 및 컨텍스트 → 시장 영향**.
4. **Next Week Action** — Key Schedule 표(KST) + 상·하방 시나리오(확률은 근거 있을 때만).
5. frontmatter → [post-from-sources](../post-from-sources/SKILL.md) 검증.
6. **`shorts`**: 주간 hook + 차주 1대 변수 중심 (`sources` 다음, `entities` 앞). 사용자 "shorts 생략" 시만 제외.
7. **차주 확정 촉매** → `src/content/events/` co-update.

### Post defaults

| Field | Default |
| --- | --- |
| `symbol` | `^KS11` |
| `market` | `KRX` |
| `conviction` | `3` (혼조·불확실) / `4` (추세·촉매 다수 정렬) |
| `tags` | `주간매크로`, `코스피`, `한국증시` + 주간 핵심 테마 2~4 |
| `aiAssisted` | `true` |
| `draft` | `false` |

### Filename

```
src/content/posts/{weekEnd-YYYY-MM-DD}-korea-weekly-macro-w{n}-{thesis-kebab}.md
```

예: `2026-06-20-korea-weekly-macro-w3-msci-semiconductor-squeeze.md`

- `thesis-kebab` = 주간 **한 줄 hook** (MSCI·쏠림·CPI 등). `naver-*` 금지.

## Output Modes

| Mode | Trigger | Output |
| --- | --- | --- |
| **Post** (default) | (명시 없음) | `src/content/posts/*.md` + Final Response |
| **Brief only** | "채팅만", "파일 없이", "브리핑만" | report-template 본문만 채팅 |
| **Research only** | "리서치만", "sources만" | triage 표 + sources YAML + 제목 3개 |

## Step 5: Quality Checklist

- [ ] `weekStart`–`weekEnd`·W주차 명시
- [ ] 일별 연대기 나열 없음 — **추세·인과** + **콜 · 순위 · 가드레일** (post-from-sources Expert voice)
- [ ] Signal 2~3 Deep Dive, Noise 축소 — 균등 N대 나열 금지
- [ ] 주간 수급·지수 **확정 숫자** = sources/fetch 일치
- [ ] 차주 Key Schedule **KST** 정렬
- [ ] visual ≥3, `shorts` 포함(생략 요청 제외)
- [ ] `sources` ≥ 10; `type` ∈ allowed enum only (`data`/`guide` 금지)
- [ ] 시나리오 확률 = 근거 있거나 "근거 부족" 명시
- [ ] events co-update (해당 시)
- [ ] `pnpm run build`(schema) 통과 후 git publish 또는 skip 사유

## Step 6: Git Publish

파일 생성·수정 시 [_shared/git-publish.md](../_shared/git-publish.md) (`build gate` → `git add` → `commit` → `push`).

Brief only / Research only / 변경 없음 / 사용자 "git 생략" → skip.

## Final Response To User

1. **기준 주** (`weekStart`–`weekEnd`, W{n}, fallback 여부)
2. **생성/수정 파일 경로** (Post mode)
3. **주간 콜 한 줄** + **Signal 2~3** (순위 포함)
4. **차주 Top 3 일정** (KST) + **가드레일** 한 줄
5. **sources shortlist** — 포함 이유 1줄
6. **low-confidence** — 미확인 숫자·충돌 보도
7. **shorts** 훅 각도, **events** (해당 시)
8. **Build/schema** — pass/fail
9. **Git** — commit hash·branch·push 또는 skip 사유

## Trigger Examples

```text
`korea-weekly-macro` — 2026-06-16~20 주간 매크로 지형도 포스트 작성. shorts 포함.
```

```text
`korea-weekly-macro` 이번 주 wrap + 차주 투자 전략. 파일 저장.
```

```text
`korea-weekly-macro` — 리서치만. sources YAML + Signal/Noise 표.
```

## Related

- Report template: [report-template.md](report-template.md)
- Search intents: [search-queries.md](search-queries.md)
- Post schema: [post-from-sources](../post-from-sources/SKILL.md)
- Daily research: [korea-daily-news](../korea-daily-news/SKILL.md)
- Git after skill: [_shared/git-publish.md](../_shared/git-publish.md)
