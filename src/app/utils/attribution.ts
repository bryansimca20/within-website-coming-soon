import { COHORT_SLUGS } from "@/components/cohort/utils/members";

/** Where a request came from: a founding member's `ref` slug and the brief's UTM parameters. */
export interface IAttribution {
  ref: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

/** Query-string and form-field names, in the order they are read. */
export const ATTRIBUTION_FIELDS: Record<keyof IAttribution, string> = {
  ref: "ref",
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  utmContent: "utm_content",
  utmTerm: "utm_term",
};

export const EMPTY_ATTRIBUTION: IAttribution = {
  ref: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmContent: null,
  utmTerm: null,
};

const REF_PATTERN = /^[a-z0-9-]{1,30}$/;

const MAX_UTM_LENGTH = 100;

/** Lowercased slug of letters, digits and hyphens, or null when the value cannot be one. */
export function sanitizeRef(raw: string): string | null {
  const candidate = raw.trim().toLowerCase();

  return REF_PATTERN.test(candidate) ? candidate : null;
}

/** Trimmed UTM value capped at 100 characters, or null when empty. */
export function sanitizeUtm(raw: string): string | null {
  const candidate = raw.trim().slice(0, MAX_UTM_LENGTH);

  return candidate === "" ? null : candidate;
}

/** Reads `ref` and the five `utm_*` parameters from a query string such as `window.location.search`. */
export function readAttributionFromSearch(search: string): IAttribution {
  const params = new URLSearchParams(search);
  const read = (name: string) => params.get(name) ?? "";

  return {
    ref: sanitizeRef(read(ATTRIBUTION_FIELDS.ref)),
    utmSource: sanitizeUtm(read(ATTRIBUTION_FIELDS.utmSource)),
    utmMedium: sanitizeUtm(read(ATTRIBUTION_FIELDS.utmMedium)),
    utmCampaign: sanitizeUtm(read(ATTRIBUTION_FIELDS.utmCampaign)),
    utmContent: sanitizeUtm(read(ATTRIBUTION_FIELDS.utmContent)),
    utmTerm: sanitizeUtm(read(ATTRIBUTION_FIELDS.utmTerm)),
  };
}

/** Field by field, the current URL wins and an earlier visit fills whatever it left empty. */
export function mergeAttribution(fromUrl: IAttribution, stored: IAttribution | null): IAttribution {
  if (stored === null) {
    return fromUrl;
  }

  return {
    ref: fromUrl.ref ?? stored.ref,
    utmSource: fromUrl.utmSource ?? stored.utmSource,
    utmMedium: fromUrl.utmMedium ?? stored.utmMedium,
    utmCampaign: fromUrl.utmCampaign ?? stored.utmCampaign,
    utmContent: fromUrl.utmContent ?? stored.utmContent,
    utmTerm: fromUrl.utmTerm ?? stored.utmTerm,
  };
}

/** One "source" string for admin and the export, whichever link scheme the visitor followed. */
export function resolveSource(attribution: IAttribution): string {
  return attribution.ref ?? attribution.utmContent ?? attribution.utmSource ?? "direct";
}

/** True when a ref is one of the eight founding members' slugs. */
export function isRosterSlug(ref: string): boolean {
  return COHORT_SLUGS.includes(ref);
}

/** The Shopify customer tag for a referred signup. */
export function buildReferralTag(slug: string): string {
  return `ref-${slug}`;
}
