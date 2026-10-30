import { describe, expect, test } from "vitest";

import {
  EMPTY_SAMPLE_FEEDBACK_INPUT,
  FeedbackStep,
  type ISampleFeedbackInput,
  parseFeedbackExtras,
  parseFeedbackId,
  parseRatingParam,
  parseReviewInput,
  readSampleFeedbackInput,
  validateFeedbackStep,
} from "./sample-feedback-input";

const CODE = "AbCdEfGhIjKlMnOpQrStUvWx";
const ID = "3f2b8c1e-9a4d-4e5f-8b6c-7d8e9f0a1b2c";

function input(patch: Partial<ISampleFeedbackInput> = {}): ISampleFeedbackInput {
  return { ...EMPTY_SAMPLE_FEEDBACK_INPUT, code: CODE, rating: "4", review: "Salty in a good way.", ...patch };
}

describe("parseReviewInput", () => {
  test("accepts a rating and a review from the personal link", () => {
    const parsed = parseReviewInput(input());
    expect(parsed).toEqual({ ok: true, value: { code: CODE, email: null, feedbackId: null, rating: 4, review: "Salty in a good way." } });
  });

  test("needs a star and some words", () => {
    expect(parseReviewInput(input({ rating: "" }))).toMatchObject({ ok: false, field: "rating" });
    expect(parseReviewInput(input({ rating: "6" }))).toMatchObject({ ok: false, field: "rating" });
    expect(parseReviewInput(input({ rating: "0" }))).toMatchObject({ ok: false, field: "rating" });
    expect(parseReviewInput(input({ review: "   " }))).toMatchObject({ ok: false, field: "review" });
    expect(parseReviewInput(input({ review: "x".repeat(501) }))).toMatchObject({ ok: false, field: "review" });
  });

  test("drops a malformed code, then falls back to the email", () => {
    const parsed = parseReviewInput(input({ code: "nope", email: " Fanny@Example.com " }));
    if (!parsed.ok) throw new Error(parsed.message);
    expect(parsed.value.code).toBeNull();
    expect(parsed.value.email).toBe("fanny@example.com");
  });

  test("a saved row's id alone is enough to edit the review", () => {
    const parsed = parseReviewInput(input({ code: "", feedbackId: ID.toUpperCase() }));
    if (!parsed.ok) throw new Error(parsed.message);
    expect(parsed.value.feedbackId).toBe(ID);
  });

  test("with no code, email or id it asks for the email", () => {
    expect(parseReviewInput(input({ code: "" }))).toMatchObject({ ok: false, field: "email" });
  });
});

describe("parseFeedbackExtras", () => {
  test("the headline is optional and trimmed", () => {
    expect(parseFeedbackExtras(FeedbackStep.Headline, input({ headline: "  " }))).toEqual({ ok: true, value: { headline: null } });
    expect(parseFeedbackExtras(FeedbackStep.Headline, input({ headline: " New long-run drink " }))).toEqual({ ok: true, value: { headline: "New long-run drink" } });
    expect(parseFeedbackExtras(FeedbackStep.Headline, input({ headline: "x".repeat(61) }))).toMatchObject({ ok: false, field: "headline" });
  });

  test("taste and effectiveness are both required, 1 to 5", () => {
    expect(parseFeedbackExtras(FeedbackStep.Scores, input({ tasteRating: "5", effectiveness: "3" }))).toEqual({ ok: true, value: { tasteRating: 5, effectiveness: 3 } });
    expect(parseFeedbackExtras(FeedbackStep.Scores, input({ tasteRating: "5" }))).toMatchObject({ ok: false, field: "effectiveness" });
    expect(parseFeedbackExtras(FeedbackStep.Scores, input({ effectiveness: "3" }))).toMatchObject({ ok: false, field: "tasteRating" });
  });

  test("felt needs a pick, and Other needs its text", () => {
    expect(parseFeedbackExtras(FeedbackStep.Felt, input({ felt: "" }))).toMatchObject({ ok: false, field: "felt" });
    expect(parseFeedbackExtras(FeedbackStep.Felt, input({ felt: "more_energy,other" }))).toMatchObject({ ok: false, field: "feltOther" });
    expect(parseFeedbackExtras(FeedbackStep.Felt, input({ felt: "more_energy,other", feltOther: "Calmer" }))).toEqual({
      ok: true,
      value: { felt: ["more_energy", "other"], feltOther: "Calmer" },
    });
  });

  test("drops Other text when Other is not picked", () => {
    expect(parseFeedbackExtras(FeedbackStep.Felt, input({ felt: "felt_hydrated", feltOther: "stale" }))).toEqual({
      ok: true,
      value: { felt: ["felt_hydrated"], feltOther: null },
    });
  });

  test("the review screen is not an extra", () => {
    expect(parseFeedbackExtras(FeedbackStep.Review, input())).toMatchObject({ ok: false });
  });
});

describe("validateFeedbackStep", () => {
  test("checks only the screen's own fields", () => {
    expect(validateFeedbackStep(FeedbackStep.Review, input({ felt: "" }))).toBeNull();
    expect(validateFeedbackStep(FeedbackStep.Felt, input({ rating: "", felt: "no_difference" }))).toBeNull();
  });
});

describe("parseRatingParam", () => {
  test("keeps 1 to 5 and ignores anything else", () => {
    expect(parseRatingParam("4")).toBe(4);
    for (const bad of ["0", "6", "4.5", "abc", "", undefined, ["4"]]) expect(parseRatingParam(bad)).toBeNull();
  });
});

describe("parseFeedbackId", () => {
  test("accepts a uuid only", () => {
    expect(parseFeedbackId(ID)).toBe(ID);
    expect(parseFeedbackId("not-an-id")).toBeNull();
  });
});

describe("readSampleFeedbackInput", () => {
  test("reads every field, missing ones as empty strings", () => {
    const formData = new FormData();
    formData.set("rating", "5");
    formData.set("review", "Good");
    expect(readSampleFeedbackInput(formData)).toEqual({ ...EMPTY_SAMPLE_FEEDBACK_INPUT, rating: "5", review: "Good" });
  });
});
