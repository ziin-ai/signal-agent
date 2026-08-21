/**
 * 홈 월 캘린더 필터.
 * 기본값 = 분석글 + High · 실적/매크로 (기존 큐레이션 유지).
 * URL에 kind|impact|category가 하나라도 있으면 명시 선택으로 해석.
 */

import type { TimelineEvent } from "./timeline";
import { eventCategoryLabel } from "./dashboard-event-filters";

export const HOME_CAL_DEFAULT_INCLUDE_POSTS = true;
export const HOME_CAL_DEFAULT_IMPACTS = ["high"] as const;
export const HOME_CAL_DEFAULT_CATEGORIES = ["earnings", "macro"] as const;

/** 홈에 노출하는 카테고리 칩 (타임라인 전체 목록보다 축소) */
export const HOME_CAL_CATEGORY_OPTIONS = ["earnings", "macro", "policy"] as const;

export type HomeCalendarFilterState = {
  includePosts: boolean;
  impacts: string[];
  categories: string[];
  /** URL에 필터 파라미터가 있어 기본값이 아닌 경우 */
  isCustom: boolean;
};

export function hasExplicitHomeCalendarFilters(url: URL): boolean {
  const sp = url.searchParams;
  return sp.has("kind") || sp.has("impact") || sp.has("category");
}

export function resolveHomeCalendarFilters(url: URL): HomeCalendarFilterState {
  if (!hasExplicitHomeCalendarFilters(url)) {
    return {
      includePosts: HOME_CAL_DEFAULT_INCLUDE_POSTS,
      impacts: [...HOME_CAL_DEFAULT_IMPACTS],
      categories: [...HOME_CAL_DEFAULT_CATEGORIES],
      isCustom: false,
    };
  }

  const kinds = [...new Set(url.searchParams.getAll("kind"))];
  const impacts = [...new Set(url.searchParams.getAll("impact"))].filter(
    (k): k is "high" | "mid" | "low" => k === "high" || k === "mid" || k === "low",
  );
  const allowed = new Set<string>(HOME_CAL_CATEGORY_OPTIONS);
  const categories = [...new Set(url.searchParams.getAll("category"))].filter((c) => allowed.has(c));

  return {
    // kind 파라미터가 있으면 post 포함 여부로 글 on/off. kind 자체가 없으면(impact/category만) 글 유지.
    includePosts: kinds.length > 0 ? kinds.includes("post") : true,
    impacts,
    categories,
    isCustom: true,
  };
}

/**
 * 글은 includePosts만 본다.
 * 이벤트는 impact·category 축이 비어 있으면 숨김(칩을 모두 끈 상태).
 * 축이 채워져 있으면 AND — 선택한 impact와 category를 모두 만족해야 함.
 */
export function filterHomeCalendarEvents(
  events: TimelineEvent[],
  state: Pick<HomeCalendarFilterState, "includePosts" | "impacts" | "categories">,
): TimelineEvent[] {
  const { includePosts, impacts, categories } = state;
  const showEvents = impacts.length > 0 && categories.length > 0;

  return events.filter((ev) => {
    if (ev.kind === "post") return includePosts;
    if (ev.kind !== "external_event") return false;
    if (!showEvents) return false;
    if (!ev.meta?.impact || !impacts.includes(ev.meta.impact)) return false;
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

/** 칩 활성 스타일 — 타임라인과 동일 톤 */
export function homeCalChipClass(active: boolean): string {
  return active
    ? "border-primary bg-primary text-on-primary"
    : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container";
}
