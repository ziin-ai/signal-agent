import YahooFinance from "yahoo-finance2";

const CACHE_TTL_MS = 120_000;

type CacheEntry = {
  expiresAt: number;
  closes: number[];
  timestamps: number[];
};

const chartCache = new Map<string, CacheEntry>();
const yahooFinance = new YahooFinance();

function cacheKey(symbol: string, range: string, interval: string): string {
  return `${symbol}|${range}|${interval}`;
}

export async function getYahooChartSeries(
  symbol: string,
  options?: { range?: "1mo" | "3mo" | "6mo" | "1y"; interval?: "1d" | "1wk" },
): Promise<{ closes: number[]; timestamps: number[] }> {
  const range = options?.range ?? "3mo";
  const interval = options?.interval ?? "1d";
  const key = cacheKey(symbol, range, interval);
  const now = Date.now();
  const hit = chartCache.get(key);
  if (hit && hit.expiresAt > now) return { closes: hit.closes, timestamps: hit.timestamps };

  const period1 = new Date();
  if (range === "1mo") period1.setMonth(period1.getMonth() - 1);
  else if (range === "3mo") period1.setMonth(period1.getMonth() - 3);
  else if (range === "6mo") period1.setMonth(period1.getMonth() - 6);
  else period1.setFullYear(period1.getFullYear() - 1);

  const quote = await yahooFinance.chart(symbol, { period1, interval });
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
    .map((q) => ({ t: q.date?.getTime(), c: q.close }))
    .filter((p): p is { t: number; c: number } => Number.isFinite(p.t) && Number.isFinite(p.c))
    .slice(-pointLimit);

  const closes = points.map((p) => p.c);
  const timestamps = points.map((p) => Math.floor(p.t / 1000));

  chartCache.set(key, { expiresAt: now + CACHE_TTL_MS, closes, timestamps });
  return { closes, timestamps };
}
