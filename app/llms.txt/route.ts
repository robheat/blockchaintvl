const BASE_URL = "https://www.chaintvl.com";

const body = `# ChainTVL

> ChainTVL tracks total value locked (TVL) and stablecoin supply across every major blockchain, and models how capital is rotating between chains over time.

ChainTVL pulls live, free-tier data from DefiLlama: chain-level TVL history (api.llama.fi) and chain-level stablecoin circulating supply (stablecoins.llama.fi). The Flows page then computes a modeled reallocation between chains that are losing share and chains that are gaining share over a selected window. This is disclosed in-page: it is not literal bridge-transaction data, because DefiLlama's real bridge-volume API now requires a paid plan.

## Pages

- [Dashboard](${BASE_URL}/): Global DeFi TVL, 24h/7d/30d change, and a sortable table of chains by TVL and stablecoin supply.
- [Cross-Chain Flows](${BASE_URL}/flows): A Sankey-style diagram of chains gaining vs. losing TVL or stablecoin share, filterable by 24h/7d/30d.

## Chain pages

Every blockchain DefiLlama tracks with nonzero TVL has its own page at \`/chain/{slug}\` (e.g. \`${BASE_URL}/chain/ethereum\`, \`${BASE_URL}/chain/solana\`), with current TVL, TVL rank, stablecoin supply, and historical TVL/stablecoin charts. The full, current list of chain pages is in the sitemap.

## Other

- [Sitemap](${BASE_URL}/sitemap.xml)
- [Robots](${BASE_URL}/robots.txt)
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
