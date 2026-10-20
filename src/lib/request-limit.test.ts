import { describe, expect, test } from "vitest";

import { createSampleRequestLimiter, SAMPLE_REQUESTS_PER_HOUR } from "./request-limit";

describe("createSampleRequestLimiter", () => {
  test("allows five requests an hour per address, then blocks", () => {
    const allow = createSampleRequestLimiter();
    for (let index = 0; index < SAMPLE_REQUESTS_PER_HOUR; index += 1) expect(allow("1.2.3.4", 0)).toBe(true);

    expect(allow("1.2.3.4", 1)).toBe(false);
    expect(allow("5.6.7.8", 1)).toBe(true);
    expect(allow("1.2.3.4", 60 * 60_000)).toBe(true);
  });
});
