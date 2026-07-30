---
name: naver-research-short-term
description: >-
  Fetches today's (KST) Naver Pay Securities research from stock.naver.com/research,
  triages for short-term traders, cross-checks with news, and writes a full analysis
  post under src/content/posts/ (with shorts, visuals, sources). After saving files,
  run git add, commit, and push per _shared/git-publish.md unless the user opts out
  or there are no changes. Use when the user asks for 네이버 증권 리서치, 증권사 리포트
  정리·작성, 단기 투자 공유, 오늘 리포트 포스트, stock.naver.com/research, or broker
  morning/market-close research briefs for Korea equities.
disable-model-invocation: true
---

# Naver Research — Short-Term Investor Brief & Post

## Goal

**KST 기준일**에 [네이버페이 증권 리서치](https://stock.naver.com/research)에서 새로 올라온 리포트를 수집하고, **단기(수일~수주) 매매·섹터 로테이션**에 쓸 만한 것만 골라 **`src/content/posts/` 분석 포스트**까지 작성한다.

사용자가 "브리핑만·채팅만·파일 없이"라고 명시하지 않는 한 **포스트 작성이 기본 산출물**이다. 스키마·shorts·visual·events 규칙은 **[post-from-sources](../post-from-sources/SKILL.md)** 와 [post-template.md](post-template.md)를 따른다. 시장 숫자 보강은 **[korea-daily-news](../korea-daily-news/SKILL.md)** 검색을 병행한다.

## When To Use

- "오늘 네이버 리서치 정리해줘" → **포스트까지**
- "증권사 리포트 중 단기 투자자에게 공유할 것" → **포스트 + DM용 요약**
- "stock.naver.com/research 최신 리포트 브리핑 작성"
- "모닝 브리프·마감 시황·종목 리포트 요약 글"

**Brief-only (파일 없음):** 사용자가 "채팅만", "브리핑만", "Mode A", "리서치만" 명시 시.

**Do not use** for: PDF OCR·목표가/EPS 필수 딥다이브, 비한국 종목 단독.

## Step 0: Anchor The Date

1. **기준일 = KST 오늘** (사용자 `YYYY-MM-DD` 명시 시 그 날짜).
2. **주말·공휴일**: 당일 리포트 0건 → **최근 `writeDate`** 를 `anchorDate`로. 포스트 `date`·filename도 **anchorDate** 기준. 응답 첫 줄에 `fallback: 최근 거래일 YYYY-MM-DD`.
3. **장중 vs 장마감** (korea-daily-news 동일):
   - 09:00~15:30 KST: 모닝·전일 마감 중심
   - 15:30 이후: 당일 마감·종목 리포트 우선

## Step 1: Fetch Reports

### Primary API

```
GET https://m.stock.naver.com/front-api/research/list?category={cat}&page=1&pageSize=50
```

| `category` | 탭 |
| --- | --- |
| `daily` | 데일리 |
| `company` | 종목분석 |
| `industry` | 산업분석 |
| `invest` | 투자전략 |
| `economy` | 경제분석 |
| `debenture` | 채권분석 |

```bash
node .cursor/skills/naver-research-short-term/scripts/fetch-research.mjs
node .cursor/skills/naver-research-short-term/scripts/fetch-research.mjs --date YYYY-MM-DD
```

`anchorDate`, `reports[]`, `shortTermScore` 사용. URL: `m.stock.naver.com` → `stock.naver.com`.

### Fallback

`finance.naver.com/research/{category}_list.naver?page=1` HTML 파싱.

## Step 2: Triage — Short-Term Lens

### Include

| Bucket | Signal |
| --- | --- |
| 시황·수급 | 마감 시황, Morning Brief, Market Digest |
| 종목 촉매 | 실적·배당·수주·테마 (조회수 3k+) |
| 섹터 로테 | 통신장비, MLCC, 방산, 로봇/조선 |
| 전략·파생 | 코스닥 프리미엄, FOMC·환율 |
| 글로벌 연동 | 미 증시 → 한국 개장 |

### Skip

채권 Daily, Carbon/ESG snapshot, 비상장, 중복 모닝 브리프(→ 증권사 2~3 + 마감 1~2).

### Share buckets (5~8 포인트)

1. 한 줄 시장 (데일리 synthesize)
2. 주목 종목 2~4 (company)
3. 섹터/테마 1~2 (industry)
4. 다음 장 변수 (invest)

`shortTermScore` ≥ 4 우선, 동점 시 `readCount` 내림차순.

## Step 3: Enrich & Build Sources

리포트 API는 메타만. **포스트 작성 전** 교차검증 필수:

1. `WebSearch`: `{anchorDate} 코스피 마감`, `외국인 순매수`, 선정 종목명
2. `WebFetch`: 핵심 뉴스 2~3건 (지수·수급 숫자)
3. 선정 리포트 4~8건 → `sources` (`type: report`, `tier: 2`)
4. 교차검증 뉴스 2~4건 → `sources` (`type: news`, `tier: 2`)
5. **합계 `sources` ≥ 6건**

**규칙:** 목표가·EPS·%는 PDF/뉴스 확인분만. 제목만 보고 숫자 창작 금지.

## Step 4: Write Post (default)

**[post-from-sources](../post-from-sources/SKILL.md)** 전체 + [post-template.md](post-template.md) 적용.

### Workflow

1. 근처 포스트 톤 참고: `src/content/posts/2026-06-19-korea-q2-earnings-surprise-candidates.md`, `src/content/posts/2026-05-14-korea-equity-market-daily-summary.md`
2. frontmatter 작성 → schema 검증
3. **제목·파일명**: [post-from-sources Title Policy](../post-from-sources/SKILL.md#title-policy-naver-as-search--discovery-source) — 네이버는 수집 경로일 뿐; `title`·slug·shorts에 `네이버`/`naver-*` 금지. 당일 hook(지수·섹터·촉매)으로 작성.
4. 본문: [post-template.md](post-template.md) Body structure
5. Visual ≥ 3 (표 + SVG/ASCII + blockquote) — post-from-sources Visual Enrichment Policy
6. **`shorts`** — `sources` 다음, `entities` 앞 (사용자 "shorts 생략" 시만 제외)
7. 확정 촉매 → `src/content/events/` co-update (post-from-sources Event Co-Update Policy)
8. 저장: `src/content/posts/YYYY-MM-DD-<content-kebab>.md` (예: `2026-06-19-kospi-nine-thousand-research-brief.md`) — 고정 `naver-research-*` slug 사용 금지

### Frontmatter quick defaults

| Field | Default |
| --- | --- |
| `symbol` | `^KS11` |
| `market` | `KRX` |
| `conviction` | `3` (마감) / `4` (장 전·다수 촉매) |
| `tags` | `리서치`, `코스피`, `단기매매` + 섹터 2~3 |
| `aiAssisted` | `true` |

### Writing rules (research-specific)

- **팩트(뉴스·리포트) vs 해석** 분리 — "유안타는 ~", "시나리오상 ~"
- 리포트는 **요지 + 단기 변수**만; PDF 전문 recap 금지
- 종목 표: `종목 | 리포트 요지 | 증권사 | 단기 변수(촉매·리스크)`
- 투자 권유·매수 단정 없음
- 본문 `## 출처`에 리포트·뉴스 URL 집중; 과다 inline link 금지

## Step 5: Chat Share Excerpt (after post)

포스트 저장 후 채팅에 **DM/커뮤니티용 500~800자** 요약 추가 (TL;DR과 정합):

```markdown
## {anchorDate} 증권사 리서치 — 단기 체크

> {한 줄 hook}

**시장:** ...
**종목:** ...
**섹터:** ...
**다음:** ...

📄 전문: src/content/posts/YYYY-MM-DD-<content-kebab>.md
※ 리포트 요지 요약, 투자 권유 아님
```

## Output Modes

| Mode | Trigger | Output |
| --- | --- | --- |
| **Post + excerpt** (default) | (명시 없음) | `src/content/posts/*.md` + Step 5 채팅 요약 |
| **Brief only** | "채팅만", "브리핑만", "파일 없이" | Step 5 형식만, 파일 없음 |
| **Research only** | "리서치만", "sources만" | 선정 표 + sources YAML + 제목 3개 |

## Step 6: Quality Checklist

- [ ] `anchorDate`·fallback 명시
- [ ] `sources` ≥ 6, 리포트 URL `stock.naver.com/research/...`
- [ ] `sources[*].type` ∈ allowed enum (`report`/`news` 등 — `data`/`guide` 금지)
- [ ] 핵심 숫자 = news fetch와 일치
- [ ] **콜 · 순위 · 가드레일** (post-from-sources Expert voice); 균등 나열·일간 FAQ 골격 복붙 금지
- [ ] visual 3종+, `shorts` 포함(생략 요청 제외)
- [ ] 공유 포인트 5~8, 중복 모닝 브리프 과다 없음
- [ ] 투자 권유·미확인 목표가 없음
- [ ] events co-update (해당 시)
- [ ] `pnpm run build`(schema) 통과 후 git publish 또는 skip 사유

## Step 7: Git Publish

**Post + excerpt** 등 파일 생성·수정 시 [_shared/git-publish.md](../_shared/git-publish.md) 실행 (`build gate` → `git add` → `commit` → `push`).

**Brief only / Research only** 등 워킹 트리 변경 없으면 skip. 사용자 "git 생략" 시 skip.

## Final Response To User

1. **기준일·anchor·fallback** (KST)
2. **생성/수정 파일 경로**
3. **콜 한 줄** + **선정 5~8 포인트** (순위 반영)
4. **대표 리포트 3~5** 링크
5. **sources shortlist** — 포함 이유 1줄
6. **low-confidence** — PDF 미확인
7. **shorts** 훅 각도, **events** (해당 시)
8. **DM용 요약** (default mode)
9. **Build/schema** — pass/fail
10. **Git** — commit hash·branch·push 결과 또는 skip 사유

## Trigger Examples

```text
`naver-research-short-term` — 오늘 네이버 리서치 중 단기 투자 공유용으로 정리해줘.
```

```text
`naver-research-short-term` 2026-06-19 기준 포스트 작성. shorts 포함.
```

```text
`naver-research-short-term` — 브리핑만 채팅으로, 파일 없이.
```

## Related

- Post schema: [post-from-sources](../post-from-sources/SKILL.md)
- Git after skill: [_shared/git-publish.md](../_shared/git-publish.md)
- Post template: [post-template.md](post-template.md)
- Market news: [korea-daily-news](../korea-daily-news/SKILL.md)
- Example snapshot: [snapshot-latest.md](snapshot-latest.md)
