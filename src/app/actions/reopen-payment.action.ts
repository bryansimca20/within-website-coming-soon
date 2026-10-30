"use server";

import { GENERIC_ERROR_MESSAGE, ReopenOutcome, type ReopenPaymentState } from "@/app/utils/sample-state";
import { db } from "@/db/client";
import { SITE_URL } from "@/lib/site";
import { dispatchPaidEmail } from "@/services/sample-email-dispatch.service";
import { SamplePaymentService } from "@/services/sample-payment.service";
import { SampleRequestService } from "@/services/sample-request.service";

const TOKEN_PATTERN = /^[A-Za-z0-9]{24}$/;

/** "Pay now" on the status page: the open Snap attempt, or a fresh one while the hold stands. */
export async function reopenPaymentAction(token: string): Promise<ReopenPaymentState> {
  if (!TOKEN_PATTERN.test(token)) {
    return { outcome: ReopenOutcome.Error, message: GENERIC_ERROR_MESSAGE };
  }

  try {
    const request = await SampleRequestService.findByToken(db, token);
    if (request === null) {
      return { outcome: ReopenOutcome.Error, message: GENERIC_ERROR_MESSAGE };
    }
    const batch = await SampleRequestService.findBatch(db, request.batchId);
    if (batch === null) {
      return { outcome: ReopenOutcome.Error, message: GENERIC_ERROR_MESSAGE };
    }

    const result = await SamplePaymentService.reopen(db, request, batch, new Date(), `${SITE_URL}/sample/r/${token}`);
    if (result.kind === "token") {
      return { outcome: ReopenOutcome.Pay, snapToken: result.payment.snapToken, snapRedirectUrl: result.payment.snapRedirectUrl };
    }
    if (result.kind === "paid") {
      // Midtrans settled before its webhook reached us.
      await dispatchPaidEmail(db, result.request, batch, new Date());
      return { outcome: ReopenOutcome.NotPending };
    }
    if (result.kind === "lapsed") {
      return { outcome: ReopenOutcome.Lapsed };
    }
    if (result.kind === "not-pending") {
      return { outcome: ReopenOutcome.NotPending };
    }
    return { outcome: ReopenOutcome.Error, message: GENERIC_ERROR_MESSAGE };
  } catch (error) {
    console.error("[reopen-payment] unexpected failure", error);
    return { outcome: ReopenOutcome.Error, message: GENERIC_ERROR_MESSAGE };
  }
}
