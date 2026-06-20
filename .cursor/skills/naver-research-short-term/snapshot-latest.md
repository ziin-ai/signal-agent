# Snapshot — 2026-06-19 (fallback when 2026-06-20 has 0 reports)

> 주말·공휴일에는 당일 리포트가 없을 수 있다. 아래는 **최근 거래일** 기준 단기 투자자 공유 예시다. 실행 시 `fetch-research.mjs`로 최신 데이터를 가져온 뒤 **`src/content/posts/YYYY-MM-DD-naver-research-short-term-brief.md`** 포스트를 작성한다(기본). 상세 템플릿은 [post-template.md](post-template.md).

## Market one-liner

- 코스피 장중 9,385 돌파 후 차익실현 — **9,052 마감**(-0.13%). 지수는 9천피 유지, **하락 종목 86%**·코스닥 **-3.43%**로 체감 약세.
- **SK하이닉스** 장중 시총 2,000조·289만원 신고가 → 종가 276.4만원. **삼성전자** 장중 37.45만 신고가 → 종가 35.4만원. 반도체 대형주 쏠림.

## Share picks (reports + cross-check)

| Bucket | Pick | Report gist | Broker | URL |
| --- | --- | --- | --- | --- |
| 시황 | 마감 | 9천피·270만닉스·워시 이슈 | 유안타 | [36456](https://stock.naver.com/research/daily/36456) |
| 시황 | 위클리 | 9천피 시대 코스닥 부진 | 유안타 | [36457](https://stock.naver.com/research/daily/36457) |
| 섹터 | 반도체 IT | 흡성대법 (6/19) | 신한 | [36459](https://stock.naver.com/research/daily/36459) |
| 종목 | KT&G | 외국인 K-담배 (조회 4.8k) | DS | [93617](https://stock.naver.com/research/company/93617) |
| 종목 | 제이투케이바이오 | 사상 최대 실적 전망 | 교보 | [93615](https://stock.naver.com/research/company/93615) |
| 종목 | 삼성물산 | 배당 Formula·시총 100조 | DS | [93616](https://stock.naver.com/research/company/93616) |
| 종목 | 대한항공 | 성장·기업가치 상승 | iM | [93610](https://stock.naver.com/research/company/93610) |
| 섹터 | 통신 | 통신 **장비주** 매수 기회 | 하나 | [45021](https://stock.naver.com/research/industry/45021) |
| 섹터 | 전기전자 | MLCC 체크포인트 | iM | [45018](https://stock.naver.com/research/industry/45018) |
| 전략 | 코스닥 | 6월 3주 KOSDAQ 프리미엄 예상 | 유안타 | [39248](https://stock.naver.com/research/invest/39248) |
| 글로벌 | 미 증시 | FOMC 부담 소화·반도체 랠리 | 키움 | [39239](https://stock.naver.com/research/invest/39239) |

## Next-session variables

- **FOMC·긴축** — 키움/IBK 뉴욕 증시 브리프: 불확실성 완화 vs 달러 상승(긴축 우려) 혼재.
- **코스닥 디커플링** — 대형주 랠리 vs 코스닥 -3%: 유안타 위클리·QWER 프리미엄 리포트와 함께 watch.
- **섹터 로테 후보** — 통신장비, MLCC, 방산(708조), 로봇/방산/조선(유진 데일리).

## Sample share text (Mode A)

```markdown
## 6/19 증권 리서치 — 단기 체크

> 9천피는 지켰지만 반도체 빅테크 쏠림·코스닥 -3%로 체감은 약세. 차익실현 구간.

**시장:** 유안타 마감 시황 — 장중 9,385·닉스 289만 후 종가 되돌림. 신한 IT Weekly — SW 조정 속 보안·네오클라우드 강세.

**종목:** KT&G(외국인·K-담배, DS) / J2KBIO(최대 실적, 교보) / 삼성물산(배당·100조, DS) / 대한항공(iM)

**섹터:** 하나 통신장비 매수 / iM MLCC / 유진 로봇·방산·조선

**다음:** FOMC·달러(키움) / 코스닥 프리미엄 종목(유안타 QWER)

※ 리포트 요지 요약, 투자 권유 아님 → [네이버 리서치](https://stock.naver.com/research)
```
