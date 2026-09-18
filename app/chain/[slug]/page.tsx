import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Coins, CurrencyCircleDollar } from "@phosphor-icons/react/ssr";
import { getChainDetail } from "@/lib/chains";
import { TrendChart } from "@/components/TrendChart";
import { StatTile } from "@/components/StatTile";
import { ChainIcon } from "@/components/ChainIcon";
import { formatUsdCompact } from "@/lib/format";

export const revalidate = 900;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chain = await getChainDetail(slug);

  if (!chain) {
    return { title: "Chain not found" };
  }

  const stablecoinPart =
    chain.stablecoinSupply > 0 ? `and ${formatUsdCompact(chain.stablecoinSupply)} in stablecoin supply ` : "";
  const description = `${chain.name} has ${formatUsdCompact(chain.tvl)} in total value locked (rank #${chain.rank} by TVL) ${stablecoinPart}right now. See ${chain.name}'s historical TVL and stablecoin supply trends on ChainTVL.`;

  const title = `${chain.name} TVL`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ChainDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chain = await getChainDetail(slug);

  if (!chain) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span
          className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2"
          style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}
        >
          Rank #{chain.rank} by TVL
        </span>
        <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          <ChainIcon name={chain.name} size={32} />
          {chain.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile icon={Coins} label="Total value locked" value={formatUsdCompact(chain.tvl)} />
        <StatTile
          icon={CurrencyCircleDollar}
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
