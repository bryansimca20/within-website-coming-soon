"use server";

import { checkBotId } from "botid/server";
import { headers } from "next/headers";

import { normalizeEmail } from "@/app/utils/subscriber-input";
import { db } from "@/db/client";
import { isAdmin } from "@/lib/admin-session";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { SampleRequestService } from "@/services/sample-request.service";

const allow = createRateLimiter({ windowMs: 10 * 60_000, maxAttempts: 20 });

/**
 * Step 1's early check: does this email already own a box? Fails open, because the claim refuses a duplicate anyway.
 * It says whether an email claimed samples, as the final submit already does.
 */
export async function checkSampleEmailAction(rawEmail: string): Promise<boolean> {
  const email = normalizeEmail(rawEmail);
  if (email === null || (await checkBotId()).isBot || !allow(clientKey(await headers()))) {
    return false;
  }
  try {
    // A founder session places test orders, so it is checked against test rows, as the claim does.
    return await SampleRequestService.hasClaim(db, email, { isTest: await isAdmin() });
  } catch (error) {
    console.error("[check-sample-email] unexpected failure", error);
    return false;
  }
}
