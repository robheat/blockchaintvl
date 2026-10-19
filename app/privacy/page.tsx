import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { JsonLd } from "@/components/JsonLd";
import { CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE } from "@/lib/legal";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { socialMetadata } from "@/lib/seo";

const title = "Privacy Policy";
const description =
  "What ChainTVL collects when you visit: analytics cookies from Google Analytics, standard hosting logs, and third-party image requests. No accounts, no forms, no ads.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  ...socialMetadata({ title, description, path: "/privacy" }),
};

export default function PrivacyPage() {
  return (
    <>
      <LegalPage title={title}>
        <p className="mt-6">
          This policy explains what information is collected when you visit www.chaintvl.com (&ldquo;ChainTVL&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;). ChainTVL is a read-only dashboard. There are no accounts, no sign-up or
          contact forms, no comments, and no ads, so we don&apos;t ask you for personal information and have nowhere
          for you to enter any.
        </p>

        <h2>Analytics</h2>
        <p>
          We use Google Analytics 4 to understand how the site is used, such as which pages are viewed and how visitors
          find us. Google Analytics sets cookies in your browser (named <strong>_ga</strong> and{" "}
          <strong>_ga_</strong> followed by an identifier) to tell visitors and sessions apart. Google receives standard
          request information with each page view, including your IP address, browser and device type, the page you
          viewed, and the page that referred you. We use the reports Google Analytics provides and do not try to identify
          individual visitors.
        </p>
        <p>
          Google acts as our analytics provider and handles this data under{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google&apos;s Privacy Policy
          </a>
          . You can block or delete these cookies in your browser settings, or install Google&apos;s{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            Analytics opt-out browser add-on
          </a>
          . The site works normally without them.
        </p>

        <h2>Hosting and server logs</h2>
        <p>
          The site is hosted on Vercel. Like most web hosts, Vercel processes and logs basic request details such as
          your IP address, the requested URL, your browser&apos;s user agent, and the time of the request, in order to
          deliver the site, keep it secure, and diagnose problems. See{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            Vercel&apos;s Privacy Policy
          </a>
          .
        </p>

        <h2>Third-party requests from your browser</h2>
        <ul>
          <li>
            <strong>Google Analytics</strong> (googletagmanager.com and google-analytics.com): the analytics script and
            reports described above.
          </li>
          <li>
            <strong>DefiLlama&apos;s icon service</strong> (icons.llamao.fi): chain and protocol logos are loaded
            directly from this service, so it receives your IP address and browser details when a page with logos loads.
          </li>
        </ul>
        <p>
          Fonts are served from our own domain, so loading them does not contact Google Fonts. The TVL, stablecoin and
          protocol figures themselves are fetched by our servers from DefiLlama&apos;s public API, not by your browser,
          and no information about you is sent with those requests.
        </p>

        <h2>Cookies and local storage</h2>
        <p>
          ChainTVL itself does not set cookies or use your browser&apos;s local storage. The only cookies come from
          Google Analytics as described above.
        </p>

        <h2>Links to other sites</h2>
        <p>
          Pages link out to protocol websites, to our sister sites CryptoCatalyst and Token Buybacks, and to other
          third parties. Those sites have their own privacy practices, which we don&apos;t control.
        </p>

        <h2>Retention</h2>
        <p>
          Analytics data is kept according to the retention settings of our Google Analytics property and
          Google&apos;s policies. Hosting logs are kept by Vercel under its own retention practices. We do not keep a
          separate database of visitor information.
        </p>

        <h2>Where data is processed</h2>
        <p>
          Google and Vercel operate internationally, so information about your visit may be processed in countries
          other than your own.
        </p>

        <h2>Children</h2>
        <p>ChainTVL is not directed at children, and we do not knowingly collect information from them.</p>

        <h2>Your choices and requests</h2>
        <p>
          Beyond the cookie controls above, depending on where you live you may have rights over personal data held
          about you. Because the data described here is held by Google and Vercel, requests about it are best directed
          to them, but you are welcome to write to us and we will help where we can.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If we change how the site handles information, we will update this page and its effective date. The current
          version is always at www.chaintvl.com/privacy.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalPage>
      <JsonLd
        data={[
          webPageSchema({ path: "/privacy", name: title, description, dateModified: LEGAL_EFFECTIVE_DATE }),
          breadcrumbSchema([
            { name: "Dashboard", url: "https://www.chaintvl.com/" },
            { name: title, url: "https://www.chaintvl.com/privacy" },
          ]),
        ]}
      />
    </>
  );
}
