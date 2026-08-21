/** 일요일 시작 주차 그리드 (Google Calendar 월 보기: 열 순서 일~토, 6주 × 7열) */

export type MonthGridDay = {
  year: number;
  /** URL·표시에 쓰는 “보고 있는 달” (1–12) */
  month: number;
  /** 셀 날짜가 속한 실제 달 (1–12) */
  calendarMonth: number;
  day: number;
  inMonth: boolean;
  /** YYYY-MM-DD (로컬 날짜 기준) */
  isoKey: string;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function localIsoKey(year: number, monthIndex0: number, day: number): string {
  return `${year}-${pad2(monthIndex0 + 1)}-${pad2(day)}`;
}

/**
 * @param year 연도
 * @param month 1–12 (표시 중인 달)
 */
export function buildGregorianMonthGrid(year: number, month: number): MonthGridDay[] {
  const monthIndex0 = month - 1;
  const first = new Date(year, monthIndex0, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();

  const cells: MonthGridDay[] = [];

  const prevLast = new Date(year, monthIndex0, 0);
  const prevYear = prevLast.getFullYear();
  const prevMonthIdx = prevLast.getMonth();
  const prevDaysInMonth = prevLast.getDate();

  for (let i = 0; i < startDow; i++) {
    const day = prevDaysInMonth - startDow + i + 1;
    cells.push({
      year: prevYear,
      month,
      calendarMonth: prevMonthIdx + 1,
      day,
      inMonth: false,
      isoKey: localIsoKey(prevYear, prevMonthIdx, day),
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      year,
      month,
      calendarMonth: month,
      day: d,
      inMonth: true,
      isoKey: localIsoKey(year, monthIndex0, d),
    });
  }

  const cursor = new Date(year, monthIndex0 + 1, 1);
  while (cells.length < 42) {
    cells.push({
      year: cursor.getFullYear(),
      month,
      calendarMonth: cursor.getMonth() + 1,
      day: cursor.getDate(),
      inMonth: false,
      isoKey: localIsoKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return cells;
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** YYYY-MM-DD → Date (로컬 자정) */
export function parseLocalIsoKey(isoKey: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoKey)) return null;
  const [y, m, d] = isoKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 선택일이 속한 주(일~토)의 isoKey 7개.
 * 캘린더 그리드와 동일하게 일요일 시작.
 */
export function weekIsoKeysContaining(isoKey: string): string[] {
  const date = parseLocalIsoKey(isoKey);
  if (!date) return [];
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    keys.push(localIsoKey(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return keys;
}

export function weekRangeLabel(weekKeys: string[]): string {
  if (weekKeys.length < 7) return "";
  const start = parseLocalIsoKey(weekKeys[0]!);
  const end = parseLocalIsoKey(weekKeys[6]!);
  if (!start || !end) return "";
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString(
    "ko-KR",
    sameMonth ? { day: "numeric" } : { month: "long", day: "numeric" },
  );
  return `${startLabel} – ${endLabel}`;
}
