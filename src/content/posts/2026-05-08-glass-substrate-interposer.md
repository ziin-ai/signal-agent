---
title: "유리기판과 인터포저: AI 패키징 병목의 다음 전환점"
date: 2026-05-08
symbol: "TBD"
market: "KRX"
conviction: 4
summary: "유리기판은 대면적·고집적 패키지에서 평탄도와 열안정성 이점을 통해 유기기판의 한계를 보완할 가능성이 높다. 다만 인터포저 생태계는 이미 실리콘·RDL 기반으로 빠르게 고도화되고 있어, 향후 2~3년은 '유리기판의 기술적 우위'보다 '수율·표준·CAPEX 회수속도'가 채택 속도를 결정할 확률이 높다."
tags:
  - "유리기판"
  - "인터포저"
  - "첨단패키징"
  - "AI반도체"
aiAssisted: true
draft: false
sources:
  - id: "src-1"
    tier: 1
    type: "news"
    title: "Intel Unveils Industry-Leading Glass Substrates to Meet Demand for More Powerful Compute"
    date: 2023-09-18
    url: "https://newsroom.intel.com/artificial-intelligence/intel-unveils-industry-leading-glass-substrates"
    excerpt: "인텔은 유리기판이 고온 공정, 평탄도, 패턴 왜곡 측면에서 유기기판 대비 우위를 가지며, 10배 수준의 인터커넥트 밀도 잠재력을 제시했다."
  - id: "src-2"
    tier: 1
    type: "report"
    title: "CoWoS - Taiwan Semiconductor Manufacturing Company"
    date: 2026-05-08
    url: "https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm"
    excerpt: "TSMC는 CoWoS-S/R/L 포트폴리오를 통해 실리콘 인터포저와 RDL 인터포저 기반의 2.5D 통합을 확장하며 HBM 결합 수요를 흡수하고 있다."
  - id: "src-3"
    tier: 1
    type: "news"
    title: "Absolics Breaks Ground On Planned $600M Investment"
    date: 2022-11-01
    url: "https://eng.sk.com/news/absolics-breaks-ground-on-planned-600-million-manufacturing-site-in-georgia-for-breakthrough-semiconductor-material"
    excerpt: "SKC 자회사 앱솔릭스는 유리기판 대량생산을 목표로 조지아 설비를 구축하며 단계적 증설 계획을 제시했다."
  - id: "src-4"
    tier: 2
    type: "news"
    title: "Samsung, SK bet big on glass substrates for AI chips"
    date: 2024-07-08
    url: "https://m.koreaherald.com/article/3430192"
    excerpt: "국내 대기업들이 유리기판을 차세대 패키징 핵심으로 보고 파일럿-양산 전환 시점을 앞당기고 있다는 점을 보도했다."
  - id: "src-5"
    tier: 2
    type: "report"
    title: "The Race To Glass Substrates"
    date: 2024-05-29
    url: "https://semiengineering.com/the-race-to-glass-substrates"
    excerpt: "유리기판의 물성 이점은 분명하지만, 취성·핸들링·표준화·전용라인 투자비가 상용화 속도를 제약할 수 있음을 지적한다."
entities:
  company:
    - "Intel"
    - "TSMC"
    - "SKC"
    - "Absolics"
    - "Samsung Electro-Mechanics"
  product:
    - "Glass Substrate"
    - "Interposer"
    - "CoWoS"
    - "HBM Package"
  theme:
    - "2.5D 패키징"
    - "AI 인프라"
    - "패키징 수율"
    - "기판 전환"
---

## 핵심 요약

- 유리기판은 고집적·대면적 패키지에서 평탄도, 열안정성, 저왜곡 특성으로 미세배선 한계 구간을 넓히는 후보 기술이다.
- 인터포저는 이미 실리콘/유기-RDL 기반으로 상용 생태계가 빠르게 확장 중이며, 현재 AI 가속기 출하의 주류는 기존 인터포저 체계에서 소화되고 있다.
- 따라서 중기 판단 포인트는 "기술 우위의 존재"가 아니라 "양산 수율, 표준화, 고객 인증, 원가 곡선"이다.

## 왜 유리기판과 인터포저를 같이 봐야 하나

AI 패키징의 본질은 연산칩 하나의 성능이 아니라, 메모리(HBM)-로직-전력 전달을 얼마나 큰 패키지 안에서 안정적으로 연결하느냐에 있다.  
인터포저는 이 연결 구조를 실현하는 현재의 핵심 레이어이고, 유리기판은 그 레이어가 커지고 미세화될 때 발생하는 뒤틀림·신호손실·열 스트레스를 줄여줄 대체 기반으로 주목받는다.

즉, 인터포저는 "지금 돌아가는 생산 체계"이고, 유리기판은 "다음 스케일 구간을 위한 재료 전환 옵션"에 가깝다. 이 둘은 경쟁 관계라기보다, 수요 급증 국면에서 공존하며 역할을 재배치할 가능성이 높다.

## 구조적 수혜 구간과 채택 메커니즘

1. **대면적 패키지 수요 확대**
   - AI/HPC에서 칩렛 수와 HBM 적층 수가 늘수록 패키지 면적과 배선 복잡도가 커진다.
   - 이때 평탄도와 열안정성이 높은 재료는 미세 배선 정합과 수율 안정에 유리하다.

2. **인터포저 다변화의 가속**
   - CoWoS 계열처럼 실리콘 인터포저와 RDL 인터포저를 병행하는 포트폴리오가 이미 확장되고 있다.
   - 유리기판은 이 다변화 흐름에서 "초대면적·고신호무결성" 요구 구간을 선점하려는 시도다.

3. **공정 전환의 병목**
   - 시장 진입의 핵심은 데모 성능이 아니라 취성 제어, 핸들링 자동화, 패널 규격 표준화, 고객 신뢰성 인증이다.
   - 전용 장비 투자와 초기 저수율을 감내할 고객/공급사 조합이 확보돼야 실제 매출 전환이 가능하다.

## 체크할 리스크와 반증 시그널

- **수율 리스크**: 시제품 성능 대비 양산 수율이 기대보다 낮으면 채택 시점이 1~2년 단위로 지연될 수 있다.
- **원가 리스크**: 기존 인터포저 체계의 학습효과(원가 절감 속도)가 빠르면 유리기판의 경제성 우위가 약해질 수 있다.
- **표준화 리스크**: 기판 크기·두께·TGV 공정 규격이 분절되면 장비 호환성과 공급망 확장이 늦어진다.
- **대체 기술 리스크**: 실리콘 인터포저 고도화와 하이브리드 기판 전략이 유리기판 도입 필요성을 부분적으로 흡수할 수 있다.

## 실무 관점 모니터링 포인트

- 고객사 샘플 승인 이후, 양산 계약으로 넘어가는 리드타임 변화
- 인터포저 면적 확장과 HBM 탑재 증가가 실제로 패키지 수율을 어떻게 바꾸는지
- OSAT/파운드리/소재사 간 공정 책임 분담(누가 수율 리스크를 보유하는지)
- 신규 CAPEX 집행 대비 단위면적당 원가 하락 속도

## 결론

현재 사이클에서 인터포저는 "확정된 수요를 소화하는 실행 기술"이고, 유리기판은 "다음 병목을 풀 잠재 기술"이다.  
투자·사업 관점에서는 유리기판의 장점 자체보다, 양산성 검증과 고객 인증의 속도를 우선 지표로 두는 접근이 더 보수적이고 유효하다.

## 출처

- Intel Newsroom, "Intel Unveils Industry-Leading Glass Substrates to Meet Demand for More Powerful Compute" (2023-09-18)  
  https://newsroom.intel.com/artificial-intelligence/intel-unveils-industry-leading-glass-substrates
- TSMC 3DFabric, "CoWoS" (2026-05-08, 페이지 내 명시일 부재로 확인일 사용)  
  https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm
- SK, "Absolics Breaks Ground On Planned $600M Investment" (2022-11-01)  
  https://eng.sk.com/news/absolics-breaks-ground-on-planned-600-million-manufacturing-site-in-georgia-for-breakthrough-semiconductor-material
- The Korea Herald, "Samsung, SK bet big on glass substrates for AI chips" (2024-07-08)  
  https://m.koreaherald.com/article/3430192
- Semiconductor Engineering, "The Race To Glass Substrates" (2024-05-29)  
  https://semiengineering.com/the-race-to-glass-substrates
