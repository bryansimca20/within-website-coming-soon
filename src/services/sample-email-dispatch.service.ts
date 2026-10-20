import "server-only";

import type { SampleDatabase } from "@/db/database";
import type { SampleShipment } from "@/db/schema";

import { SampleNotifier } from "./sample-notifier.service";
import { SampleRequestService } from "./sample-request.service";
import { SampleShipmentService } from "./sample-shipment.service";

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
