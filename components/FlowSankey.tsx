"use client";

import { useMemo, useState } from "react";
import { sankey, sankeyLinkHorizontal, type SankeyNode } from "d3-sankey";
import type { FlowNode, FlowLink } from "@/lib/flows";
import { formatUsdCompact } from "@/lib/format";

interface NodeExtra {
  id: string;
  name: string;
  side: "source" | "target";
  value: number;
  synthetic?: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LinkExtra = Record<string, any>;
type LayoutNode = SankeyNode<NodeExtra, LinkExtra>;

const WIDTH = 760;
const ROW_HEIGHT = 36;
const MIN_HEIGHT = 320;
const MARGIN = { top: 20, right: 170, bottom: 20, left: 170 };

interface Tooltip {
  x: number;
  y: number;
  title: string;
  value: string;
}

export function FlowSankey({ nodes, links }: { nodes: FlowNode[]; links: FlowLink[] }) {
  const [hovered, setHovered] = useState<Tooltip | null>(null);

  const { graph, height, linkPath } = useMemo(() => {
    const sourceCount = nodes.filter((n) => n.side === "source").length;
    const targetCount = nodes.filter((n) => n.side === "target").length;
    const height = Math.max(MIN_HEIGHT, Math.max(sourceCount, targetCount) * ROW_HEIGHT + MARGIN.top + MARGIN.bottom);

    const layout = sankey<NodeExtra, LinkExtra>()
      .nodeId((d) => d.id)
      .nodeWidth(14)
      .nodePadding(16)
      .extent([
        [MARGIN.left, MARGIN.top],
        [WIDTH - MARGIN.right, height - MARGIN.bottom],
      ]);

    const graph = layout({
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({ ...l })),
    });

    return { graph, height, linkPath: sankeyLinkHorizontal<NodeExtra, LinkExtra>() };
  }, [nodes, links]);

  if (nodes.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        No net movement between chains in this window.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Fixed pixel width, not viewBox-scaled: on narrow screens the SVG text
          would otherwise shrink below readable size. Scroll horizontally
          instead, same pattern as the chain table. */}
      <div className="overflow-x-auto">
        <svg
          width={WIDTH}
          height={height}
          viewBox={`0 0 ${WIDTH} ${height}`}
          style={{ minWidth: WIDTH }}
          role="img"
          aria-label="Modeled cross-chain flow diagram"
        >
        <g>
          {graph.links.map((link, i) => {
            const source = link.source as LayoutNode;
            const target = link.target as LayoutNode;
            const synthetic = source.synthetic || target.synthetic;
            const strokeColor = synthetic
              ? "var(--flow-neutral)"
              : source.side === "source"
                ? "var(--flow-outflow)"
                : "var(--flow-inflow)";
            return (
              <path
                key={i}
                d={linkPath(link) ?? undefined}
                fill="none"
                stroke={strokeColor}
                strokeOpacity={0.4}
                strokeWidth={Math.max(1, link.width ?? 1)}
                style={{ cursor: "pointer" }}
                onPointerEnter={(e) =>
                  setHovered({
                    x: e.clientX,
                    y: e.clientY,
                    title: `${source.name} → ${target.name}`,
                    value: formatUsdCompact(link.value ?? 0),
                  })
                }
                onPointerMove={(e) => setHovered((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
                onPointerLeave={() => setHovered(null)}
              />
            );
          })}
        </g>
        <g>
          {graph.nodes.map((node) => {
            const x0 = node.x0 ?? 0;
            const x1 = node.x1 ?? 0;
            const y0 = node.y0 ?? 0;
            const y1 = node.y1 ?? 0;
            const fill = node.synthetic
              ? "var(--flow-neutral)"
              : node.side === "source"
                ? "var(--flow-outflow)"
                : "var(--flow-inflow)";
            const labelX = node.side === "source" ? x0 - 8 : x1 + 8;
            const anchor = node.side === "source" ? "end" : "start";
            return (
              <g
                key={node.id}
                style={{ cursor: "pointer" }}
                onPointerEnter={(e) =>
                  setHovered({ x: e.clientX, y: e.clientY, title: node.name, value: formatUsdCompact(node.value ?? 0) })
                }
                onPointerMove={(e) => setHovered((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
                onPointerLeave={() => setHovered(null)}
              >
                <rect x={x0} y={y0} width={Math.max(1, x1 - x0)} height={Math.max(1, y1 - y0)} rx={3} fill={fill} />
                <text x={labelX} y={(y0 + y1) / 2} dy="0.32em" textAnchor={anchor} className="viz-label" fontSize={12}>
                  {node.name}
                </text>
              </g>
            );
          })}
        </g>
        </svg>
      </div>
      <div className="flex justify-between text-xs px-2" style={{ color: "var(--text-muted)" }}>
        <span>Losing share</span>
        <span>Gaining share</span>
      </div>
      {hovered && (
        <div
          className="viz-tooltip"
          style={{ position: "fixed", left: hovered.x + 12, top: hovered.y + 12 }}
        >
          <div className="viz-tooltip-value">{hovered.value}</div>
          <div className="viz-tooltip-label">{hovered.title}</div>
        </div>
      )}
    </div>
  );
}
