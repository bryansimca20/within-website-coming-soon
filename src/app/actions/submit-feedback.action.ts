"use server";

import { checkBotId } from "botid/server";
import { eq } from "drizzle-orm";

import { FeedbackEligibility } from "@/app/utils/feedback-eligibility";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD, isHoneypotTripped } from "@/app/utils/honeypot";
import { parseSampleFeedbackInput, readSampleFeedbackInput } from "@/app/utils/sample-feedback-input";
import { FeedbackOutcome, type FeedbackState, GENERIC_ERROR_MESSAGE } from "@/app/utils/sample-state";
import { db } from "@/db/client";
import { sampleBatches } from "@/db/schema";
import { SampleFeedbackService } from "@/services/sample-feedback.service";
import { SampleNotifier } from "@/services/sample-notifier.service";
import { readFormField } from "@/app/utils/form-field";
import { SAMPLE_COPY } from "@/components/sample/utils/sample-copy";

const EMAIL_MESSAGE: Record<Exclude<FeedbackEligibility, FeedbackEligibility.Ok>, string> = {
  [FeedbackEligibility.NotFound]: SAMPLE_COPY.feedback.emailNotFound,
  [FeedbackEligibility.NotShipped]: SAMPLE_COPY.feedback.emailNotShipped,
  [FeedbackEligibility.AlreadyGiven]: SAMPLE_COPY.feedback.emailAlreadyGiven,
};


/**
 * Stores a check-in. The personal link's code identifies the sampler outright. Without one (the
 * card's QR), the email must belong to a shipped or delivered order with no check-in yet.
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
    return { outcome: FeedbackOutcome.Success };
  }

  const parsed = parseSampleFeedbackInput(readSampleFeedbackInput(formData));
  if (!parsed.ok) {
    return { outcome: FeedbackOutcome.Error, message: parsed.message, field: parsed.field };
  }

  try {
    const now = new Date();
    let request = await SampleFeedbackService.resolveRequest(db, { code: parsed.value.code, email: null });
    if (request === null && parsed.value.email !== null) {
      const check = await SampleFeedbackService.checkEmail(db, parsed.value.email);
      if (check.eligibility !== FeedbackEligibility.Ok) {
        return { outcome: FeedbackOutcome.Error, message: EMAIL_MESSAGE[check.eligibility], field: "email" };
      }
      request = check.request;
    }
    if (request === null) {
      return { outcome: FeedbackOutcome.Error, message: SAMPLE_COPY.feedback.emailNotFound, field: "email" };
    }
    const email = request.email;
    await SampleFeedbackService.upsert(db, request.id, parsed.value, email, now);

    const [batch] = await db.select().from(sampleBatches).where(eq(sampleBatches.id, request.batchId)).limit(1);
    if (batch !== undefined) {
      await SampleNotifier.sendFeedbackReceived(request, batch);
    }

    return { outcome: FeedbackOutcome.Success };
  } catch (error) {
    console.error("[submit-feedback] unexpected failure", error);
    return { outcome: FeedbackOutcome.Error, message: GENERIC_ERROR_MESSAGE, field: null };
  }
}
