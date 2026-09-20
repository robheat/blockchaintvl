import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { ArrowsLeftRight, ChartBar } from "@phosphor-icons/react/ssr";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "ChainTVL — Cross-Chain TVL & Capital Flow Tracker";
const siteDescription =
  "Track total value locked (TVL) across every major blockchain and see where crypto capital is moving between chains. Live DeFi TVL rankings, stablecoin supply trends, and cross-chain flow charts for Ethereum, Solana, Base, Tron, BSC, and more.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chaintvl.com"),
  title: {
    default: siteTitle,
    template: "%s | ChainTVL",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "TVL tracker",
    "total value locked",
    "cross-chain flows",
    "DeFi TVL",
    "blockchain TVL",
    "stablecoin flows",
    "crypto capital flows",
    "bridge volume",
  ],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://www.chaintvl.com",
    siteName: "ChainTVL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <header
          className="border-b sticky top-0 z-10 backdrop-blur-md"
          style={{ borderColor: "var(--gridline)", background: "rgba(8, 9, 11, 0.72)" }}
        >
          <nav className="max-w-6xl mx-auto flex items-center gap-8 px-6 py-3.5">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "var(--accent-wash)" }}
              >
                <ArrowsLeftRight size={16} weight="bold" color="var(--accent)" />
              </span>
              <span className="font-semibold text-[15px] tracking-tight" style={{ color: "var(--text-primary)" }}>
                Chain<span style={{ color: "var(--accent)" }}>TVL</span>
              </span>
            </Link>
            <div className="flex items-center gap-5">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--text-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <ChartBar size={15} weight="bold" />
                Dashboard
              </Link>
              <Link
                href="/flows"
                className="flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--text-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <ArrowsLeftRight size={15} weight="bold" />
                Flows
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
        <footer
          className="text-xs px-6 py-6 text-center border-t"
          style={{ color: "var(--text-muted)", borderColor: "var(--gridline)" }}
        >
          Data from DefiLlama. TVL and stablecoin-supply figures are free-tier data; cross-chain
          &ldquo;flows&rdquo; are a modeled reallocation, not literal bridge-transaction routes.
        </footer>
      </body>
    </html>
  );
}
