import Link from "next/link";
import { LEGAL_EFFECTIVE_DATE, formatLegalDate } from "@/lib/legal";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="legal-prose flex max-w-3xl flex-col">
      <nav className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }} aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-[var(--text-primary)]">
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{title}</span>
      </nav>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Effective {formatLegalDate(LEGAL_EFFECTIVE_DATE)}
      </p>
      {children}
    </article>
  );
}
