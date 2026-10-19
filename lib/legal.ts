export const LEGAL_EFFECTIVE_DATE = "2026-10-19";
export const CONTACT_EMAIL = "contact@chaintvl.com";

/** Deterministic across server/client: fixed locale and UTC zone. */
export function formatLegalDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
