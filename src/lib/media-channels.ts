/** 미디어 허브 — 화이트리스트 채널만 큐레이션 허용 */

export type MediaChannel = {
  id: string;
  name: string;
  /** YouTube 채널 URL (공개) */
  url: string;
  blurb: string;
};

export const MEDIA_CHANNELS: readonly MediaChannel[] = [
  {
    id: "hankyung-tv",
    name: "한국경제TV",
    url: "https://www.youtube.com/@wowtv",
    blurb: "국내 시황·글로벌 마감·매크로 브리핑",
  },
  {
    id: "yonhap-infomax",
    name: "연합인포맥스",
    url: "https://www.youtube.com/@yonhapinfomax",
    blurb: "금리·환율·채권·거시 지표 속보",
  },
  {
    id: "federal-reserve",
    name: "Federal Reserve",
    url: "https://www.youtube.com/@federalreserve",
    blurb: "FOMC·연준 공식 기자회견·연설",
  },
  {
    id: "bok-official",
    name: "한국은행",
    url: "https://www.youtube.com/@bankofkorea",
    blurb: "금통위·금융안정·공식 브리핑",
  },
] as const;

export const MEDIA_CHANNEL_IDS = MEDIA_CHANNELS.map((c) => c.id);

export function mediaChannelById(id: string): MediaChannel | undefined {
  return MEDIA_CHANNELS.find((c) => c.id === id);
}

export function mediaCategoryLabel(category: string): string {
  if (category === "macro") return "매크로";
  if (category === "earnings") return "실적";
  if (category === "product") return "제품";
  if (category === "policy") return "정책";
  if (category === "supply-chain") return "공급망";
  if (category === "news") return "뉴스";
  return "기타";
}

export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`;
}

export function youtubeThumbUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
