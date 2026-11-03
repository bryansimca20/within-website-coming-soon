import "server-only";

import type { SampleDatabase } from "@/db/database";

import { BiteshipService, type IBiteshipOrder } from "./biteship.service";
import { MidtransService } from "./midtrans.service";
import { dispatchPaidEmail, dispatchShipmentEmail } from "./sample-email-dispatch.service";
import { SamplePaymentService } from "./sample-payment.service";
import { SampleRequestService } from "./sample-request.service";
import { SampleShipmentService } from "./sample-shipment.service";
import { WebhookEventService } from "./webhook-event.service";

/** Handled, or nothing a retry could change: the provider can stop. */
const OK = { status: 200 } as const;

/** Processing failed: the provider retries, which is safe because every write repeats cleanly. */
const RETRY = { status: 500 } as const;

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Midtrans and Biteship webhook processing, shared by the route handlers and tested without HTTP. */
export class WebhookHandlers {
  /**
   * Verify signature, store, apply to the attempt, send the paid email the first time a request is paid.
   * The URL is public, so only signed bodies reach the database.
   */
  static async handleMidtrans(
    db: SampleDatabase,
    body: unknown,
    serverKey: string,
    now: Date
  ): Promise<{ status: number }> {
    const notification = MidtransService.parseNotification(body);
    if (notification === null) {
      console.error("[midtrans] unparseable notification");
      return OK;
    }
    if (!MidtransService.verifyNotification(notification, serverKey)) {
      console.error("[midtrans] notification with a bad signature", notification.order_id);
      return OK;
    }
    const eventId = await WebhookEventService.record(db, "midtrans", notification.order_id, body, now);

    try {
      const result = await SamplePaymentService.applyNotification(db, notification, now);
      if (result.kind === "paid") {
        const batch = await SampleRequestService.findBatch(db, result.request.batchId);
        if (batch !== null) {
          await dispatchPaidEmail(db, result.request, batch, now);
        }
      }
      await WebhookEventService.markProcessed(db, eventId, result.kind === "unknown" ? "unknown order id" : null, now);
    } catch (error) {
      console.error("[midtrans] processing failed", error);
      await WebhookEventService.markProcessed(db, eventId, errorText(error), now);
      return RETRY;
    }

    return OK;
  }

  /** Store, re-fetch the order from Biteship, apply it, send shipped or delivered once each. */
  static async handleBiteship(
    db: SampleDatabase,
    body: unknown,
    now: Date,
    fetchOrder: (orderId: string) => Promise<IBiteshipOrder | null> = BiteshipService.fetchOrder
  ): Promise<{ status: number }> {
    const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    const orderId = typeof record.order_id === "string" ? record.order_id : null;
    const eventId = await WebhookEventService.record(db, "biteship", orderId, body, now);

    try {
      const shipment = orderId === null ? null : await SampleShipmentService.findByBiteshipOrderId(db, orderId);
      if (orderId === null || shipment === null) {
        await WebhookEventService.markProcessed(db, eventId, "unknown order id", now);
        return OK;
      }

      const order = await fetchOrder(orderId);
      if (order === null) {
        await WebhookEventService.markProcessed(db, eventId, "order fetch failed", now);
        return RETRY;
      }

      const { shipment: current, dueEmail } = await SampleShipmentService.applyOrderSnapshot(db, shipment, order, now);
      if (dueEmail !== null) {
        await dispatchShipmentEmail(db, current, dueEmail, now);
      }
      await WebhookEventService.markProcessed(db, eventId, null, now);
    } catch (error) {
      console.error("[biteship] processing failed", error);
      await WebhookEventService.markProcessed(db, eventId, errorText(error), now);
      return RETRY;
    }

    return OK;
  }
}
