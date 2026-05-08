# Skill Usage Examples

이 문서는 Cursor Agent Skill을 실제로 호출할 때 바로 복사해 쓸 수 있는 예제를 모아둔 가이드입니다.

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

출처 URL만 있어도 초안을 만들 수 있습니다. 이 경우 스킬이 `type/tier/date`를 추론합니다.

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

새 파일이 아니라 기존 파일을 보강하고 싶을 때:

```text
`post-from-sources` 스킬로 아래 파일 업데이트해줘.
target: src/content/posts/2026-05-13-nvidia-blackwell-demand.md

요청:
- TL;DR 섹션 추가
- FAQ 3개 추가
- 기존 주장 중 근거 없는 문장 제거
- sources 메타데이터 누락값 보완
```

## 4) `post-from-sources` 주제어(topic-only) 모드

URL 없이 주제어만 전달하면, 스킬이 관련 자료를 먼저 탐색한 뒤 초안을 작성합니다.

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

## 5) 출력 품질 높이는 요청 템플릿

아래 항목을 같이 주면 결과 품질이 좋아집니다.

- 핵심 질문 1개: 글이 답해야 할 질문
- 금지사항: 과장/예측/투자권유 톤 금지 등
- 필수 섹션: TL;DR, 리스크, 체크리스트
- 길이 제약: 700자 내외, 혹은 5개 불릿 중심
- 확인 요청: assumptions 표, source 추론표, 누락 데이터 목록

## 6) 자주 발생하는 실수

- URL만 주고 톤/구조 요청을 생략해서 결과물이 일반 기사체가 되는 경우
- 출처 날짜가 불명확한데도 검증 없이 단정형 문장을 쓰는 경우
- `sources[*].type`/`tier`를 스키마 범위 밖 값으로 지정하는 경우
- `summary` 대신 다른 키(`thesis`)를 써서 스키마 불일치가 나는 경우

## 7) 권장 마무리 요청 문구

작업 끝에 아래 문장을 붙이면 검토가 쉬워집니다.

```text
완료 후 아래 3가지를 반드시 보고해줘:
1) 생성/수정 파일 경로
2) assumptions 목록
3) URL별 type/tier/date 추론 근거
```

