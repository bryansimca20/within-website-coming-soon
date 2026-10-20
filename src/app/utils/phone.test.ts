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

  test("rejects empty input", () => {
    expect(normalizeIndonesianPhone("   ")).toBeNull();
  });
});
