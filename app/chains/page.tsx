import type { Metadata } from "next";
import Link from "next/link";
import { getChainDirectory } from "@/lib/chains";
import { chainAlias } from "@/lib/chain-aliases";
import { ChainIcon } from "@/components/ChainIcon";
import { JsonLd } from "@/components/JsonLd";
import { formatUsdCompact } from "@/lib/format";
import { breadcrumbSchema, itemListSchema, webPageSchema } from "@/lib/schema";
import { socialMetadata } from "@/lib/seo";

export const revalidate = 900;

const SITE_URL = "https://www.chaintvl.com";
const title = "All Blockchains by TVL";
const description =
  "Every blockchain DefiLlama tracks with nonzero total value locked, ranked by TVL, with a page for each chain's TVL history, stablecoin supply and top protocols.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/chains" },
  ...socialMetadata({ title, description, path: "/chains" }),
};

export default async function ChainsPage() {
  const chains = await getChainDirectory();

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }} aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-[var(--text-primary)]">
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>All chains</span>
      </nav>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          All {chains.length} blockchains by TVL
        </h1>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
          Every chain DefiLlama tracks with nonzero total value locked, ranked by current TVL. Each chain has its own
          page with TVL history, stablecoin supply and its top DeFi protocols.
        </p>
      </div>

      <div className="viz-card overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gridline)", background: "var(--surface-2)" }}>
              <th
                className="py-2.5 px-3 text-right text-xs font-medium uppercase tracking-wide w-12"
                style={{ color: "var(--text-secondary)" }}
              >
                #
              </th>
              <th
                className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                Chain
              </th>
              <th
                className="py-2.5 px-3 text-right text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                TVL
              </th>
            </tr>
          </thead>
          <tbody>
            {chains.map((chain) => {
              const alias = chainAlias(chain.slug)?.title;
              return (
                <tr
                  key={chain.slug}
                  style={{ borderBottom: "1px solid var(--gridline)" }}
                  className="transition-colors hover:bg-[var(--surface-2)]"
                >
                  <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {chain.rank}
                  </td>
                  <td className="py-2.5 px-3">
                    <Link href={`/chain/${chain.slug}`} className="group flex items-center gap-2.5">
                      <ChainIcon name={chain.name} size={20} />
                      <span
                        className="font-medium transition-colors group-hover:text-[var(--accent)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {chain.name}
                      </span>
                      {alias && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {alias}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {formatUsdCompact(chain.tvl)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <JsonLd
        data={[
          webPageSchema({ path: "/chains", name: title, description }),
          breadcrumbSchema([
            { name: "Dashboard", url: `${SITE_URL}/` },
            { name: "All chains", url: `${SITE_URL}/chains` },
          ]),
          itemListSchema({
            name: title,
            items: chains.map((c) => ({ name: `${c.name} TVL`, url: `${SITE_URL}/chain/${c.slug}` })),
          }),
        ]}
      />
    </div>
  );
}
