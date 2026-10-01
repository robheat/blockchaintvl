import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowSquareOut, Coins, CurrencyCircleDollar } from "@phosphor-icons/react/ssr";
import { getChainDetail, type ChainDetail } from "@/lib/chains";
import { getTopProtocolsForChain } from "@/lib/protocols";
import { TrendChart } from "@/components/TrendChart";
import { StatTile } from "@/components/StatTile";
import { ChainIcon } from "@/components/ChainIcon";
import { ProtocolIcon } from "@/components/ProtocolIcon";
import { JsonLd } from "@/components/JsonLd";
import { formatPercent, formatUsdCompact } from "@/lib/format";
import { breadcrumbSchema, chainDatasetSchema } from "@/lib/schema";
import { SISTER_SITES, buybackTokenFor, chainNewsUrl, type BuybackToken } from "@/lib/sister-sites";

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
  const topProtocols = await getTopProtocolsForChain(chain.name);
  const newsUrl = chainNewsUrl(chain.slug);
  // Badge only the first (largest) row per token: Jupiter alone can fill three rows.
  const badgedSymbols = new Set<string>();
  const buybackBySlug = new Map<string, BuybackToken>();
  for (const protocol of topProtocols) {
    const buyback = buybackTokenFor(protocol.slug, protocol.parentProtocol);
    if (!buyback || badgedSymbols.has(buyback.symbol)) continue;
    badgedSymbols.add(buyback.symbol);
    buybackBySlug.set(protocol.slug, buyback);
  }

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
        {newsUrl && (
          <a
            href={newsUrl}
            className="inline-flex items-center gap-1.5 text-sm mt-3 transition-colors hover:text-[var(--text-primary)]"
            style={{ color: "var(--accent)" }}
          >
            Latest {chain.name} news on {SISTER_SITES.cryptocatalyst.name}
            <ArrowRight size={14} weight="bold" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile icon={Coins} label="Total value locked" value={formatUsdCompact(chain.tvl)} />
        <StatTile
          icon={CurrencyCircleDollar}
          label="Stablecoin supply"
          value={chain.stablecoinSupply > 0 ? formatUsdCompact(chain.stablecoinSupply) : "No data"}
        />
      </div>

      {topProtocols.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Top protocols on {chain.name}
          </h2>
          <div className="viz-card overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gridline)", background: "var(--surface-2)" }}>
                  <th
                    className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Protocol
                  </th>
                  <th
                    className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Category
                  </th>
                  <th
                    className="py-2.5 px-3 text-right text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    TVL on {chain.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProtocols.map((protocol) => {
                  const buyback = buybackBySlug.get(protocol.slug);
                  return (
                    <tr key={protocol.slug} style={{ borderBottom: "1px solid var(--gridline)" }}>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          {protocol.url ? (
                            <a
                              href={protocol.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2.5"
                            >
                              <ProtocolIcon name={protocol.name} logo={protocol.logo} size={22} />
                              <span
                                className="font-medium transition-colors group-hover:text-[var(--accent)]"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {protocol.name}
                              </span>
                              <ArrowSquareOut
                                size={13}
                                className="opacity-0 transition-opacity group-hover:opacity-100"
                                style={{ color: "var(--text-muted)" }}
                              />
                            </a>
                          ) : (
                            <span className="flex items-center gap-2.5">
                              <ProtocolIcon name={protocol.name} logo={protocol.logo} size={22} />
                              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                                {protocol.name}
                              </span>
                            </span>
                          )}
                          {buyback && (
                            <a
                              href={buyback.url}
                              title={`${buyback.symbol} buyback history on ${SISTER_SITES.tokenbuybacks.name}`}
                              className="text-xs font-medium px-2 py-0.5 rounded-full transition-colors hover:text-[var(--text-primary)]"
                              style={{ color: "var(--accent)", background: "var(--accent-wash)" }}
                            >
                              {buyback.symbol} buybacks
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3" style={{ color: "var(--text-secondary)" }}>
                        {protocol.category}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums" style={{ color: "var(--text-primary)" }}>
                        {formatUsdCompact(protocol.tvl)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
