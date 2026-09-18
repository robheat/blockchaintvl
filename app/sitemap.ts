import type { MetadataRoute } from "next";
import { getChains } from "@/lib/defillama";
import { toSlug } from "@/lib/format";

export const revalidate = 3600;

const BASE_URL = "https://www.chaintvl.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const chains = await getChains().catch(() => []);

  const seenSlugs = new Set<string>();
  const chainEntries: MetadataRoute.Sitemap = [];

  for (const chain of [...chains].sort((a, b) => b.tvl - a.tvl)) {
    if (chain.tvl <= 0) continue;
    const slug = toSlug(chain.name);
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    chainEntries.push({
      url: `${BASE_URL}/chain/${slug}`,
      changeFrequency: "hourly",
      priority: 0.6,
    });
  }

  return [
    {
      url: BASE_URL,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/flows`,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    ...chainEntries,
  ];
}
