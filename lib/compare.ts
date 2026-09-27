import type { TvlPoint } from "./defillama";

export type CompareRange = "30d" | "90d" | "1y" | "all";
export const COMPARE_RANGES: CompareRange[] = ["30d", "90d", "1y", "all"];
const COMPARE_RANGE_DAYS: Record<Exclude<CompareRange, "all">, number> = {
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

export type CompareMetric = "indexed" | "raw";
export const COMPARE_METRICS: CompareMetric[] = ["indexed", "raw"];

export interface ComparePoint {
  date: number;
  value: number;
}

export function sliceHistoryByRange(history: TvlPoint[], range: CompareRange): TvlPoint[] {
  if (history.length === 0 || range === "all") return history;
  const latest = history[history.length - 1];
  const cutoff = latest.date - COMPARE_RANGE_DAYS[range] * 86400;
  return history.filter((p) => p.date >= cutoff);
}

/**
 * Chains being compared can differ in TVL by orders of magnitude, so a raw
 * dollar overlay makes the smaller ones look flat. Indexing every series to
 * "% change since the start of the visible range" puts them on one
 * meaningful axis regardless of size.
 */
export function toIndexedSeries(history: TvlPoint[]): ComparePoint[] {
  if (history.length === 0) return [];
  const base = history.find((p) => p.tvl > 0)?.tvl;
  if (!base) return history.map((p) => ({ date: p.date, value: 0 }));
  return history.map((p) => ({ date: p.date, value: ((p.tvl - base) / base) * 100 }));
}

export function toRawSeries(history: TvlPoint[]): ComparePoint[] {
  return history.map((p) => ({ date: p.date, value: p.tvl }));
}
