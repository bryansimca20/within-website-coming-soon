import "server-only";

import type { SampleDatabase } from "@/db/database";

import { BiteshipService, type IBiteshipOrder } from "./biteship.service";
import { MidtransService } from "./midtrans.service";
import { dispatchShipmentEmail } from "./sample-email-dispatch.service";
import { SampleNotifier } from "./sample-notifier.service";
import { SamplePaymentService } from "./sample-payment.service";
import { SampleRequestService } from "./sample-request.service";
import { SampleShipmentService } from "./sample-shipment.service";
import { WebhookEventService } from "./webhook-event.service";

/** Every webhook is answered 200 once stored, so providers stop retrying; failures live on the event row. */
const OK = { status: 200 } as const;

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Midtrans and Biteship webhook processing, shared by the route handlers and tested without HTTP. */
export class WebhookHandlers {
  /** Store, verify signature, apply to the attempt, send the paid email the first time a request is paid. */
  static async handleMidtrans(
    db: SampleDatabase,
    body: unknown,
    serverKey: string,
    now: Date
  ): Promise<{ status: number }> {
    const notification = MidtransService.parseNotification(body);
    const eventId = await WebhookEventService.record(db, "midtrans", notification?.order_id ?? null, body, now);

    if (notification === null) {
      await WebhookEventService.markProcessed(db, eventId, "unparseable body", now);
      return OK;
    }
    if (!MidtransService.verifyNotification(notification, serverKey)) {
      console.error("[midtrans] notification with a bad signature", notification.order_id);
      await WebhookEventService.markProcessed(db, eventId, "invalid signature", now);
      return OK;
    }

    try {
      const result = await SamplePaymentService.applyNotification(db, notification, now);
      if (result.kind === "paid") {
        const batch = await SampleRequestService.findBatch(db, result.request.batchId);
        if (batch !== null) {
          await SampleNotifier.sendPaid(result.request, batch);
        }
      }
      await WebhookEventService.markProcessed(db, eventId, result.kind === "unknown" ? "unknown order id" : null, now);
    } catch (error) {
      console.error("[midtrans] processing failed", error);
      await WebhookEventService.markProcessed(db, eventId, errorText(error), now);
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
        return OK;
      }

      const { shipment: current, dueEmail } = await SampleShipmentService.applyOrderSnapshot(db, shipment, order, now);
      if (dueEmail !== null) {
        await dispatchShipmentEmail(db, current, dueEmail, now);
      }
      await WebhookEventService.markProcessed(db, eventId, null, now);
    } catch (error) {
      console.error("[biteship] processing failed", error);
      await WebhookEventService.markProcessed(db, eventId, errorText(error), now);
    }

    return OK;
  }
}
