# Korea Daily News — Search Query Reference

기준일 `{Y}` = `2026년 6월 10일` 또는 `2026-06-10`. KST 기준으로 치환.

## Core (항상 실행)

```
코스피 코스닥 {Y} 마감
외국인 기관 순매수 {Y} 한국 증시
{Y} 증시 전망 모닝
site:yna.co.kr 증시 {Y}
site:n.news.naver.com section 101 {Y}
```

## Macro

```
원달러 환율 {Y} 마감
한국은행 {Y}
{Y} CPI FOMC 한국 증시 영향
유가 WTI {Y} 한국
VKOSPI {Y}
```

## Sector rotation

```
{Y} 특징주 반도체
{Y} 2차전지 바이오 특징주
{Y} 코스닥 급등 급락
```

## Corporate / policy

```
{Y} 공시 실적 잠정
{Y} 과징금 규제 심의
{Y} 파업 노조
{Y} MSCI 리밸런싱 한국
```

## Global link

```
{Y} 미국 증시 마감 한국
{Y} 나스닥 반도체 아시아
{Y} 엔화 위안 환율 아시아 증시
```

## Broker morning notes

```
{Y} 키움 NH 미래에셋 모닝 브리핑
{Y} "굿모닝 증시"
{Y} "장 전" 코스피 전망
```

## Date disambiguation

| Time (KST) | Search focus |
| --- | --- |
| 06:00–08:59 | `{Y} 장전`, `{Y-1} 마감`, 모닝 리포트 |
| 09:00–15:30 | `{Y} 장중`, `{Y-1} 종가`, 선물·환율 |
| 15:30+ | `{Y} 마감`, `{Y} 종가`, `{Y} 수급` |

## Source domains (fetch priority)

- `yna.co.kr` — 마켓·환율·특징주
- `mk.co.kr`, `hankyung.com`, `mt.co.kr`, `edaily.co.kr` — 증권·정책
- `asiae.co.kr`, `fnnews.com` — 모닝·섹터
- `newspim.com`, `news1.kr` — 브리핑
- `n.news.naver.com/section/101` — 경제 헤드라인 스캔
- `stock.pstatic.net` — 증권사 PDF (type: `report`)

## Dedup rule

동일 팩트(예: 코스피 종가)는 **tier가 가장 높은 1건**을 primary로, 나머지는 보조 corroboration만.
