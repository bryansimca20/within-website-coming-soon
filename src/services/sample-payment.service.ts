import "server-only";

import { desc, eq } from "drizzle-orm";

import { generateOrderSuffix } from "@/app/utils/token";
import type { SampleDatabase } from "@/db/database";
import { type SampleBatch, type SamplePayment, samplePayments, type SampleRequest } from "@/db/schema";

import { type IMidtransNotification, MidtransService, PaymentSignal } from "./midtrans.service";
import { SampleRequestService } from "./sample-request.service";

/** What applying a Midtrans notification did. */
export type ApplyNotificationResult =
  | { kind: "paid"; request: SampleRequest }
  | { kind: "updated" }
  | { kind: "unknown" }
  | { kind: "ignored" };

/** What the status page gets when it asks to pay. */
export type ReopenResult =
  | { kind: "token"; payment: SamplePayment }
  | { kind: "paid"; request: SampleRequest }
  | { kind: "lapsed" }
  | { kind: "not-pending" }
  | { kind: "error" };

/** Payment attempts: one Snap transaction each, several per request if the first ones lapse. */
export class SamplePaymentService {
  /** `WS-B01-042-AB12CD`: unique per attempt, readable in the Midtrans dashboard. */
  static buildOrderId(batchId: string, boxNumber: number, suffix: string): string {
    return `WS-${SampleRequestService.boxLabel(batchId, boxNumber)}-${suffix}`;
  }

  /** Opens a Snap transaction for the minutes left in the hold and stores the attempt. */
  static async createAttempt(
    db: SampleDatabase,
    request: SampleRequest,
    batch: SampleBatch,
    now: Date,
    finishUrl: string
  ): Promise<SamplePayment | null> {
    const expiryMinutes = SampleRequestService.minutesLeft(request, now);
    if (expiryMinutes < 1) {
      return null;
    }

    const orderId = SamplePaymentService.buildOrderId(batch.id, request.boxNumber, generateOrderSuffix());
    const snap = await MidtransService.createSnapTransaction({
      orderId,
      grossAmount: request.shippingFee,
      expiryMinutes,
      itemName: `Shipping: ${request.courierServiceName}`,
      finishUrl,
      customer: {
        firstName: request.firstName,
        lastName: request.fullName.slice(request.firstName.length).trim() || null,
        email: request.email,
        phone: request.whatsapp,
        address: request.addressLine,
        city: request.city,
        postalCode: request.postalCode,
      },
    });
    if (snap === null) {
      return null;
    }

    const [payment] = await db
      .insert(samplePayments)
      .values({
        requestId: request.id,
        midtransOrderId: orderId,
        grossAmount: request.shippingFee,
        snapToken: snap.token,
        snapRedirectUrl: snap.redirectUrl,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return payment ?? null;
  }

  static async latestForRequest(db: SampleDatabase, requestId: string): Promise<SamplePayment | null> {
    const [payment] = await db
      .select()
      .from(samplePayments)
      .where(eq(samplePayments.requestId, requestId))
      .orderBy(desc(samplePayments.createdAt))
      .limit(1);

    return payment ?? null;
  }

  static async findByOrderId(db: SampleDatabase, orderId: string): Promise<SamplePayment | null> {
    const [payment] = await db.select().from(samplePayments).where(eq(samplePayments.midtransOrderId, orderId)).limit(1);

    return payment ?? null;
  }

  /** The open attempt if one is still pending; otherwise a fresh one, as long as the hold stands. */
  static async reopen(
    db: SampleDatabase,
    request: SampleRequest,
    batch: SampleBatch,
    now: Date,
    finishUrl: string
  ): Promise<ReopenResult> {
    if (request.status !== "pending_payment") {
      return { kind: "not-pending" };
    }
    const current = await SampleRequestService.markExpiredIfLapsed(db, request, now);
    if (current.status === "expired") {
      return { kind: "lapsed" };
    }

    let latest = await SamplePaymentService.latestForRequest(db, request.id);
    if (latest !== null && latest.status === "pending") {
      // Our row can lag Midtrans when the expire notification is late or never configured.
      const live = await MidtransService.fetchStatus(latest.midtransOrderId);
      if (live !== null) {
        const applied = await SamplePaymentService.applyNotification(db, live, now);
        if (applied.kind === "paid") {
          return { kind: "paid", request: applied.request };
        }
        latest = await SamplePaymentService.latestForRequest(db, request.id);
      }
      if (latest !== null && latest.status === "pending") {
        return { kind: "token", payment: latest };
      }
    }

    const payment = await SamplePaymentService.createAttempt(db, current, batch, now, finishUrl);

    return payment === null ? { kind: "error" } : { kind: "token", payment };
  }

  /**
   * Applies one verified notification to its attempt. A settled attempt never moves backwards,
   * and the request is paid at most once, even when Midtrans repeats itself.
   */
  static async applyNotification(
    db: SampleDatabase,
    notification: IMidtransNotification,
    now: Date
  ): Promise<ApplyNotificationResult> {
    const payment = await SamplePaymentService.findByOrderId(db, notification.order_id);
    if (payment === null) {
      return { kind: "unknown" };
    }

    const signal = MidtransService.interpretNotification(notification);
    if (signal === PaymentSignal.Ignore || (payment.status === "settlement" && signal !== PaymentSignal.Paid)) {
      return { kind: "ignored" };
    }

    await db
      .update(samplePayments)
      .set({
        status: signal === PaymentSignal.Paid ? "settlement" : MidtransService.toPaymentStatus(notification),
        paymentType: notification.payment_type ?? payment.paymentType,
        transactionId: notification.transaction_id ?? payment.transactionId,
        transactionTime: notification.transaction_time ?? payment.transactionTime,
        settledAt: signal === PaymentSignal.Paid ? (payment.settledAt ?? now) : payment.settledAt,
        updatedAt: now,
      })
      .where(eq(samplePayments.id, payment.id));

    if (signal !== PaymentSignal.Paid) {
      return { kind: "updated" };
    }

    const request = await SampleRequestService.markPaid(db, payment.requestId, now);

    return request === null ? { kind: "updated" } : { kind: "paid", request };
  }
}
