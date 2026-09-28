import { unstable_cache } from "next/cache";
import { getChains } from "./defillama";

const PROTOCOLS_API = "https://api.llama.fi/protocols";
// CEX reserves show up as "protocols" in DefiLlama's TVL model but aren't
// DeFi protocols a visitor would recognize as one -- the noisiest exclusion.
const EXCLUDED_CATEGORIES = new Set(["CEX"]);
const TOP_N_PER_CHAIN = 8;

export interface ChainProtocolSummary {
  name: string;
  slug: string;
  category: string;
  tvl: number;
  logo: string | null;
  url: string | null;
}

interface RawProtocol {
  name?: string;
  slug?: string;
  category?: string;
  logo?: string | null;
  url?: string | null;
  chainTvls?: Record<string, number>;
}

/**
 * DefiLlama's /protocols is the only free endpoint with chain-level protocol
 * TVL, and it's ~9MB (over Next's 2MB fetch-cache ceiling, so it can't be
 * cached as a fetch response at all -- see lib/defillama.ts). Instead of
 * re-downloading that on every chain-page visit, this does the expensive
 * fetch once, reduces it to a small per-chain top-N summary, and caches only
 * that tiny result with unstable_cache.
 */
async function fetchAllProtocolsByChain(): Promise<Record<string, ChainProtocolSummary[]>> {
  const [res, chains] = await Promise.all([fetch(PROTOCOLS_API, { cache: "no-store" }), getChains()]);

  if (!res.ok) {
    throw new Error(`DefiLlama protocols request failed (${res.status} ${res.statusText})`);
  }

  const raw = (await res.json()) as RawProtocol[];
  // chainTvls keys include derived breakdowns like "Ethereum-borrowed" or
  // "Ethereum-staking" alongside the real "Ethereum" entry -- only an exact
  // match against real chain names filters those out (a prefix check would
  // wrongly admit "EthereumClassic" as part of "Ethereum" too).
  const validChainNames = new Set(chains.map((c) => c.name));

  const byChain: Record<string, ChainProtocolSummary[]> = {};

  for (const p of raw) {
    if (!p.name || !p.slug || !p.chainTvls) continue;
    if (p.category && EXCLUDED_CATEGORIES.has(p.category)) continue;

    for (const [chainName, tvl] of Object.entries(p.chainTvls)) {
      if (!validChainNames.has(chainName)) continue;
      if (typeof tvl !== "number" || tvl <= 0) continue;

      (byChain[chainName] ??= []).push({
        name: p.name,
        slug: p.slug,
        category: p.category ?? "Other",
        tvl,
        logo: p.logo ?? null,
        url: p.url ?? null,
      });
    }
  }

  for (const chainName of Object.keys(byChain)) {
    byChain[chainName] = byChain[chainName].sort((a, b) => b.tvl - a.tvl).slice(0, TOP_N_PER_CHAIN);
  }

  return byChain;
}

const getCachedProtocolsByChain = unstable_cache(fetchAllProtocolsByChain, ["protocols-by-chain"], {
  revalidate: 3600,
});

export async function getTopProtocolsForChain(chainName: string): Promise<ChainProtocolSummary[]> {
  const byChain = await getCachedProtocolsByChain();
  return byChain[chainName] ?? [];
}
