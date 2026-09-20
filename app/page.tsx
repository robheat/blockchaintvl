import { Coins, CurrencyCircleDollar, TrendUp } from "@phosphor-icons/react/ssr";
import { getGlobalTvlHistory } from "@/lib/defillama";
import { getTopChainSummaries } from "@/lib/chains";
import { StatTile } from "@/components/StatTile";
import { ChainTable } from "@/components/ChainTable";
import { JsonLd } from "@/components/JsonLd";
import { formatUsdCompact } from "@/lib/format";
import { faqSchema } from "@/lib/schema";

export const revalidate = 300;

const FAQS = [
  {
    question: "What is TVL (total value locked)?",
    answer:
      "TVL is the total dollar value of crypto assets deposited in a blockchain's DeFi protocols: lending markets, DEX liquidity pools, staking contracts, and similar. It's the standard measure of how much capital is actively used on a chain, as opposed to a token's market cap, which measures the value of the token supply itself.",
  },
  {
    question: "How are the cross-chain flows on this site calculated?",
    answer:
      "The Flows page takes each chain's net change in TVL or stablecoin supply over a chosen window, then models a reallocation: chains that lost share are treated as sources, chains that gained share as targets, and link widths are proportional to each chain's share of the total outflow and inflow. This is not literal bridge-transaction data. DefiLlama's real bridge-volume API now requires a paid plan, so this is a modeled estimate built from public TVL and stablecoin-supply data instead.",
  },
  {
    question: "Where does ChainTVL's data come from?",
    answer:
      "All figures come from DefiLlama's free public APIs: chain-level TVL from api.llama.fi, and stablecoin circulating supply per chain from stablecoins.llama.fi. ChainTVL doesn't run its own indexers or collect on-chain data directly.",
  },
  {
    question: "How often is the data updated?",
    answer:
      "The dashboard refreshes every 5 minutes, and the flows and individual chain pages refresh every 15 minutes.",
  },
];

function referenceAtDaysAgo(
  history: { date: number; tvl: number }[],
  days: number
): { date: number; tvl: number } | null {
  if (history.length === 0) return null;
  const latest = history[history.length - 1];
  const targetDate = latest.date - days * 86400;
  let reference: { date: number; tvl: number } | null = null;
  for (const p of history) {
    if (p.date <= targetDate) reference = p;
    else break;
  }
  return reference;
}

export default async function DashboardPage() {
  const [globalHistory, chains] = await Promise.all([getGlobalTvlHistory(), getTopChainSummaries()]);

  const latestGlobal = globalHistory[globalHistory.length - 1];
  const ref24h = referenceAtDaysAgo(globalHistory, 1);
  const ref7d = referenceAtDaysAgo(globalHistory, 7);

  const change24h = ref24h && ref24h.tvl > 0 ? (latestGlobal.tvl - ref24h.tvl) / ref24h.tvl : null;
  const change7d = ref7d && ref7d.tvl > 0 ? (latestGlobal.tvl - ref7d.tvl) / ref7d.tvl : null;
  const change7dAbs = ref7d ? latestGlobal.tvl - ref7d.tvl : null;

  const totalStablecoin = chains.reduce((sum, c) => sum + c.stablecoinSupply, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Cross-chain TVL dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Total value locked across every major blockchain, updated every few minutes.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ color: "var(--delta-good)", background: "rgba(12, 163, 12, 0.12)" }}
        >
          <span className="live-dot" style={{ background: "var(--delta-good)" }} />
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile
          icon={Coins}
          label="Total DeFi TVL"
          value={latestGlobal ? formatUsdCompact(latestGlobal.tvl) : "—"}
          delta={change24h}
          deltaLabel="24h"
        />
        <StatTile
          icon={TrendUp}
          label="7-day change"
          value={change7dAbs !== null ? formatUsdCompact(change7dAbs) : "—"}
          delta={change7d}
          deltaLabel="7d"
        />
        <StatTile
          icon={CurrencyCircleDollar}
          label="Tracked stablecoin supply (top chains)"
          value={formatUsdCompact(totalStablecoin)}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Chains by TVL
        </h2>
        <ChainTable chains={chains} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Frequently asked questions
        </h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq) => (
            <details key={faq.question} className="viz-card p-4 group">
              <summary
                className="cursor-pointer list-none font-medium marker:content-none"
                style={{ color: "var(--text-primary)" }}
              >
                {faq.question}
              </summary>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      <JsonLd data={faqSchema(FAQS)} />
    </div>
  );
}
