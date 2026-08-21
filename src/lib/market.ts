import YahooFinance from "yahoo-finance2";

const CACHE_TTL_MS = 120_000;

type CacheEntry = {
  expiresAt: number;
  closes: number[];
  timestamps: number[];
};

const chartCache = new Map<string, CacheEntry>();
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

function cacheKey(symbol: string, range: string, interval: string): string {
  return `${symbol}|${range}|${interval}`;
}

/** 테마 글(개별 종목 없음) — 시장별 대표 지수 차트용 */
export function isThemeSymbol(symbol: string | undefined): boolean {
  if (symbol == null || typeof symbol !== "string") return false;
  return symbol.trim().toUpperCase() === "THEME";
}

/** Yahoo chart 봉의 숫자 필드(종가·시가 등) 통일 파싱 */
function chartFieldNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

export type ThemeIndexDef = { label: string; yahoo: string };

/** THEME 포스트 `market`에 맞는 Yahoo 지수 티커 (한국: KOSPI·KOSDAQ, 미국: S&P·NASDAQ). */
export function themeIndexDefinitions(market: string | undefined): ThemeIndexDef[] {
  if (market === "KRX") {
    return [
      { label: "KOSPI", yahoo: "^KS11" },
      { label: "KOSDAQ", yahoo: "^KQ11" },
    ];
  }
  if (market && ["NASDAQ", "NYSE", "AMEX", "OTC"].includes(market)) {
    return [
      { label: "S&P 500", yahoo: "^GSPC" },
      { label: "NASDAQ", yahoo: "^IXIC" },
    ];
  }
  return [
    { label: "S&P 500", yahoo: "^GSPC" },
    { label: "NASDAQ", yahoo: "^IXIC" },
  ];
}

export type ThemeChartLine = {
  label: string;
  points: Array<{ at: string; price: number }>;
};

/**
 * THEME 글 지수 데이터 파이프라인
 * - `themeIndexDefinitions(market)` → KRX: ^KS11/^KQ11, 미국 시장: ^GSPC/^IXIC, 그 외 기본은 미국 지수
 * - 지수별 `getYahooChartSeries`(Yahoo chart 일봉) 병렬 호출 → 유효 봉이 2개 미만인 지수는 제외
 * - 한쪽 지수만 성공해도 해당 라인만 반환 (부분 성공 허용)
 */
export async function getThemeIndexChartLines(
  market: string | undefined,
  options?: {
    range?: "1mo" | "3mo" | "6mo" | "1y";
    interval?: "1d" | "1wk";
  },
): Promise<ThemeChartLine[]> {
  const defs = themeIndexDefinitions(market);
  const range = options?.range ?? "1y";
  const interval = options?.interval ?? "1d";
  const lines = await Promise.all(
    defs.map(async (d) => {
      try {
        const { closes, timestamps } = await getYahooChartSeries(d.yahoo, { range, interval });
        if (closes.length !== timestamps.length || closes.length < 2) {
          return { label: d.label, points: [] as Array<{ at: string; price: number }> };
        }
        const points = closes
          .map((price, i) => ({
            at: new Date((timestamps[i] ?? 0) * 1000).toISOString(),
            price: Number(price),
          }))
          .filter((p) => Number.isFinite(p.price));
        return { label: d.label, points };
      } catch {
        return { label: d.label, points: [] as Array<{ at: string; price: number }> };
      }
    }),
  );
  return lines.filter((l) => l.points.length >= 2);
}

/** 포스트 심볼 → Yahoo Finance 티커. 한국 6자리만 있으면 `.KS`(코스닥은 글에 `XXXXXX.KQ`로 명시). */
export function resolveYahooChartSymbol(symbol: string, _market?: string): string | null {
  const raw = symbol.trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper === "TBD" || upper === "THEME" || upper === "N/A") return null;

  const ksKq = /^(\d{6})\.(KS|KQ)$/i.exec(raw);
  if (ksKq) return `${ksKq[1]}.${ksKq[2].toUpperCase()}`;

  if (/^\d{6}$/.test(raw)) return `${raw}.KS`;

  return raw;
}

export async function getYahooChartSeries(
  symbol: string,
  options?: {
    range?: "1mo" | "3mo" | "6mo" | "1y";
    interval?: "1d" | "1wk";
    /** frontmatter `market` — KRX일 때 6자리 코드에 `.KS` 등 적용 */
    market?: string;
  },
): Promise<{ closes: number[]; timestamps: number[] }> {
  const range = options?.range ?? "3mo";
  const interval = options?.interval ?? "1d";
  const yahooSymbol = resolveYahooChartSymbol(symbol, options?.market);
  if (!yahooSymbol) {
    return { closes: [], timestamps: [] };
  }

  const key = cacheKey(yahooSymbol, range, interval);
  const now = Date.now();
  const hit = chartCache.get(key);
  if (hit && hit.expiresAt > now) return { closes: hit.closes, timestamps: hit.timestamps };

  const period1 = new Date();
  if (range === "1mo") period1.setMonth(period1.getMonth() - 1);
  else if (range === "3mo") period1.setMonth(period1.getMonth() - 3);
  else if (range === "6mo") period1.setMonth(period1.getMonth() - 6);
  else period1.setFullYear(period1.getFullYear() - 1);

  const quote = await yahooFinance.chart(yahooSymbol, { period1, interval });
  const pointLimit =
    interval === "1wk"
      ? range === "1y"
        ? 60
        : range === "6mo"
          ? 30
          : range === "3mo"
            ? 18
            : 10
      : range === "1y"
        ? 370
        : range === "6mo"
          ? 200
          : range === "3mo"
            ? 100
            : 40;
  const points = (quote.quotes ?? [])
    .map((q) => {
      const raw = q.date;
      const t =
        raw instanceof Date
          ? raw.getTime()
          : raw != null
            ? new Date(raw as string | number).getTime()
            : NaN;
      /** KRX 지수(^KS11 등)는 장중·미종가 봉에서 close/adjclose가 null인 경우가 있어 시가로 보강 */
      const rawPrice = q.close ?? q.adjclose ?? q.open;
      const c = chartFieldNumber(rawPrice);
      return { t, c };
    })
    .filter((p): p is { t: number; c: number } => Number.isFinite(p.t) && Number.isFinite(p.c))
    .slice(-pointLimit);

  const closes = points.map((p) => p.c);
  const timestamps = points.map((p) => Math.floor(p.t / 1000));

  /** 빈 시계열은 캐시하지 않음 — 일시적 Yahoo 오류가 TTL 동안 고정되는 것 방지 */
  if (closes.length > 0 && timestamps.length > 0) {
    chartCache.set(key, { expiresAt: now + CACHE_TTL_MS, closes, timestamps });
  }
  return { closes, timestamps };
}

/** 상단 TickerBar용 지수·환율 (Yahoo Finance quote) */
export type TickerBarItem = {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePercent: number;
};

const TICKER_BAR_DEFS = [
  { symbol: "^KS11", label: "KOSPI" },
  { symbol: "^KQ11", label: "KOSDAQ" },
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "KRW=X", label: "USD/KRW" },
  { symbol: "^TNX", label: "US10Y" },
] as const;

const TICKER_BAR_TTL_MS = 60_000;
let tickerBarCache: { expiresAt: number; items: TickerBarItem[] } | null = null;

function tickerFallback(): TickerBarItem[] {
  return TICKER_BAR_DEFS.map((d) => ({
    symbol: d.symbol,
    label: d.label,
    price: 0,
    change: 0,
    changePercent: 0,
  }));
}

/** Quote 실패·부분 응답 시 일봉 마지막 두 종가로 가격·등락률 보강 (배치 quote보다 우회 경로가 되는 경우가 있음) */
async function tickerBarItemFromChart(def: (typeof TICKER_BAR_DEFS)[number]): Promise<TickerBarItem> {
  try {
    const { closes } = await getYahooChartSeries(def.symbol, { range: "1mo", interval: "1d" });
    if (closes.length === 0) {
      return { symbol: def.symbol, label: def.label, price: 0, change: 0, changePercent: 0 };
    }
    const price = closes[closes.length - 1]!;
    if (closes.length < 2) {
      return { symbol: def.symbol, label: def.label, price, change: 0, changePercent: 0 };
    }
    const prev = closes[closes.length - 2]!;
    const change = price - prev;
    const changePercent = prev !== 0 ? (change / prev) * 100 : 0;
    return { symbol: def.symbol, label: def.label, price, change, changePercent };
  } catch {
    return { symbol: def.symbol, label: def.label, price: 0, change: 0, changePercent: 0 };
  }
}

function quoteNumeric(q: { regularMarketPrice?: unknown; regularMarketChange?: unknown; regularMarketChangePercent?: unknown }) {
  const price =
    typeof q.regularMarketPrice === "number" && Number.isFinite(q.regularMarketPrice)
      ? q.regularMarketPrice
      : NaN;
  const change =
    typeof q.regularMarketChange === "number" && Number.isFinite(q.regularMarketChange)
      ? q.regularMarketChange
      : NaN;
  const changePercent =
    typeof q.regularMarketChangePercent === "number" && Number.isFinite(q.regularMarketChangePercent)
      ? q.regularMarketChangePercent
      : NaN;
  return { price, change, changePercent };
}

export async function fetchTickerBarQuotes(): Promise<TickerBarItem[]> {
  const now = Date.now();
  if (tickerBarCache && tickerBarCache.expiresAt > now) {
    return tickerBarCache.items;
  }

  let items: TickerBarItem[];

  try {
    const symbols = TICKER_BAR_DEFS.map((d) => d.symbol);
    const raw = await yahooFinance.quote(symbols, undefined, { validateResult: false });
    const list = Array.isArray(raw) ? raw : [raw];
    const bySymbol = new Map(list.map((q) => [q.symbol, q]));

    items = TICKER_BAR_DEFS.map((def) => {
      const q = bySymbol.get(def.symbol);
      if (!q) {
        return { symbol: def.symbol, label: def.label, price: 0, change: 0, changePercent: 0 };
      }
      const { price, change, changePercent } = quoteNumeric(q);
      return {
        symbol: def.symbol,
        label: def.label,
        price: Number.isFinite(price) ? price : 0,
        change: Number.isFinite(change) ? change : 0,
        changePercent: Number.isFinite(changePercent) ? changePercent : 0,
      };
    });
  } catch {
    items = TICKER_BAR_DEFS.map((d) => ({
      symbol: d.symbol,
      label: d.label,
      price: 0,
      change: 0,
      changePercent: 0,
    }));
  }

  const needChartPatch = items.some((it) => !Number.isFinite(it.price) || it.price === 0);
  if (needChartPatch) {
    items = await Promise.all(
      items.map(async (it, i) => {
        if (Number.isFinite(it.price) && it.price !== 0) return it;
        const def = TICKER_BAR_DEFS[i];
        return def ? tickerBarItemFromChart(def) : it;
      }),
    );
  }

  const anyData = items.some((it) => Number.isFinite(it.price) && it.price !== 0);
  if (anyData) {
    tickerBarCache = { expiresAt: now + TICKER_BAR_TTL_MS, items };
  }

  return anyData ? items : tickerFallback();
}
