import type { Metadata } from "next";
import Link from "next/link";
import {
  getChainPickerList,
  getChainsForComparison,
  COMPARE_MAX_CHAINS,
  type ChainComparisonSeries,
} from "@/lib/chains";
import {
  sliceHistoryByRange,
  toIndexedSeries,
  toRawSeries,
  COMPARE_RANGES,
  type CompareRange,
  type CompareMetric,
} from "@/lib/compare";
import { CompareChart } from "@/components/CompareChart";
import { ChainPicker } from "@/components/ChainPicker";
import { ChainIcon } from "@/components/ChainIcon";
import { FilterPill } from "@/components/FilterPill";
import { JsonLd } from "@/components/JsonLd";
import { formatPercent, formatUsdCompact } from "@/lib/format";
import { breadcrumbSchema } from "@/lib/schema";

export const revalidate = 900;

const compareTitle = "Compare Chains";
const compareDescription =
  "Compare TVL growth across multiple blockchains on one indexed chart, or view raw TVL side by side.";

export const metadata: Metadata = {
  title: compareTitle,
  description: compareDescription,
  alternates: {
    canonical: "/compare",
  },
  openGraph: { title: compareTitle, description: compareDescription },
  twitter: { card: "summary_large_image", title: compareTitle, description: compareDescription },
};

const SERIES_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)"];
const CHANGE_WINDOWS = ["24h", "7d", "30d"] as const;

function isRange(value: string | undefined): value is CompareRange {
  return !!value && (COMPARE_RANGES as string[]).includes(value);
}

function isMetric(value: string | undefined): value is CompareMetric {
  return value === "indexed" || value === "raw";
}

function buildHref(slugs: string[], range: CompareRange, metric: CompareMetric): string {
  const params = new URLSearchParams();
  if (slugs.length > 0) params.set("chains", slugs.join(","));
  params.set("range", range);
  params.set("metric", metric);
  return `/compare?${params.toString()}`;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ chains?: string; range?: string; metric?: string }>;
}) {
  const params = await searchParams;
  const range: CompareRange = isRange(params.range) ? params.range : "1y";
  const metric: CompareMetric = isMetric(params.metric) ? params.metric : "indexed";

  const pickerList = await getChainPickerList();

  let slugs = (params.chains ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, COMPARE_MAX_CHAINS);

  if (slugs.length === 0) {
    slugs = pickerList.slice(0, 3).map((c) => c.slug);
  }

  const chainSeries = await getChainsForComparison(slugs);
  const orderedSeries = slugs
    .map((slug) => chainSeries.find((c) => c.slug === slug))
    .filter((c): c is ChainComparisonSeries => !!c);

  const chartSeries = orderedSeries.map((c, i) => {
    const sliced = sliceHistoryByRange(c.tvlHistory, range);
    const points = metric === "indexed" ? toIndexedSeries(sliced) : toRawSeries(sliced);
    return { name: c.name, color: SERIES_COLORS[i % SERIES_COLORS.length], points };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Compare chains
        </h1>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
          Pick up to {COMPARE_MAX_CHAINS} chains. By default they&apos;re indexed to percent change since
          the start of the range, since chains of very different sizes aren&apos;t comparable as raw
          dollar figures on one chart.
        </p>
      </div>

      <ChainPicker
        allChains={pickerList}
        selectedSlugs={slugs}
        maxChains={COMPARE_MAX_CHAINS}
        range={range}
        metric={metric}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {COMPARE_RANGES.map((r) => (
            <FilterPill key={r} href={buildHref(slugs, r, metric)} active={r === range}>
              {r}
            </FilterPill>
          ))}
        </div>
        <div className="flex gap-2">
          <FilterPill href={buildHref(slugs, range, "indexed")} active={metric === "indexed"}>
            Indexed growth
          </FilterPill>
          <FilterPill href={buildHref(slugs, range, "raw")} active={metric === "raw"}>
            Raw TVL
          </FilterPill>
        </div>
      </div>

      <div className="viz-card p-4">
        <CompareChart series={chartSeries} metric={metric} />
      </div>

      {orderedSeries.length > 0 && (
        <div className="viz-card overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gridline)", background: "var(--surface-2)" }}>
                <th
                  className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Chain
                </th>
                <th
                  className="py-2.5 px-3 text-right text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--text-secondary)" }}
                >
                  TVL
                </th>
                {CHANGE_WINDOWS.map((w) => (
                  <th
                    key={w}
                    className="py-2.5 px-3 text-right text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderedSeries.map((c, i) => (
                <tr key={c.slug} style={{ borderBottom: "1px solid var(--gridline)" }}>
                  <td className="py-3 px-3">
                    <Link href={`/chain/${c.slug}`} className="group flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
                      />
                      <ChainIcon name={c.name} size={20} />
                      <span
                        className="font-medium transition-colors group-hover:text-[var(--accent)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {c.name}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {formatUsdCompact(c.tvl)}
                  </td>
                  {CHANGE_WINDOWS.map((w) => {
                    const value = c.tvlChange[w];
                    return (
                      <td key={w} className="py-3 px-3 text-right tabular-nums">
                        {value !== null ? (
                          <span style={{ color: value >= 0 ? "var(--delta-good)" : "var(--delta-bad)" }}>
                            {formatPercent(value)}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <JsonLd
        data={breadcrumbSchema([
          { name: "Dashboard", url: "https://www.chaintvl.com/" },
          { name: "Compare Chains", url: "https://www.chaintvl.com/compare" },
        ])}
      />
    </div>
  );
}
