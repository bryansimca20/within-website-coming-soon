import { describe, expect, test } from "vitest";

import { generateAccessToken, generateOrderSuffix, generatePaymentCode } from "./token";

describe("generateAccessToken", () => {
  test("is 24 alphanumeric characters", () => {
    expect(generateAccessToken()).toMatch(/^[A-Za-z0-9]{24}$/);
  });

  test("differs between calls", () => {
    expect(generateAccessToken()).not.toBe(generateAccessToken());
  });
});

describe("generateOrderSuffix", () => {
  test("is 6 uppercase alphanumeric characters", () => {
    expect(generateOrderSuffix()).toMatch(/^[A-Z0-9]{6}$/);
  });
});

describe("generatePaymentCode", () => {
  test("payment codes are 6 characters with no 0, O, 1 or I", () => {
    const codes = Array.from({ length: 2000 }, generatePaymentCode);
    for (const code of codes) expect(code).toMatch(/^[2-9A-HJ-NP-Z]{6}$/);
    expect(new Set(codes).size).toBeGreaterThan(1990);
  });
});
