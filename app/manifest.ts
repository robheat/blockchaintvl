import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ChainTVL — Cross-Chain TVL & Capital Flow Tracker",
    short_name: "ChainTVL",
    description:
      "Track total value locked (TVL) across every major blockchain and see where crypto capital is moving between chains.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090b",
    theme_color: "#08090b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
