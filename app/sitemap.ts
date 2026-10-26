import type { MetadataRoute } from "next";
import { getChainDirectory } from "@/lib/chains";
import { LEGAL_EFFECTIVE_DATE } from "@/lib/legal";

export const revalidate = 3600;

const BASE_URL = "https://www.chaintvl.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const chains = await getChainDirectory().catch(() => []);
  const now = new Date();
  const legalModified = new Date(`${LEGAL_EFFECTIVE_DATE}T00:00:00Z`);

  const chainEntries: MetadataRoute.Sitemap = chains.map((chain) => ({
    url: `${BASE_URL}/chain/${chain.slug}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/chains`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/flows`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: legalModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: legalModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...chainEntries,
  ];
}
