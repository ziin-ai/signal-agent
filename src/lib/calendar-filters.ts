/**
 * 홈 월 캘린더 필터.
 * 축: 글 · 이벤트 (이벤트 종류 = 실적 / 매크로 / 정책).
 * 기본값 = 글 + 이벤트(High) · 실적/매크로/정책 (칩 전부 선택).
 * URL에 kind|category가 있으면 명시 선택으로 해석.
 */

import type { TimelineEvent } from "./timeline";
import { eventCategoryLabel } from "./dashboard-event-filters";

export const HOME_CAL_DEFAULT_INCLUDE_POSTS = true;
export const HOME_CAL_DEFAULT_INCLUDE_EVENTS = true;
/** 기본 = 노출 칩 전부 (실적·매크로·정책) */
export const HOME_CAL_DEFAULT_CATEGORIES = ["earnings", "macro", "policy"] as const;

/** 홈 캘린더는 High 영향도 이벤트만 (칩으로 노출하지 않음) */
export const HOME_CAL_EVENT_IMPACT = "high" as const;

/** 이벤트 하위 종류 칩 */
export const HOME_CAL_CATEGORY_OPTIONS = ["earnings", "macro", "policy"] as const;

export type HomeCalendarFilterState = {
  includePosts: boolean;
  includeEvents: boolean;
  categories: string[];
  /** URL에 필터 파라미터가 있어 기본값이 아닌 경우 */
  isCustom: boolean;
};

export function hasExplicitHomeCalendarFilters(url: URL): boolean {
  const sp = url.searchParams;
  return sp.has("kind") || sp.has("category");
}

export function resolveHomeCalendarFilters(url: URL): HomeCalendarFilterState {
  if (!hasExplicitHomeCalendarFilters(url)) {
    return {
      includePosts: HOME_CAL_DEFAULT_INCLUDE_POSTS,
      includeEvents: HOME_CAL_DEFAULT_INCLUDE_EVENTS,
      categories: [...HOME_CAL_DEFAULT_CATEGORIES],
      isCustom: false,
    };
  }

  const kinds = [...new Set(url.searchParams.getAll("kind"))];
  const allowed = new Set<string>(HOME_CAL_CATEGORY_OPTIONS);
  const categories = [...new Set(url.searchParams.getAll("category"))].filter((c) => allowed.has(c));

  // kind가 없으면(category만) 글·이벤트 모두 켠 상태로 보고 종류만 커스텀
  const includePosts = kinds.length > 0 ? kinds.includes("post") : true;
  const includeEvents = kinds.length > 0 ? kinds.includes("external_event") : true;

  return {
    includePosts,
    includeEvents,
    categories,
    isCustom: true,
  };
}

/**
 * 글 = includePosts.
 * 이벤트 = includeEvents + High + 선택한 종류(category).
 * 종류 칩이 전부 꺼지면 이벤트는 표시하지 않음.
 */
export function filterHomeCalendarEvents(
  events: TimelineEvent[],
  state: Pick<HomeCalendarFilterState, "includePosts" | "includeEvents" | "categories">,
): TimelineEvent[] {
  const { includePosts, includeEvents, categories } = state;
  const showEvents = includeEvents && categories.length > 0;

  return events.filter((ev) => {
    if (ev.kind === "post") return includePosts;
    if (ev.kind !== "external_event") return false;
    if (!showEvents) return false;
    if (ev.meta?.impact !== HOME_CAL_EVENT_IMPACT) return false;
    if (!ev.meta?.category || !categories.includes(ev.meta.category)) return false;
    return true;
  });
}

export function toggleListMember(list: string[], id: string): string[] {
  const s = new Set(list);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  return [...s];
}

export function homeCalCategoryLabel(category: string): string {
  return eventCategoryLabel(category);
}

export function homeCalChipClass(active: boolean): string {
  return active
    ? "border-primary bg-primary text-on-primary"
    : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container";
}
