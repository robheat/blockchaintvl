"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react";
import type { ChainPickerEntry } from "@/lib/chains";
import type { CompareMetric, CompareRange } from "@/lib/compare";

const SERIES_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)"];

export function ChainPicker({
  allChains,
  selectedSlugs,
  maxChains,
  range,
  metric,
}: {
  allChains: ChainPickerEntry[];
  selectedSlugs: string[];
  maxChains: number;
  range: CompareRange;
  metric: CompareMetric;
}) {
  const router = useRouter();

  function buildHref(slugs: string[]): string {
    const searchParams = new URLSearchParams();
    if (slugs.length > 0) searchParams.set("chains", slugs.join(","));
    searchParams.set("range", range);
    searchParams.set("metric", metric);
    return `/compare?${searchParams.toString()}`;
  }
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const selected = selectedSlugs
    .map((slug) => allChains.find((c) => c.slug === slug))
    .filter((c): c is ChainPickerEntry => !!c);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allChains.filter((c) => !selectedSlugs.includes(c.slug) && c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allChains, selectedSlugs]);

  function navigate(slugs: string[]) {
    startTransition(() => {
      router.push(buildHref(slugs));
    });
  }

  function addChain(slug: string) {
    if (selectedSlugs.includes(slug) || selectedSlugs.length >= maxChains) return;
    setQuery("");
    navigate([...selectedSlugs, slug]);
  }

  function removeChain(slug: string) {
    navigate(selectedSlugs.filter((s) => s !== slug));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {selected.map((c, i) => (
          <span
            key={c.slug}
            className="flex items-center gap-1.5 text-sm pl-2.5 pr-1.5 py-1 rounded-full"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-hairline)" }}
          >
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            <span style={{ color: "var(--text-primary)" }}>{c.name}</span>
            <button
              onClick={() => removeChain(c.slug)}
              className="p-0.5 rounded-full transition-colors hover:bg-[var(--surface-1)]"
              aria-label={`Remove ${c.name}`}
            >
              <X size={12} weight="bold" color="var(--text-muted)" />
            </button>
          </span>
        ))}
        {selected.length === 0 && (
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            No chains selected.
          </span>
        )}
      </div>

      {selectedSlugs.length < maxChains && (
        <div className="relative max-w-sm">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Add a chain to compare"
            className="w-full text-sm px-3 py-2 rounded-lg outline-none"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border-hairline)", color: "var(--text-primary)" }}
          />
          {results.length > 0 && (
            <div
              className="absolute z-10 mt-1 w-full rounded-lg overflow-hidden"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border-hairline)" }}
            >
              {results.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => addChain(c.slug)}
                  className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-2)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
