import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header
          className="border-b sticky top-0 z-10"
          style={{ borderColor: "var(--gridline)", background: "var(--background)" }}
        >
          <nav className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-4">
            <Link href="/" className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
              ChainTVL
            </Link>
            <Link href="/" className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Dashboard
            </Link>
            <Link href="/flows" className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Flows
            </Link>
          </nav>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
        <footer className="text-xs px-6 py-6 text-center" style={{ color: "var(--text-muted)" }}>
          Data from DefiLlama. TVL and stablecoin-supply figures are free-tier data; cross-chain
          &ldquo;flows&rdquo; are a modeled reallocation, not literal bridge-transaction routes.
        </footer>
      </body>
    </html>
  );
}
