import { describe, expect, test } from "vitest";

import {
  FEEDBACK_FELT,
  FEEDBACK_SESSION,
  HEARD_FROM,
  HOPE,
  SESSION_LENGTH,
  SESSIONS_PER_WEEK,
  TRAINING_TYPE,
  WHY_REASON,
  WOULD_REACH_AGAIN,
} from "@/app/utils/sample-options";

import { formatPayButton, formatRupiah, OPTION_LABEL } from "./sample-copy";

describe("OPTION_LABEL", () => {
  test.each([
    ["trainingType", TRAINING_TYPE],
    ["sessionsPerWeek", SESSIONS_PER_WEEK],
    ["sessionLength", SESSION_LENGTH],
    ["heardFrom", HEARD_FROM],
    ["whyReason", WHY_REASON],
    ["hope", HOPE],
    ["feedbackSession", FEEDBACK_SESSION],
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
