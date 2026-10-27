"use server";

import { checkBotId } from "botid/server";
import { headers } from "next/headers";

import { buildReferralTag, isRosterSlug } from "@/app/utils/attribution";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD, isHoneypotTripped } from "@/app/utils/honeypot";
import { parseSampleRequestInput, readSampleRequestInput } from "@/app/utils/sample-request-input";
import { GENERIC_ERROR_MESSAGE, SampleRequestOutcome, type SampleRequestState } from "@/app/utils/sample-state";
import { db } from "@/db/client";
import { clientKey } from "@/lib/rate-limit";
import { createSampleRequestLimiter } from "@/lib/request-limit";
import { SITE_URL } from "@/lib/site";
import { SampleNotifier } from "@/services/sample-notifier.service";
import { SamplePaymentService } from "@/services/sample-payment.service";
import { SampleRequestService } from "@/services/sample-request.service";
import { SAMPLING_TAG_PREFIX, ShopifyCustomerService } from "@/services/shopify-customer.service";
import { readFormField } from "@/app/utils/form-field";


const allowRequest = createSampleRequestLimiter();

const RATE_LIMITED: SampleRequestState = {
  outcome: SampleRequestOutcome.Error,
  message: "Too many requests from this connection. Try again in an hour.",
  field: null,
};

const GENERIC_ERROR: SampleRequestState = { outcome: SampleRequestOutcome.Error, message: GENERIC_ERROR_MESSAGE, field: null };

/**
 * Holds a box, joins the waitlist and opens the courier payment. Reachable by direct POST, so it
 * re-validates everything the form already checked.
 */
export async function requestSampleAction(formData: FormData): Promise<SampleRequestState> {
  const verification = await checkBotId();
  if (verification.isBot) {
    return GENERIC_ERROR;
  }
  if (
    isHoneypotTripped({
      trap: readFormField(formData, HONEYPOT_TRAP_FIELD),
      renderedAt: readFormField(formData, HONEYPOT_TIMESTAMP_FIELD),
      now: Date.now(),
    })
  ) {
    return GENERIC_ERROR;
  }

  const parsed = parseSampleRequestInput(readSampleRequestInput(formData));
  if (!parsed.ok) {
    return { outcome: SampleRequestOutcome.Error, message: parsed.message, field: parsed.field };
  }
  // Counted only for valid submissions, so fixing a typo never uses up an attempt.
  if (!allowRequest(clientKey(await headers()))) {
    return RATE_LIMITED;
  }
  const values = parsed.value;

  try {
    const now = new Date();
    const batch = await SampleRequestService.getOpenBatch(db);
    if (batch === null) {
      return { outcome: SampleRequestOutcome.Full };
    }

    const claim = await SampleRequestService.claim(db, batch.id, values, now);
    if (claim.kind === "full" || claim.kind === "closed") {
      return { outcome: SampleRequestOutcome.Full };
    }
    if (claim.kind === "already-requested") {
      await SampleNotifier.sendPaid(claim.request, batch);
      return { outcome: SampleRequestOutcome.AlreadyRequested, email: values.email };
    }

    const request = claim.request;
    const statusUrl = `${SITE_URL}/sample/r/${request.accessToken}`;
    const payment = await SamplePaymentService.createAttempt(db, request, batch, now, statusUrl);
    if (payment === null) {
      await SampleRequestService.setStatus(db, request.id, "cancelled", { adminNote: "Midtrans create failed at request time." });
      return GENERIC_ERROR;
    }

    const ref = values.attribution.ref;
    try {
      const outcome = await ShopifyCustomerService.createPrelaunchSubscriber({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        instagramHandle: values.instagramHandle,
        consentedAt: values.wantsLaunchEmail ? now.toISOString() : null,
        extraTags: [`${SAMPLING_TAG_PREFIX}${batch.id}`, ...(ref !== null && isRosterSlug(ref) ? [buildReferralTag(ref)] : [])],
      });
      await SampleRequestService.setShopifyOutcome(db, request.id, outcome);
    } catch (error) {
      console.error("[request-sample] shopify join failed", error);
      await SampleRequestService.setShopifyOutcome(db, request.id, "error");
    }

    return {
      outcome: SampleRequestOutcome.Pay,
      snapToken: payment.snapToken,
      snapRedirectUrl: payment.snapRedirectUrl,
      statusUrl: `/sample/r/${request.accessToken}`,
      boxLabel: SampleRequestService.boxWord(request.boxNumber),
    };
  } catch (error) {
    console.error("[request-sample] unexpected failure", error);
    return GENERIC_ERROR;
  }
}
