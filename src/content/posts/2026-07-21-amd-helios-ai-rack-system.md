---
title: "AMD Helios AI 랙: 단품 GPU에서 랙스케일 플랫폼으로의 전환"
date: 2026-07-21
symbol: "AMD"
market: "NASDAQ"
conviction: 4
summary: "AMD Helios는 Instinct MI455X·EPYC Venice·Pensando·ROCm을 하나의 ORW 더블와이드 랙으로 묶은 첫 랙스케일 AI 시스템이다. 2026년 하반기 출하를 앞두고 Microsoft Azure 도입이 확정되며 Meta·OpenAI·Oracle 고객군이 겹친다. 관전 포인트는 스펙 대결이 아니라 볼륨 램프·ROCm 워크로드 이식·토큰당 TCO가 Nvidia NVL급 대비 실제로 벌어지는지다."
tags:
  - "AMD"
  - "Helios"
  - "AI랙"
  - "데이터센터"
  - "MI455X"
aiAssisted: true
draft: false
sources:
  - id: "src-1"
    tier: 1
    type: "news"
    title: "Microsoft to Deploy Next-Gen AMD Instinct and AMD EPYC Processors as the Companies Expand Their Long-Term Strategic Partnership"
    date: 2026-07-20
    url: "https://www.amd.com/en/newsroom/press-releases/2026-7-20-microsoft-to-deploy-next-gen-amd-instinct-and-amd-.html"
    excerpt: "Microsoft가 Azure에 AMD Helios Rackscale을 대규모로 도입해 frontier model inference·Azure AI 서비스를 지원한다고 발표. Venice 기반 신규 VM 2종과 Pensando DPU 확대도 포함. Helios 고객 출하(MS 포함)는 2026년 하반기."
  - id: "src-2"
    tier: 1
    type: "news"
    title: "AMD Helios Rackscale Solution (official product page)"
    date: 2026-07-20
    url: "https://www.amd.com/en/products/rackscale-solutions/helios.html"
    excerpt: "72× MI455X, EPYC Venice, Pensando Vulcano·UALink 기반 코디자인. OCP Open Rack Wide(ORW), UALink, UEC 오픈 표준. 볼륨 배포 기대 시점은 2026년 하반기. 랙당 FP4 약 2.9EF, HBM4 합산 31TB 등 스펙 제시."
  - id: "src-3"
    tier: 1
    type: "news"
    title: "AMD and its Partners Share their Vision for “AI Everywhere, for Everyone” at CES 2026"
    date: 2026-01-05
    url: "https://ir.amd.com/news-events/press-releases/detail/1272/amd-and-its-partners-share-their-vision-for-ai-everywhere-for-everyone-at-ces-2026"
    excerpt: "CES 2026 키노트에서 Helios 랙스케일 플랫폼을 공개. MI455X·Venice·Pensando Vulcano·ROCm 통합, 단일 랙에서 최대 약 3 AI exaflops급 성능을 제시."
  - id: "src-4"
    tier: 2
    type: "news"
    title: "AMD Helios: Microsoft signs on to rack AI system that rivals Nvidia"
    date: 2026-07-20
    url: "https://www.cnbc.com/2026/07/20/amd-helios-microsoft-ai-nvidia.html"
    excerpt: "MS가 Helios를 Azure에 배치하며 Meta·OpenAI·Oracle 고객군에 합류. 하반기 출하. Meta는 장기 최대 6GW 중 올해 Helios 랙으로 1GW 우선 배치. AMD는 2027년부 데이터센터 AI 매출 수십억 달러대, 상당 부분을 Helios에서 인식할 계획이라고 CNBC에 언급."
  - id: "src-5"
    tier: 2
    type: "news"
    title: "MS, 클라우드 '애저'에 AMD AI랙 대거 도입…엔비디아 독주 견제"
    date: 2026-07-21
    url: "https://www.yna.co.kr/view/AKR20260721005300091"
    excerpt: "연합뉴스: Helios는 CES 2026에서 공개된 훈련·추론용 랙으로 GB/Vera Rubin 경쟁 제품으로 소개. Futurum 인용 Helios ASP 추산 500만~550만 달러, Vera Rubin 대비 고가이나 토큰당 비용·TCO를 선택 이유로 제시. Futurum은 AMD DC GPU 점유율 4.5%→20~25% 시나리오를 언급."
  - id: "src-6"
    tier: 2
    type: "news"
    title: "AMD, 차세대 데이터센터 랙 '헬리오스' 공개"
    date: 2026-01-06
    url: "https://www.thelec.kr/news/articleView.html?idxno=50609"
    excerpt: "디일렉: 랙당 GPU 72·CPU 18, MI455·Venice, HBM4 31TB·스케일업 대역 260TB/s·스케일아웃 43TB/s 등 CES 공개 수치와 Meta 협력 ORW 표준 기반을 정리. 올해 말부터 판매 예정."
  - id: "src-7"
    tier: 3
    type: "news"
    title: "AMD's Helios puts 72 GPUs and 31 terabytes of HBM4 in one rack"
    date: 2026-07-01
    url: "https://thenextweb.com/news/amd-helios-mi455x-72-gpu-rack-nvidia-rival"
    excerpt: "18 컴퓨트 트레이×(MI455X 4 + Venice 1) 구성, UALink 스케일업·UEC 스케일아웃, 엔지니어링 샘플 H2 2026·양산 램프 Q2 2027 등 일정 해석을 담은 2차 분석. ROCm·CUDA 이식 격차가 핵심 검증 과제로 지적."
shorts:
  enabled: true
  platform:
    - "youtube"
  format: "9:16"
  duration: 30
  hook: "AMD가 칩이 아니라 '랙'을 판다"
  title: "AMD Helios: MS·Meta가 선택한 AI 랙"
  description: |
    MI455X 72장·HBM4 31TB를 한 랙에 묶은 Helios.
    Microsoft Azure 도입과 Meta·OpenAI 고객군이 의미하는 것과
    출하·ROCm이 남긴 리스크만 30초로 정리.

    #AMD #Helios #AI랙 #데이터센터 #MI455X #반도체
  hashtags:
    - "#AMD"
    - "#Helios"
    - "#AI랙"
    - "#데이터센터"
    - "#반도체"
    - "#주식분석"
  thumbnail:
    headline: "AMD = 랙스케일"
    subline: "MS Azure 합류"
    style: "랙 실루엣 + 대비 텍스트"
  scenes:
    - t: "0-3s"
      role: "hook"
      visual: "더블와이드 랙 실루엣에 Helios 로고"
      caption: "AMD가 칩이 아니라 랙을 판다"
      vo: "단품 GPU 시대가 끝납니다"
    - t: "3-8s"
      role: "problem"
      visual: "Nvidia NVL vs AMD Helios 대결 프레임"
      caption: "문제는 점유율 95% 벽"
      vo: "랙스케일 없이는 하이퍼스케일러 문을 못 엽니다"
    - t: "8-15s"
      role: "explanation"
      visual: "72 GPU · 18 CPU · HBM4 31TB 스펙 카드"
      caption: "72×MI455X + Venice + Pensando"
      vo: "오픈 표준 ORW·UALink로 NVL급에 맞대응"
    - t: "15-23s"
      role: "checkpoints"
      visual: "MS · Meta · OpenAI · Oracle 로고 행"
      caption: "고객은 모였다. 남은 건 램프"
      vo: "하반기 출하와 ROCm 이식이 진짜 시험"
    - t: "23-28s"
      role: "conclusion"
      visual: "토큰당 TCO 화살표 하락"
      caption: "스펙 전쟁 → TCO 전쟁"
      vo: "점유율 재평가는 출하 숫자가 결정합니다"
    - t: "28-30s"
      role: "cta"
      visual: "블로그 링크 카드"
      caption: "전체 분석은 블로그에서"
      vo: ""
  cta:
    type: "blog_link"
    target: "본문 포스트"
  tone: "analytical_calm"
  bgm: "minimal_beat_no_climax"
entities:
  company:
    - "AMD"
    - "Microsoft"
    - "Meta"
    - "OpenAI"
    - "Oracle"
    - "NVIDIA"
  product:
    - "Helios"
    - "Instinct MI455X"
    - "EPYC Venice"
    - "Pensando"
    - "ROCm"
  theme:
    - "랙스케일 AI"
    - "오픈 표준 ORW"
    - "데이터센터 추론"
---

2026년 7월 20일 Microsoft가 Azure에 AMD Helios를 배치한다고 발표하면서, Helios 논쟁은 ‘공개 스펙’ 단계에서 ‘하이퍼스케일 조달’ 단계로 넘어갔다{{cite:src-1}}. Helios는 Instinct MI455X·EPYC Venice·Pensando·ROCm을 ORW 더블와이드 랙으로 통합한 AMD의 첫 랙스케일 AI 시스템이며, 고객 출하는 2026년 하반기로 제시된다{{cite:src-2}}.

## 결론 요약 (TL;DR)

- 티어 A(플랫폼 전환): 단품 GPU 판매 → 랙스케일 턴키. Nvidia Grace Blackwell / Vera Rubin NVL급과 같은 ‘랙’ 단위 경쟁으로 이동{{cite:src-1}}{{cite:src-3}}
- 티어 A(수요 가시성): MS Azure + Meta(장기 최대 6GW·올해 Helios 1GW)·OpenAI·Oracle 등 고객 로스터가 겹침{{cite:src-1}}{{cite:src-4}}
- 티어 B(검증 숙제): 하반기 출하 램프, ROCm 워크로드 이식, 토큰당 TCO가 ASP 프리미엄을 상쇄하는지{{cite:src-5}}{{cite:src-7}}
- 관전 트리거: Azure ND MI455X급 인스턴스 상용화 시점, Meta 1GW Helios 배치 진도, 2027년 DC AI 매출에서 Helios 비중 코멘트{{cite:src-4}}

## Helios는 무엇인가?

Helios는 서버 보드 묶음이 아니라, 컴퓨트 트레이·인터커넥트·냉각·스케일아웃까지 한 랙 레퍼런스로 고정한 시스템이다. 공식 구성은 랙당 Instinct MI455X 72개와 EPYC Venice CPU, Pensando Vulcano 네트워킹이며, Meta가 OCP에 제출한 Open Rack Wide(ORW) 더블와이드 폼팩터를 따른다{{cite:src-2}}{{cite:src-6}}.

트레이 단위로는 보통 GPU 4개 + Venice CPU 1개가 한 세트로 묶이고, 이를 18트레이로 쌓아 72 GPU 랙을 만든다{{cite:src-7}}. 메모리·대역 쪽 핵심 숫자는 HBM4 합산 약 31TB, 스케일업(UALink) 약 260TB/s, 스케일아웃(이더넷/UEC) 약 43TB/s, FP4 추론 약 2.9EF 수준이다{{cite:src-2}}{{cite:src-6}}.

<svg viewBox="0 0 640 220" role="img" aria-label="AMD Helios 랙 구성 개요">
  <title>Helios 랙스케일 스택</title>
  <desc>ORW 랙 안에 Venice CPU, MI455X GPU, Pensando 네트워킹, ROCm 소프트웨어가 계층적으로 결합됨</desc>
  <rect x="20" y="20" width="600" height="180" rx="10" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="320" y="48" text-anchor="middle" fill="currentColor" font-size="14">ORW Double-Wide Rack (Helios)</text>
  <rect x="40" y="70" width="130" height="100" rx="8" fill="#1a1a1a" stroke="currentColor"/>
  <text x="105" y="115" text-anchor="middle" fill="currentColor" font-size="12">EPYC</text>
  <text x="105" y="135" text-anchor="middle" fill="currentColor" font-size="12">Venice ×18</text>
  <rect x="190" y="70" width="150" height="100" rx="8" fill="#1a1a1a" stroke="currentColor"/>
  <text x="265" y="115" text-anchor="middle" fill="currentColor" font-size="12">MI455X ×72</text>
  <text x="265" y="135" text-anchor="middle" fill="currentColor" font-size="12">HBM4 31TB</text>
  <rect x="360" y="70" width="130" height="100" rx="8" fill="#1a1a1a" stroke="currentColor"/>
  <text x="425" y="115" text-anchor="middle" fill="currentColor" font-size="12">Pensando</text>
  <text x="425" y="135" text-anchor="middle" fill="currentColor" font-size="12">UALink/UEC</text>
  <rect x="510" y="70" width="90" height="100" rx="8" fill="#1a1a1a" stroke="currentColor"/>
  <text x="555" y="125" text-anchor="middle" fill="currentColor" font-size="12">ROCm</text>
</svg>

*공식 제품·CES·2차 보도 스펙을 단순화한 구성도{{cite:src-2}}{{cite:src-3}}{{cite:src-6}}*

## Nvidia NVL급과 무엇이 다른가?

| 구분 | AMD Helios | Nvidia NVL급(GB / Vera Rubin) | 함의 |
| --- | --- | --- | --- |
| 랙 단위 | MI455X 72 + Venice | GB200/Rubin NVL72 계열 | 같은 ‘랙’ 경쟁 지형{{cite:src-2}}{{cite:src-5}} |
| 인터커넥트 | UALink + UEC/이더넷 | NVLink 등 프로프라이어터리 | 벤더 락인 vs 오픈 표준{{cite:src-2}}{{cite:src-7}} |
| 폼팩터 | Meta ORW 더블와이드 | Nvidia 랙 설계 | 하이퍼스케일 시설 표준 정렬{{cite:src-2}} |
| 소프트웨어 | ROCm | CUDA | 이식·툴링이 채택 속도 결정{{cite:src-7}} |
| ASP(2차 추산) | Helios 약 500만~550만 달러 | Vera Rubin 약 350만~400만 달러 | 가격 프리미엄을 TCO로 상쇄해야 함{{cite:src-5}} |

*ASP는 Futurum→연합뉴스/CNBC 인용 추산이며, 공식 리스트 프라이스가 아님{{cite:src-5}}*

AMD의 포지셔닝은 ‘같은 랙 밀도’보다 ‘오픈 표준 + 메모리 용량/대역 + 토큰당 비용’이다. 공식·보도 기준으로 Helios는 HBM4 용량·대역을 전면에 내세우고, 경영진은 총소유비용(TCO)·토큰당 최저 비용을 선택 이유로 반복한다{{cite:src-2}}{{cite:src-5}}.

> 스펙 표가 아니라 출하 램프와 ROCm 이식률이 Helios의 밸류에이션 승부처다.

## 고객 로스터가 말해 주는 것

Microsoft 발표의 핵심은 Helios를 Azure에서 frontier model inference·Azure AI 서비스·고객 앱에 쓴다는 점이다{{cite:src-1}}. 동시에 Venice 기반 HDv2(에이전틱 AI·데이터 파이프라인)·HXv2(반도체 설계) VM과 Pensando DPU 확대가 붙어, ‘GPU 한 장’이 아니라 CPU·네트워킹·소프트웨어까지 스택 판매로 확장된다{{cite:src-1}}.

CNBC에 따르면 Meta는 장기 최대 6GW AMD GPU 중 올해 Helios 랙으로 1GW를 먼저 올리고, OpenAI·Oracle·TCS도 올해 배치·약정 라인에 있다{{cite:src-4}}. CES 단계의 ‘공개’와 7월의 ‘Azure 조달’이 이어지면서, Helios는 레퍼런스 디자인에서 상용 조달 파이프라인으로 격상됐다{{cite:src-3}}{{cite:src-1}}.

```text
CES 2026 공개 → 고객 약정(Meta/OpenAI/Oracle 등)
                 → 2026-07 MS Azure 도입 확정
                 → 2026 H2 고객 출하 시작
                 → 2027~ Helios 중심 DC AI 매출 확대(회사 코멘트)
```

*타임라인은 공식 보도·CNBC 인용을 연결한 것이며, 분기별 출하량은 미공개{{cite:src-1}}{{cite:src-3}}{{cite:src-4}}*

<iframe src="https://s.tradingview.com/widgetembed/?symbol=NASDAQ%3AAMD&interval=D&theme=dark&style=1&locale=kr&hide_top_toolbar=1&hide_legend=1" width="100%" height="360" loading="lazy" title="AMD TradingView 일봉"></iframe>

*MS Helios 발표 전후 AMD 가격 반응을 일봉으로 대조할 때 사용. 투자 판단용 단독 근거는 아님.*

## 투자 포인트와 반증

투자 논지는 세 갈래다. 첫째, 랙스케일 전환은 AMD가 Nvidia와 같은 ‘시스템 ASP’ 풀에 진입한다는 뜻이다. 둘째, MS·Meta급 고객은 수요 가시성을 높이지만, 계약 규모·GPU 수량은 대부분 미공개라 매출 환산은 아직 시나리오다{{cite:src-1}}{{cite:src-4}}. 셋째, Futurum류 점유율 20~25% 시나리오는 상단 스토리일 뿐, 현재 점유율·소프트웨어 격차를 감안하면 경로의존이 크다{{cite:src-5}}.

반증 신호도 분명하다. 2차 분석은 엔지니어링 샘플·초기 생산이 2026 하반기, 본격 양산 토큰은 2027년 2분기로 밀릴 수 있다고 본다{{cite:src-7}}. 이 경우 2026년 인식 매출은 제한적이고, Nvidia 2026 매출에 대한 즉각 위협은 약해진다. ASP가 더 높다는 추산이 맞다면, 토큰당 비용·가동률·전력당 성능이 증명되지 않으면 조달이 파일럿에 그칠 수 있다{{cite:src-5}}.

<aside style="border-left:3px solid currentColor;padding:0.75rem 1rem;margin:1.25rem 0;">
핵심 지표 한 줄: 고객 로스터(질) × H2 출하(양) × ROCm 이식(전환비용) = Helios 멀티플
</aside>

## 체크할 리스크

- 출하 일정 지연: H2 2026 ‘시작’과 2027 볼륨 램프 사이의 갭{{cite:src-2}}{{cite:src-7}}
- 소프트웨어: CUDA 대비 ROCm 성숙도·프레임워크 최적화 속도{{cite:src-7}}
- 가격·TCO: Helios ASP 프리미엄이 실제 토큰 경제학으로 상쇄되지 않을 위험{{cite:src-5}}
- 공급망: HBM4·첨단 패키징·액체냉각·전력 인프라 병목이 랙 납기를 제약
- 경쟁 반응: Nvidia 차세대 랙·소프트웨어·번들 가격 정책이 상대 TCO를 다시 좁힐 수 있음

## Helios는 Nvidia 독주를 깨는가?

단기적으로 ‘독주 붕괴’보다 ‘조달 다변화의 실물화’에 가깝다. MS가 Nvidia·자체 Maia와 병행해 Helios를 넣는 구조는, 하이퍼스케일러가 단일 벤더 리스크를 줄이려는 전형적인 포트폴리오 전략이다{{cite:src-1}}{{cite:src-5}}. 점유율 재평가는 Azure 상용 인스턴스 가동, Meta 1GW 배치, 2027년 Helios 매출 코멘트가 숫자로 확인될 때 가능하다{{cite:src-4}}.

## 결론

Helios는 AMD를 AI 가속기 공급자에서 랙스케일 인프라 벤더로 재정의하는 제품이다. 2026년 7월 Microsoft 합류로 고객 질은 한 단계 올라갔고, 하반기 출하가 스토리를 재무로 옮기는 첫 관문이다{{cite:src-1}}. 컨빅션 4의 근거는 플랫폼 전환의 비가역성과 하이퍼스케일 고객 로스터이며, 상향 여지는 ROCm·램프 실행, 하향 리스크는 일정 지연과 TCO 미증명에 묶여 있다.

## 자주 묻는 질문 (FAQ)

**Q. Helios는 언제부터 팔리나?**  
A. AMD는 볼륨 배포·고객 출하를 2026년 하반기로 제시한다. Microsoft 포함 고객 출하도 같은 윈도우다{{cite:src-1}}{{cite:src-2}}.

**Q. 랙 하나에 GPU가 몇 장인가?**  
A. Instinct MI455X 72장. 트레이당 보통 4GPU+1CPU, 18트레이 구성으로 보도된다{{cite:src-2}}{{cite:src-7}}.

**Q. Nvidia보다 싼가?**  
A. Futurum 추산으로는 Helios ASP가 Vera Rubin보다 높을 수 있다. 선택 논거는 ASP가 아니라 토큰당 비용·TCO다{{cite:src-5}}.

**Q. 한국 투자자에게 직접 노출은?**  
A. 1차 티커는 NASDAQ:AMD. 간접으로는 HBM·서버·전력·액체냉각 밸류체인이 Helios 램프와 연동될 수 있으나, 본 노트는 AMD 플랫폼 논지에 한정한다.

## 출처

1. [AMD Newsroom — Microsoft Helios / Azure 파트너십 (2026-07-20)](https://www.amd.com/en/newsroom/press-releases/2026-7-20-microsoft-to-deploy-next-gen-amd-instinct-and-amd-.html)
2. [AMD — Helios Rackscale 제품 페이지](https://www.amd.com/en/products/rackscale-solutions/helios.html)
3. [AMD IR — CES 2026 Helios 공개 (2026-01-05)](https://ir.amd.com/news-events/press-releases/detail/1272/amd-and-its-partners-share-their-vision-for-ai-everywhere-for-everyone-at-ces-2026)
4. [CNBC — AMD Helios, Microsoft 합류 (2026-07-20)](https://www.cnbc.com/2026/07/20/amd-helios-microsoft-ai-nvidia.html)
5. [연합뉴스 — MS Azure AMD AI랙 도입 (2026-07-21)](https://www.yna.co.kr/view/AKR20260721005300091)
6. [디일렉 — AMD 헬리오스 CES 공개 (2026-01-06)](https://www.thelec.kr/news/articleView.html?idxno=50609)
7. [The Next Web — Helios 72 GPU / HBM4 31TB 분석](https://thenextweb.com/news/amd-helios-mi455x-72-gpu-rack-nvidia-rival)
