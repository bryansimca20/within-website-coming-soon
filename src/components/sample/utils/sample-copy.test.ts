import { describe, expect, test } from "vitest";

import {
  FEEDBACK_FELT,
  FEEDBACK_SESSION,
  HYDRATION_GOAL,
  MAIN_SPORT,
  SESSION_LENGTH,
  SESSIONS_PER_WEEK,
  TRAIN_WHERE,
  WOULD_REACH_AGAIN,
} from "@/app/utils/sample-options";

import { formatClaimed, formatPayButton, formatRupiah, OPTION_LABEL } from "./sample-copy";

describe("OPTION_LABEL", () => {
  test.each([
    ["mainSport", MAIN_SPORT],
    ["sessionsPerWeek", SESSIONS_PER_WEEK],
    ["sessionLength", SESSION_LENGTH],
    ["trainWhere", TRAIN_WHERE],
    ["hydrationGoal", HYDRATION_GOAL],
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

  test("formats the counter", () => {
    expect(formatClaimed(42, 100)).toBe("42 of 100 claimed");
  });

  test("formats the pay button", () => {
    expect(formatPayButton(10000)).toBe("Pay shipping Rp 10.000");
  });
});
