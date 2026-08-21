# ziin.ai — Technical Architecture

## 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Astro 6.x | 콘텐츠 컬렉션, 0 JS 기본, `@astrojs/node` SSR |
| UI | Tailwind CSS 4 | 디자인 토큰 관리 용이 |
| 인터랙티브 | React 18 (islands) | 그래프, 차트만 클라이언트 컴포넌트 |
| 콘텐츠 | Markdown + frontmatter | Git이 SSOT |
| 차트 | Recharts | React 친화, 번들 < 100KB |
| 그래프 | D3 v7 (force layout) | Knowledge Graph 시각화 |
| 시세 | Yahoo Finance v8 (비공식) | 무료, 한국 종목 지원 |
| 배포 | kubernetes | 도메인 ziin.ai 연결 |
| CI | GitHub Actions | 빌드, AI 리뷰, 자동 재검증 |

## 디렉토리 구조

ziin-ai/
├── .ai/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── style-guide.md
│   ├── prompts/
│   │   ├── outline.md
│   │   ├── review.md
│   │   ├── source-audit.md
│   │   └── thesis-extract.md
│   └── context/
│       └── recent-posts-summary.md
├── src/
│   ├── content/
│   │   ├── posts/              # 분석 글 (.md)
│   │   ├── recommendations/    # 매수/매도 기록
│   │   ├── theses/             # 검증 대기 가설
│   │   └── config.ts
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── TickerBar.astro
│   │   │   ├── HeroCard.astro
│   │   │   ├── TrustCard.astro
│   │   │   ├── KpiStrip.astro
│   │   │   ├── MiniGraph.tsx       # React island
│   │   │   ├── ConvictionTimeline.tsx
│   │   │   ├── InsightCard.astro
│   │   │   ├── RecentPosts.astro
│   │   │   ├── ThesisBoard.astro
│   │   │   └── HoldingsList.astro
│   │   ├── post/
│   │   │   ├── CitationBadge.astro
│   │   │   ├── SourceSidebar.astro
│   │   │   └── ThesisBox.astro
│   │   └── layout/
│   ├── lib/
│   │   ├── market.ts           # 시세 fetch
│   │   ├── credibility.ts      # 신뢰도 점수 계산
│   │   ├── graph.ts            # 지식 그래프 빌드
│   │   ├── thesis.ts           # 가설 상태 관리
│   │   └── portfolio.ts        # 수익률, 샤프
│   ├── pages/
│   │   ├── index.astro
│   │   ├── posts/[slug].astro
│   │   ├── ticker/[symbol].astro
│   │   └── api/
│   │       └── quotes.json.ts
│   └── plugins/
│       └── remark-citations.ts # {{cite:id}} 변환
├── .github/workflows/
│   └── build.yml               # Docker 이미지 빌드·GHCR 푸시
└── scripts/
    └── new-post.ts

## 데이터 모델

### Post (frontmatter)
title, date, symbol, market, conviction (1-5), thesis, tags, youtubeUrl?, aiAssisted,
draft, sources[], thesisChecks[], entities{}

### Source
id, tier (1-4 또는 0=contra), type (filing/ir-call/report/news/anonymous),
title, date, url, excerpt

### Thesis
id, claim, deadline, status (pending/confirmed/falsified),
confirmedDate, evidenceUrl

### Recommendation
date, symbol, action (open/close/trim/add), price, weight,
postSlug, rationale

### ExternalEvent (new)
id, title, date, symbol?, market?, category, impact, summary, sourceUrl?, tags[]

## 핵심 빌드 파이프라인

1. Astro 빌드 시작
2. 모든 posts 스캔 → entities 추출 → graph.json 생성
3. 모든 sources 집계 → credibility scores 계산
4. 모든 theses 집계 → thesis-board 데이터 생성
5. 시세 데이터 페치 → 빌드 시 스냅샷 + 클라이언트 폴링
6. Node 어댑터로 서버 번들 생성 (`dist/server`, `dist/client`) 후 컨테이너/Kubernetes 배포

## 최근 흐름 오버랩 차트 아키텍처

### 컴포넌트 책임
- `DashboardTimeline.astro`
  - 단일 시간축(windowStart/windowEnd) 계산
  - 이벤트 점(분석/체크/포트/가설) 위치 계산 및 렌더링
  - 가격선(`pricePoints`) 오버레이 렌더링
- `index.astro`
  - active post 기준으로 `pricePoints` 조합
  - 우선순위: 외부 시세 API 결과 → 내부 폴백 포인트
- `SymbolTimelineChart.tsx`
  - 심볼 전용 상세 차트에서 외부 API fetch + 폴백 처리

### 데이터 플로우
1. `buildTimelineEvents(...)`로 이벤트 시계열 생성
2. `filterEventsToDashboardWindow(...)`로 대시보드 윈도우 정규화
3. `pricePoints`를 동일 윈도우에 매핑
4. 이벤트점/가격선을 같은 x축 비율로 렌더링

### 장애 대응
- Yahoo 응답 4xx/5xx/429 시 빈 UI 대신 폴백 시계열 사용
- 폴백 소스: `recommendations.price`
- 폴백 사용 여부는 UI 캡션으로 노출 가능

## events 컬렉션 아키텍처 (timeline 연계)

### 디렉토리/스키마
- 디렉토리: `src/content/events/`
- 스키마 등록: `src/content.config.ts` 의 `events` collection 추가
- 정렬 기준: `date` (ISO → Date coercion)

### 런타임 통합 포인트
- `src/lib/timeline.ts`
  - `TimelineEventKind`에 `external_event` 추가
  - `buildGlobalTimelineEvents(...)`에 events merge
  - `buildSymbolTimelineEvents(...)`에 symbol/global 정책 반영 merge
- `src/pages/index.astro` (메인 캘린더)
  - collection fetch에 `events` 포함
  - 라벨/색상/링크 처리 분기 추가
  - `/timeline`은 `/`로 리다이렉트
- `src/pages/today.astro`
  - `/`로 리다이렉트 (구 홈 북마크 유지)
- `src/components/dashboard/DashboardTimeline.astro`
  - event dot class에 `external_event` 스타일 추가

### 권장 함수 시그니처
- `buildGlobalTimelineEvents(posts, theses, recommendations, events)`
- `buildSymbolTimelineEvents(symbol, posts, theses, recommendations, events)`

### 색상/우선순위
- external_event 기본 색상: 인디고
- 우선순위(동일 일자): `external_event` < `post` < `recommendation` < `thesis_check` < `thesis`
- 대시보드 라벨/배지 노출은 `rankEventForDashboard()` 점수 함수로 결정
  - 입력: `TimelineEvent`, `now`, `context.symbol`
  - 사용처: `DashboardTimeline.astro`의 eventLabels/highImpactEvents

### 검증
- 단위 테스트 추가:
  - symbol 필터링
  - 정렬/병합 순서
  - global 이벤트 포함 규칙

## Current Snapshot (2026-05-08)

### Scope simplification
- `theses`, `recommendations` 기능은 제거됨.
- 타임라인 이벤트는 `post`, `external_event` 중심으로 운영.

### Event category
- `ExternalEvent.category`는 다음 집합으로 운영:
  - `macro | earnings | product | policy | supply-chain | news | other`

### Dashboard recent flow filter
- 위치: `DashboardTimeline` 그래프 하단 임베드.
- 필터:
  - 시장: `all | us | kr`
  - 카테고리: multi-select (URL query 다중 `eventCategory`)
- 규칙: 필터는 external event만 대상, post 마커는 유지.

### Hero card behavior
- `오늘의 분석` 제목 클릭 시 `/posts/[slug]` 이동.
- summary는 상시 표시.
- post 본문(body)은 카드 내 토글로 표시/숨김.

## 지인 Agent Layer (Self-hosted LLM)

브랜드 "내 곁에 지인"의 의인화. 범용 GPT 래퍼가 아니라 **ziin.ai 콘텐츠만** 근거로 답하는 대화 레이어.

### 포지셔닝
- signal-agent: 콘텐츠 생산 파이프라인 (스킬 → posts/events)
- 지인 Agent: 콘텐츠 소비·탐색 대화 레이어 (RAG + tools + persona)

### 3-tier 구조

```
Browser (widget / inline ask)
  → POST /api/chat (Astro SSR, signal-agent web pod)
      → Orchestrator (tool loop + guardrail)
          → Self-hosted vLLM (OpenAI-compatible /v1/chat/completions)
          → Tools (posts, events, credibility, quote — no hallucination path for facts)
```

- **Web pod**: API gateway, 키 보관, 가드레일, SSE 스트리밍. GPU 없음.
- **vLLM pod**: 추론 전용, `LLM_BASE_URL`로 연결. web과 분리.
- **Tool layer**: frontmatter·timeline·credibility — 결정적(deterministic) 데이터.

### 디렉토리

```
src/lib/agent/
  types.ts          # Chat request/response, tool types
  persona.ts        # System prompt (지인)
  guardrail.ts      # Buy/sell block, disclaimer
  tools.ts          # search_posts, get_post, get_timeline_events, explain_credibility, get_quote
  llm-client.ts     # OpenAI-compatible fetch → vLLM
  orchestrator.ts   # Tool loop (max 4 rounds) + fallback
src/pages/api/
  chat.ts           # POST /api/chat (JSON + SSE)
.ai/prompts/
  jiin-agent.md     # Persona SSOT
k8s/base/
  jiin-vllm-deployment.yaml
  jiin-vllm-service.yaml
```

### 환경 변수 (web pod)

| Variable | Description |
|---|---|
| `LLM_BASE_URL` | e.g. `http://jiin-vllm:8000/v1` |
| `LLM_MODEL` | Served model name |
| `LLM_API_KEY` | Optional |
| `AGENT_ENABLED` | `false` → tool-only fallback |

`LLM_BASE_URL` 미설정 시 LLM 없이 **deterministic fallback** (개발·장애 시).

### Tool-first RAG (MVP)

1. Structured tools (frontmatter search, timeline filter) — primary
2. BM25/keyword (search_posts) — MVP implemented
3. Vector embed index — v1.5 (build-time chunk + embed server)

환각 방지: **수치·날짜·등급은 tool JSON만** 인용. LLM은 서술·톤만 담당.

### 가드레일

- `guardrail.ts`: 매수/매도·수익보장 패턴 → 시나리오 재구성
- 모든 응답 footer: 투자 권유 아님 면책 (`AGENT_DISCLAIMER`)
- `robots.txt`: `/api/` Disallow (기존)

### UX

| Layer | Component | Hydration |
|---|---|---|
| Global | `JiinWidget.tsx` floating (우하단 FAB) | `client:idle`, `transition:persist` |
| In-post | `JiinAskButton.tsx` — slug pre-fill via meta + `jiin:open` event | `client:visible` |
| Proactive | "오늘의 지인 한마디" | HeroCard 연동 (v2, 미구현) |

페이지 컨텍스트: `Base.astro`의 `agentContext` → `<meta name="ziin-agent-slug|symbol">` → `readPageAgentContext()`.

### 성공 지표

- `grounded` rate (citations.length ≥ 1)
- citation click-through → post PV
- widget open rate, sessions with chat

### vLLM 배포 (K8s)

- Image: `vllm/vllm-openai:latest` (or pinned)
- GPU nodeSelector + `nvidia.com/gpu: 1`
- Service: `jiin-vllm:8000` (cluster-internal)
- Model via `LLM_MODEL` env (e.g. Qwen2.5-7B-Instruct or ziin-jiin SFT checkpoint)