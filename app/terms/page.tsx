import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { JsonLd } from "@/components/JsonLd";
import { CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE } from "@/lib/legal";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

const title = "Terms of Service";
const description =
  "Terms for using ChainTVL: the site is informational only and not financial advice, data comes from DefiLlama as-is, and cross-chain flows are a modeled estimate.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

export default function TermsPage() {
  return (
    <>
      <LegalPage title={title}>
        <p className="mt-6">
          These terms apply to your use of www.chaintvl.com (&ldquo;ChainTVL&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
          By using the site you agree to them. If you don&apos;t agree, please don&apos;t use the site.
        </p>

        <h2>Information only, not advice</h2>
        <p>
          ChainTVL publishes statistics and charts about blockchains and DeFi protocols for general information.
          Nothing on the site is financial, investment, legal, or tax advice, or a recommendation or offer to buy, sell,
          or hold any asset or to use any protocol. We are not a financial advisor. Crypto assets are volatile and can
          lose value, including all of it. Do your own research and consult a qualified professional before making
          decisions.
        </p>

        <h2>Data sources and accuracy</h2>
        <p>
          Chain TVL, stablecoin supply, and protocol figures come from DefiLlama&apos;s public APIs, and the methodology
          behind those numbers is DefiLlama&apos;s, not ours. Data is cached and refreshed periodically, so it can be
          delayed, incomplete, revised, or wrong. We provide it &ldquo;as is&rdquo; and &ldquo;as available&rdquo; and
          don&apos;t guarantee its accuracy, completeness, or timeliness.
        </p>

        <h2>Cross-chain flows are a model</h2>
        <p>
          The Flows page does not show actual bridge transactions or transfers between chains. It is a modeled
          reallocation estimated from each chain&apos;s net change in TVL or stablecoin supply over a chosen window, and
          the Compare page presents values derived from the same public data, including indexed percent changes. These
          are illustrative estimates and should not be read as a record of where specific funds moved.
        </p>

        <h2>No warranty</h2>
        <p>
          To the fullest extent permitted by law, the site and everything on it is provided without warranties of any
          kind, whether express or implied, including warranties of merchantability, fitness for a particular purpose,
          and non-infringement. We don&apos;t promise that the site will be uninterrupted, secure, or error-free.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, ChainTVL is not liable for any loss or damage arising from your use of,
          or inability to use, the site, or from decisions made in reliance on its content, including trading, investing,
          or protocol-usage losses and any indirect, incidental, or consequential damages.
        </p>

        <h2>Third-party links, names, and logos</h2>
        <p>
          The site links to and displays the names and logos of third-party chains, protocols, and websites, including
          our sister sites CryptoCatalyst and Token Buybacks. These belong to their respective owners, are used only to
          identify them, and do not imply endorsement. We don&apos;t control and aren&apos;t responsible for third-party
          sites, products, or services, and appearing on ChainTVL is not an endorsement or a safety assessment of any
          protocol.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Please don&apos;t interfere with the site or its hosting, attempt to gain unauthorized access, or send
          automated traffic that places an unreasonable load on it. Automated access that respects{" "}
          <Link href="/robots.txt">robots.txt</Link> is fine.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The site&apos;s design, code, and original text are owned by ChainTVL or its licensors. Underlying market data
          belongs to its original providers and remains subject to their terms, including{" "}
          <a href="https://defillama.com" target="_blank" rel="noopener noreferrer">
            DefiLlama
          </a>
          &apos;s.
        </p>

        <h2>Changes to the site and these terms</h2>
        <p>
          We may change, suspend, or discontinue any part of the site at any time. We may also update these terms; when
          we do, we will change the effective date above. Continuing to use the site after an update means you accept
          the updated terms.
        </p>

        <h2>Privacy</h2>
        <p>
          How we handle information is described in our <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalPage>
      <JsonLd
        data={[
          webPageSchema({ path: "/terms", name: title, description, dateModified: LEGAL_EFFECTIVE_DATE }),
          breadcrumbSchema([
            { name: "Dashboard", url: "https://www.chaintvl.com/" },
            { name: title, url: "https://www.chaintvl.com/terms" },
          ]),
        ]}
      />
    </>
  );
}
