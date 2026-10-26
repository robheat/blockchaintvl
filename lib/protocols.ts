import { unstable_cache } from "next/cache";
import { getChains } from "./defillama";

const PROTOCOLS_API = "https://api.llama.fi/protocols";
// CEX reserves show up as "protocols" in DefiLlama's TVL model but aren't
// DeFi protocols a visitor would recognize as one -- the noisiest exclusion.
const EXCLUDED_CATEGORIES = new Set(["CEX"]);
const TOP_N_PER_CHAIN = 8;

/**
 * /protocols keys chainTvls by DefiLlama's older internal chain names, while
 * /v2/chains (which our chain pages use) has the current display names. Without
 * this, these chains -- BSC and OP Mainnet among them -- matched no protocols.
 * Each pair was checked against matching TVL and the chain's known top protocols.
 * Key: name in /protocols chainTvls. Value: name in /v2/chains.
 */
const PROTOCOL_KEY_TO_CHAIN_NAME = new Map<string, string>(
  Object.entries({
    Binance: "BSC",
    Optimism: "OP Mainnet",
    xDai: "Gnosis",
    RSK: "Rootstock",
    HydraDX: "Hydration",
    Proton: "XPR Network",
    Pulse: "PulseChain",
    EOS: "Vaulta",
    Ripple: "XRPL",
    Thorchain: "THORChain",
    Strato: "Strato Chain",
    "zkSync Era": "ZKsync Era",
    Elrond: "MultiversX",
    "Reya Network": "ReyaChain",
    Klaytn: "Kaia",
    Bitkub: "KUB",
    Fuel: "Fuel Ignition",
    WEMIX: "WEMIX3.0",
    Aleo: "ALEO",
    Op_Bnb: "opBNB",
    Map: "MAP Protocol",
    Terra: "Terra Classic",
    Mantra: "MANTRA",
    Persistence: "Persistence One",
  })
);

export interface ChainProtocolSummary {
  name: string;
  slug: string;
  category: string;
  tvl: number;
  logo: string | null;
  url: string | null;
  /** DefiLlama parent, e.g. "parent#uniswap" for uniswap-v3. */
  parentProtocol: string | null;
}

interface RawProtocol {
  name?: string;
  slug?: string;
  category?: string;
  logo?: string | null;
  url?: string | null;
  parentProtocol?: string;
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

    for (const [key, tvl] of Object.entries(p.chainTvls)) {
      const chainName = PROTOCOL_KEY_TO_CHAIN_NAME.get(key) ?? key;
      if (!validChainNames.has(chainName)) continue;
      if (typeof tvl !== "number" || tvl <= 0) continue;

      (byChain[chainName] ??= []).push({
        name: p.name,
        slug: p.slug,
        category: p.category ?? "Other",
        tvl,
        logo: p.logo ?? null,
        url: p.url ?? null,
        parentProtocol: p.parentProtocol ?? null,
      });
    }
  }

  for (const chainName of Object.keys(byChain)) {
    byChain[chainName] = byChain[chainName].sort((a, b) => b.tvl - a.tvl).slice(0, TOP_N_PER_CHAIN);
  }

  return byChain;
}

// The name map is part of the key so editing it invalidates the cached summary
// immediately instead of serving the old grouping until the next revalidate.
const getCachedProtocolsByChain = unstable_cache(
  fetchAllProtocolsByChain,
  ["protocols-by-chain-v3", JSON.stringify([...PROTOCOL_KEY_TO_CHAIN_NAME])],
  { revalidate: 3600 }
);

export async function getTopProtocolsForChain(chainName: string): Promise<ChainProtocolSummary[]> {
  const byChain = await getCachedProtocolsByChain();
  return byChain[chainName] ?? [];
}
