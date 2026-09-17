const preciseUsdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * Hand-rolled instead of Intl's compact notation: V8-in-Node and
 * V8-in-Chromium can round compact currency differently (e.g. "945.6M" vs
 * "945.60M"), which breaks SSR hydration. This is deterministic everywhere.
 */
export function formatUsdCompact(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function formatUsdPrecise(value: number): string {
  return preciseUsdFormatter.format(value);
}

export function formatPercent(value: number, opts: { signed?: boolean } = {}): string {
  const { signed = true } = opts;
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

export function formatDate(unixSeconds: number): string {
  // timeZone is pinned to UTC (not just locale) so this renders identically
  // on the server and in the browser regardless of either one's local zone.
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
