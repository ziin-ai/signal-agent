import type { ChatResponse } from "./chat-client";

export const JIIN_COMPANION_RUN_EVENT = "jiin:companion-run";
export const DASHBOARD_COMPANION_ID = "dashboard-jiin-companion";

export type JiinCompanionRunDetail = {
  message: string;
  journey?: ChatResponse["journey"];
  scroll?: boolean;
};

export function dispatchJiinCompanionRun(detail: JiinCompanionRunDetail): void {
  window.dispatchEvent(
    new CustomEvent(JIIN_COMPANION_RUN_EVENT, {
      detail,
    }),
  );
}

export function scrollToDashboardCompanion(): void {
  document.getElementById(DASHBOARD_COMPANION_ID)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
