import { describe, expect, test } from "vitest";

import {
  buildReferralTag,
  EMPTY_ATTRIBUTION,
  isRosterSlug,
  mergeAttribution,
  readAttributionFromSearch,
  resolveSource,
  sanitizeRef,
  sanitizeUtm,
} from "./attribution";

describe("sanitizeRef", () => {
  test("lowercases and trims a slug", () => {
    expect(sanitizeRef("  Fanny ")).toBe("fanny");
  });

  test("drops anything outside lowercase letters, digits and hyphens", () => {
    expect(sanitizeRef("ref-fanny!")).toBeNull();
    expect(sanitizeRef("")).toBeNull();
    expect(sanitizeRef("a".repeat(31))).toBeNull();
  });
});

describe("sanitizeUtm", () => {
  test("caps a value at 100 characters", () => {
    expect(sanitizeUtm("x".repeat(150))).toHaveLength(100);
  });

  test("nulls an empty value", () => {
    expect(sanitizeUtm("   ")).toBeNull();
  });
});

describe("readAttributionFromSearch", () => {
  test("reads ref and utm values from a query string", () => {
    expect(readAttributionFromSearch("?ref=fanny&utm_source=ig&utm_content=marco")).toEqual({
      ref: "fanny",
      utmSource: "ig",
      utmMedium: null,
      utmCampaign: null,
      utmContent: "marco",
      utmTerm: null,
    });
  });

  test("returns the empty attribution for no query", () => {
    expect(readAttributionFromSearch("")).toEqual(EMPTY_ATTRIBUTION);
  });
});

describe("mergeAttribution", () => {
  test("the URL wins per field and the stored value fills the gaps", () => {
    const merged = mergeAttribution(
      { ...EMPTY_ATTRIBUTION, ref: "fanny" },
      { ...EMPTY_ATTRIBUTION, ref: "marco", utmSource: "ig" }
    );

    expect(merged.ref).toBe("fanny");
    expect(merged.utmSource).toBe("ig");
  });

  test("a null stored attribution leaves the URL values as they are", () => {
    expect(mergeAttribution({ ...EMPTY_ATTRIBUTION, ref: "fanny" }, null).ref).toBe("fanny");
  });
});

describe("resolveSource", () => {
  test("prefers ref, then utm_content, then utm_source, then direct", () => {
    expect(resolveSource({ ...EMPTY_ATTRIBUTION, ref: "fanny", utmContent: "x", utmSource: "y" })).toBe("fanny");
    expect(resolveSource({ ...EMPTY_ATTRIBUTION, utmContent: "marco", utmSource: "ig" })).toBe("marco");
    expect(resolveSource({ ...EMPTY_ATTRIBUTION, utmSource: "ig" })).toBe("ig");
    expect(resolveSource(EMPTY_ATTRIBUTION)).toBe("direct");
  });
});

describe("roster slugs", () => {
  test("knows the eight founding members", () => {
    expect(isRosterSlug("fanny")).toBe(true);
    expect(isRosterSlug("bryan")).toBe(false);
  });

  test("builds the Shopify tag", () => {
    expect(buildReferralTag("fanny")).toBe("ref-fanny");
  });
});
