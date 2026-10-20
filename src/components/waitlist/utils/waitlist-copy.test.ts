import { describe, expect, it } from "vitest";

import { formatJoinedTitle } from "./waitlist-copy";

describe("formatJoinedTitle", () => {
  it("greets the person by first name", () => {
    expect(formatJoinedTitle("Bryan")).toBe("Thanks for being early, Bryan.");
  });

  it("keeps the name exactly as typed", () => {
    expect(formatJoinedTitle("bryan")).toBe("Thanks for being early, bryan.");
  });

  it("drops the comma and name when there is no first name", () => {
    expect(formatJoinedTitle("")).toBe("Thanks for being early.");
  });

  it("treats a whitespace-only name as missing", () => {
    expect(formatJoinedTitle("   ")).toBe("Thanks for being early.");
  });
});
