import { createRateLimiter } from "./rate-limit";

/** Holds a person can place per hour from one address. Enough for a household, not for a script. */
export const SAMPLE_REQUESTS_PER_HOUR = 5;

/** The limiter the request action uses, so one visitor cannot hold every box in the batch. */
export function createSampleRequestLimiter() {
  return createRateLimiter({ windowMs: 60 * 60_000, maxAttempts: SAMPLE_REQUESTS_PER_HOUR });
}
