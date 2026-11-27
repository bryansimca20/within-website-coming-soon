"use server";

import { GENERIC_ERROR_MESSAGE, ReportTransferOutcome, type ReportTransferState } from "@/app/utils/sample-state";
import { db } from "@/db/client";
import { SampleTransferService } from "@/services/sample-transfer.service";

const TOKEN_PATTERN = /^[A-Za-z0-9]{24}$/;

const ERROR: ReportTransferState = { outcome: ReportTransferOutcome.Error, message: GENERIC_ERROR_MESSAGE };

/** "I've transferred" on the status page: the box stays held as a reported transfer until a founder decides. */
export async function reportTransferAction(token: string): Promise<ReportTransferState> {
  if (!TOKEN_PATTERN.test(token)) {
    return ERROR;
  }

  try {
    const result = await SampleTransferService.report(db, token, new Date());
    if (result.kind === "reported") return { outcome: ReportTransferOutcome.Reported };
    if (result.kind === "lapsed") return { outcome: ReportTransferOutcome.Lapsed };
    if (result.kind === "not-pending") return { outcome: ReportTransferOutcome.NotPending };
    return ERROR;
  } catch (error) {
    console.error("[report-transfer] unexpected failure", error);
    return ERROR;
  }
}
