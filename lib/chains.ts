import {
  getChains,
  getChainTvlHistory,
  getStablecoinChains,
  getStablecoinChainHistory,
  type TvlPoint,
  type StablecoinPoint,
} from "./defillama";
import { toSlug } from "./format";

export type Window = "24h" | "7d" | "30d";
export const WINDOWS: Window[] = ["24h", "7d", "30d"];
export const WINDOW_DAYS: Record<Window, number> = { "24h": 1, "7d": 7, "30d": 30 };
export const DASHBOARD_TOP_N = 50;
export const FLOWS_TOP_N = 14;

export interface ChainSummary {
  name: string;
  slug: string;
  tvl: number;
  stablecoinSupply: number;
  tvlChange: Record<Window, number | null>;
}

export interface ChainDetail {
  name: string;
  slug: string;
  tvl: number;
  rank: number;
  stablecoinSupply: number;
  tvlHistory: TvlPoint[];
  stablecoinHistory: StablecoinPoint[];
  tvlChange: Record<Window, number | null>;
}

export type FlowMetric = "tvl" | "stablecoin";

export interface ChainMetricChange {
  name: string;
  change: number;
  current: number;
}

export interface ChainPickerEntry {
  name: string;
  slug: string;
  tvl: number;
}

export interface ChainComparisonSeries {
  name: string;
  slug: string;
  tvl: number;
  tvlChange: Record<Window, number | null>;
  tvlHistory: TvlPoint[];
}

export const COMPARE_MAX_CHAINS = 3;
export const COMPARE_PICKER_LIMIT = 60;

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

/** Value of the last point at or before `targetDate`, walking a date-ascending series. */
function referenceAt<T extends { date: number }>(points: T[], targetDate: number): T | null {
  let reference: T | null = null;
  for (const p of points) {
    if (p.date <= targetDate) reference = p;
    else break;
  }
  return reference;
}

function absChangeOverWindow(points: TvlPoint[], days: number): number | null {
  if (points.length < 2) return null;
  const latest = points[points.length - 1];
  const reference = referenceAt(points, latest.date - days * 86400);
  if (!reference) return null;
  return latest.tvl - reference.tvl;
}

// Below this, a reference TVL is too close to zero for a % change to mean
// anything -- a chain going from $500 to $1M would otherwise show +199,900%.
const MIN_REFERENCE_TVL_FOR_PERCENT = 100_000;

function fractionalChangeOverWindow(points: TvlPoint[], days: number): number | null {
  if (points.length < 2) return null;
  const latest = points[points.length - 1];
  const reference = referenceAt(points, latest.date - days * 86400);
  if (!reference || reference.tvl < MIN_REFERENCE_TVL_FOR_PERCENT) return null;
  return (latest.tvl - reference.tvl) / reference.tvl;
}

/** Top chains by current TVL with 24h/7d/30d % change, for the dashboard table. */
export async function getTopChainSummaries(limit = DASHBOARD_TOP_N): Promise<ChainSummary[]> {
  const [chains, stablecoinChains] = await Promise.all([getChains(), getStablecoinChains()]);

  const stableByName = new Map(stablecoinChains.map((c) => [normalize(c.name), c.totalCirculatingUSD]));
  const top = [...chains].sort((a, b) => b.tvl - a.tvl).slice(0, limit);

  const histories = await Promise.all(
    top.map((c) => getChainTvlHistory(c.name).catch(() => [] as TvlPoint[]))
  );

  return top.map((chain, i) => {
    const history = histories[i];
    return {
      name: chain.name,
      slug: toSlug(chain.name),
      tvl: chain.tvl,
      stablecoinSupply: stableByName.get(normalize(chain.name)) ?? 0,
      tvlChange: {
        "24h": fractionalChangeOverWindow(history, WINDOW_DAYS["24h"]),
        "7d": fractionalChangeOverWindow(history, WINDOW_DAYS["7d"]),
        "30d": fractionalChangeOverWindow(history, WINDOW_DAYS["30d"]),
      },
    };
  });
}

export async function getChainDetail(slug: string): Promise<ChainDetail | null> {
  const chains = await getChains();
  const sorted = [...chains].sort((a, b) => b.tvl - a.tvl);
  const idx = sorted.findIndex((c) => toSlug(c.name) === slug);
  if (idx === -1) return null;
  const chain = sorted[idx];

  const [tvlHistory, stablecoinChains] = await Promise.all([
    getChainTvlHistory(chain.name).catch(() => [] as TvlPoint[]),
    getStablecoinChains(),
  ]);

  const stableMatch = stablecoinChains.find((c) => normalize(c.name) === normalize(chain.name));
  const stablecoinHistory = stableMatch
    ? await getStablecoinChainHistory(stableMatch.name).catch(() => [] as StablecoinPoint[])
    : [];

  return {
    name: chain.name,
    slug,
    tvl: chain.tvl,
    rank: idx + 1,
    stablecoinSupply: stableMatch?.totalCirculatingUSD ?? 0,
    tvlHistory,
    stablecoinHistory,
    tvlChange: {
      "24h": fractionalChangeOverWindow(tvlHistory, WINDOW_DAYS["24h"]),
      "7d": fractionalChangeOverWindow(tvlHistory, WINDOW_DAYS["7d"]),
      "30d": fractionalChangeOverWindow(tvlHistory, WINDOW_DAYS["30d"]),
    },
  };
}

export interface ChainDirectoryEntry {
  name: string;
  slug: string;
  tvl: number;
  rank: number;
}

/**
 * Every chain with a live chain page worth listing: nonzero TVL, sorted by TVL,
 * one entry per slug. The sitemap and the /chains directory both use this so
 * they always list the same set. Only the single /v2/chains call -- no
 * per-chain history fetches.
 */
export async function getChainDirectory(): Promise<ChainDirectoryEntry[]> {
  const chains = await getChains();
  const seen = new Set<string>();
  const entries: ChainDirectoryEntry[] = [];
  for (const chain of [...chains].sort((a, b) => b.tvl - a.tvl)) {
    if (chain.tvl <= 0) continue;
    const slug = toSlug(chain.name);
    if (seen.has(slug)) continue;
    seen.add(slug);
    entries.push({ name: chain.name, slug, tvl: chain.tvl, rank: entries.length + 1 });
  }
  return entries;
}

/**
 * The chains ranked just above and below `slug` by TVL (3 each side, shifted
 * at either end of the list so there are always `count`). Gives every chain
 * page links to other chain pages; without it they're reachable only from
 * /chains. Empty if `slug` isn't in the directory (e.g. a zero-TVL chain).
 */
export async function getSimilarChains(slug: string, count = 6): Promise<ChainDirectoryEntry[]> {
  const directory = await getChainDirectory();
  const index = directory.findIndex((c) => c.slug === slug);
  if (index === -1) return [];
  const others = directory.length - 1;
  const take = Math.min(count, others);
  let start = Math.max(0, index - Math.floor(take / 2));
  start = Math.min(start, directory.length - (take + 1));
  return directory.slice(start, start + take + 1).filter((c) => c.slug !== slug);
}

/** Chains available to pick for comparison, by current TVL. */
export async function getChainPickerList(limit = COMPARE_PICKER_LIMIT): Promise<ChainPickerEntry[]> {
  const chains = await getChains();
  return [...chains]
    .filter((c) => c.tvl > 0)
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, limit)
    .map((c) => ({ name: c.name, slug: toSlug(c.name), tvl: c.tvl }));
}

/** TVL history for a specific set of chain slugs, for the comparison chart. */
export async function getChainsForComparison(slugs: string[]): Promise<ChainComparisonSeries[]> {
  const chains = await getChains();
  const bySlug = new Map(chains.map((c) => [toSlug(c.name), c]));

  const matched = slugs
    .map((slug) => bySlug.get(slug))
    .filter((c): c is NonNullable<typeof c> => !!c);

  const histories = await Promise.all(
    matched.map((c) => getChainTvlHistory(c.name).catch(() => [] as TvlPoint[]))
  );

  return matched.map((chain, i) => {
    const history = histories[i];
    return {
      name: chain.name,
      slug: toSlug(chain.name),
      tvl: chain.tvl,
      tvlChange: {
        "24h": fractionalChangeOverWindow(history, WINDOW_DAYS["24h"]),
        "7d": fractionalChangeOverWindow(history, WINDOW_DAYS["7d"]),
        "30d": fractionalChangeOverWindow(history, WINDOW_DAYS["30d"]),
      },
      tvlHistory: history,
    };
  });
}

/**
 * Absolute-dollar change over `window` for the top chains, by either TVL or
 * stablecoin supply. This is the flow-proxy signal the Flows page allocates
 * into a modeled reallocation (see lib/flows.ts) since DefiLlama's real
 * bridge-transaction API now requires a paid plan.
 */
export async function getFlowChangeMetrics(
  window: Window,
  metric: FlowMetric,
  limit = FLOWS_TOP_N
): Promise<ChainMetricChange[]> {
  const days = WINDOW_DAYS[window];

  if (metric === "tvl") {
    const chains = await getChains();
    const top = [...chains].sort((a, b) => b.tvl - a.tvl).slice(0, limit);
    const histories = await Promise.all(
      top.map((c) => getChainTvlHistory(c.name).catch(() => [] as TvlPoint[]))
    );
    return top
      .map((c, i) => ({ name: c.name, change: absChangeOverWindow(histories[i], days) ?? 0, current: c.tvl }))
      .filter((x) => x.change !== 0);
  }

  const stableChains = await getStablecoinChains();
  const top = [...stableChains].sort((a, b) => b.totalCirculatingUSD - a.totalCirculatingUSD).slice(0, limit);
  const histories = await Promise.all(
    top.map((c) => getStablecoinChainHistory(c.name).catch(() => [] as StablecoinPoint[]))
  );
  return top
    .map((c, i) => {
      const asTvlPoints: TvlPoint[] = histories[i].map((p) => ({ date: p.date, tvl: p.totalCirculatingUSD }));
      return { name: c.name, change: absChangeOverWindow(asTvlPoints, days) ?? 0, current: c.totalCirculatingUSD };
    })
    .filter((x) => x.change !== 0);
}
