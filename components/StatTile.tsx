import { formatPercent } from "@/lib/format";

export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
}: {
  label: string;
  value: string;
  delta?: number | null;
  deltaLabel?: string;
}) {
  const hasDelta = typeof delta === "number";
  const isGood = hasDelta && delta! >= 0;

  return (
    <div className="viz-card p-5 flex flex-col gap-1">
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span className="text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
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
  );
}
