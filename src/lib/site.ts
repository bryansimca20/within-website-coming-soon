/** The live domain. The apex redirects here, so links skip the hop. */
const PRODUCTION_URL = "https://www.getwithin.id";

/** This deployment's own origin: an explicit override, else the Vercel preview host, localhost in dev, else production. */
export function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_ENV === "preview") {
    const host = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
    if (host) return `https://${host}`;
  }
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return PRODUCTION_URL;
}

/** Base for every absolute URL the site emits (metadata, emails, the Snap finish callback). */
export const SITE_URL = resolveSiteUrl();

/** Brand name used across metadata and structured data. */
export const SITE_NAME = "WITHIN";

/** Default meta description — honest, keyword-bearing, on-brand. */
export const SITE_DESCRIPTION =
  "Take back what you lose in the heat. Electrolytes dosed to the milligram: 1,000 mg sodium, 250 mg potassium, 50 mg magnesium per sachet. Zero sugar. Join the waitlist to hear first at launch.";

/** Instagram — the only live channel before launch. */
export const INSTAGRAM_HANDLE = "@withinrecovery";
export const INSTAGRAM_URL = "https://instagram.com/withinrecovery";
