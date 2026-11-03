import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { resolveSiteUrl } from "./site";

describe("resolveSiteUrl", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_BRANCH_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("NODE_ENV", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("production uses the live domain", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_URL", "within-abc123.vercel.app");
    expect(resolveSiteUrl()).toBe("https://www.getwithin.id");
  });

  test("a preview follows its branch host", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_BRANCH_URL", "within-git-staging.vercel.app");
    vi.stubEnv("VERCEL_URL", "within-abc123.vercel.app");
    expect(resolveSiteUrl()).toBe("https://within-git-staging.vercel.app");
  });

  test("a preview with no branch host uses its deployment host", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "within-abc123.vercel.app");
    expect(resolveSiteUrl()).toBe("https://within-abc123.vercel.app");
  });

  test("local dev stays on localhost", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(resolveSiteUrl()).toBe("http://localhost:3000");
  });

  test("an explicit override wins everywhere", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.getwithin.id");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_BRANCH_URL", "within-git-staging.vercel.app");
    expect(resolveSiteUrl()).toBe("https://staging.getwithin.id");
  });
});
