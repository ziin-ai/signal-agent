/** 대시보드 「최근 흐름」 외부 이벤트 필터 — URL·포스트 메타·타임라인 이벤트를 한곳에서 해석 */

import type { CollectionEntry } from "astro:content";
import type { TimelineEvent } from "./timeline";

export type EventMarketFilter = "all" | "us" | "kr";

const US_LISTED_MARKETS = ["NASDAQ", "NYSE", "AMEX", "OTC"] as const;

function isUsDashboardMarket(m: string | undefined): boolean {
  if (!m) return false;
  if (m === "GLOBAL") return true;
  return US_LISTED_MARKETS.includes(m as (typeof US_LISTED_MARKETS)[number]);
}

/** 시장별 카테고리 칩용 — 이벤트 컬렉션 전체에서 대시보드 기간만 보고 계산 (글별 타임라인 스코프와 무관) */
export type MarketCategoryOptionSets = {
  all: string[];
  us: string[];
  kr: string[];
};

export function marketCategoryOptionsInWindow(
  externalEvents: CollectionEntry<"events">[],
  windowStart: Date,
  windowEnd: Date,
): MarketCategoryOptionSets {
  const ws = windowStart.getTime();
  const we = windowEnd.getTime();
  const allSet = new Set<string>();
  const usSet = new Set<string>();
  const krSet = new Set<string>();

  for (const ev of externalEvents) {
    const t = ev.data.date.getTime();
    if (t < ws || t > we) continue;
    const cat = ev.data.category;
    if (!cat) continue;
    const m = ev.data.market;
    allSet.add(cat);
    if (m === "KRX") krSet.add(cat);
    if (isUsDashboardMarket(m)) usSet.add(cat);
  }

  const sort = (s: Set<string>) => [...s].sort();
  return { all: sort(allSet), us: sort(usSet), kr: sort(krSet) };
}

/** 타임라인 이벤트 스트림 없이도 서버에서 미리 계산한 칩 목록 사용 */
export function categoryOptionsForMarketFilter(
  selectedMarket: EventMarketFilter,
  presets: MarketCategoryOptionSets | undefined,
  allEvents: TimelineEvent[],
): string[] {
  if (presets) {
    if (selectedMarket === "us") return presets.us;
    if (selectedMarket === "kr") return presets.kr;
    return presets.all;
  }
  return categoryOptionsFromTimeline(allEvents, selectedMarket);
}

export function defaultEventMarketFromPost(market: string | undefined): EventMarketFilter {
  if (!market) return "all";
  if (market === "KRX") return "kr";
  if (US_LISTED_MARKETS.includes(market as (typeof US_LISTED_MARKETS)[number])) return "us";
  return "all";
}

/** 기본 선택 카테고리 (실적 · 매크로) — 이벤트 데이터에 존재하는 것만 적용 */
export const DEFAULT_TIMELINE_EVENT_CATEGORIES = ["earnings", "macro"] as const;

/** 쿼리에 시장/카테고리가 한 번도 없으면 포스트 기반 기본 필터 적용 */
export function shouldUsePostBasedFilterDefaults(url: URL): boolean {
  const sp = url.searchParams;
  return !sp.has("eventMarket") && !sp.has("eventCategory");
}

/**
 * URL의 eventMarket 쿼리를 EventMarketFilter로 해석한다.
 * `eventCategory`만 있고 시장 파라미터가 없을 때 예전 로직은 "all"이 되어 한국 글에서 칩이 전부 비활성처럼 보였다.
 * 명시값: us | kr | all. 없거나 알 수 없으면 포스트 시장 기본값.
 */
export function eventMarketFilterFromUrlSearch(
  url: URL,
  activePostMarket: string | undefined,
  usePostFilterDefaults: boolean,
): EventMarketFilter {
  if (usePostFilterDefaults) return defaultEventMarketFromPost(activePostMarket);
  const raw = url.searchParams.get("eventMarket")?.trim().toLowerCase() ?? "";
  if (raw === "us" || raw === "kr") return raw;
  if (raw === "all") return "all";
  return defaultEventMarketFromPost(activePostMarket);
}

export function eventCategoryLabel(category: string): string {
  if (category === "macro") return "매크로";
  if (category === "earnings") return "실적";
  if (category === "product") return "제품";
  if (category === "policy") return "정책";
  if (category === "supply-chain") return "공급망";
  if (category === "news") return "뉴스";
  return "기타";
}

export type ExternalEventForFilters = { data: { market?: string; category: string } };

/** URL·포스트 시장·외부 이벤트 컬렉션으로 선택 상태와 카테고리 옵션을 계산한다. */
export function resolveDashboardTimelineFilters(
  url: URL,
  activePostMarket: string | undefined,
  externalEvents: ExternalEventForFilters[],
  /** 대시보드 기간 윈도우 기준 프리셋 — 있으면 `parseDashboardFiltersFromUrl`·클라이언트 칩과 동일한 옵션 집합을 쓴다. */
  marketCategoryPresets?: MarketCategoryOptionSets,
): {
  selectedEventMarket: EventMarketFilter;
  selectedEventCategories: string[];
  eventCategoryOptions: string[];
} {
  const usePostFilterDefaults = shouldUsePostBasedFilterDefaults(url);
  const selectedEventMarket = eventMarketFilterFromUrlSearch(url, activePostMarket, usePostFilterDefaults);

  const rawEventCategoryParams = url.searchParams
    .getAll("eventCategory")
    .map((category) => category.trim())
    .filter((category) => category.length > 0 && category !== "all");

  const eventCategoryOptions = marketCategoryPresets
    ? categoryOptionsForMarketFilter(selectedEventMarket, marketCategoryPresets, [])
    : (() => {
        const externalEventsByMarket = externalEvents.filter((ev) => {
          if (selectedEventMarket === "kr") return ev.data.market === "KRX";
          if (selectedEventMarket === "us") {
            return isUsDashboardMarket(ev.data.market);
          }
          return true;
        });
        return [...new Set(externalEventsByMarket.map((ev) => ev.data.category))].sort();
      })();

  const selectedEventCategories = usePostFilterDefaults
    ? [...DEFAULT_TIMELINE_EVENT_CATEGORIES].filter((c) => eventCategoryOptions.includes(c))
    : [...new Set(rawEventCategoryParams.filter((category) => eventCategoryOptions.includes(category)))];

  return {
    selectedEventMarket,
    selectedEventCategories,
    eventCategoryOptions,
  };
}

/** 타임라인 이벤트 스트림에서 외부 이벤트만 시장·카테고리 필터로 걸러낸다 (가격선·포스트는 유지). */
export function filterDashboardTimelineEvents(
  dashboardEvents: TimelineEvent[],
  selectedEventMarket: EventMarketFilter,
  selectedEventCategories: string[],
): TimelineEvent[] {
  return dashboardEvents.filter((ev) => {
    if (ev.kind !== "external_event") return true;
    if (selectedEventMarket === "kr" && ev.meta?.market !== "KRX") return false;
    if (selectedEventMarket === "us" && !isUsDashboardMarket(ev.meta?.market)) {
      return false;
    }
    if (selectedEventCategories.length > 0 && !selectedEventCategories.includes(ev.meta?.category ?? "")) {
      return false;
    }
    return true;
  });
}

export type DashboardHrefNext = {
  eventMarket?: string;
  eventCategoryToggle?: string;
  clearCategories?: boolean;
};

/** 같은 페이지 경로에 쿼리만 바꾼 필터 링크를 만든다 (`/` vs `/dashboard/slug`). */
export function createDashboardHref(
  filterBasePath: string,
  selectedEventMarket: EventMarketFilter,
  selectedEventCategories: string[],
  eventCategoryOptions: string[],
): (next: DashboardHrefNext) => string {
  return function dashboardHref(next: DashboardHrefNext): string {
    const params = new URLSearchParams();
    const marketValue = next.eventMarket ?? selectedEventMarket;
    const categorySet = new Set(selectedEventCategories);
    if (next.clearCategories) {
      categorySet.clear();
    }
    if (next.eventCategoryToggle && eventCategoryOptions.includes(next.eventCategoryToggle)) {
      if (categorySet.has(next.eventCategoryToggle)) categorySet.delete(next.eventCategoryToggle);
      else categorySet.add(next.eventCategoryToggle);
    }
    params.set("eventMarket", marketValue);
    [...categorySet].sort().forEach((category) => params.append("eventCategory", category));
    const qs = params.toString();
    return qs ? `${filterBasePath}?${qs}` : filterBasePath;
  };
}

/** 타임라인 이벤트만으로 선택 시장에 해당하는 카테고리 목록 (창 안의 외부 이벤트 기준) */
export function categoryOptionsFromTimeline(
  events: TimelineEvent[],
  selectedMarket: EventMarketFilter,
): string[] {
  const set = new Set<string>();
  for (const ev of events) {
    if (ev.kind !== "external_event") continue;
    const m = ev.meta?.market ?? "";
    const cat = ev.meta?.category ?? "";
    if (!cat) continue;
    if (selectedMarket === "kr") {
      if (m !== "KRX") continue;
      set.add(cat);
      continue;
    }
    if (selectedMarket === "us") {
      if (!isUsDashboardMarket(m)) continue;
      set.add(cat);
      continue;
    }
    set.add(cat);
  }
  return [...set].sort();
}

/** 브라우저 주소창만 갱신 (전체 페이지 네비게이션 없음) */
export function buildDashboardFilterUrl(
  filterBasePath: string,
  selectedEventMarket: EventMarketFilter,
  selectedEventCategories: string[],
): string {
  const params = new URLSearchParams();
  params.set("eventMarket", selectedEventMarket);
  [...selectedEventCategories].sort().forEach((category) => params.append("eventCategory", category));
  const qs = params.toString();
  return qs ? `${filterBasePath}?${qs}` : filterBasePath;
}

/**
 * `post` 등 다른 쿼리·해시는 유지한 채 시장·카테고리만 바꾼다.
 * (루트 대시보드 `/?post=slug`에서 필터 클릭 시 slug가 지워지면 서버가 다른 글을 잡아 필터가 깨진 것처럼 보임.)
 */
export function replaceDashboardFiltersInSearchParams(
  pageUrl: URL,
  selectedEventMarket: EventMarketFilter,
  selectedEventCategories: string[],
): string {
  const next = new URL(pageUrl.href);
  next.searchParams.delete("eventMarket");
  next.searchParams.delete("eventCategory");
  next.searchParams.set("eventMarket", selectedEventMarket);
  [...selectedEventCategories].sort().forEach((category) => next.searchParams.append("eventCategory", category));
  return `${next.pathname}${next.search}${next.hash}`;
}

/**
 * 타임라인 페이지와 같이 `<a href>`로만 필터를 바꿀 때 사용한다.
 * `pathWithQuery`는 `pathname + search + hash` (예: Astro에서 `${Astro.url.pathname}${Astro.url.search}${Astro.url.hash}`).
 */
export function dashboardTimelineFilterHref(
  pathWithQuery: string,
  selectedEventMarket: EventMarketFilter,
  selectedEventCategories: string[],
): string {
  const pageUrl = new URL(pathWithQuery, "https://ziin.dashboard.invalid");
  return replaceDashboardFiltersInSearchParams(pageUrl, selectedEventMarket, selectedEventCategories);
}

/** popstate·직접 URL 입력 시 필터 상태 복원 */
export function parseDashboardFiltersFromUrl(
  url: URL,
  allEvents: TimelineEvent[],
  activePostMarket: string | undefined,
  marketCategoryPresets?: MarketCategoryOptionSets,
): { market: EventMarketFilter; categories: string[] } {
  const usePostFilterDefaults = shouldUsePostBasedFilterDefaults(url);
  const market = eventMarketFilterFromUrlSearch(url, activePostMarket, usePostFilterDefaults);

  const rawEventCategoryParams = url.searchParams
    .getAll("eventCategory")
    .map((category) => category.trim())
    .filter((category) => category.length > 0 && category !== "all");

  const opts = categoryOptionsForMarketFilter(market, marketCategoryPresets, allEvents);

  const categories = usePostFilterDefaults
    ? [...DEFAULT_TIMELINE_EVENT_CATEGORIES].filter((c) => opts.includes(c))
    : [...new Set(rawEventCategoryParams.filter((category) => opts.includes(category)))];

  return { market, categories };
}

export function buildDashboardFilterPills(
  dashboardHref: (next: DashboardHrefNext) => string,
  selectedEventMarket: EventMarketFilter,
  selectedEventCategories: string[],
  eventCategoryOptions: string[],
): {
  eventMarketFilters: Array<{ label: string; href: string; active: boolean }>;
  eventCategoryFilters: Array<{ label: string; href: string; active: boolean }>;
} {
  const eventMarketFilters = [
    { label: "전체", href: dashboardHref({ eventMarket: "all" }), active: selectedEventMarket === "all" },
    { label: "미국", href: dashboardHref({ eventMarket: "us" }), active: selectedEventMarket === "us" },
    { label: "한국", href: dashboardHref({ eventMarket: "kr" }), active: selectedEventMarket === "kr" },
  ];
  const eventCategoryFilters = [
    { label: "전체", href: dashboardHref({ clearCategories: true }), active: selectedEventCategories.length === 0 },
    ...eventCategoryOptions.map((category) => ({
      label: eventCategoryLabel(category),
      href: dashboardHref({ eventCategoryToggle: category }),
      active: selectedEventCategories.includes(category),
    })),
  ];
  return { eventMarketFilters, eventCategoryFilters };
}
