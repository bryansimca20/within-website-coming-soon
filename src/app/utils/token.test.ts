import { describe, expect, test } from "vitest";

import { generateAccessToken, generateOrderSuffix } from "./token";

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
