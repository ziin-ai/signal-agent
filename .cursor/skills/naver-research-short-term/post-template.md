# Research Post Template

`post-from-sources` 스키마 준수. 아래는 **리서치 브리핑 전용** 기본값·본문 골격.

## Filename

```
src/content/posts/YYYY-MM-DD-<content-kebab>.md
```

- **content kebab** = 당일 thesis hook (지수·섹터·촉매). 예: `2026-06-19-kospi-nine-thousand-research-brief.md`
- `naver-*` slug **금지** — 네이버는 수집 경로일 뿐 ([post-from-sources Title Policy](../post-from-sources/SKILL.md#title-policy-naver-as-search--discovery-source))
- fallback anchor일 때도 **anchorDate** 기준 (리포트 발행일)

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

**원칙:** 리서치·뉴스 **내용**(시장 성격, 변수, 섹터·종목)만 반영. `네이버`/`Naver`/`네이버 리서치`/`네이버 경제` 등 **수집처 표기 금지**.

- ✅ `{anchorDate} 증권사 리서치 브리핑: {한 줄 hook — 지수·촉매·섹터}`
- ✅ `{anchorDate} 코스피 {N}천피·{테마}: 단기 체크포인트`
- ❌ `{anchorDate} 네이버 리서치 — …`
- ❌ `네이버 경제 헤드라인이 가리키는 …`

## Body structure

`post-from-sources` **ziin analysis engine** 순서 고정. 해석·1인칭 중심. 단순 시황 전달·AI 템플릿(인사→불렛3→당부) 금지. Hangul **≥ ~1,200자**(권장 1,500+).

```markdown
## 오늘의 결론

{2~5문장: 해석이 담긴 답. 리서치 나열·“지표→방향”만 쓰지 말 것}

## 핵심 팩트

| 지표 | 현재 | 의미 |
| --- | --- | --- |
| … | … | … |  <!-- 5~7행, news·리포트 교차 검증 -->

## 배경 동인

{데일리 2~3건 synthesize — 원인 인과 + 현상:해석 1:1, {{cite:src-x}}}

## 종목 체크 (증권사 리포트)

| 종목 | 리포트 요지 | 증권사 | 단기 변수 |
| --- | --- | --- | --- |
| ... | ... | ... | ... |

## 데이터 시나리오

| 시나리오 | 조건 | 함의 |
| --- | --- | --- |
| 갭 유지 / 상승 | … | … |
| 갭 메움 / 중립 | … | … |
| 추가 약세 | … | … |

## 투자자 유의점

1. …
2. …
3. …

## 지인의 판단

{1인칭 고유 해석 — 리포트 인용 최대 1건 + 동의/이견}

## 개념 노트

{오늘 테마와 연결된 에버그린 개념 1블록 — 베이시스·수급·밸류 등}

## 결론

{5~10줄 + 짧은 면책}

## 출처

- [리포트/기사 제목](url) — tier N, YYYY-MM-DD
```

## Title patterns (search-friendly)

- ✅ `{anchorDate} 코스피 전망: {핵심 숫자}, {질문}?`
- ✅ `{anchorDate} 증권사 리서치 브리핑: {지수·촉매·섹터 hook}`
- ❌ 암호형 메모 제목 (`호가`·`테이프`·`슈퍼위크는 이번 주 이야기`만으로 끝)
- ❌ `{anchorDate} 네이버 리서치 — …`

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
