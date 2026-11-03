import { describe, expect, test } from "vitest";

import {
  FEEDBACK_FELT,
  HEARD_FROM,
  HOPE,
  SESSION_LENGTH,
  SESSIONS_PER_WEEK,
  TRAINING_TYPE,
  WHY_REASON,
  WOULD_REACH_AGAIN,
} from "@/app/utils/sample-options";

import { batchCopy, SAMPLE_COPY, formatPayButton, formatRupiah, OPTION_LABEL } from "./sample-copy";

describe("OPTION_LABEL", () => {
  test.each([
    ["trainingType", TRAINING_TYPE],
    ["sessionsPerWeek", SESSIONS_PER_WEEK],
    ["sessionLength", SESSION_LENGTH],
    ["heardFrom", HEARD_FROM],
    ["whyReason", WHY_REASON],
    ["hope", HOPE],
    ["felt", FEEDBACK_FELT],
    ["wouldReachAgain", WOULD_REACH_AGAIN],
  ] as const)("labels every %s key", (group, keys) => {
    const labels: Record<string, string> = OPTION_LABEL[group];
    for (const key of keys) {
      expect(labels[key]).toBeTruthy();
    }
  });
});

describe("formatting", () => {
  test("formats Rupiah with dot thousands", () => {
    expect(formatRupiah(10000)).toBe("Rp 10.000");
    expect(formatRupiah(1250000)).toBe("Rp 1.250.000");
    expect(formatRupiah(900)).toBe("Rp 900");
  });

  test("formats the pay button", () => {
    expect(formatPayButton(10000)).toBe("Pay shipping Rp 10.000");
  });
});

describe("batchCopy", () => {
  test("names the batch and its capacity", () => {
    expect(batchCopy({ label: "Batch 02", capacity: 150 })).toEqual({
      label: "SAMPLE BATCH 02",
      introHeadline: "Be one of the first 150 to train with it.",
      upcomingWhy: "Before WITHIN goes on sale, 150 people who train in the heat get to try it first.",
      closedHeadline: "Batch 02 is claimed.",
      pageTitle: "Sample Batch 02",
    });
  });

  test("no fixed copy names a batch or its size", () => {
    const text = JSON.stringify(SAMPLE_COPY);

    expect(text).not.toMatch(/Batch 0\d|BATCH 0\d/);
    expect(text).not.toMatch(/\b100\b/);
  });

  test("the feedback thank-you makes no claim about how early they were", () => {
    expect(SAMPLE_COPY.feedback.thanksBody[0]).toBe(
      "You were one of the first people to train with WITHIN, and you took the time to tell us how it really went."
    );
  });
});
