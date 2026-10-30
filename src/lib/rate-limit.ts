/** Window and ceiling for one limiter. */
export interface IRateLimitOptions {
  windowMs: number;
  maxAttempts: number;
}

/**
 * In-memory, per-instance limiter. On serverless each instance keeps its own counters, which is
 * enough to blunt a casual script against the area, rates and login endpoints, not a determined one.
 */
export function createRateLimiter({ windowMs, maxAttempts }: IRateLimitOptions) {
  const buckets = new Map<string, { count: number; windowStart: number }>();

  return function allow(key: string, now: number = Date.now()): boolean {
    for (const [bucketKey, bucket] of buckets) {
      if (now - bucket.windowStart >= windowMs) {
        buckets.delete(bucketKey);
      }
    }

    const bucket = buckets.get(key);
    if (bucket === undefined) {
      buckets.set(key, { count: 1, windowStart: now });
      return true;
    }
    if (bucket.count >= maxAttempts) {
      return false;
    }
    bucket.count += 1;
    return true;
  };
}

/** The caller's IP as Vercel forwards it, or "unknown". */
export function clientKey(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
