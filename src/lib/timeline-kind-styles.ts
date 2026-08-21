/** 분석글 vs 외부 이벤트 — 색·라벨·영향도 공통 토큰 (캘린더·주간 아젠다 공유) */

import { eventCategoryLabel } from "./dashboard-event-filters";

export type TimelineKind = "post" | "external_event" | string;

export type TimelineImpact = "high" | "mid" | "low" | string | undefined;

export type TimelineLabelSource = {
  kind: TimelineKind;
  meta?: { category?: string; impact?: string };
};

/** 캘린더·리스트 배지 짧은 라벨 (글 / 실적 / 매크로 …) */
export function kindShortLabel(kind: TimelineKind, category?: string): string {
  if (kind === "post") return "글";
  if (kind === "external_event") return eventCategoryLabel(category ?? "");
  return "기타";
}

export function kindLongLabel(kind: TimelineKind, category?: string): string {
  if (kind === "post") return "분석글";
  if (kind === "external_event") return eventCategoryLabel(category ?? "");
  return "기타";
}

export function timelineItemShortLabel(ev: TimelineLabelSource): string {
  return kindShortLabel(ev.kind, ev.meta?.category);
}

export function timelineItemLongLabel(ev: TimelineLabelSource): string {
  return kindLongLabel(ev.kind, ev.meta?.category);
}

export function resolveItemImpact(ev: TimelineLabelSource): TimelineImpact {
  if (ev.kind === "post") return "mid";
  return ev.meta?.impact;
}

/** 캘린더 칸·리스트 행 배경 (kind 기반 — 월간 density 레거시) */
export function kindSurfaceClass(kind: TimelineKind): string {
  if (kind === "post") {
    return "bg-sky-50 text-sky-950 ring-1 ring-inset ring-sky-200/90 hover:bg-sky-100 dark:bg-sky-950/45 dark:text-sky-50 dark:ring-sky-700/80 dark:hover:bg-sky-900/55";
  }
  if (kind === "external_event") {
    return "bg-orange-50 text-orange-950 ring-1 ring-inset ring-orange-200/90 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-50 dark:ring-orange-700/70 dark:hover:bg-orange-900/50";
  }
  return "bg-surface-container text-on-surface ring-1 ring-inset ring-outline-variant";
}

/**
 * 아젠다 행 표면 — 영향도 우선, kind는 accent만.
 * High > Mid > Low/글.
 */
export function agendaRowClass(ev: TimelineLabelSource): string {
  const impact = resolveItemImpact(ev);
  const isPost = ev.kind === "post";
  const base =
    "block rounded-md3-sm border-l-[3px] px-3.5 py-3 transition hover:bg-surface-container/80";

  if (isPost) {
    return `${base} border-l-sky-500 bg-sky-50/50 dark:bg-sky-950/25`;
  }
  if (impact === "high") {
    return `${base} border-l-primary bg-primary/[0.08] shadow-sm`;
  }
  if (impact === "low") {
    return `${base} border-l-outline-variant/80 bg-surface-container-low/40 opacity-90`;
  }
  // mid / unknown events
  return `${base} border-l-orange-400/80 bg-surface-container-lowest`;
}

export function agendaTitleClass(ev: TimelineLabelSource): string {
  const impact = resolveItemImpact(ev);
  if (ev.kind === "post") {
    return "text-[15px] font-medium leading-relaxed tracking-[-0.015em] text-on-surface";
  }
  if (impact === "high") {
    return "text-[16px] font-semibold leading-relaxed tracking-[-0.02em] text-on-surface";
  }
  if (impact === "low") {
    return "text-[14px] font-medium leading-relaxed text-on-surface-variant";
  }
  return "text-[15px] font-medium leading-relaxed tracking-[-0.015em] text-on-surface";
}

export function agendaMetaClass(ev: TimelineLabelSource): string {
  const impact = resolveItemImpact(ev);
  if (impact === "high") return "text-[12px] font-medium text-primary";
  if (impact === "low") return "text-[11px] text-on-surface-variant/70";
  return "text-[12px] text-on-surface-variant";
}

/** 작은 배지 (글 / 실적·매크로 등) — 영향도에 따라 채도 조절 */
export function kindBadgeClass(kind: TimelineKind, impact?: TimelineImpact): string {
  if (kind === "post") {
    return "bg-sky-600/90 text-white dark:bg-sky-500";
  }
  if (kind === "external_event") {
    if (impact === "high") return "bg-primary text-on-primary";
    if (impact === "low") return "bg-on-surface-variant/55 text-white";
    return "bg-orange-600/85 text-white dark:bg-orange-500";
  }
  return "bg-on-surface-variant text-white";
}

export function kindDotClass(kind: TimelineKind, impact?: TimelineImpact): string {
  if (kind === "post") return "bg-sky-600";
  if (kind === "external_event") {
    if (impact === "high") return "bg-primary";
    if (impact === "low") return "bg-outline";
    return "bg-orange-500";
  }
  return "bg-on-surface-variant";
}

/** 월간 density: High 우선 정렬용 가중치 */
export function impactSortWeight(ev: TimelineLabelSource): number {
  if (ev.kind === "post") return 1;
  const impact = ev.meta?.impact;
  if (impact === "high") return 3;
  if (impact === "mid") return 2;
  if (impact === "low") return 0;
  return 1;
}
