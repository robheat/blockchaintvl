"use client";

import { useMemo, useState } from "react";
import { formatDate, formatUsdCompact } from "@/lib/format";
import type { ComparePoint, CompareMetric } from "@/lib/compare";

export interface CompareSeriesInput {
  name: string;
  color: string;
  points: ComparePoint[];
}

const WIDTH = 720;
const MARGIN = { top: 16, right: 16, bottom: 24, left: 8 };

function formatValue(value: number, metric: CompareMetric): string {
  if (metric === "raw") return formatUsdCompact(value);
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/** Nearest point to `targetDate` in a date-ascending series. */
function nearestPoint(points: ComparePoint[], targetDate: number): ComparePoint | null {
  if (points.length === 0) return null;
  let nearest = points[0];
  let bestDist = Math.abs(points[0].date - targetDate);
  for (const p of points) {
    const dist = Math.abs(p.date - targetDate);
    if (dist < bestDist) {
      bestDist = dist;
      nearest = p;
    }
  }
  return nearest;
}

export function CompareChart({
  series,
  metric,
  height = 340,
}: {
  series: CompareSeriesInput[];
  metric: CompareMetric;
  height?: number;
}) {
  const [hoverX, setHoverX] = useState<number | null>(null);

  const layout = useMemo(() => {
    const nonEmpty = series.filter((s) => s.points.length > 0);
    if (nonEmpty.length === 0) return null;

    const allDates = nonEmpty.flatMap((s) => s.points.map((p) => p.date));
    const allValues = nonEmpty.flatMap((s) => s.points.map((p) => p.value));
    const minX = Math.min(...allDates);
    const maxX = Math.max(...allDates);
    let minY = Math.min(...allValues);
    let maxY = Math.max(...allValues);
    if (metric === "indexed") {
      minY = Math.min(minY, 0);
      maxY = Math.max(maxY, 0);
    }
    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }

    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;
    const xScale = (x: number) => MARGIN.left + ((x - minX) / (maxX - minX || 1)) * innerWidth;
    const yScale = (y: number) => MARGIN.top + innerHeight - ((y - minY) / (maxY - minY || 1)) * innerHeight;
    const dateAt = (px: number) => minX + ((px - MARGIN.left) / innerWidth) * (maxX - minX);

    const paths = nonEmpty.map((s) => {
      const pts = s.points.map((p) => `${xScale(p.date)},${yScale(p.value)}`);
      return { ...s, path: `M${pts.join("L")}`, last: s.points[s.points.length - 1] };
    });

    return { xScale, yScale, dateAt, paths, minX, maxX, zeroY: metric === "indexed" ? yScale(0) : null };
  }, [series, metric, height]);

  if (!layout || layout.paths.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Pick at least one chain to compare.
      </p>
    );
  }

  const { xScale, dateAt, paths, minX, maxX, zeroY } = layout;

  function handleMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    setHoverX(Math.max(MARGIN.left, Math.min(WIDTH - MARGIN.right, relX)));
  }

  const hoverDate = hoverX !== null ? dateAt(hoverX) : null;
  const hoverRows =
    hoverDate !== null
      ? paths
          .map((s) => ({ name: s.name, color: s.color, point: nearestPoint(s.points, hoverDate) }))
          .filter((r): r is { name: string; color: string; point: ComparePoint } => r.point !== null)
      : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {paths.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5 text-sm">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span style={{ color: "var(--text-primary)" }}>{s.name}</span>
            <span style={{ color: "var(--text-secondary)" }}>{formatValue(s.last.value, metric)}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} className="w-full h-auto">
          {[0, 0.5, 1].map((t) => {
            const y = MARGIN.top + t * (height - MARGIN.top - MARGIN.bottom);
            return (
              <line key={t} x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={y} y2={y} stroke="var(--gridline)" strokeWidth={1} />
            );
          })}
          {zeroY !== null && (
            <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={zeroY} y2={zeroY} stroke="var(--baseline)" strokeWidth={1} />
          )}
          {paths.map((s) => (
            <path key={s.name} d={s.path} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {paths.map((s) => (
            <circle
              key={`${s.name}-end`}
              cx={xScale(s.last.date)}
              cy={layout.yScale(s.last.value)}
              r={4}
              fill={s.color}
              stroke="var(--surface-1)"
              strokeWidth={2}
            />
          ))}
          {hoverX !== null && (
            <line x1={hoverX} x2={hoverX} y1={MARGIN.top} y2={height - MARGIN.bottom} stroke="var(--baseline)" strokeWidth={1} />
          )}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={WIDTH - MARGIN.left - MARGIN.right}
            height={height - MARGIN.top - MARGIN.bottom}
            fill="transparent"
            onPointerMove={handleMove}
            onPointerLeave={() => setHoverX(null)}
          />
        </svg>
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          <span>{formatDate(minX)}</span>
          <span>{formatDate(maxX)}</span>
        </div>
        {hoverRows.length > 0 && hoverX !== null && (
          <div
            className="viz-tooltip absolute pointer-events-none"
            style={{
              left: `${(hoverX / WIDTH) * 100}%`,
              top: 0,
              transform: hoverX > WIDTH * 0.7 ? "translate(-100%, -8px)" : "translate(8px, -8px)",
            }}
          >
            <div className="viz-tooltip-label mb-1">{formatDate(hoverRows[0].point.date)}</div>
            {hoverRows.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="viz-tooltip-value">{formatValue(r.point.value, metric)}</span>
                <span className="viz-tooltip-label">{r.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
