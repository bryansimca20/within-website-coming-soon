"use server";

import { checkBotId } from "botid/server";

import { FeedbackEligibility } from "@/app/utils/feedback-eligibility";
import { readFormField } from "@/app/utils/form-field";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD, isHoneypotTripped } from "@/app/utils/honeypot";
import { parseReviewInput, readSampleFeedbackInput } from "@/app/utils/sample-feedback-input";
import { FeedbackOutcome, type FeedbackState, GENERIC_ERROR_MESSAGE } from "@/app/utils/sample-state";
import { SAMPLE_COPY } from "@/components/sample/utils/sample-copy";
import { db } from "@/db/client";
import { SampleFeedbackService } from "@/services/sample-feedback.service";

const EMAIL_MESSAGE: Record<Exclude<FeedbackEligibility, FeedbackEligibility.Ok>, string> = {
  [FeedbackEligibility.NotFound]: SAMPLE_COPY.feedback.emailNotFound,
  [FeedbackEligibility.NotShipped]: SAMPLE_COPY.feedback.emailNotShipped,
  [FeedbackEligibility.AlreadyGiven]: SAMPLE_COPY.feedback.emailAlreadyGiven,
};

/** A honeypot hit is told it worked; this id matches no row, so its later screens change nothing. */
const DECOY_FEEDBACK_ID = "00000000-0000-4000-8000-000000000000";

/**
 * Saves the first screen: rating and review. Coming back to it edits the saved row by its id. Otherwise
 * the personal link's code identifies the sampler, or (the card's QR) the email must belong to a shipped
 * or delivered order with no review yet.
 */
export async function submitFeedbackAction(formData: FormData): Promise<FeedbackState> {
  const verification = await checkBotId();
  if (verification.isBot) {
    return { outcome: FeedbackOutcome.Error, message: GENERIC_ERROR_MESSAGE, field: null };
  }
  if (
    isHoneypotTripped({
      trap: readFormField(formData, HONEYPOT_TRAP_FIELD),
      renderedAt: readFormField(formData, HONEYPOT_TIMESTAMP_FIELD),
      now: Date.now(),
    })
  ) {
    return { outcome: FeedbackOutcome.Success, feedbackId: DECOY_FEEDBACK_ID };
  }

  const parsed = parseReviewInput(readSampleFeedbackInput(formData));
  if (!parsed.ok) {
    return { outcome: FeedbackOutcome.Error, message: parsed.message, field: parsed.field };
  }
  const { code, email, feedbackId, rating, review } = parsed.value;

  try {
    const now = new Date();
    if (feedbackId !== null) {
      const edited = await SampleFeedbackService.addToReview(db, feedbackId, { rating, review }, now);
      if (edited !== null) return { outcome: FeedbackOutcome.Success, feedbackId: edited.id };
    }

    let request = await SampleFeedbackService.resolveRequest(db, { code, email: null });
    if (request === null && email !== null) {
      const check = await SampleFeedbackService.checkEmail(db, email);
      if (check.eligibility !== FeedbackEligibility.Ok) {
        return { outcome: FeedbackOutcome.Error, message: EMAIL_MESSAGE[check.eligibility], field: "email" };
      }
      request = check.request;
    }
    if (request === null) {
      return { outcome: FeedbackOutcome.Error, message: SAMPLE_COPY.feedback.emailNotFound, field: "email" };
    }
    const saved = await SampleFeedbackService.saveReview(db, request.id, { rating, review }, request.email, now);

    return { outcome: FeedbackOutcome.Success, feedbackId: saved.id };
  } catch (error) {
    console.error("[submit-feedback] unexpected failure", error);
    return { outcome: FeedbackOutcome.Error, message: GENERIC_ERROR_MESSAGE, field: null };
  }
}
