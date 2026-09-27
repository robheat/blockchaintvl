import Link from "next/link";

export function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm px-3.5 py-1.5 rounded-full border transition-colors"
      style={
        active
          ? {
              borderColor: "var(--accent)",
              color: "var(--text-primary)",
              background: "var(--accent-wash)",
              fontWeight: 600,
            }
          : {
              borderColor: "var(--border-hairline)",
              color: "var(--text-secondary)",
              background: "var(--surface-1)",
            }
      }
    >
      {children}
    </Link>
  );
}
