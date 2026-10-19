import type { Metadata } from "next";

const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "ChainTVL: Cross-Chain TVL & Capital Flow Tracker",
};

/**
 * A page that sets its own `openGraph`/`twitter` replaces the layout's whole
 * object, which drops the image from app/opengraph-image.tsx and leaves a
 * "summary_large_image" card with nothing to show. Every page's social
 * metadata therefore goes through here so the image is always attached.
 */
export function socialMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.path,
      siteName: "ChainTVL",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [OG_IMAGE.url],
    },
  };
}
