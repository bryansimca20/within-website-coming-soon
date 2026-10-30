import "server-only";

import type { SampleDatabase } from "@/db/database";
import type { SampleBatch, SampleRequest, SampleShipment } from "@/db/schema";

import { SampleNotifier } from "./sample-notifier.service";
import { SampleRequestService } from "./sample-request.service";
import { SampleShipmentService } from "./sample-shipment.service";

/** Sends the paid email at most once. A failed send gives the claim back, and the daily cron retries it. */
export async function dispatchPaidEmail(db: SampleDatabase, request: SampleRequest, batch: SampleBatch, now: Date): Promise<void> {
  if (!(await SampleRequestService.claimPaidEmail(db, request.id, now))) {
    return;
  }
  if (!(await SampleNotifier.sendPaid(request, batch))) {
    await SampleRequestService.releasePaidEmail(db, request.id);
  }
}

/**
 * Sends the shipped or delivered email at most once. The claim is taken before sending and given
 * back if Resend refuses, so concurrent webhooks never double-send and a failure stays retryable.
 * A delivered email also closes the shipped slot, so a late "picked" cannot send shipped after it.
 */
export async function dispatchShipmentEmail(
  db: SampleDatabase,
  shipment: SampleShipment,
  kind: "shipped" | "delivered",
  now: Date
): Promise<void> {
  if (!(await SampleShipmentService.claimEmail(db, shipment.id, kind, now))) {
    return;
  }
  const request = await SampleRequestService.findById(db, shipment.requestId);
  const batch = request === null ? null : await SampleRequestService.findBatch(db, request.batchId);
  if (request === null || batch === null) {
    await SampleShipmentService.releaseEmail(db, shipment.id, kind);
    return;
  }

  const sent =
    kind === "shipped"
      ? await SampleNotifier.sendShipped(request, batch, shipment)
      : await SampleNotifier.sendDelivered(request, batch, shipment);
  if (!sent) {
    await SampleShipmentService.releaseEmail(db, shipment.id, kind);
    return;
  }
  if (kind === "delivered") {
    await SampleShipmentService.claimEmail(db, shipment.id, "shipped", now);
  }
}
