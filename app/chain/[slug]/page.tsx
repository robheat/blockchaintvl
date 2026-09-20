import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Coins, CurrencyCircleDollar } from "@phosphor-icons/react/ssr";
import { getChainDetail, type ChainDetail } from "@/lib/chains";
import { TrendChart } from "@/components/TrendChart";
import { StatTile } from "@/components/StatTile";
import { ChainIcon } from "@/components/ChainIcon";
import { JsonLd } from "@/components/JsonLd";
import { formatPercent, formatUsdCompact } from "@/lib/format";
import { breadcrumbSchema, chainDatasetSchema } from "@/lib/schema";

export const revalidate = 900;

const SITE_URL = "https://www.chaintvl.com";

function buildSummary(chain: ChainDetail): string {
  const stablecoinPart =
    chain.stablecoinSupply > 0 ? ` and ${formatUsdCompact(chain.stablecoinSupply)} in stablecoin supply` : "";
  const change7d = chain.tvlChange["7d"];
  const trendPart =
    change7d !== null
      ? ` Over the past 7 days, its TVL is ${change7d >= 0 ? "up" : "down"} ${formatPercent(Math.abs(change7d), { signed: false })}.`
      : "";
  return `${chain.name} ranks #${chain.rank} by total value locked among blockchains DefiLlama tracks, with ${formatUsdCompact(chain.tvl)} in TVL${stablecoinPart}.${trendPart}`;
}

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

  const title = `${chain.name} TVL`;
  const description = `${buildSummary(chain)} See ${chain.name}'s historical TVL and stablecoin supply trends on ChainTVL.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/chain/${chain.slug}`,
    },
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

  const chainUrl = `${SITE_URL}/chain/${chain.slug}`;
  const summary = buildSummary(chain);

  return (
    <div className="flex flex-col gap-8">
      <nav className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }} aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-[var(--text-primary)]">
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{chain.name}</span>
      </nav>

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
        <p className="text-sm mt-2 max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {summary}
        </p>
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

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Dashboard", url: `${SITE_URL}/` },
            { name: chain.name, url: chainUrl },
          ]),
          chainDatasetSchema({ chainName: chain.name, url: chainUrl, description: summary }),
        ]}
      />
    </div>
  );
}
