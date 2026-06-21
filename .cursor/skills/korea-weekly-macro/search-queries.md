# Weekly Macro — Search Intent Matrix

`weekStart`~`weekEnd`를 `{week}`, `{start}`, `{end}`로 치환. **병렬** `WebSearch` 최소 **8~12개**.

## Korea equity & flows

| Intent | Example query |
| --- | --- |
| 주간 코스피·코스닥 | `코스피 코스닥 {week} 주간 마감` |
| 주간 수급 | `외국인 기관 순매수 {week} 주간 누적` |
| VKOSPI·변동성 | `VKOSPI {end} 주간` |
| 섹터 로테 | `{week} 반도체 섹터 수익률 코스피` |
| 코스닥 디커플 | `코스닥 {week} 외국인` |

## Macro & global link

| Intent | Example query |
| --- | --- |
| 美 CPI·고용·FOMC | `US CPI {week} treasury yield` |
| 환율·국채 | `원달러 {end} 주간 한국 국채` |
| 유가·지정학 | `WTI {week} Iran Israel` |
| 美 증시→韓 | `S&P 500 {week} Korea market` |
| BOK·한국 매크로 | `한국은행 {week} GDP CPI` |

## Sector deep checks

| Intent | Example query |
| --- | --- |
| 반도체/AI | `{week} SK하이닉스 삼성전자 AI HBM` |
| 방산 | `{week} 방산주 수출` |
| 플랫폼·규제 | `{week} 카카오 쿠팡 규제` |
| 실적 시즌 | `{week} 2분기 실적 컨센 코스피` |

## Next week calendar (차주)

| Intent | Example query |
| --- | --- |
| 차주 매크로 | `{nextMon} FOMC CPI BOK 일정` |
| 실적·이벤트 | `{nextWeek} 실적 발표 코스피` |
| MSCI·지수 | `MSCI {nextWeek} Korea` |

## Source tier bias

| Tier | Outlets |
| --- | --- |
| 1 | BOK·금융위·KRX·DART·Fed·BLS·MSCI 공식 |
| 2 | 연합·매경·한경·머니투데이·이데일리·Reuters·Bloomberg |
| 3 | 증권사 주간 전략·리서치 요약 |
| 4 | SNS·커뮤니티 — 본문 근거 금지 |

`WebFetch`로 핵심 3~6건 본문에서 **숫자·날짜** 검증.
