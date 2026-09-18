"use client";

import { useState } from "react";
import { toSlug } from "@/lib/format";

/**
 * DefiLlama's own icon CDN, keyed by the same lowercase-hyphenated slug we
 * already use for chain URLs (verified against their `name` field for the
 * whole chain list). Falls back to a monogram badge for the handful of
 * long-tail chains that don't have an icon there.
 */
export function ChainIcon({ name, size = 24 }: { name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const slug = toSlug(name);

  if (failed) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{ width: size, height: size, background: "var(--surface-2)", color: "var(--text-secondary)" }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny external decorative icon, not worth next/image config
    <img
      src={`https://icons.llamao.fi/icons/chains/rsz_${slug}?w=${size * 2}&h=${size * 2}`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0 rounded-full"
      style={{ width: size, height: size, objectFit: "cover", background: "var(--surface-2)" }}
      onError={() => setFailed(true)}
    />
  );
}
