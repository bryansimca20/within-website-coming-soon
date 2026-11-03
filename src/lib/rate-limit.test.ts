import { describe, expect, test } from "vitest";

import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  test("allows up to the limit, then blocks", () => {
    const allow = createRateLimiter({ windowMs: 1000, maxAttempts: 2 });

    expect(allow("ip", 0)).toBe(true);
    expect(allow("ip", 1)).toBe(true);
    expect(allow("ip", 2)).toBe(false);
  });

  test("resets once the window passes", () => {
    const allow = createRateLimiter({ windowMs: 1000, maxAttempts: 1 });
    allow("ip", 0);

    expect(allow("ip", 1000)).toBe(true);
  });

  test("counts keys separately", () => {
    const allow = createRateLimiter({ windowMs: 1000, maxAttempts: 1 });
    allow("a", 0);

    expect(allow("b", 0)).toBe(true);
  });
});
