const SITE_URL = "https://www.chaintvl.com";
const SITE_NAME = "ChainTVL";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Track total value locked (TVL) across every major blockchain and see where crypto capital is moving between chains.",
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function chainDatasetSchema(opts: { chainName: string; url: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${opts.chainName} TVL and stablecoin supply history`,
    description: opts.description,
    url: opts.url,
    variableMeasured: ["Total value locked (USD)", "Stablecoin circulating supply (USD)"],
    temporalCoverage: "2017-01-01/..",
    creator: {
      "@type": "Organization",
      name: "DefiLlama",
      url: "https://defillama.com",
    },
    isBasedOn: ["https://api.llama.fi", "https://stablecoins.llama.fi"],
  };
}
