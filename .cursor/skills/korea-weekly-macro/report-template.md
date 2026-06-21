# Weekly Macro Report Template

`post-from-sources` frontmatter + 아래 본문 구조. **Output Format Template** 톤·섹션을 **엄격 준수**.

## Frontmatter sketch

```yaml
---
title: "{weekEnd} {M}월 W{n}주차 매크로 지형도: {thesis hook — 지표·섹터·차주 변수}"
date: {weekEnd YYYY-MM-DD}
symbol: "^KS11"
market: "KRX"
conviction: 3
summary: "한 줄: 주간 시장 성격 + 차주 1대 변수 + 포지션 힌트."
tags: ["주간매크로", "코스피", "한국증시", "..."]
aiAssisted: true
draft: false
sources: []   # ≥10, 주간·차주 근거
shorts: {}    # post-from-sources shortsSchema
entities:
  sector: []
  theme: []
---
```

## Output Format Template

*(아래 Markdown 구조와 톤앤매너를 엄격히 준수하여 리포트를 작성하라.)*

## [Weekly] 매크로 지형도 및 차주 투자 전략 ([MM월 W주차])

> `[Weekly]`는 메타 라벨 — 실제 포스트 `#` 제목에는 `{MM월 W{n}주차}`와 thesis hook만 사용.

### 1. Market Overview: 한 줄 요약 & 심리 지표

- **주간 마켓 한 줄평:** 한 주간의 전체 시장 성격과 핵심 변수를 명확히 정의하는 1문장.
- **주간 수급 트렌드:** 외국인 및 기관의 주간 누적 순매수 대금 현황과 특징적인 자금 이동 경로 요약.

**권장 시각화 (이 섹션 또는 인접):**

| 지표 | 주초 | 주말(금) | 주간 Δ | 비고 |
| --- | --- | --- | --- | --- |
| 코스피 | | | | {{cite:src-x}} |
| 코스닥 | | | | |
| 외국인(주간) | | | | |
| 기관(주간) | | | | |
| VKOSPI / 환율 | | | | |

### 2. Deep Dive: 주간 핵심 매크로 이슈 (최대 2~3개)

*(각 이슈별로 '현상 → 원인 → 시장 영향'의 구조로 심층 분석할 것)*

- **[이슈 제목: 예 - 美 고용 둔화 시그널과 금리 경로의 변화]**
  - **현상 (Fact):** 관련 주요 지표 수치 및 시장 변동 수치 기술 (예: 미 국채 10년물 금리 변동폭 등).
  - **원인 및 컨텍스트 (Context):** 이 현상이 발생한 배경과 시장 참여자들의 심리 변화 분석.
  - **시장 영향 (Implication):** 국내 정규 시장 및 특정 주요 섹터(예: 기술주, 경기민감주 등)에 미친 구체적 영향.

*(이슈 2~3개 반복. 일별 타임라인 금지.)*

### 3. Sector & Trend Tracker: 주도 섹터 및 소외 섹터 진단

- **Leading Sector (주도 영역):** 이번 주 시장을 주도했으며 차주에도 모멘텀이 유지될 가능성이 높은 섹터와 그 근거 (실적/수급 기반 점검).
- **Laggard & Turnaround (소외 및 반등 영역):** 과도한 낙폭 후 거래대금이 유입되거나 바닥권 탈출 신호가 포착되는 섹터/종목군 분석.

**권장 표:**

| 구분 | 섹터/테마 | 주간 상대 강도 | 수급·실적 근거 | 차주 체크 |
| --- | --- | --- | --- | --- |
| Leading | | | | |
| Laggard | | | | |
| Turnaround | | | | |

### 4. Next Week Action: 차주 시나리오 및 대응 전략

- **Key Schedule:** 차주 예정된 핵심 매크로 일정 및 기업 실적/이벤트 목록 (한국 시간 기준 정렬).

| 일시 (KST) | 이벤트 | 영향 섹터/자산 | impact |
| --- | --- | --- | --- |
| | | | |

- **Market Scenarios:**
  - **상방 시나리오 (확률 OO%):** 주요 지표가 긍정적일 때의 시장 예상 밴드 및 주도 섹터 비중 확대 전략.
  - **하방 시나리오 (확률 OO%):** 리스크 요인 부각 시 지지선 설정 및 현금/방어주 비중 관리 가이드.

**확률 규칙:** OO%는 **근거(옵션 가격·컨센·과거 유사 국면)** 가 있을 때만. 없으면 `(정성)` 또는 `(근거 부족)` 표기.

---

## Body add-ons (post-from-sources)

`## 출처` — URL·tier·날짜 집중. 과다 inline link 금지.

**Visual minimum:** GFM 표 2+ · SVG/ASCII 1+ · blockquote 1 (주간 thesis).

**Shorts arc:** hook(주간 성격) → problem(변동성/쏠림) → explanation(Signal 1) → checkpoints(차주 일정) → conclusion → cta
