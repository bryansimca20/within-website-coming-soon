import { describe, expect, test } from "vitest";

import { normalizeEmail, normalizeInstagramHandle, parseSubscriberInput } from "./subscriber-input";

describe("normalizeEmail", () => {
  test("lowercases and trims a valid address", () => {
    expect(normalizeEmail("  Bryan@Example.COM ")).toBe("bryan@example.com");
  });

  test("rejects an address with no @", () => {
    expect(normalizeEmail("bryanexample.com")).toBeNull();
  });

  test("rejects an address with no domain dot", () => {
    expect(normalizeEmail("bryan@example")).toBeNull();
  });

  test("rejects an empty string", () => {
    expect(normalizeEmail("   ")).toBeNull();
  });

  test("rejects an address containing whitespace", () => {
    expect(normalizeEmail("bry an@example.com")).toBeNull();
  });
});

describe("normalizeInstagramHandle", () => {
  test("strips a leading @", () => {
    expect(normalizeInstagramHandle("@within.id")).toBe("within.id");
  });

  test("lowercases and trims", () => {
    expect(normalizeInstagramHandle("  WithinID  ")).toBe("withinid");
  });

  test("extracts the handle from a pasted profile URL", () => {
    expect(normalizeInstagramHandle("https://www.instagram.com/within.id/")).toBe("within.id");
  });

  test("extracts the handle from a URL with a query string", () => {
    expect(normalizeInstagramHandle("instagram.com/within.id?igsh=abc123")).toBe("within.id");
  });

  test("accepts underscores and periods", () => {
    expect(normalizeInstagramHandle("with_in.id")).toBe("with_in.id");
  });

  test("rejects a handle with a space", () => {
    expect(normalizeInstagramHandle("within id")).toBeNull();
  });

  test("rejects a handle over 30 characters", () => {
    expect(normalizeInstagramHandle("a".repeat(31))).toBeNull();
  });

  test("accepts a handle of exactly 30 characters", () => {
    expect(normalizeInstagramHandle("a".repeat(30))).toBe("a".repeat(30));
  });

  test("rejects an empty string", () => {
    expect(normalizeInstagramHandle("  ")).toBeNull();
  });
});

describe("parseSubscriberInput", () => {
  test("accepts an email with no handle", () => {
    expect(parseSubscriberInput({ email: "bryan@example.com", instagramHandle: "" })).toEqual({
      ok: true,
      email: "bryan@example.com",
      instagramHandle: null,
    });
  });

  test("accepts an email with a handle", () => {
    expect(parseSubscriberInput({ email: "bryan@example.com", instagramHandle: "@within.id" })).toEqual({
      ok: true,
      email: "bryan@example.com",
      instagramHandle: "within.id",
    });
  });

  test("treats a whitespace-only handle as omitted", () => {
    expect(parseSubscriberInput({ email: "bryan@example.com", instagramHandle: "   " })).toEqual({
      ok: true,
      email: "bryan@example.com",
      instagramHandle: null,
    });
  });

  test("rejects an invalid email before looking at the handle", () => {
    const result = parseSubscriberInput({ email: "nope", instagramHandle: "also bad" });

    expect(result).toEqual({ ok: false, field: "email", message: expect.any(String) });
  });

  test("rejects a supplied but invalid handle", () => {
    const result = parseSubscriberInput({ email: "bryan@example.com", instagramHandle: "not a handle" });

    expect(result).toEqual({ ok: false, field: "instagramHandle", message: expect.any(String) });
  });
});
