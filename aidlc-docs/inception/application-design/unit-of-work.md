# Unit of Work Plan

## Units

| Unit | Stories | Deliverables (workspace root) |
| --- | --- | --- |
| evergreen-content | US-01 | 3 deepened MD + 5 new MD under `src/content/posts/` |
| publisher-chrome | US-02, US-03 | `about.astro`, `index.astro` |
| crawl-hardening | US-04 | prerender on legal + `posts/index.astro` |
| daily-voice-sample | US-05 | 5 outlook MD rewrites |

## Dependencies

```text
evergreen-content ──┐
publisher-chrome ───┼──► crawl-hardening (independent) ──► build-and-test ──► git publish
daily-voice-sample ─┘
```

Units may run in parallel; single commit preferred at end for reviewability (Q7 A still satisfied).

## New guide topics (Q8=B)

1. 공매도·대차 잔고 읽는 법  
2. 원/달러와 한국 증시  
3. 실적시즌·컨센서스 캘린더 읽기  
4. ETF vs 개별주 선택 프레임  
5. 거래대금·수급 회전율 기초  

## Outlook rewrite targets

- `2026-07-21-korea-market-outlook.md`
- `2026-07-08-korea-market-outlook.md`
- `2026-07-07-korea-market-outlook.md`
- `2026-06-24-korea-market-outlook.md`
- `2026-06-17-korea-market-outlook.md`
