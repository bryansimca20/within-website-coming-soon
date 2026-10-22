import { z } from "zod";

import {
  FEEDBACK_FELT,
  FEEDBACK_SESSION,
  type FeedbackFelt,
  type FeedbackSession,
  SESSION_LENGTH,
  type SessionLength,
  TASTE_MAX,
  TASTE_MIN,
  WOULD_REACH_AGAIN,
  type WouldReachAgain,
} from "./sample-options";
import { multiChoice } from "./sample-request-input";
import { normalizeEmail } from "./subscriber-input";

/** Raw, untrusted check-in values as they arrive from the form. */
export interface ISampleFeedbackInput {
  code: string;
  email: string;
  sessionType: string;
  sessionLength: string;
  tasteRating: string;
  felt: string;
  feltOther: string;
  wouldReachAgain: string;
  comment: string;
}

export type SampleFeedbackField = keyof ISampleFeedbackInput;

/** A validated check-in. `code` is the personal link's token; `email` is the typed fallback. */
export interface ISampleFeedbackValues {
  code: string | null;
  email: string | null;
  sessionType: FeedbackSession;
  sessionLength: SessionLength;
  tasteRating: number;
  felt: FeedbackFelt[];
  feltOther: string | null;
  wouldReachAgain: WouldReachAgain;
  comment: string | null;
}

export type ParsedSampleFeedback =
  | { ok: true; value: ISampleFeedbackValues }
  | { ok: false; field: SampleFeedbackField; message: string };

export const EMPTY_SAMPLE_FEEDBACK_INPUT: ISampleFeedbackInput = {
  code: "",
  email: "",
  sessionType: "",
  sessionLength: "",
  tasteRating: "",
  felt: "",
  feltOther: "",
  wouldReachAgain: "",
  comment: "",
};

/** The six questions, in the order the card asks them. */
export const FEEDBACK_QUESTION_ORDER: SampleFeedbackField[] = [
  "sessionType",
  "sessionLength",
  "tasteRating",
  "felt",
  "wouldReachAgain",
  "comment",
];

/** Field-level error copy, shared by the validator and the form. */
export const FEEDBACK_FIELD_ERROR: Record<SampleFeedbackField, string> = {
  code: "",
  email: "Add the email you requested your box with.",
  sessionType: "Pick the session you took it on.",
  sessionLength: "Pick how long it was.",
  tasteRating: "Rate the taste from 1 to 5.",
  felt: "Pick how you felt.",
  feltOther: "Tell us how you felt.",
  wouldReachAgain: "Pick one.",
  comment: "Keep it under 1000 characters.",
};

const ACCESS_TOKEN_PATTERN = /^[A-Za-z0-9]{24}$/;

const FIELD_NAMES = Object.keys(EMPTY_SAMPLE_FEEDBACK_INPUT) as SampleFeedbackField[];

const feedbackSchema = z.object({
  code: z.string().transform((value) => (ACCESS_TOKEN_PATTERN.test(value.trim()) ? value.trim() : null)),
  email: z.string().transform((value) => (value.trim() === "" ? null : normalizeEmail(value))),
  sessionType: z.enum(FEEDBACK_SESSION),
  sessionLength: z.enum(SESSION_LENGTH),
  tasteRating: z
    .string()
    .trim()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(TASTE_MIN).max(TASTE_MAX)),
  felt: multiChoice(FEEDBACK_FELT),
  feltOther: z
    .string()
    .trim()
    .max(100)
    .transform((value) => (value === "" ? null : value)),
  wouldReachAgain: z.enum(WOULD_REACH_AGAIN),
  comment: z
    .string()
    .trim()
    .max(1000)
    .transform((value) => (value === "" ? null : value)),
});

function isFeedbackField(name: unknown): name is SampleFeedbackField {
  return typeof name === "string" && (FIELD_NAMES as string[]).includes(name);
}

/** Every check-in field from posted form data, missing ones as empty strings. */
export function readSampleFeedbackInput(formData: FormData): ISampleFeedbackInput {
  const input = { ...EMPTY_SAMPLE_FEEDBACK_INPUT };
  for (const field of FIELD_NAMES) {
    const value = formData.get(field);
    input[field] = typeof value === "string" ? value : "";
  }

  return input;
}

/** Validates a check-in. A malformed code is dropped, not an error; then an email must be present. */
export function parseSampleFeedbackInput(input: ISampleFeedbackInput): ParsedSampleFeedback {
  const result = feedbackSchema.safeParse(input);
  if (!result.success) {
    const issue = [...result.error.issues].sort(
      (a, b) => FIELD_NAMES.indexOf(a.path[0] as SampleFeedbackField) - FIELD_NAMES.indexOf(b.path[0] as SampleFeedbackField)
    )[0];
    const field = isFeedbackField(issue?.path[0]) ? issue.path[0] : "email";
    return { ok: false, field, message: FEEDBACK_FIELD_ERROR[field] || "Check this field." };
  }

  const data = result.data;

  if (data.code === null && data.email === null) {
    return { ok: false, field: "email", message: FEEDBACK_FIELD_ERROR.email };
  }

  if (data.felt.includes("other") && data.feltOther === null) {
    return { ok: false, field: "feltOther", message: FEEDBACK_FIELD_ERROR.feltOther };
  }

  return {
    ok: true,
    value: {
      code: data.code,
      email: data.email,
      sessionType: data.sessionType,
      sessionLength: data.sessionLength,
      tasteRating: data.tasteRating,
      felt: data.felt,
      feltOther: data.felt.includes("other") ? data.feltOther : null,
      wouldReachAgain: data.wouldReachAgain,
      comment: data.comment,
    },
  };
}
