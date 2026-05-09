import type { CollectionEntry } from "astro:content";

export type SymbolSearchEntry = {
  symbol: string;
  /** 티커·회사명·태그 등 검색에 쓰는 문자열 */
  labels: string[];
};

function normalizeSpaces(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

/** 영문 티커 비교용 */
function compactAscii(s: string): string {
  return s.trim().toLowerCase().replace(/\s/g, "");
}

export function buildSymbolSearchEntries(
  posts: CollectionEntry<"posts">[],
  events: CollectionEntry<"events">[],
): SymbolSearchEntry[] {
  const bySymbol = new Map<string, Set<string>>();

  function add(sym: string, label: string) {
    const t = label.trim();
    if (t.length < 1) return;
    let set = bySymbol.get(sym);
    if (!set) {
      set = new Set<string>();
      bySymbol.set(sym, set);
    }
    set.add(t);
    if (/^[A-Za-z0-9._-]+$/.test(t)) {
      set.add(t.toUpperCase());
      set.add(t.toLowerCase());
    }
  }

  for (const p of posts) {
    const sym = p.data.symbol;
    add(sym, sym);
    for (const tag of p.data.tags ?? []) add(sym, tag);
    const ent = p.data.entities ?? {};
    const companies = ent.company;
    if (Array.isArray(companies)) {
      for (const c of companies) add(sym, c);
    }
  }

  for (const e of events) {
    const sym = e.data.symbol;
    if (!sym) continue;
    add(sym, sym);
  }

  return [...bySymbol.entries()].map(([symbol, set]) => ({
    symbol,
    labels: [...set],
  }));
}

/**
 * 검색어(티커 또는 회사명 일부)를 등록된 심볼 하나로 해석합니다.
 * 부분 일치는 검색어 길이 2 이상일 때만 사용합니다.
 */
export function resolveSymbolFromQuery(
  query: string,
  entries: SymbolSearchEntry[],
): string | undefined {
  const raw = query.trim();
  if (!raw) return undefined;

  const qCompact = compactAscii(raw);
  const qNorm = normalizeSpaces(raw).toLowerCase();

  const symbolSet = new Set(entries.map((e) => e.symbol));

  for (const sym of symbolSet) {
    if (compactAscii(sym) === qCompact) return sym;
  }

  for (const e of entries) {
    for (const lab of e.labels) {
      if (compactAscii(lab) === qCompact) return e.symbol;
      if (normalizeSpaces(lab).toLowerCase() === qNorm) return e.symbol;
    }
  }

  if (qCompact.length < 2 && qNorm.length < 2) return undefined;

  type Hit = { symbol: string; score: number };
  const hits: Hit[] = [];

  for (const e of entries) {
    for (const lab of e.labels) {
      const lc = compactAscii(lab);
      const ln = normalizeSpaces(lab).toLowerCase();

      if (qCompact.length >= 2 && lc.length >= 2 && lc.includes(qCompact)) {
        hits.push({
          symbol: e.symbol,
          score: 10_000 + qCompact.length * 50 - Math.abs(lc.length - qCompact.length),
        });
      } else if (qNorm.length >= 2 && ln.includes(qNorm)) {
        hits.push({
          symbol: e.symbol,
          score: 5_000 + qNorm.length * 40 - Math.abs(ln.length - qNorm.length),
        });
      }
    }
  }

  if (hits.length === 0) return undefined;

  hits.sort((a, b) => b.score - a.score || a.symbol.localeCompare(b.symbol));
  return hits[0].symbol;
}

/** datalist 표시용: 사람이 읽기 쉬운 한 줄 */
export function symbolOptionCaption(entry: SymbolSearchEntry): string {
  const nick = entry.labels
    .filter((l) => l !== entry.symbol && !/^[A-Z0-9._-]+$/i.test(l))
    .sort((a, b) => b.length - a.length)[0];
  if (nick) return `${nick} · ${entry.symbol}`;
  return entry.symbol;
}
