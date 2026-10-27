import { describe, expect, test } from "vitest";

import {
  EMPTY_SAMPLE_FEEDBACK_INPUT,
  FEEDBACK_QUESTION_ORDER,
  type ISampleFeedbackInput,
  parseSampleFeedbackInput,
  readSampleFeedbackInput,
  validateFeedbackStep,
} from "./sample-feedback-input";

const VALID_INPUT: ISampleFeedbackInput = {
  code: "AbCdEfGhIjKlMnOpQrStUvWx",
  email: "",
  sessionType: "running,padel",
  sessionTypeOther: "",
  sessionLength: "under_45,over_90",
  tasteRating: "4",
  felt: "less_cramping",
  feltOther: "",
  wouldReachAgain: "yes_definitely",
  comment: "Salty in a good way.",
};

function parseWith(patch: Partial<ISampleFeedbackInput>) {
  return parseSampleFeedbackInput({ ...VALID_INPUT, ...patch });
}

describe("parseSampleFeedbackInput", () => {
  test("accepts a code with no email", () => {
    const parsed = parseSampleFeedbackInput(VALID_INPUT);

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.code).toBe(VALID_INPUT.code);
    expect(parsed.value.email).toBeNull();
    expect(parsed.value.tasteRating).toBe(4);
    expect(parsed.value.comment).toBe("Salty in a good way.");
    expect(parsed.value.sessionType).toEqual(["running", "padel"]);
    expect(parsed.value.sessionLength).toEqual(["under_45", "over_90"]);
    expect(parsed.value.sessionTypeOther).toBeNull();
  });

  test("sessions and lengths need at least one known answer", () => {
    expect(parseWith({ sessionType: "" })).toMatchObject({ ok: false, field: "sessionType" });
    expect(parseWith({ sessionType: "long_run" })).toMatchObject({ ok: false, field: "sessionType" });
    expect(parseWith({ sessionLength: "" })).toMatchObject({ ok: false, field: "sessionLength" });
  });

  test("an Other session needs its description", () => {
    expect(parseWith({ sessionType: "running,other", sessionTypeOther: "" })).toMatchObject({ ok: false, field: "sessionTypeOther" });
    const parsed = parseWith({ sessionType: "other", sessionTypeOther: "Futsal match" });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.sessionTypeOther).toBe("Futsal match");
  });

  test("accepts an email with no code and lowercases it", () => {
    const parsed = parseWith({ code: "", email: "Fanny@Example.com" });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.code).toBeNull();
    expect(parsed.value.email).toBe("fanny@example.com");
  });

  test("fails on the email field when neither code nor email is given", () => {
    expect(parseWith({ code: "", email: "" })).toMatchObject({ ok: false, field: "email" });
  });

  test("rejects a taste rating outside 1 to 5", () => {
    expect(parseWith({ tasteRating: "6" })).toMatchObject({ ok: false, field: "tasteRating" });
    expect(parseWith({ tasteRating: "0" })).toMatchObject({ ok: false, field: "tasteRating" });
  });

  test("requires the free text when felt is other", () => {
    expect(parseWith({ felt: "other", feltOther: "" })).toMatchObject({ ok: false, field: "feltOther" });
  });

  test("felt accepts several answers", () => {
    const parsed = parseWith({ felt: "more_energy,felt_hydrated" });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.felt).toEqual(["more_energy", "felt_hydrated"]);
  });

  test("felt needs at least one known answer", () => {
    expect(parseWith({ felt: "" })).toMatchObject({ ok: false, field: "felt" });
    expect(parseWith({ felt: "more_energy,flying" })).toMatchObject({ ok: false, field: "felt" });
  });

  test("requires the free text when other is one of several", () => {
    expect(parseWith({ felt: "more_energy,other", feltOther: "" })).toMatchObject({ ok: false, field: "feltOther" });
  });

  test("rejects a comment over 1000 characters", () => {
    expect(parseWith({ comment: "x".repeat(1001) })).toMatchObject({ ok: false, field: "comment" });
  });

  test("nulls a malformed code instead of failing", () => {
    const parsed = parseWith({ code: "not-a-token", email: "a@b.co" });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.code).toBeNull();
  });

  test("turns an empty comment into null", () => {
    const parsed = parseWith({ comment: "  " });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.comment).toBeNull();
  });
});

describe("FEEDBACK_QUESTION_ORDER", () => {
  test("lists the six questions in the card's order", () => {
    expect(FEEDBACK_QUESTION_ORDER).toEqual([
      "sessionType",
      "sessionLength",
      "tasteRating",
      "felt",
      "wouldReachAgain",
      "comment",
    ]);
  });
});

describe("readSampleFeedbackInput", () => {
  test("reads every field as an empty string from an empty form", () => {
    expect(readSampleFeedbackInput(new FormData())).toEqual(EMPTY_SAMPLE_FEEDBACK_INPUT);
  });
});

describe("validateFeedbackStep", () => {
  const EMPTY = { ...VALID_INPUT, sessionType: "", sessionLength: "", tasteRating: "", felt: "", wouldReachAgain: "" };

  test("checks only its own question, ignoring later empty ones", () => {
    expect(validateFeedbackStep("sessionType", { ...EMPTY, sessionType: "running" })).toBeNull();
    expect(validateFeedbackStep("sessionType", EMPTY)).toMatchObject({ field: "sessionType" });
  });

  test("an Other answer needs its text on its own screen", () => {
    expect(validateFeedbackStep("sessionType", { ...EMPTY, sessionType: "running,other" })).toMatchObject({ field: "sessionTypeOther" });
    expect(validateFeedbackStep("felt", { ...EMPTY, felt: "other" })).toMatchObject({ field: "feltOther" });
    expect(validateFeedbackStep("felt", { ...EMPTY, felt: "other", feltOther: "Calmer" })).toBeNull();
  });

  test("the comment is optional but capped", () => {
    expect(validateFeedbackStep("comment", { ...EMPTY, comment: "" })).toBeNull();
    expect(validateFeedbackStep("comment", { ...EMPTY, comment: "x".repeat(1001) })).toMatchObject({ field: "comment" });
  });
});
