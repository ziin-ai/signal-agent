import React, { useMemo, useState } from "react";

export type ChartMarker = { at: string; kind: string };
export type FallbackPricePoint = { at: string; price: number };

interface Props {
  symbol: string;
  markers?: ChartMarker[];
  fallbackPoints?: FallbackPricePoint[];
}

function markerColor(kind: string): string {
  if (kind === "post") return "rgb(59 130 246)";
  if (kind === "external_event") return "rgb(99 102 241)";
  return "rgb(148 163 184)";
}

function closestBarIndex(timestamps: number[], targetMs: number): number {
  if (timestamps.length === 0) return 0;
  const first = timestamps[0] * 1000;
  const last = timestamps[timestamps.length - 1] * 1000;
  if (targetMs <= first) return 0;
  if (targetMs >= last) return timestamps.length - 1;
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < timestamps.length; i++) {
    const d = Math.abs(timestamps[i] * 1000 - targetMs);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return best;
}

export default function SymbolTimelineChart({ symbol: _symbol, markers = [], fallbackPoints = [] }: Props) {
  const [err] = useState(false);

  const w = 280;
  const h = 72;
  const pad = 4;
  const fallbackSeries = useMemo(() => {
    const normalized = fallbackPoints
      .map((p) => ({ t: new Date(p.at).getTime(), c: p.price }))
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.c))
      .sort((a, b) => a.t - b.t);
    if (normalized.length < 2) return { closes: [] as number[], timestamps: [] as number[] };
    const closes2 = normalized.slice(-64).map((p) => p.c);
    const timestamps2 = normalized.slice(-64).map((p) => Math.floor(p.t / 1000));
    return { closes: closes2, timestamps: timestamps2 };
  }, [fallbackPoints]);
  const useFallback = fallbackSeries.closes.length >= 2;
  const chartCloses = fallbackSeries.closes;
  const chartTimestamps = fallbackSeries.timestamps;
  const noData = chartCloses.length < 2;

  const markerLines = useMemo(() => {
    if (chartCloses.length < 2 || chartTimestamps.length !== chartCloses.length || markers.length === 0) return [];
    const innerW = w - pad * 2;
    const maxMarks = 24;
    const usedBar = new Set<number>();
    const lines: { x: number; color: string; key: string }[] = [];
    for (const m of markers) {
      const t = new Date(m.at).getTime();
      if (!Number.isFinite(t)) continue;
      const i = closestBarIndex(chartTimestamps, t);
      if (usedBar.has(i)) continue;
      usedBar.add(i);
      const x = pad + (i / (chartCloses.length - 1)) * innerW;
      lines.push({ x, color: markerColor(m.kind), key: `${m.at}-${m.kind}-${i}` });
      if (lines.length >= maxMarks) break;
    }
    return lines;
  }, [chartCloses, chartTimestamps, markers, w, pad]);

  if (noData) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500 dark:border-slate-600 dark:text-slate-400">
        이 심볼에 대한 차트 데이터를 불러오지 못했습니다.
      </p>
    );
  }

  const min = Math.min(...chartCloses);
  const max = Math.max(...chartCloses);
  const span = Math.max(1e-9, max - min);
  const pts = chartCloses
    .map((c, i) => {
      const x = pad + (i / (chartCloses.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (c - min) / span) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">최근 3개월 종가 (일봉)</p>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-emerald-600 dark:text-emerald-400">
        <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" points={pts} />
        {markerLines.map((m) => (
          <line
            key={m.key}
            x1={m.x}
            y1={pad}
            x2={m.x}
            y2={h - pad}
            stroke={m.color}
            strokeWidth={1}
            opacity={0.45}
          />
        ))}
      </svg>
      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
        최저 {min.toLocaleString("ko-KR")} → 최고 {max.toLocaleString("ko-KR")}
        {markers.length > 0 && chartTimestamps.length === chartCloses.length ? " · 세로선: 타임라인 이벤트(일 단위)" : ""}
        {useFallback ? " · 네트워크 폴백(내부 기록 기준)" : ""}
        {err && !useFallback ? " · 외부 시세 API 응답 지연" : ""}
      </p>
    </div>
  );
}
