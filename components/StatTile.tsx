import type { Icon } from "@phosphor-icons/react";
import { formatPercent } from "@/lib/format";

export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
  icon: IconComponent,
}: {
  label: string;
  value: string;
  delta?: number | null;
  deltaLabel?: string;
  icon: Icon;
}) {
  const hasDelta = typeof delta === "number";
  const isGood = hasDelta && delta! >= 0;

  return (
    <div className="viz-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--accent-wash)" }}
        >
          <IconComponent size={16} weight="bold" color="var(--accent)" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {value}
        </span>
        {hasDelta && (
          <span
            className="text-sm font-medium"
            style={{ color: isGood ? "var(--delta-good)" : "var(--delta-bad)" }}
          >
            {formatPercent(delta!)} {deltaLabel}
          </span>
        )}
      </div>
    </div>
  );
}
