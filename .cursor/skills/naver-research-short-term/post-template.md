# Research Post Template

`post-from-sources` 스키마 준수. 아래는 **리서치 브리핑 전용** 기본값·본문 골격.

## Filename

```
src/content/posts/YYYY-MM-DD-naver-research-short-term-brief.md
```

fallback anchor일 때도 **anchorDate** 기준 (리포트 발행일).

## Frontmatter defaults

| Field | Default |
| --- | --- |
| `symbol` | `^KS11` |
| `market` | `KRX` |
| `conviction` | `3` (장 마감형) / `4` (장 전·다수 촉매) |
| `tags` | `리서치`, `코스피`, `단기매매` + 선정 섹터 2~3 |
| `aiAssisted` | `true` |
| `draft` | `false` (검토 전이면 `true`) |

## Sources mix (minimum 6)

| Source kind | `type` | `tier` | Notes |
| --- | --- | --- | --- |
| Naver research URL | `report` | `2` | title = 리포트 제목, date = writeDate |
| Market cross-check | `news` | `2` | 연합·매경·머니투데이 등 — 지수·수급 숫자 |
| Optional filing/IR | `filing` / `ir-call` | `1` | 실적·공시가 핵심일 때 |

리포트 URL 예:

```yaml
- id: "src-1"
  tier: 2
  type: "report"
  title: "국내주식 마감 시황 (26.06.18) - 워시의 입도 막지 못한 270만닉스와 열린 9천피 시대"
  date: 2026-06-19
  url: "https://stock.naver.com/research/daily/36456"
  excerpt: "유안타증권 장마감 시황. 9천피·반도체 대형주·변동성."
```

## Title patterns

- `{YYYY-MM-DD} 증권사 리서치 브리핑: {한 줄 hook}`
- `{anchorDate} 네이버 리서치 — 단기 체크: {핵심 테마}`

## Body structure

```markdown
{첫 1~2문장: anchor 장의 성격 + 리서치가 가리키는 방향}

## 결론 요약 (TL;DR)

- {bullet 3~5, 숫자 포함}

## 오늘 장·리서치가 말하는 것

{데일리 2~3건 synthesize — 인과·시나리오, {{cite:src-x}}}

## 종목 체크 (증권사 리포트)

| 종목 | 리포트 요지 | 증권사 | 단기 변수 |
| --- | --- | --- | --- |
| ... | ... | ... | ... |

## 섹터·전략

{industry + invest 1~2건 — 로테이션·코스닥 프리미엄 등}

## 다음 장 변수

- {FOMC·환율·실적·MSCI 등 — invest/daily + news 교차}

## 체크할 리스크

- {쏠림·차익실현·코스닥 디커플링·PDF 미확인 항목}

## 출처

- [리포트/기사 제목](url) — tier N, YYYY-MM-DD
```

## Visual minimum (post-from-sources)

- GFM **비교 표** 1+: 종목·섹터 매트릭스 또는 시황 숫자 표
- **ASCII/SVG** 1+: 수급 흐름·섹터 로테
- **blockquote** 1: 한 줄 thesis

## Shorts arc

`hook`(장 성격) → `problem`(쏠림/디커플링) → `explanation`(리포트 1~2) → `checkpoints`(다음 변수) → `conclusion` → `cta`

## Events co-update

다음이 본문에 **확정일**로 나오면 `src/content/events/` 추가:

- FOMC·CPI·BOK
- MSCI·실적 잠정·규제 심의
- 종목별 실적 발표일 (issuer `symbol` + `market`)

## Chat share excerpt (post 작성 후)

포스트 저장 후 사용자에게 **500자 내외** DM용 요약을 채팅으로 추가 제공 (Mode A 형식, 포스트 TL;DR과 정합).
