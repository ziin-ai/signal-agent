/**
 * 대시보드 타임라인 차트 좌표·경로 계산 (DashboardTimeline 로직과 동일)
 */

import type { ThemeChartLine } from "./market";
import { rankEventForDashboard, type TimelineEvent } from "./timeline";

export type PositionedWithRow = TimelineEvent & {
  pct: number;
  dotBottom: number;
  rowIdx: number;
  lane: "post" | "event";
};

export type EventLabelWithRow = TimelineEvent & {
  rowBottom: number;
};

export type TimelineChartLayout = {
  chartMode: "single" | "theme" | "theme-empty";
  priceLine: string;
  priceArea: string;
  priceSeriesLen: number;
  /** theme: 두 번째 이후 지수 선 */
  themeExtraLines?: Array<{ d: string; stroke: string; label: string }>;
  highPoint?: { t: number; price: number };
  lowPoint?: { t: number; price: number };
  highX: number;
  highY: number;
  lowX: number;
  lowY: number;
  yTickTop: number;
  yTickBottom: number;
  /** theme일 때 Y축 숫자(100 기준 상대지수) */
  yAxisKind: "price" | "rebase";
  monthGuideTicks: number[];
  positionedWithRow: PositionedWithRow[];
  eventLabelsWithRow: EventLabelWithRow[];
  highImpactEvents: TimelineEvent[];
  toXPct: (t: number) => number;
};

function formatYearMonth(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}.${m}`;
}

export { formatYearMonth };

function buildPositionedEvents(
  displayEvents: TimelineEvent[],
  priceSeries: Array<{ t: number; price: number }>,
  start: number,
  end: number,
  span: number,
  toXPct: (t: number) => number,
  symbol?: string,
): {
  positionedWithRow: PositionedWithRow[];
  eventLabelsWithRow: EventLabelWithRow[];
  highImpactEvents: TimelineEvent[];
} {
  const positioned = displayEvents.map((ev) => ({
    ...ev,
    pct: Math.min(100, Math.max(0, ((new Date(ev.at).getTime() - start) / span) * 100)),
  }));

  const minP = priceSeries.length > 0 ? Math.min(...priceSeries.map((p) => p.price)) : 0;
  const maxP = priceSeries.length > 0 ? Math.max(...priceSeries.map((p) => p.price)) : 0;
  const pSpan = Math.max(1e-9, maxP - minP);
  const toYChart = (price: number) => 10 + (1 - (price - minP) / pSpan) * 42;

  function priceBottomPctAtTime(t: number): number {
    if (priceSeries.length === 0) return 42;
    if (priceSeries.length === 1) {
      const y = toYChart(priceSeries[0]!.price);
      return Math.min(84, Math.max(20, ((64 - y) / 64) * 100));
    }
    if (t <= priceSeries[0]!.t) {
      const y = toYChart(priceSeries[0]!.price);
      return Math.min(84, Math.max(20, ((64 - y) / 64) * 100));
    }
    if (t >= priceSeries[priceSeries.length - 1]!.t) {
      const y = toYChart(priceSeries[priceSeries.length - 1]!.price);
      return Math.min(84, Math.max(20, ((64 - y) / 64) * 100));
    }
    for (let i = 1; i < priceSeries.length; i++) {
      const left = priceSeries[i - 1]!;
      const right = priceSeries[i]!;
      if (t >= left.t && t <= right.t) {
        const ratio = (t - left.t) / Math.max(1, right.t - left.t);
        const p = left.price + (right.price - left.price) * ratio;
        const y = toYChart(p);
        return Math.min(84, Math.max(20, ((64 - y) / 64) * 100));
      }
    }
    return 42;
  }

  function labelDisplayText(ev: TimelineEvent): string {
    if (ev.title.length > 20) return `${ev.title.slice(0, 20)}…`;
    return ev.title;
  }

  const eventDotRows = [6, 10, 14, 18, 22];
  const postDotOffsets = [-4, 0, 4];
  const postDotRows = [...postDotOffsets];
  const postDotRowLastEnd = postDotRows.map(() => -Infinity);
  const eventDotRowLastEnd = eventDotRows.map(() => -Infinity);
  let lastPostDotRowIdx = 0;
  let lastEventDotRowIdx = 0;

  function pickSpreadRow(
    rowLastEnd: number[],
    currentPct: number,
    minGapPct: number,
    lastRowIdx: number,
  ): number {
    const candidateRows = rowLastEnd
      .map((lastEnd, idx) => ({ idx, ok: currentPct - lastEnd >= minGapPct }))
      .filter((c) => c.ok)
      .map((c) => c.idx);
    const selectableRows = candidateRows.length > 0 ? candidateRows : rowLastEnd.map((_, idx) => idx);
    return selectableRows.reduce((bestIdx, idx) => {
      const bestDiff = Math.abs(bestIdx - lastRowIdx);
      const curDiff = Math.abs(idx - lastRowIdx);
      if (curDiff > bestDiff) return idx;
      if (curDiff === bestDiff) {
        const bestLastEnd = rowLastEnd[bestIdx];
        const curLastEnd = rowLastEnd[idx];
        return curLastEnd < bestLastEnd ? idx : bestIdx;
      }
      return bestIdx;
    }, selectableRows[0]!);
  }

  const positionedWithRow = [...positioned]
    .sort((a, b) => a.pct - b.pct)
    .map((ev) => {
      const lane = ev.kind === "post" ? "post" : "event";
      const laneRows = lane === "post" ? postDotRows : eventDotRows;
      const markerText = labelDisplayText(ev);
      const markerWidthPct = Math.min(30, Math.max(8, markerText.length * 1.1));
      const minGapPct = 1.6;
      const laneLastEnd = lane === "post" ? postDotRowLastEnd : eventDotRowLastEnd;
      const lastRowIdx = lane === "post" ? lastPostDotRowIdx : lastEventDotRowIdx;
      const rowIdx = pickSpreadRow(laneLastEnd, ev.pct, minGapPct, lastRowIdx);
      laneLastEnd[rowIdx] = ev.pct + markerWidthPct;
      if (lane === "post") lastPostDotRowIdx = rowIdx;
      else lastEventDotRowIdx = rowIdx;
      const dotBottom =
        lane === "post"
          ? Math.min(
              88,
              Math.max(16, priceBottomPctAtTime(new Date(ev.at).getTime()) + laneRows[rowIdx]!),
            )
          : laneRows[rowIdx]!;
      return { ...ev, dotBottom, rowIdx, lane };
    });

  const eventLabels = positioned.sort((a, b) => a.pct - b.pct);
  const eventLabelNudgeRows = [0, 2.2, 4.4];
  const postLabelNudgeRows = [...eventLabelNudgeRows];
  const postLabelNudgeLastEnd = postLabelNudgeRows.map(() => -Infinity);
  const eventLabelNudgeLastEnd = eventLabelNudgeRows.map(() => -Infinity);

  const eventLabelsWithRow = eventLabels.map((ev) => {
    const pinned = positionedWithRow.find((p) => p.id === ev.id);
    const lane = pinned?.lane === "post" ? "post" : "event";
    const display = labelDisplayText(ev);
    const estWidthPct = Math.min(24, Math.max(8, display.length * 1.15));
    const laneNudgeRows = lane === "post" ? postLabelNudgeRows : eventLabelNudgeRows;
    const laneNudgeLastEnd = lane === "post" ? postLabelNudgeLastEnd : eventLabelNudgeLastEnd;
    const minGapPct = 1.2;
    const candidateNudges = laneNudgeLastEnd
      .map((lastEnd, idx) => ({ idx, ok: ev.pct - lastEnd >= minGapPct }))
      .filter((c) => c.ok)
      .map((c) => c.idx);
    const nudgeIdx =
      candidateNudges.length > 0
        ? candidateNudges[0]!
        : laneNudgeLastEnd.indexOf(Math.min(...laneNudgeLastEnd));
    laneNudgeLastEnd[nudgeIdx] = ev.pct + estWidthPct;
    const rowBottom = pinned?.dotBottom ?? 10;
    return { ...ev, rowBottom };
  });

  const highImpactEvents = displayEvents
    .filter((e) => e.kind === "external_event" && e.meta?.impact === "high")
    .sort(
      (a, b) =>
        rankEventForDashboard(b, new Date(), { symbol }) - rankEventForDashboard(a, new Date(), { symbol }),
    )
    .slice(0, 3);

  return { positionedWithRow, eventLabelsWithRow, highImpactEvents };
}

function buildThemeTimelineChartLayout(
  themeLines: ThemeChartLine[],
  start: number,
  end: number,
  todayMs: number,
  span: number,
  toXPct: (t: number) => number,
): Omit<
  TimelineChartLayout,
  | "positionedWithRow"
  | "eventLabelsWithRow"
  | "highImpactEvents"
  | "toXPct"
  | "monthGuideTicks"
> & { referenceSeries: Array<{ t: number; price: number }> } {
  const processed = themeLines
    .map((line) => {
      const normalized = line.points
        .map((p) => ({
          t: new Date(p.at).getTime(),
          price: typeof p.price === "number" ? p.price : Number(p.price),
        }))
        .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.price) && p.t <= todayMs)
        .sort((a, b) => a.t - b.t);
      if (normalized.length < 2) return null;
      /** 대시보드 X축은 [start, end]; 이 구간 안의 봉만 쓰면 가격선이 0~100%에 걸림 */
      let core = normalized.filter((p) => p.t >= start);
      if (core.length < 2) core = normalized;
      const base = core[0]!.price;
      if (!Number.isFinite(base) || base === 0) return null;
      const series = core.map((p) => ({ t: p.t, price: (p.price / base) * 100 }));
      return { label: line.label, series };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  if (processed.length === 0) {
    return {
      chartMode: "theme",
      priceLine: "",
      priceArea: "",
      /** 0이면 Dashboard SVG 전체가 숨겨지므로, 기준선(referenceSeries) 표시용으로 2 유지 */
      priceSeriesLen: 2,
      themeExtraLines: [],
      highX: 0,
      highY: 0,
      lowX: 0,
      lowY: 0,
      yTickTop: 0,
      yTickBottom: 0,
      yAxisKind: "rebase",
      referenceSeries: [
        { t: start, price: 100 },
        { t: todayMs, price: 100 },
      ],
    };
  }

  const allY = processed.flatMap((p) => p.series.map((x) => x.price));
  const minP = Math.min(...allY);
  const maxP = Math.max(...allY);
  const pSpan = Math.max(1e-9, maxP - minP);
  const toYChart = (price: number) => 10 + (1 - (price - minP) / pSpan) * 42;

  const strokePalette = [
    "rgb(101 163 13 / 0.98)",
    "rgb(59 130 246 / 0.95)",
    "rgb(234 88 12 / 0.92)",
  ];

  const paths = processed.map((proc, idx) => {
    const pts = proc.series
      .map((p) => {
        const x = toXPct(p.t);
        const y = toYChart(p.price);
        return { x, y };
      })
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    const d =
      pts.length >= 2
        ? pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")
        : "";
    return { d, label: proc.label, stroke: strokePalette[idx % strokePalette.length]! };
  });

  const priceLine = paths[0]!.d;
  const themeExtraLines = paths.slice(1).map((p) => ({ d: p.d, stroke: p.stroke, label: p.label }));

  return {
    chartMode: "theme",
    priceLine,
    priceArea: "",
    priceSeriesLen: Math.max(...processed.map((p) => p.series.length)),
    themeExtraLines,
    highX: 0,
    highY: 0,
    lowX: 0,
    lowY: 0,
    yTickTop: maxP,
    yTickBottom: minP,
    yAxisKind: "rebase",
    referenceSeries: processed[0]!.series,
  };
}

export function buildTimelineChartLayout(
  displayEvents: TimelineEvent[],
  pricePoints: Array<{ at: string; price: number }>,
  windowStart: string,
  windowEnd: string,
  symbol?: string,
  themeChartLines?: ThemeChartLine[] | null,
  options?: { emptyTheme?: boolean },
): TimelineChartLayout {
  const start = new Date(windowStart).getTime();
  const end = new Date(windowEnd).getTime();
  const todayMs = Math.min(Date.now(), end);
  const span = Math.max(1, end - start);
  const toXPct = (t: number) => Math.min(100, Math.max(0, ((t - start) / span) * 100));

  const monthGuideTicks: number[] = [];
  {
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    while (cursor.getTime() <= end) {
      monthGuideTicks.push(cursor.getTime());
      cursor.setMonth(cursor.getMonth() + 4);
    }
  }

  if (options?.emptyTheme) {
    const themePart = buildThemeTimelineChartLayout([], start, end, todayMs, span, toXPct);
    const { referenceSeries, ...rest } = themePart;
    const { positionedWithRow, eventLabelsWithRow, highImpactEvents } = buildPositionedEvents(
      displayEvents,
      referenceSeries,
      start,
      end,
      span,
      toXPct,
      symbol,
    );
    return {
      ...rest,
      chartMode: "theme-empty",
      monthGuideTicks,
      positionedWithRow,
      eventLabelsWithRow,
      highImpactEvents,
      toXPct,
    };
  }

  if (themeChartLines && themeChartLines.length > 0) {
    const themePart = buildThemeTimelineChartLayout(themeChartLines, start, end, todayMs, span, toXPct);
    const { referenceSeries, ...rest } = themePart;
    const { positionedWithRow, eventLabelsWithRow, highImpactEvents } = buildPositionedEvents(
      displayEvents,
      referenceSeries,
      start,
      end,
      span,
      toXPct,
      symbol,
    );
    return {
      ...rest,
      monthGuideTicks,
      positionedWithRow,
      eventLabelsWithRow,
      highImpactEvents,
      toXPct,
    };
  }

  const normalizedPrices = pricePoints
    .map((p) => ({ t: new Date(p.at).getTime(), price: p.price }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.price))
    .sort((a, b) => a.t - b.t);

  const priceSeries =
    normalizedPrices.length === 0
      ? [
          { t: start, price: 1 },
          { t: todayMs, price: 1 },
        ]
      : normalizedPrices.length === 1
        ? [
            { t: start, price: normalizedPrices[0].price },
            { t: todayMs, price: normalizedPrices[0].price },
          ]
        : [
            ...(normalizedPrices[0].t > start ? [{ t: start, price: normalizedPrices[0].price }] : []),
            ...normalizedPrices.filter((p) => p.t <= todayMs),
            ...(normalizedPrices[normalizedPrices.length - 1].t < todayMs
              ? [{ t: todayMs, price: normalizedPrices[normalizedPrices.length - 1].price }]
              : []),
          ];

  const minP = priceSeries.length > 0 ? Math.min(...priceSeries.map((p) => p.price)) : 0;
  const maxP = priceSeries.length > 0 ? Math.max(...priceSeries.map((p) => p.price)) : 0;
  const pSpan = Math.max(1e-9, maxP - minP);
  const toYChart = (price: number) => 10 + (1 - (price - minP) / pSpan) * 42;

  const priceLine = priceSeries
    .map((p, i) => {
      const x = toXPct(p.t);
      const y = toYChart(p.price);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const priceArea = `${priceLine} L ${Math.min(100, Math.max(0, ((todayMs - start) / span) * 100)).toFixed(2)} 54 L 0 54 Z`;

  const highPoint =
    priceSeries.length > 0 ? priceSeries.reduce((a, b) => (b.price > a.price ? b : a)) : undefined;
  const lowPoint =
    priceSeries.length > 0 ? priceSeries.reduce((a, b) => (b.price < a.price ? b : a)) : undefined;
  const highX = highPoint ? toXPct(highPoint.t) : 0;
  const highY = highPoint ? toYChart(highPoint.price) : 0;
  const lowX = lowPoint ? toXPct(lowPoint.t) : 0;
  const lowY = lowPoint ? toYChart(lowPoint.price) : 0;
  const yTickTop = maxP > 0 ? Math.ceil(maxP / 10000) * 10000 : 0;
  const yTickBottom = minP > 0 ? Math.floor(minP / 10000) * 10000 : 0;

  const { positionedWithRow, eventLabelsWithRow, highImpactEvents } = buildPositionedEvents(
    displayEvents,
    priceSeries,
    start,
    end,
    span,
    toXPct,
    symbol,
  );

  const priceSeriesLen = priceSeries.length;

  return {
    chartMode: "single",
    priceLine,
    priceArea,
    priceSeriesLen,
    highPoint,
    lowPoint,
    highX,
    highY,
    lowX,
    lowY,
    yTickTop,
    yTickBottom,
    yAxisKind: "price",
    monthGuideTicks,
    positionedWithRow,
    eventLabelsWithRow,
    highImpactEvents,
    toXPct,
  };
}
