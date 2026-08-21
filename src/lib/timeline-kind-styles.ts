/** 분석글 vs 외부 이벤트 — 색·라벨 공통 토큰 (캘린더·주간 리스트 공유) */

export type TimelineKind = "post" | "external_event" | string;

export function kindShortLabel(kind: TimelineKind): string {
  if (kind === "post") return "글";
  if (kind === "external_event") return "이벤트";
  return "기타";
}

export function kindLongLabel(kind: TimelineKind): string {
  if (kind === "post") return "분석글";
  if (kind === "external_event") return "이벤트";
  return "기타";
}

/** 캘린더 칸·리스트 행 배경 */
export function kindSurfaceClass(kind: TimelineKind): string {
  if (kind === "post") {
    return "bg-sky-50 text-sky-950 ring-1 ring-inset ring-sky-200/90 hover:bg-sky-100 dark:bg-sky-950/45 dark:text-sky-50 dark:ring-sky-700/80 dark:hover:bg-sky-900/55";
  }
  if (kind === "external_event") {
    return "bg-orange-50 text-orange-950 ring-1 ring-inset ring-orange-200/90 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-50 dark:ring-orange-700/70 dark:hover:bg-orange-900/50";
  }
  return "bg-surface-container text-on-surface ring-1 ring-inset ring-outline-variant";
}

/** 작은 배지 (글 / 이벤트) */
export function kindBadgeClass(kind: TimelineKind): string {
  if (kind === "post") {
    return "bg-sky-600 text-white dark:bg-sky-500";
  }
  if (kind === "external_event") {
    return "bg-orange-600 text-white dark:bg-orange-500";
  }
  return "bg-on-surface-variant text-white";
}

export function kindDotClass(kind: TimelineKind): string {
  if (kind === "post") return "bg-sky-600";
  if (kind === "external_event") return "bg-orange-600";
  return "bg-on-surface-variant";
}
