"use client";

import { useState } from "react";

export function ProtocolIcon({ name, logo, size = 20 }: { name: string; logo: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed || !logo) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
        style={{ width: size, height: size, background: "var(--surface-2)", color: "var(--text-secondary)" }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny external decorative icon, not worth next/image config
    <img
      src={logo}
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
