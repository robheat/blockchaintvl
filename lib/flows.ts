import type { ChainMetricChange } from "./chains";

export interface FlowNode {
  id: string;
  name: string;
  side: "source" | "target";
  value: number;
  synthetic?: boolean;
}

export interface FlowLink {
  source: string;
  target: string;
  value: number;
}

export interface ReallocationResult {
  nodes: FlowNode[];
  links: FlowLink[];
  totalOutflow: number;
  totalInflow: number;
}

const MAX_PER_SIDE = 6;
const EPSILON = 1e-6;

function foldOthers(items: ChainMetricChange[], label: string): ChainMetricChange[] {
  if (items.length <= MAX_PER_SIDE) return items;
  const kept = items.slice(0, MAX_PER_SIDE);
  const rest = items.slice(MAX_PER_SIDE);
  const restTotal = rest.reduce((sum, r) => sum + r.change, 0);
  return [...kept, { name: label, change: restTotal, current: 0 }];
}

/**
 * Models how net TVL/stablecoin-supply change redistributes across chains
 * over a window: chains that lost share (sources) vs. gained share (targets),
 * with link widths from an independence-model allocation (each link =
 * source's share of total outflow x target's share of total inflow). This is
 * a modeled reallocation, not literal bridge-transaction routes -- we don't
 * have real chain-to-chain transfer data on DefiLlama's free tier.
 *
 * When outflow and inflow totals don't match (the tracked chains gained or
 * lost capital net), the gap is attributed to a synthetic "New capital" or
 * "Net exit" node so every source's/target's own change is still fully
 * accounted for.
 */
export function computeReallocation(metrics: ChainMetricChange[]): ReallocationResult {
  const sourcesRaw = metrics
    .filter((m) => m.change < -EPSILON)
    .sort((a, b) => a.change - b.change);
  const targetsRaw = metrics
    .filter((m) => m.change > EPSILON)
    .sort((a, b) => b.change - a.change);

  const sources = foldOthers(sourcesRaw, "Other outflow chains");
  const targets = foldOthers(targetsRaw, "Other inflow chains");

  const totalOutflow = sources.reduce((sum, c) => sum + Math.abs(c.change), 0);
  const totalInflow = targets.reduce((sum, c) => sum + c.change, 0);
  const matched = Math.min(totalOutflow, totalInflow);

  const nodes: FlowNode[] = [
    ...sources.map((s) => ({ id: `src:${s.name}`, name: s.name, side: "source" as const, value: Math.abs(s.change) })),
    ...targets.map((t) => ({ id: `dst:${t.name}`, name: t.name, side: "target" as const, value: t.change })),
  ];

  const links: FlowLink[] = [];

  if (matched > EPSILON && totalOutflow > EPSILON && totalInflow > EPSILON) {
    for (const s of sources) {
      for (const t of targets) {
        const value = (matched * Math.abs(s.change) * t.change) / (totalOutflow * totalInflow);
        if (value > EPSILON) links.push({ source: `src:${s.name}`, target: `dst:${t.name}`, value });
      }
    }
  }

  if (totalInflow > totalOutflow + EPSILON) {
    const gap = totalInflow - totalOutflow;
    nodes.push({ id: "src:__new__", name: "New capital", side: "source", value: gap, synthetic: true });
    for (const t of targets) {
      const shortfall = (t.change * gap) / totalInflow;
      if (shortfall > EPSILON) links.push({ source: "src:__new__", target: `dst:${t.name}`, value: shortfall });
    }
  } else if (totalOutflow > totalInflow + EPSILON) {
    const gap = totalOutflow - totalInflow;
    nodes.push({ id: "dst:__exit__", name: "Net exit", side: "target", value: gap, synthetic: true });
    for (const s of sources) {
      const shortfall = (Math.abs(s.change) * gap) / totalOutflow;
      if (shortfall > EPSILON) links.push({ source: `src:${s.name}`, target: "dst:__exit__", value: shortfall });
    }
  }

  return { nodes, links, totalOutflow, totalInflow };
}
