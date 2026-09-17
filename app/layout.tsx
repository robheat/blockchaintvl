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

export const metadata: Metadata = {
  title: "BlockchainTVL",
  description: "Where crypto capital is moving between chains — TVL and stablecoin flow tracking.",
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
              BlockchainTVL
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
