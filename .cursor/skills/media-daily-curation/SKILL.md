---
name: media-daily-curation
description: >-
  Find and add today's (KST) curated economy/market YouTube videos into
  signal-agent src/content/media/ for the /media monitor. Whitelist channels
  only (hankyung-tv, yonhap-infomax, federal-reserve, bok-official). Verify
  video IDs via oEmbed, write schema-valid markdown, then git commit/push per
  _shared/git-publish.md unless the user opts out. Use when the user asks for
  오늘 미디어, 미디어 데이터 추가, media curation, YouTube 큐레이션 갱신,
  must-watch briefs 추가, or /media 당일 픽.
disable-model-invocation: true
---

# Media Daily Curation (오늘 미디어)

## Goal

**오늘(KST)** 화이트리스트 채널에서 경제·증시 유튜브를 찾아 `src/content/media/*.md`로 추가한다. `/media` 모니터(브리프·테이프·센티먼트)에 바로 노출되게 한다.

## When To Use

- "오늘 미디어 추가", "미디어 데이터 업데이트"
- "Must-Watch /media 큐레이션 채워줘"
- FOMC·금통위·시황 브리핑 영상을 당일 픽으로 넣을 때

**Do not use** for: 일반 블로그 포스트 작성 → `korea-daily-news` / `post-from-sources`. 화이트리스트 밖 채널 영상은 **추가 금지**.

## Step 0: Anchor The Date

1. **기준일 = KST 오늘** (`Asia/Seoul`). 사용자가 `YYYY-MM-DD`를 주면 그 날짜.
2. 응답 첫 줄에 `기준일: YYYY-MM-DD (KST)` 명시.
3. 파일명 prefix: `{YYYY-MM-DD}-{slug}.md` (공개일이 전일이어도 **큐레이션 기준일**을 파일명에 써도 됨. `publishedAt`은 실제 공개·업로드 시각).

## Step 1: Whitelist Only

채널 ID ↔ YouTube (소스: `src/lib/media-channels.ts`):

| `channel` | 이름 | URL |
| --- | --- | --- |
| `hankyung-tv` | 한국경제TV | https://www.youtube.com/@hkwowtv |
| `yonhap-infomax` | 연합인포맥스 | https://www.youtube.com/@yonhapinfomax |
| `federal-reserve` | Federal Reserve | https://www.youtube.com/@federalreserve |
| `bok-official` | 한국은행 | https://www.youtube.com/@theBankofKoreakr |

채널 핸들이 비어 있으면(공개 영상 없음) 스킵하고 Final Response에 적는다. **다른 채널 ID로 우회 금지.**

## Step 2: Discover Today's Videos

병렬 검색 + 채널 페이지:

1. `WebSearch` / 채널 `/videos` 스크rape로 **기준일±1일** 업로드 후보 수집.
2. 의도 예:
   - `{date} FOMC OR 금통위 site:youtube.com`
   - `한국경제TV {date} 시황 OR 금리 OR 환율`
   - `Federal Reserve FOMC Press Conference {year}`
   - `한국은행 기자간담회 OR 가계신용 {date}`
3. 우선순위: **공식 1차(Fed/한은)** → 국내 시황 브리핑(한경TV) → 속보형(인포맥스).
4. 목표: **2~5편**. High 1~2 + Mid 테이프용. 중복·예능·종목 리딩 쇼만 있는 영상은 제외.

## Step 3: Verify Each Video

각 `youtubeId`에 대해:

```bash
curl -sL "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={ID}&format=json"
```

또는:

```bash
node .cursor/skills/media-daily-curation/scripts/verify-youtube.mjs {ID} [{ID}...]
```

**필수 확인:**

- oEmbed `author_name` / 채널이 화이트리스트와 일치
- `title`이 frontmatter `title`과 일치(또는 합리적 축약)
- watch 페이지에서 `lengthSeconds`, `publishDate`/`uploadDate` 확보 → `durationSec`, `publishedAt`(KST `+09:00`)

검증 실패·채널 불일치 → **파일 쓰지 않음**.

## Step 4: Write Markdown

경로: `src/content/media/{YYYY-MM-DD}-{short-slug}.md`

템플릿: [template.md](template.md)

스키마 요약 (`src/content.config.ts` `media` collection, **strict**):

| Field | Rules |
| --- | --- |
| `title` | 영상 제목(또는 명확한 축약) |
| `publishedAt` | ISO datetime, 가능하면 `+09:00` |
| `youtubeId` | 6–20자 |
| `channel` | enum 4종만 |
| `category` | `macro` \| `earnings` \| `product` \| `policy` \| `supply-chain` \| `news` \| `other` |
| `impact` | `high` \| `mid` \| `low` — Must-Watch는 `high` 우선 |
| `why` | 1–2문장, 왜 모니터에 올렸는지 |
| `summaryBullets` | 결론 중심 2–3개 (최대 5) |
| `timestamps` | `{ label, timeSeconds }` 0–4개. 모르면 `[]` |
| `marketSentiment` | optional: `hawkish` \| `dovish` \| `neutral` \| `mixed` |
| `relatedAssets` | 예: `KOSPI`, `USD/KRW`, `US10Y`, `S&P 500` |
| `live` | 기본 `false` |
| `durationSec` | 확인된 초 |
| `lang` | `ko` \| `en` |
| `draft` | `false` |
| `tags` | 짧은 키워드 |

본문(frontmatter 아래): 면책 한 줄. **투자 권유 금지.** AI/생성 언급 금지.

기존 동일 `youtubeId` 파일이 있으면 **갱신**하거나 스킵(중복 금지).

## Step 5: Build + Publish

1. `pnpm run build` 또는 `npm run build` — media schema 통과 확인.
2. [../_shared/git-publish.md](../_shared/git-publish.md) 준수.
   - Stage: `src/content/media/`, 필요 시 `src/lib/media-channels.ts`
   - Message 예: `Add {date} media curation picks ({n} videos)`

## Checklist

```
- [ ] 기준일(KST) 명시
- [ ] 화이트리스트 채널만
- [ ] oEmbed/스크립트로 ID·채널 검증
- [ ] durationSec·publishedAt 채움
- [ ] summaryBullets 2–3 + why
- [ ] 중복 youtubeId 없음
- [ ] build 통과
- [ ] git commit/push (또는 opt-out)
```

## Final Response

1. **기준일**
2. **추가/갱신 파일** 목록 (`youtubeId`, channel, impact)
3. **스킵** 사유 (채널 없음, 검증 실패 등)
4. **Build/schema** + **Git** (`_shared/git-publish.md` 형식)
