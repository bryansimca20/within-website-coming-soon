import { describe, expect, test } from "vitest";

import { HONEYPOT_MIN_ELAPSED_MS, isHoneypotTripped } from "./honeypot";

const RENDERED_AT = 1_770_000_000_000;

describe("isHoneypotTripped", () => {
  test("passes a human who filled nothing hidden and took their time", () => {
    const tripped = isHoneypotTripped({
      trap: "",
      renderedAt: String(RENDERED_AT),
      now: RENDERED_AT + 8_000,
    });

    expect(tripped).toBe(false);
  });

  test("trips when the hidden field was filled in", () => {
    const tripped = isHoneypotTripped({
      trap: "Acme Inc",
      renderedAt: String(RENDERED_AT),
      now: RENDERED_AT + 8_000,
    });

    expect(tripped).toBe(true);
  });

  test("trips when the form was submitted faster than a human could", () => {
    const tripped = isHoneypotTripped({
      trap: "",
      renderedAt: String(RENDERED_AT),
      now: RENDERED_AT + HONEYPOT_MIN_ELAPSED_MS - 1,
    });

    expect(tripped).toBe(true);
  });

  test("passes at exactly the minimum elapsed time", () => {
    const tripped = isHoneypotTripped({
      trap: "",
      renderedAt: String(RENDERED_AT),
      now: RENDERED_AT + HONEYPOT_MIN_ELAPSED_MS,
    });

    expect(tripped).toBe(false);
  });

  test("trips when the timestamp is missing", () => {
    expect(isHoneypotTripped({ trap: "", renderedAt: "", now: RENDERED_AT })).toBe(true);
  });

  test("trips when the timestamp is not a number", () => {
    expect(isHoneypotTripped({ trap: "", renderedAt: "soon", now: RENDERED_AT })).toBe(true);
  });

  test("trips when the timestamp is in the future", () => {
    const tripped = isHoneypotTripped({
      trap: "",
      renderedAt: String(RENDERED_AT + 60_000),
      now: RENDERED_AT,
    });

    expect(tripped).toBe(true);
  });
});
