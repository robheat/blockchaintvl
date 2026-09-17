const CHAINS_API = "https://api.llama.fi";
const STABLECOINS_API = "https://stablecoins.llama.fi";

export interface ChainTvl {
  name: string;
  tvl: number;
  tokenSymbol: string | null;
  chainId: number | null;
}

export interface TvlPoint {
  date: number;
  tvl: number;
}

export interface StablecoinChainSummary {
  name: string;
  totalCirculatingUSD: number;
}

export interface StablecoinPoint {
  date: number;
  totalCirculatingUSD: number;
}

async function fetchJson<T>(
  url: string,
  revalidateSeconds: number,
  opts: { skipCache?: boolean } = {}
): Promise<T> {
  // Next's fetch data cache silently refuses to store responses over 2MB
  // (logging a warning on every request). Full-history stablecoin charts
  // routinely exceed that, so those requests opt out of the cache entirely
  // instead of retrying to cache a payload that will never fit.
  const res = opts.skipCache
    ? await fetch(url, { cache: "no-store" })
    : await fetch(url, { next: { revalidate: revalidateSeconds } });

  if (!res.ok) {
    throw new Error(`DefiLlama request failed (${res.status} ${res.statusText}): ${url}`);
  }
  return res.json() as Promise<T>;
}

/** Current TVL for every chain DefiLlama tracks. */
export async function getChains(): Promise<ChainTvl[]> {
  const raw = await fetchJson<
    Array<{ name?: string; tvl?: number; tokenSymbol?: string | null; chainId?: number | null }>
  >(`${CHAINS_API}/v2/chains`, 300);

  return raw
    .filter((c): c is { name: string; tvl: number; tokenSymbol?: string | null; chainId?: number | null } =>
      typeof c.name === "string" && typeof c.tvl === "number"
    )
    .map((c) => ({
      name: c.name,
      tvl: c.tvl,
      tokenSymbol: c.tokenSymbol ?? null,
      chainId: c.chainId ?? null,
    }));
}

/** Total DeFi TVL across all chains, daily, since inception. */
export async function getGlobalTvlHistory(): Promise<TvlPoint[]> {
  return fetchJson<TvlPoint[]>(`${CHAINS_API}/v2/historicalChainTvl`, 900);
}

/** Daily TVL history for a single chain (chain must match the `name` field from getChains). */
export async function getChainTvlHistory(chain: string): Promise<TvlPoint[]> {
  return fetchJson<TvlPoint[]>(
    `${CHAINS_API}/v2/historicalChainTvl/${encodeURIComponent(chain)}`,
    900
  );
}

/** Current stablecoin circulating supply per chain. */
export async function getStablecoinChains(): Promise<StablecoinChainSummary[]> {
  const raw = await fetchJson<
    Array<{ name?: string; totalCirculatingUSD?: Record<string, number> }>
  >(`${STABLECOINS_API}/stablecoinchains`, 900);

  return raw
    .filter((c): c is { name: string; totalCirculatingUSD?: Record<string, number> } => typeof c.name === "string")
    .map((c) => ({
      name: c.name,
      totalCirculatingUSD: sumPegged(c.totalCirculatingUSD),
    }));
}

/** Daily stablecoin supply history for a single chain (name must match stablecoinchains `name`). */
export async function getStablecoinChainHistory(chain: string): Promise<StablecoinPoint[]> {
  const raw = await fetchJson<
    Array<{ date: string | number; totalCirculatingUSD?: Record<string, number> }>
  >(`${STABLECOINS_API}/stablecoincharts/${encodeURIComponent(chain)}`, 900, { skipCache: true });

  return raw.map((p) => ({
    date: Number(p.date),
    totalCirculatingUSD: sumPegged(p.totalCirculatingUSD),
  }));
}

function sumPegged(pegged: Record<string, number> | undefined): number {
  if (!pegged) return 0;
  return Object.values(pegged).reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0);
}
