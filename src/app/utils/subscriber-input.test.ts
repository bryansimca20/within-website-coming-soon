import { describe, expect, test } from "vitest";

import {
  normalizeEmail,
  normalizeFullName,
  normalizeInstagramHandle,
  parseSubscriberInput,
  SUBSCRIBER_FIELD_ERROR,
  validateField,
} from "./subscriber-input";

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

describe("normalizeFullName", () => {
  test("splits a two-word name on the space", () => {
    expect(normalizeFullName("Bryan Simca")).toEqual({ firstName: "Bryan", lastName: "Simca" });
  });

  test("keeps everything after the first space as the last name", () => {
    expect(normalizeFullName("Bryan Aditya Simca")).toEqual({
      firstName: "Bryan",
      lastName: "Aditya Simca",
    });
  });

  test("a single token becomes the first name with a null last name", () => {
    expect(normalizeFullName("Cher")).toEqual({ firstName: "Cher", lastName: null });
  });

  test("collapses and trims surrounding whitespace", () => {
    expect(normalizeFullName("   Bryan   Simca  ")).toEqual({ firstName: "Bryan", lastName: "Simca" });
  });

  test("rejects an empty or whitespace-only name", () => {
    expect(normalizeFullName("   ")).toBeNull();
  });

  test("rejects a name longer than 100 characters", () => {
    expect(normalizeFullName("a".repeat(101))).toBeNull();
  });
});

describe("parseSubscriberInput", () => {
  test("accepts an email, name, and handle", () => {
    expect(
      parseSubscriberInput({
        fullName: "Bryan Simca",
        email: "bryan@example.com",
        instagramHandle: "@within.id",
      })
    ).toEqual({
      ok: true,
      firstName: "Bryan",
      lastName: "Simca",
      email: "bryan@example.com",
      instagramHandle: "within.id",
    });
  });

  test("rejects a missing handle, because Instagram is required", () => {
    expect(
      parseSubscriberInput({ fullName: "Bryan Simca", email: "bryan@example.com", instagramHandle: "  " })
    ).toEqual({
      ok: false,
      field: "instagramHandle",
      message: SUBSCRIBER_FIELD_ERROR.instagramHandle,
    });
  });

  test("rejects an invalid email before looking at the name", () => {
    const result = parseSubscriberInput({ fullName: "  ", email: "nope", instagramHandle: "" });

    expect(result).toEqual({ ok: false, field: "email", message: SUBSCRIBER_FIELD_ERROR.email });
  });

  test("rejects a missing name before looking at the handle", () => {
    const result = parseSubscriberInput({
      fullName: "  ",
      email: "bryan@example.com",
      instagramHandle: "also bad",
    });

    expect(result).toEqual({ ok: false, field: "fullName", message: SUBSCRIBER_FIELD_ERROR.fullName });
  });

  test("rejects a supplied but malformed handle", () => {
    const result = parseSubscriberInput({
      fullName: "Bryan Simca",
      email: "bryan@example.com",
      instagramHandle: "not a handle",
    });

    expect(result).toEqual({
      ok: false,
      field: "instagramHandle",
      message: SUBSCRIBER_FIELD_ERROR.instagramHandle,
    });
  });
});

describe("validateField", () => {
  test("flags an empty name", () => {
    expect(validateField("fullName", "   ")).toBe(SUBSCRIBER_FIELD_ERROR.fullName);
  });

  test("accepts a present name", () => {
    expect(validateField("fullName", "Bryan Simca")).toBeNull();
  });

  test("flags an invalid email", () => {
    expect(validateField("email", "nope")).toBe(SUBSCRIBER_FIELD_ERROR.email);
  });

  test("accepts a valid email", () => {
    expect(validateField("email", "bryan@example.com")).toBeNull();
  });

  test("flags an empty Instagram handle, because it is required", () => {
    expect(validateField("instagramHandle", "  ")).toBe(SUBSCRIBER_FIELD_ERROR.instagramHandle);
  });

  test("flags a malformed Instagram handle", () => {
    expect(validateField("instagramHandle", "not a handle")).toBe(SUBSCRIBER_FIELD_ERROR.instagramHandle);
  });

  test("accepts a valid Instagram handle", () => {
    expect(validateField("instagramHandle", "@within.id")).toBeNull();
  });
});
