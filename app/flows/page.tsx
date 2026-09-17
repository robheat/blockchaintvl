import type { Metadata } from "next";
import Link from "next/link";
import { getFlowChangeMetrics, WINDOWS, type Window, type FlowMetric } from "@/lib/chains";
import { computeReallocation } from "@/lib/flows";
import { FlowSankey } from "@/components/FlowSankey";
import { formatUsdCompact } from "@/lib/format";

export const revalidate = 900;

const flowsTitle = "Cross-Chain Flows";
const flowsDescription =
  "See which blockchains are gaining and losing TVL and stablecoin supply, visualized as a cross-chain capital flow diagram. Filter by 24h, 7d, or 30d.";

export const metadata: Metadata = {
  title: flowsTitle,
  description: flowsDescription,
  openGraph: { title: flowsTitle, description: flowsDescription },
  twitter: { card: "summary_large_image", title: flowsTitle, description: flowsDescription },
};

const METRICS: { key: FlowMetric; label: string }[] = [
  { key: "tvl", label: "TVL" },
  { key: "stablecoin", label: "Stablecoin supply" },
];

function isWindow(value: string | undefined): value is Window {
  return !!value && (WINDOWS as string[]).includes(value);
}

function isMetric(value: string | undefined): value is FlowMetric {
  return value === "tvl" || value === "stablecoin";
}

function FilterPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm px-3 py-1.5 rounded-full border transition-colors"
      style={{
        borderColor: active ? "var(--flow-inflow)" : "var(--border-hairline)",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        background: active ? "var(--series-tvl-wash)" : "transparent",
      }}
    >
      {children}
    </Link>
  );
}

export default async function FlowsPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string; metric?: string }>;
}) {
  const params = await searchParams;
  const window: Window = isWindow(params.window) ? params.window : "7d";
  const metric: FlowMetric = isMetric(params.metric) ? params.metric : "tvl";

  const metrics = await getFlowChangeMetrics(window, metric);
  const { nodes, links, totalOutflow, totalInflow } = computeReallocation(metrics);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Cross-chain flows
        </h1>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
          Chains losing share on the left, chains gaining share on the right. Link widths are a{" "}
          <strong>modeled reallocation</strong> of the net change — not literal bridge-transaction
          routes, since DefiLlama&apos;s bridge-volume API now requires a paid plan. Widths are
          proportional to each chain&apos;s share of total outflow / inflow for the window.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {WINDOWS.map((w) => (
            <FilterPill key={w} href={`/flows?window=${w}&metric=${metric}`} active={w === window}>
              {w}
            </FilterPill>
          ))}
        </div>
        <div className="flex gap-2">
          {METRICS.map((m) => (
            <FilterPill key={m.key} href={`/flows?window=${window}&metric=${m.key}`} active={m.key === metric}>
              {m.label}
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="viz-card p-4">
        <FlowSankey nodes={nodes} links={links} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
        <div className="viz-card p-4">
          <div style={{ color: "var(--text-muted)" }}>Total outflow (losing chains)</div>
          <div className="text-lg font-semibold" style={{ color: "var(--flow-outflow)" }}>
            {formatUsdCompact(totalOutflow)}
          </div>
        </div>
        <div className="viz-card p-4">
          <div style={{ color: "var(--text-muted)" }}>Total inflow (gaining chains)</div>
          <div className="text-lg font-semibold" style={{ color: "var(--flow-inflow)" }}>
            {formatUsdCompact(totalInflow)}
          </div>
        </div>
      </div>
    </div>
  );
}
