import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "ChainTVL — Cross-Chain TVL & Capital Flow Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#08090b",
          backgroundImage:
            "radial-gradient(900px 500px at 12% -10%, rgba(57,135,229,0.22), transparent 60%), radial-gradient(700px 420px at 100% 10%, rgba(230,103,103,0.10), transparent 55%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 20,
              background: "rgba(57,135,229,0.14)",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 256 256" fill="none">
              <path
                d="M64 96 L192 96 M192 96 L160 64 M192 96 L160 128 M192 160 L64 160 M64 160 L96 128 M64 160 L96 192"
                stroke="#3987e5"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#f5f6f8", letterSpacing: "-0.02em" }}>
            <span>Chain</span>
            <span style={{ color: "#3987e5" }}>TVL</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 34, color: "#a6abb8", maxWidth: 920 }}>
          Track TVL across every major blockchain and see where crypto capital is moving between chains.
        </div>
      </div>
    ),
    { ...size }
  );
}
