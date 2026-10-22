"use server";

import { checkBotId } from "botid/server";
import { headers } from "next/headers";

import { FeedbackEligibility } from "@/app/utils/feedback-eligibility";
import type { IFeedbackEmailCheck } from "@/app/utils/sample-state";
import { normalizeEmail } from "@/app/utils/subscriber-input";
import { db } from "@/db/client";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { SampleFeedbackService } from "@/services/sample-feedback.service";

const allow = createRateLimiter({ windowMs: 10 * 60_000, maxAttempts: 20 });

/**
 * The QR path's first screen: is this email's order shipped or delivered, with no check-in yet?
 * It does say whether an email claimed samples; the founder accepted that for Batch 01 (2026-10-22).
 */
export async function checkFeedbackEmailAction(rawEmail: string): Promise<IFeedbackEmailCheck> {
  const email = normalizeEmail(rawEmail);
  if (email === null || (await checkBotId()).isBot || !allow(clientKey(await headers()))) {
    return { eligibility: FeedbackEligibility.NotFound, firstName: null };
  }
  try {
    const { eligibility, firstName } = await SampleFeedbackService.checkEmail(db, email);
    return { eligibility, firstName };
  } catch (error) {
    console.error("[check-feedback-email] unexpected failure", error);
    return { eligibility: FeedbackEligibility.NotFound, firstName: null };
  }
}
