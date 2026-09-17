import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // www.chaintvl.com is the canonical domain; send the bare apex there.
      {
        source: "/:path*",
        has: [{ type: "host", value: "chaintvl.com" }],
        destination: "https://www.chaintvl.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
