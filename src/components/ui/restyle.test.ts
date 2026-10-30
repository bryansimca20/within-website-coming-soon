import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

const UI = join(process.cwd(), "src/components/ui");

describe("WITHIN-restyled ui primitives", () => {
  test.each(readdirSync(UI).filter((name) => name.endsWith(".tsx")))("%s has no dark: variant (the site is light-only)", (name) => {
    expect(readFileSync(join(UI, name), "utf8")).not.toMatch(/\bdark:/);
  });
});
