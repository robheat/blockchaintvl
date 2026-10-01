/**
 * Links to the other sites run by the same team: CryptoCatalyst (news) and
 * Token Buybacks (buyback data). Every map here points only at pages that
 * exist on the other site, so a link never lands on a 404.
 */

export const SISTER_SITES = {
  cryptocatalyst: {
    name: "CryptoCatalyst",
    url: "https://www.cryptocatalyst.news",
    blurb: "daily crypto news digest",
  },
  tokenbuybacks: {
    name: "Token Buybacks",
    url: "https://www.tokenbuybacks.app",
    blurb: "daily crypto token buyback tracker",
  },
} as const;

/**
 * Chain slug -> CryptoCatalyst topic hub for that chain's news.
 *
 * Only hubs that exist: CryptoCatalyst mints a tag page once 8 articles share
 * the tag, and article counts only grow, so these don't disappear. Bitcoin and
 * Ethereum point at category pages because those replace the tag hubs there.
 * Add a chain once its tag passes 8 articles on cryptocatalyst.news/tags.
 */
const CHAIN_NEWS = new Map<string, string>(Object.entries({
  ethereum: "/categories/ethereum",
  bitcoin: "/categories/bitcoin",
  solana: "/tags/solana",
  base: "/tags/base",
  arbitrum: "/tags/arbitrum",
  avalanche: "/tags/avalanche",
  cardano: "/tags/cardano",
  "hyperliquid-l1": "/tags/hyperliquid",
  xrpl: "/tags/xrp",
}));

export function chainNewsUrl(chainSlug: string): string | null {
  const path = CHAIN_NEWS.get(chainSlug);
  return path ? `${SISTER_SITES.cryptocatalyst.url}${path}` : null;
}

export interface BuybackToken {
  symbol: string;
  url: string;
}

/**
 * DefiLlama protocol slug -> the token whose buybacks Token Buybacks tracks.
 *
 * Keys are the DefiLlama slugs in tokenbuybacks' src/data/tokens.mjs (`llama`),
 * which are mostly parent protocols ("uniswap"), so a child like "uniswap-v3"
 * matches through its `parentProtocol`. Keep in sync with that file; the
 * token page is /token/<symbol, lowercased>/.
 */
const BUYBACK_SYMBOL_BY_LLAMA_SLUG = new Map<string, string>(Object.entries({
  hyperliquid: "HYPE",
  pump: "PUMP",
  chainlink: "LINK",
  pancakeswap: "CAKE",
  uniswap: "UNI",
  jupiter: "JUP",
  aave: "AAVE",
  "sky-lending": "SKY",
  "aster-spot": "ASTER",
  edgex: "EDGE",
  lighter: "LIT",
  raydium: "RAY",
  "ore-protocol": "ORE",
  "ether.fi-stake": "ETHFI",
  "bonk.fun-launchpad": "BONK",
  "apex-protocol": "APEX",
  debridge: "DBR",
  lido: "LDO",
  "near-protocol": "NEAR",
  layerzero: "ZRO",
  "maple-finance": "SYRUP",
  geodnet: "GEOD",
  fluid: "FLUID",
  spark: "SPK",
  venice: "VVV",
  euler: "EUL",
  "helium-network": "HNT",
  orca: "ORCA",
  clanker: "CLANKER",
  "gains-network": "GNS",
}));

/** `parentProtocol` comes from DefiLlama as "parent#uniswap". */
export function buybackTokenFor(slug: string, parentProtocol: string | null): BuybackToken | null {
  const parent = parentProtocol?.replace(/^parent#/, "");
  const symbol =
    BUYBACK_SYMBOL_BY_LLAMA_SLUG.get(slug) ?? (parent ? BUYBACK_SYMBOL_BY_LLAMA_SLUG.get(parent) : undefined);
  if (!symbol) return null;
  return { symbol, url: `${SISTER_SITES.tokenbuybacks.url}/token/${symbol.toLowerCase()}/` };
}
