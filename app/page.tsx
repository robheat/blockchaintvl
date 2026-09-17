import { getGlobalTvlHistory } from "@/lib/defillama";
import { getTopChainSummaries } from "@/lib/chains";
import { StatTile } from "@/components/StatTile";
import { ChainTable } from "@/components/ChainTable";
import { formatUsdCompact } from "@/lib/format";

export const revalidate = 300;

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
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Cross-chain TVL dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Total value locked across every major blockchain, updated every few minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile
          label="Total DeFi TVL"
          value={latestGlobal ? formatUsdCompact(latestGlobal.tvl) : "—"}
          delta={change24h}
          deltaLabel="24h"
        />
        <StatTile
          label="7-day change"
          value={change7dAbs !== null ? formatUsdCompact(change7dAbs) : "—"}
          delta={change7d}
          deltaLabel="7d"
        />
        <StatTile label="Tracked stablecoin supply (top chains)" value={formatUsdCompact(totalStablecoin)} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Chains by TVL
        </h2>
        <ChainTable chains={chains} />
      </div>
    </div>
  );
}
