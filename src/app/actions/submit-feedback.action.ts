"use server";

import { checkBotId } from "botid/server";
import { eq } from "drizzle-orm";

import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD, isHoneypotTripped } from "@/app/utils/honeypot";
import { parseSampleFeedbackInput, readSampleFeedbackInput } from "@/app/utils/sample-feedback-input";
import { FeedbackOutcome, type FeedbackState, GENERIC_ERROR_MESSAGE } from "@/app/utils/sample-state";
import { db } from "@/db/client";
import { sampleBatches } from "@/db/schema";
import { SampleFeedbackService } from "@/services/sample-feedback.service";
import { SampleNotifier } from "@/services/sample-notifier.service";
import { readFormField } from "@/app/utils/form-field";


/**
 * Stores a check-in. Success is reported whether or not the email matched a box, so the form
 * never reveals who requested one; unmatched answers are kept for a founder to match.
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
    const request = await SampleFeedbackService.resolveRequest(db, parsed.value);
    const email = request?.email ?? parsed.value.email ?? "";
    await SampleFeedbackService.upsert(db, request?.id ?? null, parsed.value, email, now);

    if (request !== null) {
      const [batch] = await db.select().from(sampleBatches).where(eq(sampleBatches.id, request.batchId)).limit(1);
      if (batch !== undefined) {
        await SampleNotifier.sendFeedbackReceived(request, batch);
      }
    }

    return { outcome: FeedbackOutcome.Success };
  } catch (error) {
    console.error("[submit-feedback] unexpected failure", error);
    return { outcome: FeedbackOutcome.Error, message: GENERIC_ERROR_MESSAGE, field: null };
  }
}
