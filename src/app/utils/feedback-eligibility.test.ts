import { describe, expect, test } from "vitest";

import { FeedbackEligibility, feedbackEligibility } from "./feedback-eligibility";

describe("feedbackEligibility", () => {
  test("no order is not found", () => {
    expect(feedbackEligibility(null, false)).toBe(FeedbackEligibility.NotFound);
  });

  test("shipped or delivered may give feedback", () => {
    expect(feedbackEligibility("shipped", false)).toBe(FeedbackEligibility.Ok);
    expect(feedbackEligibility("delivered", false)).toBe(FeedbackEligibility.Ok);
  });

  test("an order that never shipped is not ready", () => {
    for (const status of ["pending_payment", "paid", "expired", "cancelled"] as const) {
      expect(feedbackEligibility(status, false)).toBe(FeedbackEligibility.NotShipped);
    }
  });

  test("feedback already given wins over the status", () => {
    expect(feedbackEligibility("delivered", true)).toBe(FeedbackEligibility.AlreadyGiven);
  });
});
