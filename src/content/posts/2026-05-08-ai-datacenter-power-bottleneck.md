---
title: "2026 AI 데이터센터 전력 병목: 어디가 막혔고 누가 푸는가"
date: 2026-05-08
symbol: "THEME"
market: "KRX"
conviction: 4
summary: "AI 데이터센터의 진짜 병목은 GPU나 부지가 아니라 송전망·변압기·HVDC 케이블·가스터빈으로 이어지는 전력 공급사슬 전체로 옮겨갔다. 한국은 수도권 포화와 비수도권 인프라 부족이라는 이중 제약 위에 있어 정책보다 실집행 속도가 더 중요하며, 글로벌 기준으로도 단기 수혜는 변압기·HVDC·가스터빈 등 공급 부족 깊이가 큰 영역에 집중될 가능성이 높다."
tags:
  - "AI"
  - "데이터센터"
  - "전력 인프라"
  - "HVDC"
aiAssisted: true
draft: false
sources:
  - id: "src-iea-key"
    tier: 1
    type: "report"
    title: "IEA, Key Questions on Energy and AI – Executive summary"
    date: 2026-04-22
    url: "https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary"
    excerpt: "데이터센터 전력 수요는 2025년 485TWh에서 2030년 약 950TWh로 두 배 가까이 증가할 전망이며, 변압기·전력기기·가스터빈 공급망 병목이 단기 상방을 제약한다."
  - id: "src-iea-news"
    tier: 1
    type: "news"
    title: "IEA, Data centre electricity use surged in 2025, even with tightening bottlenecks"
    date: 2026-04-22
    url: "https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions"
    excerpt: "글로벌 데이터센터 전력 소비가 2025년 17% 증가했고 AI 전용 데이터센터는 50% 급증했으며, 빅테크 자본지출은 2026년 다시 75% 추가 증가가 예상된다."
  - id: "src-dcf-grid"
    tier: 2
    type: "news"
    title: "Transmission at the Breaking Point: Why the Grid Is Becoming the Defining Constraint for AI Data Centers"
    date: 2026-04-30
    url: "https://www.datacenterfrontier.com/energy/article/55354992/transmission-at-the-breaking-point-why-the-grid-is-becoming-the-defining-constraint-for-ai-data-centers"
    excerpt: "구글이 송전망 연결 지연을 데이터센터 확장의 1순위 위협으로 지목했고, 일부 유틸리티는 단순 검토에만 12년을 요구하고 있다."
  - id: "src-power-transformer"
    tier: 2
    type: "news"
    title: "Transformers in 2026: Shortage, Scramble, or Self-Inflicted Crisis?"
    date: 2026-04-15
    url: "https://www.powermag.com/transformers-in-2026-shortage-scramble-or-self-inflicted-crisis/"
    excerpt: "변압기 수요는 2019년 대비 119% 증가했고 미국 변압기 수급은 약 30% 부족 상태이며, 변전소용 변압기 리드타임은 160주 이상으로 연장됐다."
  - id: "src-yna-bottleneck"
    tier: 2
    type: "news"
    title: "[AI3강] AI 경쟁 병목은 데이터센터…전력 인프라가 성패"
    date: 2026-01-04
    url: "https://www.yna.co.kr/view/AKR20260104038600017?input=1195m"
    excerpt: "국내 데이터센터의 60~70%가 수도권에 집중돼 있고, 수도권 송배전망 한계로 신규 하이퍼스케일 입지가 사실상 봉쇄돼 일본으로 옮겨가는 사례가 늘고 있다."
  - id: "src-econoreview-power"
    tier: 2
    type: "report"
    title: "AI 전력 대전 본격화…효성 선두 속 LS일렉·HD현대일렉 '맹추격'"
    date: 2026-04-28
    url: "https://slv.econovill.com/news/articleView.html?idxno=737769"
    excerpt: "북미 데이터센터향 변압기·HVDC·배전반 수요 폭증으로 효성중공업·LS일렉트릭·HD현대일렉트릭이 수주잔고 기준 동반 상향되는 흐름이다."
  - id: "src-yt-cable"
    tier: 2
    type: "youtube"
    title: "전기가 없어서 AI 멈춘다. 전 세계 독점한 한국 전선기업"
    date: 2026-04-10
    url: "https://www.youtube.com/watch?v=R4UHVI3NyvU"
    excerpt: "초고압 해저 HVDC 시장은 Prysmian·NKT·Nexans·LS전선 4사가 85%를 점유하고 있으며, 미국 FCC의 중국산 케이블 차단 이후 한국 전선업의 수주잔고가 사상 최대치로 점프했다."
entities:
  company:
    - "두산에너빌리티"
    - "효성중공업"
    - "LS일렉트릭"
    - "LS전선"
    - "대한전선"
    - "HD현대일렉트릭"
  product:
    - "HVDC 케이블"
    - "초고압 변압기"
    - "가스터빈"
    - "SMR"
  theme:
    - "AI 인프라"
    - "전력 슈퍼사이클"
    - "송전망 제약"
---

## 한 줄 결론

2026년 AI 인프라의 진짜 결정 변수는 GPU 물량이 아니라 **전기를 칩까지 가져다주는 공급사슬**이다.  
즉, 송전망·변압기·HVDC 케이블·가스터빈처럼 리드타임이 긴 자산이 부족할수록, AI 투자 사이클의 실제 집행 속도와 실적 가시성이 갈린다.

## 결론 요약 (TL;DR)

- 글로벌 데이터센터 전력 수요는 2025년 485TWh → 2030년 약 950TWh로 두 배 가까이 증가하지만, 단기 상방은 송전·기기 공급망에 의해 막혀 있다.
- 한국은 수도권 포화와 비수도권 인프라 부족이라는 이중 제약 위에 있어 특별법 통과만으로 병목이 풀리지 않는다.
- 단기 수혜는 공급 부족 깊이가 가장 큰 변압기·HVDC·가스터빈에서 가장 선명하게 나타나는 구조다.

## 병목은 어디서 일어나고 있나

병목은 한 지점이 아니라 **공급사슬 4단**에서 동시에 발생하고 있다. 이 구조를 분리해야 산업별 수혜 강도가 보인다.

| 단계 | 무엇이 막혔나 | 현재 신호 |
|---|---|---|
| 발전 | AI는 변동성이 큰 부하라 베이스로드 + 빠른 기동 전원이 동시에 필요 | 가스터빈 신규 발주 2025년 +70%, SMR은 2030년대 초 상업 운전 목표 |
| 송전 | 신규 송전선·변전소 부족, 인터커넥션 대기열 폭증 | 미국 일부 유틸리티 4~10년, 일부는 12년 검토 견적 제시 |
| 기자재 | 초고압 변압기·스위치기어·HVDC 케이블 공급 부족 | 변전소 변압기 리드타임 140주(2023) → 160주+(2026) |
| 입지·연계 | 전력 연결 가능 부지의 사실상 고갈 | 미국 데이터센터 공실률 1%대 사상 최저 |

핵심은 4단 모두에서 **자본 투입이 아니라 시간이 부족**하다는 점이다. CAPEX는 더 들어와도 변압기 공장과 송전선 인허가는 그 속도에 맞춰 늘지 않는다.

## 글로벌 vs 한국, 무엇이 결정적으로 다른가

글로벌 시장(특히 미국)의 병목은 "송전 + 기자재" 중심이고, 한국의 병목은 "수도권 집중 + 비수도권 인프라 미비"가 추가로 얹혀 있다.

- 미국은 텍사스·미드웨스트 중심으로 송전망 연결 대기와 변압기 부족이 핵심 문제다. 발전 측은 가스 + 일부 SMR + 배터리 조합으로 상대적으로 빠르게 대응 가능하다.
- 한국은 신청 전력의 30% 이상이 미공급 위험 구간이며, 수도권 신규 신청은 사실상 거의 통과하지 못하는 구조다. 비수도권으로 이동해도 송전, 인력, 통신, 운영 생태계가 동시에 따라가야 가동률이 안정된다.
- 결과적으로 정책(특별법)은 인허가 시간을 줄여줄 뿐, 전력 자체를 늘리지는 못한다. **법 통과 ≠ 가동 시작**이라는 점을 분리해 봐야 한다.

## 누가 푸는가: 산업 매핑과 수혜 깊이

수혜 강도는 단순히 "AI 노출도"가 아니라 **공급 부족 깊이 × 진입장벽 × 가격 전가력**으로 봐야 정확하다.

1. **HVDC·해저 케이블**  
   초고압 해저 HVDC는 전 세계 4개사가 85%를 점유하는 구조이고, 그중 한 자리를 LS전선이 차지한다. 525kV 직류 케이블은 VCV(수직 압출) 인프라와 전용 포설선이 필요해 신규 진입이 사실상 불가능에 가깝다. 미국 FCC의 중국산 차단 이후 단가·수주잔고가 동시에 상향되며, 대한전선도 시공 역량 확대로 직접 경쟁권에 진입했다. 다만 사이클 후반에는 수주 점유율 분산과 단가 정상화 가능성을 함께 봐야 한다.

2. **초고압 변압기 / 배전반 / 스위치기어**  
   리드타임이 140주에서 160주 이상으로 더 늘어났고, 데이터센터가 미국 전기기기 수요의 약 40%를 잠식하는 구조다. 효성중공업·LS일렉트릭·HD현대일렉트릭이 북미 수주잔고에서 동반 가시성이 올라간다. 가격 전가력이 높아 영업이익률 레버리지가 큰 구간이다.

3. **가스터빈 / 발전 솔루션**  
   온사이트 가스 발전이 송전망 우회 수단으로 떠올랐고, 2025년 글로벌 가스터빈 신규 발주가 70% 가까이 급증했다. 두산에너빌리티는 H-class 380MW 자체 모델을 미국 빅테크향으로 다수 공급하며 글로벌 상위 4사 외 진입이 어려운 시장에서 신규 수주 채널을 확보했다. 다만 IEA 분석대로 온사이트 가스가 절대적 솔루션이 아니라 보조 채널이라는 점은 유의가 필요하다.

4. **SMR / 차세대 발전**  
   2030년대 초 상업 운전이 베이스 시나리오라 단기 실적 모멘텀과는 거리가 있다. 정책 발표·표준 인가·실증 부지 선정이 모멘텀 트리거이지만, 케파 기여 구간에 들어오기 전까지는 밸류에이션 위주의 흐름으로 보는 편이 안전하다.

5. **냉각·전력 관리·UPS / 케이블 부속**  
   AI 랙당 전력 밀도가 2020년 대비 11배, 2027년에 추가 4배 확대 전망이다. 액침/리퀴드 쿨링, 고밀도 UPS, 고전압 DC 분배 같은 영역은 사이클 길이가 길지만 외형 폭발성은 변압기·HVDC 대비 낮은 편이다.

요약하면 **공급 부족이 가장 깊은 영역은 HVDC와 변압기, 모멘텀이 가장 빠른 영역은 가스터빈, 사이클이 가장 긴 영역은 SMR과 냉각/UPS**다.

## 무엇이 이 그림을 깰 수 있나

- AI 자본지출 감속: IEA 추정상 빅테크 CAPEX의 +75%(2026) 가정이 둔화되면 변압기·HVDC 단가 상승 폭이 빠르게 정상화될 수 있다.
- 인플레이션·금리 재상승: 인프라 자산은 자본 비용에 민감하다. 자금 조달 환경 악화는 신규 프로젝트 일정 자체를 뒤로 민다.
- 정책·규제 변수: 미국 일부 주에서 데이터센터 세제 혜택 축소 움직임이 있고, 가정용 전기료 전가 논쟁이 불거지면 입지 정책이 빠르게 보수화될 수 있다.
- 한국 비수도권 실집행 지연: 인허가가 빨라져도 전력 연계, 인력, 운영 생태계가 동반되지 않으면 가동률 안정화가 늦어지며 정책 기대가 선반영된 종목군의 변동성이 커질 수 있다.
- 대체 기술의 성숙: CPO, 고밀도 DC 분배, 고효율 냉각이 빨라질수록 단위 전력당 연산 효율이 올라가 일부 병목 강도가 완화될 수 있다.

## 체크리스트

- 변압기·HVDC 케이블 리드타임 추이 (분기별 16개월 이상 유지 여부)
- 미국 인터커넥션 큐 해소 속도와 송전선 신규 인가 건수
- 한국 비수도권 데이터센터 착공 → 전력 연계 시점 데이터
- 빅테크 분기 CAPEX 가이던스의 상·하향 방향
- 두산에너빌리티 가스터빈 추가 수주 / xAI 외 신규 고객 확보 여부
- LS전선·대한전선 해저 HVDC 신규 수주 단가 및 점유율 변화
- SMR 표준 인가 일정과 실증 부지 선정 결과

## 자주 묻는 질문 (FAQ)

**Q1. AI 데이터센터 전력 부족은 일시적 현상인가 구조적 변화인가?**  
A. 구조적이다. 데이터센터 수요가 미국 전체 전력 수요 증가의 약 절반을 차지하는 흐름이며, 2030년 가까이까지 두 배 가까운 수요 증가가 IEA 베이스라인이다.

**Q2. 한국 특별법으로 병목이 풀리는가?**  
A. 인허가 마찰은 줄어들지만 송전·전력기기·비수도권 인프라 한계는 별개의 문제다. 법 통과와 실가동 사이의 시차를 분리해 점검해야 한다.

**Q3. 수혜 강도는 어디가 가장 큰가?**  
A. 공급 부족 깊이 기준으로 HVDC·초고압 변압기, 모멘텀 기준으로 가스터빈, 장기 옵션 기준으로 SMR 순서로 정리하는 편이 합리적이다.

## 출처

- IEA, "Key Questions on Energy and AI – Executive summary" (2026-04-22)  
  https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary
- IEA News, "Data centre electricity use surged in 2025, even with tightening bottlenecks" (2026-04-22)  
  https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions
- Data Center Frontier, "Transmission at the Breaking Point: Why the Grid Is Becoming the Defining Constraint for AI Data Centers" (2026-04-30)  
  https://www.datacenterfrontier.com/energy/article/55354992/transmission-at-the-breaking-point-why-the-grid-is-becoming-the-defining-constraint-for-ai-data-centers
- POWER Magazine, "Transformers in 2026: Shortage, Scramble, or Self-Inflicted Crisis?" (2026-04-15)  
  https://www.powermag.com/transformers-in-2026-shortage-scramble-or-self-inflicted-crisis/
- 연합뉴스, "[AI3강] ② AI 경쟁 병목은 데이터센터…전력 인프라가 성패" (2026-01-04)  
  https://www.yna.co.kr/view/AKR20260104038600017?input=1195m
- 이코노믹리뷰, "AI 전력 대전 본격화…효성 선두 속 LS일렉·HD현대일렉 '맹추격'" (2026-04-28)  
  https://slv.econovill.com/news/articleView.html?idxno=737769
- 간단경제한스푼(YouTube), "전기가 없어서 AI 멈춘다. 전 세계 독점한 한국 전선기업" (2026-04-10)  
  https://www.youtube.com/watch?v=R4UHVI3NyvU
