"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ChainSummary, Window } from "@/lib/chains";
import { formatPercent, formatUsdCompact } from "@/lib/format";

type SortKey = "tvl" | "24h" | "7d" | "30d" | "stablecoinSupply";

const WINDOWS: Window[] = ["24h", "7d", "30d"];

function DeltaCell({ value }: { value: number | null }) {
  if (value === null) {
    return <span style={{ color: "var(--text-muted)" }}>—</span>;
  }
  const isGood = value >= 0;
  return (
    <span style={{ color: isGood ? "var(--delta-good)" : "var(--delta-bad)" }}>
      {formatPercent(value)}
    </span>
  );
}

function Header({
  sortKeyValue,
  activeSortKey,
  descending,
  onToggle,
  children,
}: {
  sortKeyValue: SortKey;
  activeSortKey: SortKey;
  descending: boolean;
  onToggle: (key: SortKey) => void;
  children: React.ReactNode;
}) {
  const active = activeSortKey === sortKeyValue;
  return (
    <th
      onClick={() => onToggle(sortKeyValue)}
      className="cursor-pointer select-none py-2 px-3 text-xs font-medium uppercase tracking-wide text-right"
      style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}
    >
      {children}
      {active && <span className="ml-1">{descending ? "↓" : "↑"}</span>}
    </th>
  );
}

export function ChainTable({ chains }: { chains: ChainSummary[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("tvl");
  const [descending, setDescending] = useState(true);

  const sorted = useMemo(() => {
    const value = (c: ChainSummary): number => {
      if (sortKey === "tvl") return c.tvl;
      if (sortKey === "stablecoinSupply") return c.stablecoinSupply;
      return c.tvlChange[sortKey] ?? Number.NEGATIVE_INFINITY;
    };
    const copy = [...chains].sort((a, b) => value(a) - value(b));
    if (descending) copy.reverse();
    return copy;
  }, [chains, sortKey, descending]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDescending((d) => !d);
    } else {
      setSortKey(key);
      setDescending(true);
    }
  }

  return (
    <div className="viz-card overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--gridline)", background: "var(--surface-2)" }}>
            <th className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
              Chain
            </th>
            <Header sortKeyValue="tvl" activeSortKey={sortKey} descending={descending} onToggle={toggleSort}>
              TVL
            </Header>
            {WINDOWS.map((w) => (
              <Header key={w} sortKeyValue={w} activeSortKey={sortKey} descending={descending} onToggle={toggleSort}>
                {w}
              </Header>
            ))}
            <Header
              sortKeyValue="stablecoinSupply"
              activeSortKey={sortKey}
              descending={descending}
              onToggle={toggleSort}
            >
              Stablecoin supply
            </Header>
          </tr>
        </thead>
        <tbody>
          {sorted.map((chain) => (
            <tr
              key={chain.slug}
              style={{ borderBottom: "1px solid var(--gridline)" }}
              className="transition-colors hover:bg-[var(--surface-2)]"
            >
              <td className="py-3 px-3">
                <Link href={`/chain/${chain.slug}`} className="group flex items-center gap-2.5">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                  >
                    {chain.name.charAt(0).toUpperCase()}
                  </span>
                  <span
                    className="font-medium transition-colors group-hover:text-[var(--accent)]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {chain.name}
                  </span>
                </Link>
              </td>
              <td className="py-3 px-3 text-right tabular-nums" style={{ color: "var(--text-primary)" }}>
                {formatUsdCompact(chain.tvl)}
              </td>
              {WINDOWS.map((w) => (
                <td key={w} className="py-3 px-3 text-right tabular-nums">
                  <DeltaCell value={chain.tvlChange[w]} />
                </td>
              ))}
              <td className="py-3 px-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                {chain.stablecoinSupply > 0 ? formatUsdCompact(chain.stablecoinSupply) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
