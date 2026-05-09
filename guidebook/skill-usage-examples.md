# Skill Usage Examples

이 문서는 Cursor Agent **`post-from-sources`** 스킬을 실제로 호출할 때 바로 복사해 쓸 수 있는 예제를 모아둔 가이드입니다. 상세 규칙·스키마·워크플로는 레포 루트의 [`.cursor/skills/post-from-sources/SKILL.md`](../.cursor/skills/post-from-sources/SKILL.md)이 기준입니다.

## 1) `post-from-sources` 기본 사용

가장 일반적인 형태는 "출처 + 작성 조건"을 함께 주는 방식입니다.

예시 프롬프트:

```text
`post-from-sources` 스킬로 작성해줘.

topic: NVIDIA Blackwell 수요 점검
symbol: NVDA
market: NASDAQ
conviction: 4
tags: [NVIDIA, AI, 반도체, 데이터센터]

sources:
- id: src-1
  tier: 1
  type: filing
  title: NVIDIA Quarterly Results
  date: 2026-05-12
  url: https://investor.nvidia.com/financial-info/quarterly-results/default.aspx
  excerpt: 데이터센터 매출 모멘텀과 플랫폼 전환 진행 상황 언급

요청:
- src/content/posts/ 아래에 새 파일 생성
- 한국어, 전문가 톤, 분석적으로
- 리스크 섹션 포함
```

## 2) `post-from-sources` URL-only 모드

출처 URL만 있어도 초안을 만들 수 있습니다. 스킬이 `type` / `tier` / `date` 등을 추론합니다.

예시 프롬프트:

```text
`post-from-sources` 스킬로 URL-only 모드로 작성해줘.
urls:
- https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2026
- https://www.reuters.com/technology/artificial-intelligence/
- https://stock.pstatic.net/stock-research/company/66/20260507_company_796792000.pdf

요청:
- src/content/posts/ 아래에 새 파일 생성
- 한국어, 전문가 톤, 분석적으로
- 스니펫 노출형 구조(질문형 헤딩 + 즉답 + TL;DR + FAQ + 리스크 + 출처)
- 생성 후 assumptions, URL->type/tier/date 추론표 같이 보고
```

## 3) 기존 포스트 업데이트 요청

새 파일이 아니라 기존 파일을 보강할 때:

```text
`post-from-sources` 스킬로 아래 파일 업데이트해줘.
target: src/content/posts/2026-05-13-nvidia-blackwell-demand.md

요청:
- TL;DR 섹션 추가
- FAQ 3개 추가
- 기존 주장 중 근거 없는 문장 제거
- sources 메타데이터 누락값 보완
```

## 4) 주제어(topic-only) 모드

URL 없이 주제만 주면, 스킬이 관련 자료를 탐색한 뒤 초안을 작성합니다.

예시 프롬프트:

```text
`post-from-sources` 스킬로 topic-only 모드로 작성해줘.

topic: 2026년 AI 데이터센터 전력 병목이 반도체 수요에 미치는 영향

요청:
- src/content/posts/ 아래에 새 파일 생성
- 한국어, 전문가 톤, 분석적으로
- 링크는 본문에 과도하게 넣지 말고 출처 섹션 중심으로 정리
- YouTube가 출처에 포함되면 영상 핵심 내용까지 반영
- 생성 후 선정 소스 shortlist와 선정 이유, assumptions 같이 보고
```

## 5) Topic + 앵커 URL (꼭 넣을 링크가 있을 때)

**topic research가 중심**이고, 그 안에서 **반드시 인용·포함할 URL**이 있을 때 topic과 함께 넘깁니다. 앵커 URL은 `sources`에 빠지지 않고 본문 근거에도 쓰이지만, 결론 가중치는 전체 근거 품질 기준으로 판단합니다.

예시 프롬프트:

```text
`post-from-sources` 스킬로 작성해줘. topic + 앵커 URL 모드.

topic: 국내 AI 데이터센터 특별법 이행 리스크

anchor_urls (반드시 sources에 포함하고 본문에서 인용):
- https://www.law.go.kr/...
- https://example.go.kr/policy-notice/...

요청:
- topic 리서치를 중심으로 진행하고, 위 URL은 필수 참조로 포함
- 앵커와 다른 1차 출처가 충돌하면 본문에서 균형 있게 정리
- 완료 후: 앵커 URL별 할당된 src-n, 본문 인용 여부 보고
```

트리거 예시 문구: `이 URL 꼭`, `반드시 참고`, `must read`, `아래 링크 위주로`, topic과 URL을 한 메시지에 같이 붙여 넣기.

## 6) 타임라인 이벤트(`src/content/events`) 동반 기록

글에서 **날짜가 분명한 촉매**(실적 일정, FOMC/CPI, 규제 마일스톤, 공장 가동 등)를 전제로 하면, 타임라인·대시보드 「최근 흐름」에 쓰이도록 **`src/content/events/`** 에도 추가·수정을 요청할 수 있습니다. 날짜를 지어내지 말 것.

예시 프롬프트:

```text
`post-from-sources` 스킬로 새 글 작성하고, 필요하면 events도 같이 처리해줘.

topic: ...
symbol: ...
market: ...

요청:
- src/content/posts/ 신규 초안
- 글에서 다루는 확정/예정 일정 중 시장 의미가 큰 것은 src/content/events/ 에 YAML 스키마 맞게 추가
- 이미 비슷한 이벤트 파일이 있으면 중복 생성 말고 업데이트
- 생성/수정한 event 파일 경로와 이유를 마지막에 보고
```

이벤트 frontmatter 필드 요약은 스킬의 Schema Guardrails와 `src/content.config.ts`의 `events` 컬렉션을 따릅니다 (`id`, `title`, `date`, `summary`, `category`, `impact`, 선택적 `symbol` / `market` / `scope`, 등).

## 7) 출력 품질 높이는 요청 템플릿

아래 항목을 같이 주면 결과 품질이 좋아집니다.

- 핵심 질문 1개: 글이 답해야 할 질문
- 금지사항: 과장/예측/투자권유 톤 금지 등
- 필수 섹션: TL;DR, 리스크, 체크리스트
- 길이 제약: 700자 내외, 혹은 5개 불릿 중심
- 확인 요청: assumptions 표, source 추론표, 누락 데이터 목록
- (topic + 앵커 시) 앵커 목록, 본문 인용 여부, 그리고 결론이 전체 근거 기준으로 도출됐는지
- (이벤트 동반 시) 기록할 촉매 날짜·종류를 사용자가 직접 적어 주기

## 8) 자주 발생하는 실수

- URL만 주고 톤/구조 요청을 생략해서 결과물이 일반 기사체가 되는 경우
- 출처 날짜가 불명확한데도 검증 없이 단정형 문장을 쓰는 경우
- `sources[*].type` / `tier`를 스키마 범위 밖 값으로 지정하는 경우
- `summary` 대신 다른 키(`thesis`)를 써서 포스트 스키마 불일치가 나는 경우
- topic + 앵커에서 앵커만 과대반영하고, 주제 리서치를 충분히 확장하지 않는 경우
- `src/content/events/`에 잘못된 `category`/`impact`/`market` enum을 쓰는 경우 (스키마는 `src/content.config.ts` 참고)

## 9) 권장 마무리 요청 문구

작업 끝에 아래를 붙이면 검토가 쉬워집니다.

```text
완료 후 아래를 보고해줘:
1) 생성/수정한 포스트 파일 경로
2) assumptions 목록
3) URL-only이면: URL별 type/tier/date 추론 근거
4) topic-only이면: 선정 소스 shortlist와 선정 이유
5) topic + 앵커이면: 앵커 URL 순서, 각각 매긴 src-n, 본문 인용 여부
6) events를 건드렸으면: 생성/수정한 event 파일 경로와 요약
```
