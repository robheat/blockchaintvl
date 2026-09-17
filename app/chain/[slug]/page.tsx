import { notFound } from "next/navigation";
import { getChainDetail } from "@/lib/chains";
import { TrendChart } from "@/components/TrendChart";
import { StatTile } from "@/components/StatTile";
import { formatUsdCompact } from "@/lib/format";

export const revalidate = 900;

export default async function ChainDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chain = await getChainDetail(slug);

  if (!chain) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          Rank #{chain.rank} by TVL
        </span>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          {chain.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile label="Total value locked" value={formatUsdCompact(chain.tvl)} />
        <StatTile
          label="Stablecoin supply"
          value={chain.stablecoinSupply > 0 ? formatUsdCompact(chain.stablecoinSupply) : "No data"}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          TVL history
        </h2>
        <div className="viz-card p-4">
          <TrendChart points={chain.tvlHistory.map((p) => ({ date: p.date, value: p.tvl }))} />
        </div>
      </div>

      {chain.stablecoinHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Stablecoin supply history
          </h2>
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
            A proxy for capital moving in and out of {chain.name} via stablecoins.
          </p>
          <div className="viz-card p-4">
            <TrendChart
              points={chain.stablecoinHistory.map((p) => ({ date: p.date, value: p.totalCirculatingUSD }))}
              color="var(--flow-inflow)"
              washColor="var(--series-tvl-wash)"
            />
          </div>
        </div>
      )}
    </div>
  );
}
