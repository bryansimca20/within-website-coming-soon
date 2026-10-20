import "server-only";

import { and, asc, desc, eq, isNull } from "drizzle-orm";

import type { SampleDatabase } from "@/db/database";
import { type SampleRequest, type SampleShipment, sampleShipments } from "@/db/schema";

import {
  BiteshipService,
  type IBiteshipOrder,
  phaseForBiteshipStatus,
  readSampleOrigin,
  ShipmentPhase,
} from "./biteship.service";
import { SampleRequestService } from "./sample-request.service";

/** One shipping run: which paid requests, and when the courier should collect. */
export interface IShipRunInput {
  requestIds: string[];
  deliveryType: "now" | "scheduled";
  deliveryDate: string | null;
  deliveryTime: string | null;
}

/** The outcome for one request in a run. */
export interface IShipRunResult {
  requestId: string;
  boxLabel: string;
  ok: boolean;
  waybillId: string | null;
  error: string | null;
}

/** A refreshed shipment, and which sampler email is now due, if any. */
export interface SnapshotResult {
  shipment: SampleShipment;
  dueEmail: "shipped" | "delivered" | null;
}

/** Requests a founder may book: paid, or shipped and coming back for a re-ship. */
const BOOKABLE_STATUSES = ["paid", "shipped"];

/** Pickups are scheduled in Jakarta time. */
const JAKARTA_OFFSET = "+07:00";

/** Biteship orders for requests: booking runs, applying what Biteship reports, email guards. */
export class SampleShipmentService {
  /** `B01-042-1`: Biteship's reference id, unique per attempt. */
  static referenceId(boxLabel: string, attempt: number): string {
    return `${boxLabel}-${attempt}`;
  }

  /** Books one Biteship order per request. One failure never stops the others. */
  static async bookRun(db: SampleDatabase, input: IShipRunInput, now: Date): Promise<IShipRunResult[]> {
    const origin = readSampleOrigin();
    const results: IShipRunResult[] = [];

    for (const requestId of input.requestIds) {
      const request = await SampleRequestService.findById(db, requestId);
      if (request === null) {
        results.push({ requestId, boxLabel: "", ok: false, waybillId: null, error: "Request not found." });
        continue;
      }
      const boxLabel = SampleRequestService.boxLabel(request.batchId, request.boxNumber);
      if (!BOOKABLE_STATUSES.includes(request.status)) {
        results.push({ requestId, boxLabel, ok: false, waybillId: null, error: `Not bookable: status is ${request.status}.` });
        continue;
      }

      const attempt = (await SampleShipmentService.listAttempts(db, requestId)).length + 1;
      const referenceId = SampleShipmentService.referenceId(boxLabel, attempt);
      const order = await BiteshipService.createOrder({
        referenceId,
        courierCompany: request.courierCompany,
        courierType: request.courierType,
        deliveryType: input.deliveryType,
        deliveryDate: input.deliveryType === "scheduled" ? input.deliveryDate : null,
        deliveryTime: input.deliveryType === "scheduled" ? input.deliveryTime : null,
        destination: {
          name: request.fullName,
          phone: request.whatsapp,
          email: request.email,
          address: request.addressLine,
          note: request.deliveryNote,
          areaId: request.areaId,
          postalCode: request.postalCode,
        },
        origin,
      });
      if (order === null) {
        results.push({ requestId, boxLabel, ok: false, waybillId: null, error: "Biteship refused the order." });
        continue;
      }

      await db.insert(sampleShipments).values({
        requestId,
        attempt,
        referenceId,
        biteshipOrderId: order.id,
        trackingId: order.trackingId,
        waybillId: order.waybillId,
        courierCompany: request.courierCompany,
        courierType: request.courierType,
        trackingLink: order.trackingLink,
        status: order.status,
        price: order.price,
        deliveryType: input.deliveryType,
        scheduledFor: SampleShipmentService.scheduledFor(input),
        history: order.history,
        createdAt: now,
        updatedAt: now,
      });
      results.push({ requestId, boxLabel, ok: true, waybillId: order.waybillId, error: null });
    }

    return results;
  }

  private static scheduledFor(input: IShipRunInput): Date | null {
    if (input.deliveryType !== "scheduled" || input.deliveryDate === null || input.deliveryTime === null) {
      return null;
    }
    const scheduled = new Date(`${input.deliveryDate}T${input.deliveryTime}:00${JAKARTA_OFFSET}`);

    return Number.isNaN(scheduled.getTime()) ? null : scheduled;
  }

  static async latestForRequest(db: SampleDatabase, requestId: string): Promise<SampleShipment | null> {
    const [shipment] = await db
      .select()
      .from(sampleShipments)
      .where(eq(sampleShipments.requestId, requestId))
      .orderBy(desc(sampleShipments.attempt))
      .limit(1);

    return shipment ?? null;
  }

  static async listAttempts(db: SampleDatabase, requestId: string): Promise<SampleShipment[]> {
    return db
      .select()
      .from(sampleShipments)
      .where(eq(sampleShipments.requestId, requestId))
      .orderBy(asc(sampleShipments.attempt));
  }

  static async findByBiteshipOrderId(db: SampleDatabase, orderId: string): Promise<SampleShipment | null> {
    const [shipment] = await db
      .select()
      .from(sampleShipments)
      .where(eq(sampleShipments.biteshipOrderId, orderId))
      .limit(1);

    return shipment ?? null;
  }

  /**
   * Stores what Biteship reports and moves the request forward (never back). Says which email
   * is due: delivered when the box landed and that email has not gone, else shipped when the
   * courier has it and that email has not gone.
   */
  static async applyOrderSnapshot(
    db: SampleDatabase,
    shipment: SampleShipment,
    order: IBiteshipOrder,
    now: Date
  ): Promise<SnapshotResult> {
    const [updated] = await db
      .update(sampleShipments)
      .set({
        status: order.status,
        trackingId: order.trackingId ?? shipment.trackingId,
        waybillId: order.waybillId ?? shipment.waybillId,
        trackingLink: order.trackingLink ?? shipment.trackingLink,
        price: order.price ?? shipment.price,
        history: order.history,
        updatedAt: now,
      })
      .where(eq(sampleShipments.id, shipment.id))
      .returning();
    const current = updated ?? shipment;

    const phase = phaseForBiteshipStatus(order.status);
    const request = await SampleRequestService.findById(db, shipment.requestId);
    if (request !== null) {
      await SampleShipmentService.advanceRequest(db, request, phase, now);
    }

    let dueEmail: SnapshotResult["dueEmail"] = null;
    if (phase === ShipmentPhase.Delivered && current.deliveredEmailSentAt === null) {
      dueEmail = "delivered";
    } else if (phase === ShipmentPhase.Shipped && current.shippedEmailSentAt === null) {
      dueEmail = "shipped";
    }

    return { shipment: current, dueEmail };
  }

  /** paid → shipped → delivered, each timestamp written once; anything else leaves the request alone. */
  private static async advanceRequest(
    db: SampleDatabase,
    request: SampleRequest,
    phase: ShipmentPhase,
    now: Date
  ): Promise<void> {
    const reachedShipped = phase === ShipmentPhase.Shipped || phase === ShipmentPhase.Delivered;
    const patch: { shippedAt?: Date; deliveredAt?: Date } = {};
    let status = request.status;

    if (reachedShipped && request.shippedAt === null) {
      patch.shippedAt = now;
      if (status === "paid") {
        status = "shipped";
      }
    }
    if (phase === ShipmentPhase.Delivered && request.deliveredAt === null) {
      patch.deliveredAt = now;
      if (status === "paid" || status === "shipped") {
        status = "delivered";
      }
    }

    if (status !== request.status || Object.keys(patch).length > 0) {
      await SampleRequestService.setStatus(db, request.id, status, patch);
    }
  }

  /**
   * Claims the right to send a once-only email: an atomic `UPDATE … WHERE sent_at IS NULL`, so two
   * webhooks racing on the same status cannot both send. True when this caller won.
   */
  static async claimEmail(db: SampleDatabase, shipmentId: string, kind: "shipped" | "delivered", at: Date): Promise<boolean> {
    const column = kind === "shipped" ? sampleShipments.shippedEmailSentAt : sampleShipments.deliveredEmailSentAt;
    const rows = await db
      .update(sampleShipments)
      .set(kind === "shipped" ? { shippedEmailSentAt: at } : { deliveredEmailSentAt: at })
      .where(and(eq(sampleShipments.id, shipmentId), isNull(column)))
      .returning({ id: sampleShipments.id });

    return rows.length > 0;
  }

  /** Gives a claim back after a failed send, so the next webhook or an admin refresh can retry. */
  static async releaseEmail(db: SampleDatabase, shipmentId: string, kind: "shipped" | "delivered"): Promise<void> {
    await db
      .update(sampleShipments)
      .set(kind === "shipped" ? { shippedEmailSentAt: null } : { deliveredEmailSentAt: null })
      .where(eq(sampleShipments.id, shipmentId));
  }

}
