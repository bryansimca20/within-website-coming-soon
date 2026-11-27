import { describe, expect, test } from "vitest";

import { normalizeIndonesianPhone } from "./phone";

describe("normalizeIndonesianPhone", () => {
  test.each([
    ["0812 3456 7890"],
    ["628123456 7890"],
    ["+62 812-3456-7890"],
    ["(0812) 3456-7890"],
  ])("normalizes %s to E.164", (raw) => {
    expect(normalizeIndonesianPhone(raw)).toBe("+6281234567890");
  });

  test("rejects a landline that does not start with 8 after the country code", () => {
    expect(normalizeIndonesianPhone("02112345678")).toBeNull();
  });

  test("rejects a number too short to be a mobile", () => {
    expect(normalizeIndonesianPhone("0812345")).toBeNull();
  });

  test("rejects a number too long to be a mobile", () => {
    expect(normalizeIndonesianPhone("081234567890123")).toBeNull();
  });

  test.each([["+81 90 1234 5678"], ["+82 10 1234 5678"], ["+852 9123 4567"], ["+65 9123 4567"]])(
    "rejects the foreign number %s instead of reading it as Indonesian",
    (raw) => {
      expect(normalizeIndonesianPhone(raw)).toBeNull();
    }
  );

  test("rejects empty input", () => {
    expect(normalizeIndonesianPhone("   ")).toBeNull();
  });
});
