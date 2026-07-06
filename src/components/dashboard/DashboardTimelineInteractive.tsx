import { useEffect, useMemo, useState } from "react";
import type { TimelineEvent } from "../../lib/timeline";
import {
  type EventMarketFilter,
  categoryOptionsForMarketFilter,
  dashboardTimelineFilterHref,
  eventCategoryLabel,
  filterDashboardTimelineEvents,
  type MarketCategoryOptionSets,
  parseDashboardFiltersFromUrl,
} from "../../lib/dashboard-event-filters";
import { themeIndexDefinitions, type ThemeChartLine } from "../../lib/market";
import { buildTimelineChartLayout, formatYearMonth } from "../../lib/timeline-chart-layout";

export interface Props {
  allEvents: TimelineEvent[];
  windowStart: string;
  windowEnd: string;
  todayPct: number;
  pricePoints: Array<{ at: string; price: number }>;
  /** symbol이 THEME일 때 시장별 지수 시계열 */
  themeChartLines?: ThemeChartLine[];
  /** THEME 글: 지수 데이터 유무에 따라 레이아웃·범례 분기 */
  timelineChartVariant?: "stock" | "theme" | "theme-empty";
  symbol?: string;
  market?: "KRX" | "NASDAQ" | "NYSE" | "AMEX" | "OTC";
  currentPrice?: number;
  priceDataStatusMessage?: string;
  rootPath: string;
  /** 현재 요청의 `pathname+search+hash` — 필터 칩 `<a href>`에 사용 (타임라인 페이지와 동일한 링크 네비 패턴) */
  filterPathAndQuery: string;
  initialMarket: EventMarketFilter;
  initialCategories: string[];
  /** 글 스코프와 무관하게 events 컬렉션+기간으로 계산한 카테고리 칩 (미국 필터 시 빈 목록 방지) */
  marketCategoryOptions?: MarketCategoryOptionSets;
}

function withBase(rootPath: string, href: string): string {
  if (!href.startsWith("/")) return href;
  return `${rootPath}${href.slice(1)}`;
}

/** 페이지당 타임라인 1개 — useId()는 Astro SSR와 클라이언트에서 달라져 하이드레이션 실패·블록 공백을 일으킬 수 있음 */
const PRICE_GRADIENT_DOM_ID = "ziin-dashboard-timeline-price-fill";

/** 지수(THEME) 모드 가격선 — viewBox 왜곡과 무관하게 얇은 헤어라인(px) */
const THEME_INDEX_STROKE_PX = 0.28;

/** View Transition·popstate 후 URL과 props 불일치 방지 — 필터·href 기준 경로를 주소창에서 재동기화 */
function useDashboardFilterSync(
  filterPathAndQuery: string,
  initialMarket: EventMarketFilter,
  initialCategories: string[],
  postMarket: Props["market"],
  allEvents: TimelineEvent[],
  marketCategoryOptions?: MarketCategoryOptionSets,
): {
  pathWithQuery: string;
  marketFilter: EventMarketFilter;
  categories: string[];
} {
  const [urlRevision, setUrlRevision] = useState(0);

  useEffect(() => {
    const bump = () => setUrlRevision((n) => n + 1);
    document.addEventListener("astro:page-load", bump);
    window.addEventListener("popstate", bump);
    return () => {
      document.removeEventListener("astro:page-load", bump);
      window.removeEventListener("popstate", bump);
    };
  }, []);

  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
        pathWithQuery: filterPathAndQuery,
        marketFilter: initialMarket,
        categories: initialCategories ?? [],
      };
    }
    const pageUrl = new URL(window.location.href);
    const parsed = parseDashboardFiltersFromUrl(pageUrl, allEvents, postMarket, marketCategoryOptions);
    return {
      pathWithQuery: `${pageUrl.pathname}${pageUrl.search}${pageUrl.hash}`,
      marketFilter: parsed.market,
      categories: parsed.categories,
    };
  }, [
    urlRevision,
    filterPathAndQuery,
    initialMarket,
    initialCategories,
    postMarket,
    allEvents,
    marketCategoryOptions,
  ]);
}

export default function DashboardTimelineInteractive({
  allEvents,
  windowStart,
  windowEnd,
  todayPct,
  pricePoints,
  themeChartLines,
  timelineChartVariant: timelineChartVariantProp = "stock",
  symbol,
  market,
  currentPrice,
  priceDataStatusMessage,
  rootPath,
  filterPathAndQuery,
  initialMarket,
  initialCategories,
  marketCategoryOptions,
}: Props) {
  const { pathWithQuery, marketFilter, categories } = useDashboardFilterSync(
    filterPathAndQuery,
    initialMarket,
    initialCategories,
    market,
    allEvents,
    marketCategoryOptions,
  );

  const currency = market === "KRX" ? "KRW" : "USD";
  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(currency === "KRW" ? "ko-KR" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "KRW" ? 0 : 2,
      }),
    [currency],
  );

  function formatMoney(n?: number): string {
    if (typeof n !== "number" || !Number.isFinite(n)) return "-";
    return moneyFormatter.format(n);
  }

  const filteredEvents = useMemo(
    () => filterDashboardTimelineEvents(allEvents, marketFilter, categories),
    [allEvents, marketFilter, categories],
  );

  const categoryOpts = useMemo(
    () => categoryOptionsForMarketFilter(marketFilter, marketCategoryOptions, allEvents),
    [allEvents, marketFilter, marketCategoryOptions],
  );

  /**
   * 차트 모드: 서버(Astro)가 계산한 `timelineChartVariant`를 우선한다.
   * 클라이언트에서 `symbol`만 빠지는 경우가 있어 symbol만으로 THEME 판별하면 항상 종목 모드로 떨어져 ₩1 기준선이 된다.
   */
  const chartVariant: "stock" | "theme" | "theme-empty" = (() => {
    const fromServer = timelineChartVariantProp;
    const symTheme = String(symbol ?? "")
      .trim()
      .toUpperCase() === "THEME";

    if (fromServer === "theme" || fromServer === "theme-empty") {
      if (fromServer === "theme" && !themeChartLines?.length) return "theme-empty";
      return fromServer;
    }
    if (symTheme) {
      return themeChartLines?.length ? "theme" : "theme-empty";
    }
    return "stock";
  })();

  const layout = useMemo(
    () =>
      buildTimelineChartLayout(
        filteredEvents,
        pricePoints,
        windowStart,
        windowEnd,
        symbol,
        chartVariant === "theme" && themeChartLines?.length ? themeChartLines : null,
        { emptyTheme: chartVariant === "theme-empty" },
      ),
    [filteredEvents, pricePoints, themeChartLines, chartVariant, windowStart, windowEnd, symbol],
  );

  const themeLastQuotes = useMemo(() => {
    if (!themeChartLines?.length) return [];
    return themeChartLines
      .map((line) => {
        const p = line.points[line.points.length - 1];
        return p ? { label: line.label, price: p.price } : null;
      })
      .filter((x): x is { label: string; price: number } => x != null);
  }, [themeChartLines]);

  const chartSymbolLabel =
    symbol?.trim().toUpperCase() === "THEME"
      ? themeChartLines?.length
        ? themeChartLines.map((l) => l.label).join(" · ")
        : themeIndexDefinitions(market).map((d) => d.label).join(" · ")
      : symbol;

  function categoriesAfterMarketSwitch(nextMarket: EventMarketFilter): string[] {
    const opts = categoryOptionsForMarketFilter(nextMarket, marketCategoryOptions, allEvents);
    return categories.filter((c) => opts.includes(c));
  }

  function hrefForMarket(nextMarket: EventMarketFilter): string {
    return dashboardTimelineFilterHref(pathWithQuery, nextMarket, categoriesAfterMarketSwitch(nextMarket));
  }

  function hrefClearCategories(): string {
    return dashboardTimelineFilterHref(pathWithQuery, marketFilter, []);
  }

  function hrefToggleCategory(cat: string): string {
    const next = new Set(categories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    const nextArr = [...next].sort();
    return dashboardTimelineFilterHref(pathWithQuery, marketFilter, nextArr);
  }

  function kindDotClass(kind: TimelineEvent["kind"]): string {
    if (kind === "post") return "bg-sky-500 ring-sky-200 dark:ring-sky-900";
    if (kind === "external_event") return "bg-orange-500 ring-orange-200 dark:ring-orange-900";
    return "bg-slate-500 ring-slate-200 dark:ring-slate-700";
  }

  function markerShapeClass(kind: TimelineEvent["kind"]): string {
    return kind === "post" ? "rotate-45 rounded-[2px]" : "rounded-full";
  }

  function labelDisplayText(ev: TimelineEvent): string {
    if (ev.title.length > 20) return `${ev.title.slice(0, 20)}…`;
    return ev.title;
  }

  const pillInactive =
    "border-slate-200 bg-white text-slate-700 hover:border-info/50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";
  const pillActive = "border-info bg-info/15 text-info";

  /** theme-empty·지수 가공 실패 시에도 priceSeriesLen≥2로 두지만, 조건을 명시해 그리드·축이 항상 보이게 함 */
  const showChartSvg =
    layout.chartMode === "theme" ||
    layout.chartMode === "theme-empty" ||
    layout.priceSeriesLen >= 2;

  return (
    <div className="rounded-xl border border-slate-200 bg-secondary/20 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="font-sans text-xl font-semibold tracking-tight">최근 흐름</h2>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
        <p>
          <span className="font-semibold text-info">Today</span> 기준 · 과거 8개월 + 예정 4개월
        </p>
        <a href={`${rootPath}timeline`} className="shrink-0 font-medium text-info hover:underline">
          전체 타임라인 →
        </a>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap gap-1.5"></div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          {themeLastQuotes.length > 0 ? (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {themeLastQuotes.map((q) => (
                <span key={q.label}>
                  <span className="text-slate-500">{q.label}</span>{" "}
                  <b className="font-mono text-emerald-600 dark:text-emerald-400">{formatMoney(q.price)}</b>
                </span>
              ))}
            </span>
          ) : (
            currentPrice !== undefined && (
              <span>
                현재{" "}
                <b className="font-mono text-emerald-600 dark:text-emerald-400">{formatMoney(currentPrice)}</b>
              </span>
            )
          )}
          {chartSymbolLabel && <span className="font-mono text-slate-500">{chartSymbolLabel}</span>}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600 dark:text-slate-300">
        {layout.chartMode === "theme" && themeChartLines?.length ? (
          <>
            <span className="text-slate-500 dark:text-slate-400">지수(시작=100):</span>
            {themeChartLines.map((line, idx) => (
              <span key={line.label} className="inline-flex items-center gap-1">
                <span
                  className="h-1.5 w-4 rounded"
                  style={{
                    backgroundColor:
                      idx === 0
                        ? "rgb(101 163 13)"
                        : idx === 1
                          ? "rgb(59 130 246)"
                          : "rgb(234 88 12)",
                  }}
                />
                {line.label}
              </span>
            ))}
          </>
        ) : layout.chartMode === "theme-empty" ? (
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-500 dark:text-slate-400">
            <span>
              지수 선({themeIndexDefinitions(market).map((d) => d.label).join(" · ")})
            </span>
            <span className="text-amber-600 dark:text-amber-400">· 데이터 없음</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-4 rounded bg-lime-600"></span>
            가격선
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rotate-45 rounded-[2px] bg-sky-500 ring-1 ring-sky-200 dark:ring-sky-900"></span>
          post
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500 ring-1 ring-orange-200 dark:ring-orange-900"></span>
          이벤트
        </span>
      </div>

      {priceDataStatusMessage && (
        <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">{priceDataStatusMessage}</p>
      )}

      {layout.highImpactEvents.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">High impact:</span>
          {layout.highImpactEvents.map((ev) => (
            <a
              key={ev.id}
              href={ev.href ? withBase(rootPath, ev.href) : `${rootPath}timeline`}
              className="rounded-full border border-indigo-300 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
              {...(ev.href && !ev.href.startsWith("/") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              title={ev.summary ?? ev.title}
            >
              {new Date(ev.at).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })} · {ev.title}
            </a>
          ))}
        </div>
      )}

      <div className="relative z-10 mt-3 border-b border-slate-200/80 pb-3 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-slate-500 dark:text-slate-400">시장:</span>
          {(
            [
              { label: "전체", value: "all" as const },
              { label: "미국", value: "us" as const },
              { label: "한국", value: "kr" as const },
            ] as const
          ).map(({ label, value }) => (
            <a
              key={value}
              href={hrefForMarket(value)}
              aria-current={marketFilter === value ? "true" : undefined}
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs no-underline ${
                marketFilter === value ? pillActive : pillInactive
              }`}
            >
              {label}
            </a>
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-slate-500 dark:text-slate-400">카테고리:</span>
          <a
            href={hrefClearCategories()}
            aria-current={categories.length === 0 ? "true" : undefined}
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs no-underline ${
              categories.length === 0 ? pillActive : pillInactive
            }`}
          >
            전체
          </a>
          {categoryOpts.map((cat) => (
            <a
              key={cat}
              href={hrefToggleCategory(cat)}
              aria-current={categories.includes(cat) ? "true" : undefined}
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs no-underline ${
                categories.includes(cat) ? pillActive : pillInactive
              }`}
            >
              {eventCategoryLabel(cat)}
            </a>
          ))}
        </div>
      </div>

      <div className="relative mt-4">
        <div className="relative h-64 overflow-hidden rounded-xl bg-slate-100/85 dark:bg-slate-900/80" aria-hidden="true">
          {showChartSvg && (
            <svg
              viewBox="0 0 100 64"
              className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={PRICE_GRADIENT_DOM_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(132 204 22 / 0.45)" />
                  <stop offset="100%" stopColor="rgb(132 204 22 / 0.06)" />
                </linearGradient>
              </defs>
              <line x1="0" y1="8" x2="100" y2="8" stroke="rgb(148 163 184 / 0.22)" strokeWidth="0.3" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgb(148 163 184 / 0.22)" strokeWidth="0.3" />
              <line x1="0" y1="32" x2="100" y2="32" stroke="rgb(148 163 184 / 0.22)" strokeWidth="0.3" />
              <line x1="0" y1="44" x2="100" y2="44" stroke="rgb(148 163 184 / 0.22)" strokeWidth="0.3" />
              <line x1="0" y1="56" x2="100" y2="56" stroke="rgb(148 163 184 / 0.22)" strokeWidth="0.3" />
              {layout.monthGuideTicks.map((t) => {
                const x = layout.toXPct(t);
                return (
                  <line
                    key={t}
                    x1={x}
                    y1="8"
                    x2={x}
                    y2="56"
                    stroke="rgb(148 163 184 / 0.2)"
                    strokeWidth="0.35"
                    strokeDasharray="1.2 1.4"
                  />
                );
              })}
              {layout.priceArea ? (
                <path d={layout.priceArea} fill={`url(#${PRICE_GRADIENT_DOM_ID})`} />
              ) : null}
              {layout.priceLine ? (
                <path
                  d={layout.priceLine}
                  fill="none"
                  stroke="rgb(101 163 13 / 0.98)"
                  strokeWidth={
                    layout.chartMode === "single" ? 0.35 : THEME_INDEX_STROKE_PX
                  }
                  vectorEffect={layout.chartMode === "single" ? undefined : "nonScalingStroke"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {layout.themeExtraLines?.map((line) => (
                <path
                  key={line.label}
                  d={line.d}
                  fill="none"
                  stroke={line.stroke}
                  strokeWidth={THEME_INDEX_STROKE_PX}
                  vectorEffect="nonScalingStroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>
          )}
          <div
            className="pointer-events-none absolute bottom-0 right-0 top-0 z-[1] bg-slate-100/45 dark:bg-slate-900/30"
            style={{ left: `${todayPct}%` }}
          />
          {layout.monthGuideTicks.map((t) => {
            const x = layout.toXPct(t);
            return (
              <span
                key={`lbl-${t}`}
                className="pointer-events-none absolute bottom-1 z-[6] -translate-x-1/2 text-[9px] text-slate-400 dark:text-slate-500"
                style={{ left: `${x}%` }}
              >
                {formatYearMonth(t)}
              </span>
            );
          })}
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-info shadow-[0_0_0_1px_rgba(255,255,255,0.8)] dark:shadow-none"
            style={{ left: `${todayPct}%`, transform: "translateX(-50%)" }}
          />
          <span
            className="pointer-events-none absolute -top-0.5 z-10 -translate-x-1/2 rounded bg-info px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
            style={{ left: `${todayPct}%` }}
          >
            Today
          </span>

          {layout.positionedWithRow.map((ev) => (
            <a
              key={ev.id}
              href={ev.href ? withBase(rootPath, ev.href) : "#"}
              className={`absolute z-[5] block h-2.5 w-2.5 ${markerShapeClass(ev.kind)} ring-2 ring-white dark:ring-slate-900 ${kindDotClass(ev.kind)} ${
                ev.href ? "hover:scale-125" : "pointer-events-none opacity-50"
              }`}
              style={{ left: `${ev.pct}%`, bottom: `${ev.dotBottom}%` }}
              title={`${new Date(ev.at).toLocaleDateString("ko-KR")} · ${ev.title}${ev.summary ? `\n${ev.summary}` : ""}`}
              {...(ev.href && !ev.href.startsWith("/") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            />
          ))}

          {layout.eventLabelsWithRow.map((ev) => (
            <span
              key={`lbl-${ev.id}`}
              className="pointer-events-none absolute z-[6] -translate-y-1/2 text-left text-[9px] font-medium text-slate-600 dark:text-slate-300"
              style={{
                left: `calc(${ev.pct}% + 1.3%)`,
                bottom: `${ev.rowBottom}%`,
                maxWidth: "130px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={`${ev.title}${ev.summary ? `\n${ev.summary}` : ""}`}
            >
              {labelDisplayText(ev)}
            </span>
          ))}

          {layout.chartMode === "single" && layout.highPoint && (
            <>
              <div
                className="pointer-events-none absolute z-[7] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-300 bg-red-500/90"
                style={{ left: `${layout.highX}%`, top: `${layout.highY}%` }}
              />
              <div
                className="pointer-events-none absolute z-[7] -translate-x-1/2 text-[10px] font-semibold text-red-600 dark:text-red-400"
                style={{
                  left: `${Math.max(8, Math.min(92, layout.highX))}%`,
                  top: `${Math.max(4, layout.highY - 10)}%`,
                }}
              >
                최고 {formatMoney(layout.highPoint.price)} (
                {new Date(layout.highPoint.t).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })})
              </div>
            </>
          )}

          {layout.chartMode === "single" && layout.lowPoint && (
            <>
              <div
                className="pointer-events-none absolute z-[7] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300 bg-sky-500/90"
                style={{ left: `${layout.lowX}%`, top: `${layout.lowY}%` }}
              />
              <div
                className="pointer-events-none absolute z-[7] -translate-x-1/2 text-[10px] font-semibold text-sky-600 dark:text-sky-400"
                style={{
                  left: `${Math.max(8, Math.min(92, layout.lowX))}%`,
                  top: `${Math.min(92, layout.lowY + 3)}%`,
                }}
              >
                최저 {formatMoney(layout.lowPoint.price)} (
                {new Date(layout.lowPoint.t).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })})
              </div>
            </>
          )}

          <div className="pointer-events-none absolute left-5 top-5 z-[6] text-[11px] font-mono text-slate-600 dark:text-slate-300">
            {layout.yAxisKind === "rebase"
              ? layout.yTickTop > 0
                ? layout.yTickTop.toFixed(1)
                : ""
              : layout.yTickTop > 0
                ? `${Math.round(layout.yTickTop / 1000)}K`
                : ""}
          </div>
          <div className="pointer-events-none absolute bottom-8 left-5 z-[6] text-[11px] font-mono text-slate-600 dark:text-slate-300">
            {layout.yAxisKind === "rebase"
              ? layout.yTickBottom > 0
                ? layout.yTickBottom.toFixed(1)
                : ""
              : layout.yTickBottom > 0
                ? `${Math.round(layout.yTickBottom / 1000)}K`
                : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
