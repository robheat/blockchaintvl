import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090b",
          backgroundImage: "radial-gradient(130px 110px at 20% 0%, rgba(57,135,229,0.28), transparent 70%)",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 256 256" fill="none">
          <path
            d="M64 96 L192 96 M192 96 L160 64 M192 96 L160 128 M192 160 L64 160 M64 160 L96 128 M64 160 L96 192"
            stroke="#3987e5"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
