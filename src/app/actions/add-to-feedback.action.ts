"use server";

import { checkBotId } from "botid/server";

import { type FeedbackStep, parseFeedbackExtras, parseFeedbackId, readSampleFeedbackInput } from "@/app/utils/sample-feedback-input";
import { FeedbackOutcome, type FeedbackState, GENERIC_ERROR_MESSAGE } from "@/app/utils/sample-state";
import { db } from "@/db/client";
import { SampleFeedbackService } from "@/services/sample-feedback.service";

/**
 * Saves one screen after the review (headline, scores or how they felt) onto the row the review created.
 * `field: "feedbackId"` means the row is gone or stale: the review itself is saved, so the form just finishes.
 */
export async function addToFeedbackAction(step: FeedbackStep, formData: FormData): Promise<FeedbackState> {
  if ((await checkBotId()).isBot) {
    return { outcome: FeedbackOutcome.Error, message: GENERIC_ERROR_MESSAGE, field: null };
  }
  const input = readSampleFeedbackInput(formData);
  const feedbackId = parseFeedbackId(input.feedbackId);
  if (feedbackId === null) {
    return { outcome: FeedbackOutcome.Error, message: GENERIC_ERROR_MESSAGE, field: "feedbackId" };
  }
  const parsed = parseFeedbackExtras(step, input);
  if (!parsed.ok) {
    return { outcome: FeedbackOutcome.Error, message: parsed.message, field: parsed.field };
  }

  try {
    const saved = await SampleFeedbackService.addToReview(db, feedbackId, parsed.value, new Date());
    if (saved === null) {
      return { outcome: FeedbackOutcome.Error, message: GENERIC_ERROR_MESSAGE, field: "feedbackId" };
    }
    return { outcome: FeedbackOutcome.Success, feedbackId: saved.id };
  } catch (error) {
    console.error("[add-to-feedback] unexpected failure", error);
    return { outcome: FeedbackOutcome.Error, message: GENERIC_ERROR_MESSAGE, field: null };
  }
}
