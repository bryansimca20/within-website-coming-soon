import { describe, expect, test } from "vitest";

import { parseProductHandle } from "./product-handle";

describe("parseProductHandle", () => {
  test("accepts a Shopify handle, trimmed and lowercased", () => {
    expect(parseProductHandle(" Within-Orange ")).toBe("within-orange");
    expect(parseProductHandle("electrolyte-30")).toBe("electrolyte-30");
  });

  test("blank or missing means store reviews", () => {
    expect(parseProductHandle("")).toBeNull();
    expect(parseProductHandle(null)).toBeNull();
  });

  test("rejects anything that is not a handle", () => {
    expect(parseProductHandle("within orange")).toBeNull();
    expect(parseProductHandle("-orange")).toBeNull();
    expect(parseProductHandle("orange,=1+1")).toBeNull();
    expect(parseProductHandle("a".repeat(256))).toBeNull();
  });
});
