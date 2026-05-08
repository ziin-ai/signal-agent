# SPEC.md — ziin.ai Project Context

## 당신의 역할
시니어 풀스택 엔지니어. 금융 데이터 시각화와 Astro SSR(Node)
아키텍처에 능숙. 작업할 때 다음을 항상 확인:
1. .ai/PRD.md — 무엇을 만드는가
2. .ai/ARCHITECTURE.md — 어떻게 만드는가
3. .ai/style-guide.md — 어떤 톤으로 만드는가

## 절대 원칙

### 1. Frontmatter는 진실의 원천
모든 메타데이터는 마크다운 frontmatter에 있다. 별도 DB나 
외부 CMS를 도입하지 마라. JSON 파일로 임시 저장하지도 마라. 
파일이 곧 데이터다.

### 2. 신뢰도는 시스템적으로 강제
출처 없는 주장을 생성하지 마라. credibility score 계산 로직을 
변경할 때는 반드시 .ai/PRD.md의 "Pillar A"를 참조해 정합성 확인.

### 3. AI 사용은 투명하게
ai-assisted 글은 frontmatter에 명시. UI에서 항상 배지로 노출.
숨기는 것은 신뢰 침해.

### 4. 한국어/영어 분리
- 사용자 대면 텍스트: 한국어
- 코드 식별자, 주석, 커밋 메시지: 영어
- 변수명에 한국어 로마자 표기 금지 (예: jongmok ❌, symbol ✅)

### 5. 코드 스타일
- TypeScript strict mode
- 파일명: kebab-case (post-card.astro)
- 컴포넌트명: PascalCase (PostCard)
- 함수: camelCase, 의미 있는 동사 시작 (calculateScore, fetchQuotes)
- 매직 넘버 금지 — 상수로 분리

### 6. 컴포넌트 분리 원칙
- Astro 컴포넌트가 기본
- 인터랙션이 필요할 때만 React island
- React 컴포넌트는 client:visible 또는 client:idle
- 그래프, 차트, 폼 = React / 나머지 = Astro

## 작업 시작 전 체크리스트
□ 어떤 컴포넌트를 만드는지 ARCHITECTURE.md에서 확인
□ 관련 데이터 모델 확인 (frontmatter 스키마)
□ 디자인 토큰 사용 (직접 색상 hardcode 금지)
□ 다크 모드 동작 확인
□ 모바일 반응형 확인

## 작업 후 체크리스트
□ TypeScript 에러 없음
□ 빌드 성공 (pnpm build)
□ Lighthouse 성능 > 95
□ 필요 시 단위 테스트 추가

---

## 최근 흐름 v2 기획 (오버랩 차트 스타일)

### 목표
- `최근 흐름` 카드 안에서 **가격 흐름(선)** 과 **이벤트(점)** 를 같은 시간축에 겹쳐 보여준다.
- 사용자는 “시세가 왜 움직였는지”를 한 화면에서 즉시 읽을 수 있어야 한다.
- 종목 페이지(`/timeline?symbol=...`)와 대시보드(`index`)의 시각 언어를 일관되게 유지한다.

### 정보 구조
- 상단 텍스트: Today 기준 윈도우(과거 30일 + 미래 60일) + 맥락 제목.
- 필터 칩: `₩ 가격`, `% 변화`, `vs KOSPI` (향후 인터랙션 확장 전제).
- 핵심 수치(한 줄): 매수가, 목표가, 현재가.
- 중앙 메인 패널: 가격선 + 이벤트점 + Today 세로선 + 우측 축.
- 하단 인사이트 스트립: 매수가 대비, 지수 대비, 목표까지, 다음 검증 D-day, 인사이트 문장.

### 시각 규칙 (Color/Mark)
- 가격선: 에메랄드 계열 단일 선, 미래 구간은 점선(또는 alpha 감소).
- 이벤트 점:
  - 분석: 파랑
  - 체크: 호박
  - 포트: 보라
  - 가설: 회색(기본), 확정=초록, 반증=빨강
- Today 기준선: 브랜드 포인트 컬러 + `TODAY` 라벨.
- 이벤트 라벨은 과밀 시 모두 노출하지 않고 중요도 순으로 샘플링 가능.

### 데이터 규칙
- 시간축 기본: `windowStart ~ windowEnd` (대시보드 window와 동일).
- 가격 데이터 우선순위:
  1) 외부 시세 API 일봉
  2) 폴백: `recommendations.price` 시계열
- 이벤트 데이터: `TimelineEvent` 단일 스키마를 재사용한다.
- 모든 날짜는 렌더 시점에 `Date`로 변환하며 정렬 기준은 UTC timestamp.

### 인터랙션 규칙
- 이벤트 점 hover/click 시 툴팁(날짜, 타입, 제목).
- 이벤트 클릭 시 내부 링크 우선 이동, 외부 링크는 새 탭.
- 필터 칩은 시각 모드만 바꾸고 원본 이벤트 집합은 보존한다.
- 마우스/터치 모두 동일 동작(hover 없는 환경은 tap 우선).

### 반응형 규칙
- 모바일에서는 라벨 밀도를 줄이고 점/선 대비를 키운다.
- x축 텍스트는 좌/우 앵커만 유지, 중간 눈금은 생략 가능.
- 인사이트 카드 5개는 가로 스크롤 또는 2줄 그리드 허용.

### 비기능 요구사항
- 차트/타임라인 영역은 `client:idle` 기준으로 하이드레이션.
- 외부 시세 API 실패 시 빈 화면을 금지하고 폴백 라인을 반드시 표시.
- 다크 모드에서 기준선/점 대비비(contrast) 확보.

### 완료 기준 (DoD)
- [ ] 최근 흐름 카드에 가격선+이벤트점 오버랩 렌더링
- [ ] Today 기준선 및 핵심 수치 노출
- [ ] 외부 API 실패 시 폴백 라인 노출
- [ ] `/timeline`과 이벤트 컬러 규칙 일치
- [ ] 빌드 통과 및 시각 회귀 체크(라이트/다크, 모바일/데스크톱)

---

## events 컬렉션 기획 (content/events)

### 목적
- `posts/theses/recommendations`에 없는 **외부 이벤트**(실적발표, FOMC, 규제, 제품출시, 배당락 등)를 별도 컬렉션으로 관리한다.
- timeline에서 “시장 이벤트”와 “우리 행동(분석/포트)”을 같은 축에서 읽을 수 있게 한다.

### 파일 위치
- `src/content/events/*.md`
- Frontmatter 기반 SSOT 유지. DB/CMS 추가 금지.

### 데이터 모델 (frontmatter)
- `id: string` — 이벤트 고유 ID
- `title: string` — 노출 제목
- `date: date` — 이벤트 발생일
- `symbol?: string` — 특정 종목 이벤트 (없으면 매크로 이벤트)
- `market?: "KRX" | "NASDAQ" | "NYSE" | "AMEX" | "OTC" | "GLOBAL"`
- `category: "macro" | "earnings" | "product" | "policy" | "supply-chain" | "news" | "other"`
- `impact: "low" | "mid" | "high"`
- `summary: string`
- `sourceUrl?: string`
- `tags: string[]`

### Timeline 연계 규칙
- 전역 타임라인:
  - `events`를 기존 이벤트와 merge하여 최신순 정렬.
- 종목 타임라인(`/timeline?symbol=...`):
  - `symbol` 일치 이벤트 + `symbol` 없는 `GLOBAL` 이벤트(선택 정책)를 함께 표시.
- 대시보드 `최근 흐름`:
  - active post의 symbol 이벤트를 점으로 표시(색상은 시장 이벤트 전용 컬러 사용).
  - 메타데이터 점수화(`impact/category/symbol/date`) 기반으로 라벨/상단 배지 우선 노출.

### UI/색상 규칙
- event kind 추가: `external_event` (가칭).
- Dot/Badge 기본 컬러: 인디고 계열 (기존 분석/체크/포트/가설과 시각 분리).
- `impact=high`는 점 크기 1단계 확대 또는 테두리 강조.

### 대시보드 노출 점수(권장)
- `score = impactWeight + categoryWeight + symbolWeight + recencyWeight`
- impact: high 60 / mid 30 / low 10
- category: earnings/product 8, macro 6, policy 4, 기타 2
- symbol: exact +30, global +10, mismatch -10
- recency: Today와 가까울수록 가산(최대 +20)

### 품질 규칙
- `sourceUrl` 없는 이벤트는 `impact=high` 사용 금지.
- 같은 `id` 중복 금지.
- 날짜 파싱 실패 시 빌드 에러.

### 단계별 구현 계획
- 1단계: 컬렉션/스키마 추가 + timeline merge + 기본 렌더.
- 2단계: symbol/global 노출 정책 고도화 + 필터(카테고리/영향도).
- 3단계: 이벤트-분석글 자동 연결 제안(태그/심볼 기반).

---

## 운영 반영 기록 (2026-05-08)

### 1) 이벤트 카테고리 확장
- `events.category`에 `news` 추가.
- 필터 라벨에서 `news`는 `뉴스`로 노출.

### 2) 대시보드 최근 흐름 필터 UX
- 위치: `최근 흐름` 카드 내부(그래프 하단 임베드).
- 시장 필터: `전체/미국/한국`.
- 카테고리 필터: **multi-select(토글형)**.
- 필터 적용 범위: external event만 대상, post 마커는 유지.

### 3) 오늘의 분석 카드 UX
- 제목 클릭 시 상세 글(`/posts/[slug]`) 이동.
- summary는 상시 노출.
- post 본문(body)은 `상세 내용 보이기/숨기기` 토글로 제어.