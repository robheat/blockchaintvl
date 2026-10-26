/**
 * Names people actually search for a chain by, keyed by our chain slug.
 *
 * Hand-curated on purpose: DefiLlama's `tokenSymbol` is unreliable for this
 * (TON comes back as "GRAM", Rootstock as "RIF"), and a wrong alias in a title
 * is worse than none. Add a chain only when the alternate name is well
 * established.
 *
 * - `title`: the one alias shown in parentheses in the page title.
 * - `aka`: text spliced directly after the chain name in the page summary
 *   sentence, including its own punctuation, e.g. ", also known as Optimism (OP),".
 */
export interface ChainAlias {
  title: string;
  aka: string;
}

const ticker = (symbol: string): ChainAlias => ({ title: symbol, aka: ` (${symbol})` });

const CHAIN_ALIASES = new Map<string, ChainAlias>(
  Object.entries({
    "op-mainnet": { title: "Optimism", aka: ", also known as Optimism (OP)," },
    polygon: { title: "MATIC", aka: " (POL), formerly known as Matic Network (MATIC)," },
    bsc: { title: "BNB Chain", aka: ", also known as BNB Chain or BNB Smart Chain (BNB)," },
    xrpl: { title: "XRP Ledger", aka: ", the XRP Ledger (XRP)," },
    ton: { title: "Toncoin", aka: ", The Open Network (Toncoin)," },
    gnosis: { title: "xDai", aka: ", formerly known as xDai," },
    kaia: { title: "Klaytn", aka: ", formerly known as Klaytn," },
    rootstock: { title: "RSK", aka: ", formerly known as RSK," },
    icp: { title: "Internet Computer", aka: ", the Internet Computer," },
    "hyperliquid-l1": { title: "HYPE", aka: ", the Hyperliquid blockchain (HYPE)," },
    arbitrum: { title: "ARB", aka: ", also known as Arbitrum One (ARB)," },
    ethereum: ticker("ETH"),
    bitcoin: ticker("BTC"),
    solana: ticker("SOL"),
    tron: ticker("TRX"),
    cardano: ticker("ADA"),
    stellar: ticker("XLM"),
    hedera: ticker("HBAR"),
    avalanche: ticker("AVAX"),
    cronos: ticker("CRO"),
    algorand: ticker("ALGO"),
    mantle: ticker("MNT"),
    berachain: ticker("BERA"),
    starknet: ticker("STRK"),
    zcash: ticker("ZEC"),
    litecoin: ticker("LTC"),
    aptos: ticker("APT"),
    stacks: ticker("STX"),
    flare: ticker("FLR"),
    injective: ticker("INJ"),
    osmosis: ticker("OSMO"),
    plasma: ticker("XPL"),
    monad: ticker("MON"),
  })
);

export function chainAlias(slug: string): ChainAlias | null {
  return CHAIN_ALIASES.get(slug) ?? null;
}

// Google shows roughly 60 characters of a title; the layout template appends this.
const TITLE_SUFFIX = " | ChainTVL";
const MAX_TITLE_LENGTH = 60;

/**
 * Chain page title, leading with the live TVL figure so the search result
 * says something before the click. Drops the trailing phrase first, then the
 * alias, to stay inside the visible length; the TVL figure always stays.
 */
export function buildChainTitle(
  name: string,
  slug: string,
  tvlText: string,
  hasProtocols: boolean
): string {
  const alias = chainAlias(slug)?.title;
  const tail = hasProtocols ? " & Top Protocols" : " & History";
  const label = alias ? `${name} (${alias})` : name;
  const candidates = [`${label} TVL: ${tvlText}${tail}`, `${label} TVL: ${tvlText}`, `${name} TVL: ${tvlText}`];
  return candidates.find((t) => (t + TITLE_SUFFIX).length <= MAX_TITLE_LENGTH) ?? candidates[candidates.length - 1];
}
