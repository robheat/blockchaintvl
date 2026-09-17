"use client";

import { useMemo, useState } from "react";
import { formatDate, formatUsdCompact } from "@/lib/format";

export interface TrendPoint {
  date: number;
  value: number;
}

const WIDTH = 720;
const MARGIN = { top: 16, right: 16, bottom: 24, left: 8 };

export function TrendChart({
  points,
  color = "var(--series-tvl)",
  washColor = "var(--series-tvl-wash)",
  height = 260,
}: {
  points: TrendPoint[];
  color?: string;
  washColor?: string;
  height?: number;
}) {
  const formatValue = formatUsdCompact;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const layout = useMemo(() => {
    if (points.length === 0) return null;
    const xs = points.map((p) => p.date);
    const ys = points.map((p) => p.value);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys, 0);
    const maxY = Math.max(...ys);
    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const xScale = (x: number) => MARGIN.left + ((x - minX) / (maxX - minX || 1)) * innerWidth;
    const yScale = (y: number) => MARGIN.top + innerHeight - ((y - minY) / (maxY - minY || 1)) * innerHeight;

    const linePoints = points.map((p) => `${xScale(p.date)},${yScale(p.value)}`);
    const linePath = `M${linePoints.join("L")}`;
    const areaPath = `${linePath}L${xScale(points[points.length - 1].date)},${yScale(minY)}L${xScale(points[0].date)},${yScale(minY)}Z`;

    return { xScale, yScale, linePath, areaPath };
  }, [points, height]);

  if (!layout || points.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        No data available.
      </p>
    );
  }

  const { xScale, yScale, linePath, areaPath } = layout;
  const latest = points[points.length - 1];
  const hovered = hoverIndex !== null ? points[hoverIndex] : latest;
  const hoveredX = xScale(hovered.date);

  function handleMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(xScale(p.date) - relX);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="w-full h-auto">
        {[0, 0.5, 1].map((t) => {
          const y = MARGIN.top + t * (height - MARGIN.top - MARGIN.bottom);
          return (
            <line
              key={t}
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y}
              y2={y}
              stroke="var(--gridline)"
              strokeWidth={1}
            />
          );
        })}
        <path d={areaPath} fill={washColor} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <circle
          cx={xScale(latest.date)}
          cy={yScale(latest.value)}
          r={4}
          fill={color}
          stroke="var(--surface-1)"
          strokeWidth={2}
        />
        {hoverIndex !== null && (
          <line
            x1={hoveredX}
            x2={hoveredX}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
            stroke="var(--baseline)"
            strokeWidth={1}
          />
        )}
        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={WIDTH - MARGIN.left - MARGIN.right}
          height={height - MARGIN.top - MARGIN.bottom}
          fill="transparent"
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIndex(null)}
        />
      </svg>
      <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        <span>{formatDate(points[0].date)}</span>
        <span>{formatDate(latest.date)}</span>
      </div>
      <div
        className="viz-tooltip absolute pointer-events-none"
        style={{
          left: `${(hoveredX / WIDTH) * 100}%`,
          top: 0,
          transform: "translate(-50%, -110%)",
          opacity: hoverIndex !== null ? 1 : 0,
          transition: "opacity 120ms",
        }}
      >
        <div className="viz-tooltip-value">{formatValue(hovered.value)}</div>
        <div className="viz-tooltip-label">{formatDate(hovered.date)}</div>
      </div>
    </div>
  );
}
