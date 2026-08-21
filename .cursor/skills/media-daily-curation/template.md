# Media entry template

Copy into `src/content/media/{YYYY-MM-DD}-{slug}.md`.

```markdown
---
title: "영상 제목"
publishedAt: 2026-08-21T16:00:00+09:00
youtubeId: "xxxxxxxxxxx"
channel: "hankyung-tv"
category: "macro"
impact: "high"
why: "모니터에 올린 이유 1–2문장."
summaryBullets:
  - "핵심 결론 1"
  - "핵심 결론 2"
  - "핵심 결론 3"
timestamps:
  - { label: "도입", timeSeconds: 60 }
  - { label: "핵심", timeSeconds: 300 }
marketSentiment: "mixed"
relatedAssets: ["KOSPI", "USD/KRW", "US10Y"]
durationSec: 600
lang: "ko"
draft: false
tags: ["금리", "매크로"]
---

편집 큐레이션. 원본은 YouTube·해당 채널에 있으며 투자 권유가 아닙니다.
```

## Field notes

- `channel`: `federal-reserve` | `bok-official` | `bloomberg-tv` | `cnbc-intl` | `reuters-news` | `wsj-video` | `ft-video` | `yahoo-finance` | `hankyung-tv` | `yonhap-infomax` | `sampro-tv` | `syuka-world` | `talent-invest` | `sosumonkey` | `supergaemi`
- `category`: 매크로·정책 공식 → `macro`/`policy`, 시황 헤드라인 → `news`
- `impact: high` → Must-Watch 후보 (당일 High 최대 2슬롯)
- `timestamps` 모르면 빈 배열 `timestamps: []` 또는 생략(default [])
- `marketSentiment` 불명확하면 생략 또는 `mixed`
