import { z } from "zod";

import { FEEDBACK_FELT, type FeedbackFelt, SCORE_MAX, SCORE_MIN } from "./sample-options";
import { multiChoice, splitChoices } from "./sample-request-input";
import { normalizeEmail } from "./subscriber-input";

/** The review's screens, in order. The review is saved on the first; each later one adds to it. */
export enum FeedbackStep {
  Review = "review",
  Headline = "headline",
  Scores = "scores",
  Felt = "felt",
}

export const FEEDBACK_STEP_ORDER: FeedbackStep[] = [FeedbackStep.Review, FeedbackStep.Headline, FeedbackStep.Scores, FeedbackStep.Felt];

/** Raw, untrusted review values as they arrive from the form. */
export interface ISampleFeedbackInput {
  code: string;
  email: string;
  /** The row the first screen saved; later screens add to it. Empty until then. */
  feedbackId: string;
  rating: string;
  review: string;
  headline: string;
  tasteRating: string;
  effectiveness: string;
  /** Comma-joined option keys. */
  felt: string;
  feltOther: string;
}

export type SampleFeedbackField = keyof ISampleFeedbackInput;

/** A validated first screen. `code` is the personal link's token; `email` is the typed fallback. */
export interface ISampleReviewValues {
  code: string | null;
  email: string | null;
  feedbackId: string | null;
  rating: number;
  review: string;
}

/** What one later screen adds to the saved review. */
export interface ISampleFeedbackExtras {
  headline?: string | null;
  tasteRating?: number;
  effectiveness?: number;
  felt?: FeedbackFelt[];
  feltOther?: string | null;
}

type FieldError = { ok: false; field: SampleFeedbackField; message: string };

export const EMPTY_SAMPLE_FEEDBACK_INPUT: ISampleFeedbackInput = {
  code: "",
  email: "",
  feedbackId: "",
  rating: "",
  review: "",
  headline: "",
  tasteRating: "",
  effectiveness: "",
  felt: "",
  feltOther: "",
};

export const REVIEW_MAX_LENGTH = 500;
export const HEADLINE_MAX_LENGTH = 60;

/** Field-level error copy, shared by the validator and the form. */
export const FEEDBACK_FIELD_ERROR: Record<SampleFeedbackField, string> = {
  code: "",
  email: "Add the email you requested your box with.",
  feedbackId: "",
  rating: "Tap a star to rate it.",
  review: "Tell us a little about it.",
  headline: `Keep it under ${HEADLINE_MAX_LENGTH} characters.`,
  tasteRating: "Rate the taste from 1 to 5.",
  effectiveness: "Rate how effective it was from 1 to 5.",
  felt: "Pick how you felt.",
  feltOther: "Tell us how you felt.",
};

/** The fields each screen owns, in the order their errors should surface. */
const STEP_FIELDS: Record<FeedbackStep, SampleFeedbackField[]> = {
  [FeedbackStep.Review]: ["rating", "review"],
  [FeedbackStep.Headline]: ["headline"],
  [FeedbackStep.Scores]: ["tasteRating", "effectiveness"],
  [FeedbackStep.Felt]: ["felt", "feltOther"],
};

const ACCESS_TOKEN_PATTERN = /^[A-Za-z0-9]{24}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const score = z.string().trim().regex(/^\d$/).transform(Number).pipe(z.number().int().min(SCORE_MIN).max(SCORE_MAX));

const fieldSchema = {
  rating: score,
  review: z.string().trim().min(1).max(REVIEW_MAX_LENGTH),
  headline: z
    .string()
    .trim()
    .max(HEADLINE_MAX_LENGTH)
    .transform((value) => (value === "" ? null : value)),
  tasteRating: score,
  effectiveness: score,
  felt: multiChoice(FEEDBACK_FELT),
  feltOther: z
    .string()
    .trim()
    .max(100)
    .transform((value) => (value === "" ? null : value)),
} as const;

const FIELD_NAMES = Object.keys(EMPTY_SAMPLE_FEEDBACK_INPUT) as SampleFeedbackField[];

/** Every review field from posted form data, missing ones as empty strings. */
export function readSampleFeedbackInput(formData: FormData): ISampleFeedbackInput {
  const input = { ...EMPTY_SAMPLE_FEEDBACK_INPUT };
  for (const field of FIELD_NAMES) {
    const value = formData.get(field);
    input[field] = typeof value === "string" ? value : "";
  }

  return input;
}

/** A `?rating=` from the reminder email's stars: a whole number 1 to 5, else nothing. */
export function parseRatingParam(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = score.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** The saved row's id, or null when it is not a well-formed uuid. */
export function parseFeedbackId(value: string): string | null {
  return UUID_PATTERN.test(value.trim()) ? value.trim().toLowerCase() : null;
}

/** One screen's check, on the client before moving on and on the server before saving. */
export function validateFeedbackStep(step: FeedbackStep, input: ISampleFeedbackInput): FieldError | null {
  for (const field of STEP_FIELDS[step]) {
    if (field === "feltOther") {
      const text = input.feltOther.trim();
      if (splitChoices(input.felt).includes("other") && (text === "" || text.length > 100)) {
        return { ok: false, field, message: FEEDBACK_FIELD_ERROR.feltOther };
      }
      continue;
    }
    const schema = fieldSchema[field as keyof typeof fieldSchema];
    if (!schema.safeParse(input[field]).success) return { ok: false, field, message: FEEDBACK_FIELD_ERROR[field] };
  }
  return null;
}

/** Validates the first screen. A malformed code or id is dropped, not an error; then an email or id must be present. */
export function parseReviewInput(input: ISampleFeedbackInput): { ok: true; value: ISampleReviewValues } | FieldError {
  const problem = validateFeedbackStep(FeedbackStep.Review, input);
  if (problem !== null) return problem;

  const code = ACCESS_TOKEN_PATTERN.test(input.code.trim()) ? input.code.trim() : null;
  const email = input.email.trim() === "" ? null : normalizeEmail(input.email);
  const feedbackId = parseFeedbackId(input.feedbackId);
  if (code === null && email === null && feedbackId === null) {
    return { ok: false, field: "email", message: FEEDBACK_FIELD_ERROR.email };
  }

  return {
    ok: true,
    value: { code, email, feedbackId, rating: Number(input.rating), review: input.review.trim() },
  };
}

/** Validates one later screen and returns only the fields it adds. */
export function parseFeedbackExtras(step: FeedbackStep, input: ISampleFeedbackInput): { ok: true; value: ISampleFeedbackExtras } | FieldError {
  if (step === FeedbackStep.Review) return { ok: false, field: "rating", message: FEEDBACK_FIELD_ERROR.rating };
  const problem = validateFeedbackStep(step, input);
  if (problem !== null) return problem;

  if (step === FeedbackStep.Headline) return { ok: true, value: { headline: fieldSchema.headline.parse(input.headline) } };
  if (step === FeedbackStep.Scores) {
    return { ok: true, value: { tasteRating: Number(input.tasteRating), effectiveness: Number(input.effectiveness) } };
  }
  const felt = fieldSchema.felt.parse(input.felt);
  return { ok: true, value: { felt, feltOther: felt.includes("other") ? fieldSchema.feltOther.parse(input.feltOther) : null } };
}
