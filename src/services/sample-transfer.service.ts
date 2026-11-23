import "server-only";

import { and, asc, eq, inArray, sql } from "drizzle-orm";

import { CONFIRM_WITHIN_HOURS } from "@/app/utils/bank-transfer";
import type { SampleDatabase } from "@/db/database";
import { sampleBatches, type SampleRequest, type SampleRequestStatus, sampleRequests } from "@/db/schema";

import { SampleRequestService, UNPAID_HOLDING_STATUSES } from "./sample-request.service";

/** What "I've transferred" did. `reported` covers a repeat tap, which changes nothing. */
export type ReportTransferResult =
  | { kind: "reported"; request: SampleRequest }
  | { kind: "lapsed" }
  | { kind: "not-pending"; request: SampleRequest }
  | { kind: "not-found" };

/** What a founder's Confirm did: paid the box, was a repeat, needs a refund (noted on the request), or was refused. */
export type ConfirmTransferResult =
  | { kind: "paid"; request: SampleRequest }
  | { kind: "repeat" }
  | { kind: "refund"; request: SampleRequest }
  | { kind: "refused"; message: string };

/** Outcome of a founder's Reject. */
export type RejectTransferResult = { ok: true } | { ok: false; message: string };

/** The statuses a founder can still reject: the box is held but not paid. */
const REJECTABLE_STATUSES: SampleRequestStatus[] = ["pending_payment", "awaiting_confirmation"];

const MS_PER_HOUR = 3_600_000;
const REJECT_REASON = "Transfer not found.";

/** Bank transfers: the sampler's "I've transferred", and the founder's Confirm and Reject. */
export class SampleTransferService {
  /** The sampler's tap. A live hold becomes a reported transfer, which holds its box until a founder decides. */
  static async report(db: SampleDatabase, token: string, now: Date): Promise<ReportTransferResult> {
    const found = await SampleRequestService.findByToken(db, token);
    if (found === null || found.paymentCode === null) {
      return { kind: "not-found" };
    }
    const request = await SampleRequestService.markExpiredIfLapsed(db, found, now);
    if (request.status === "pending_payment") {
      const [reported] = await db
        .update(sampleRequests)
        .set({ status: "awaiting_confirmation", transferReportedAt: now })
        .where(and(eq(sampleRequests.id, request.id), eq(sampleRequests.status, "pending_payment")))
        .returning();
      if (reported !== undefined) {
        return { kind: "reported", request: reported };
      }
    }

    // Already reported, or something moved it since it was read: the stored state answers.
    const current = (await SampleRequestService.findById(db, request.id)) ?? request;
    if (current.status === "expired") return { kind: "lapsed" };
    if (current.status === "awaiting_confirmation") return { kind: "reported", request: current };
    return { kind: "not-pending", request: current };
  }

  /**
   * A founder saw the money in the bank. Pays the request through the same path as a Midtrans settlement, in one
   * transaction with its batch row locked. A late transfer is paid only while the batch has room; otherwise, and for
   * a rejected request, nothing is paid and the request is noted for a refund. A closed batch still confirms.
   */
  static async confirm(db: SampleDatabase, requestId: string, now: Date): Promise<ConfirmTransferResult> {
    return db.transaction(async (tx) => {
      const unlocked = await SampleRequestService.findById(tx, requestId);
      if (unlocked === null || unlocked.batchId === null) {
        return { kind: "refused", message: "That request doesn't exist." };
      }
      const [batch] = await tx.select().from(sampleBatches).where(eq(sampleBatches.id, unlocked.batchId)).for("update");
      // As a claim does: a hold that lapsed unseen must not keep a box from a late transfer.
      await SampleRequestService.expireLapsedHolds(tx, unlocked.batchId, now);
      const request = (await SampleRequestService.findById(tx, requestId)) ?? unlocked;
      if (request.paymentCode === null) {
        return { kind: "refused", message: "Only bank-transfer requests are confirmed here." };
      }
      if (request.paidAt !== null) {
        return { kind: "repeat" };
      }
      const hasNoRoom =
        request.status === "expired" && !request.isTest && batch !== undefined && !(await SampleTransferService.hasRoomFor(tx, request, batch.capacity));
      if (request.status === "cancelled" || hasNoRoom) {
        await SampleTransferService.noteRefundOnce(tx, request);
        return { kind: "refund", request };
      }

      const settled = await SampleRequestService.settle(tx, request.id, now);
      if (settled.kind === "refund") {
        await SampleTransferService.noteRefundOnce(tx, settled.request);
        // The email already owns a box, so this request stops holding one.
        await tx
          .update(sampleRequests)
          .set({ status: "expired" })
          .where(and(eq(sampleRequests.id, settled.request.id), inArray(sampleRequests.status, UNPAID_HOLDING_STATUSES)));
      }
      return settled;
    });
  }

  /** A founder found no money. The box goes back to the batch; the request keeps the reason and the founder's note. */
  static async reject(db: SampleDatabase, requestId: string, note: string): Promise<RejectTransferResult> {
    const request = await SampleRequestService.findById(db, requestId);
    if (request === null || request.paymentCode === null) {
      return { ok: false, message: "Only bank-transfer requests are rejected here." };
    }
    const line = note.trim() === "" ? REJECT_REASON : `${REJECT_REASON} ${note.trim()}`;
    const [rejected] = await db
      .update(sampleRequests)
      .set({ status: "cancelled", adminNote: request.adminNote === null ? line : `${request.adminNote}\n${line}` })
      .where(and(eq(sampleRequests.id, request.id), inArray(sampleRequests.status, REJECTABLE_STATUSES)))
      .returning({ id: sampleRequests.id });

    return rejected === undefined ? { ok: false, message: "Only a holding or to-confirm request can be rejected." } : { ok: true };
  }

  /** A batch's reported transfers, oldest report first, test rows included so a founder can try the flow. */
  static async listToConfirm(db: SampleDatabase, batchId: string): Promise<SampleRequest[]> {
    return db
      .select()
      .from(sampleRequests)
      .where(and(eq(sampleRequests.batchId, batchId), eq(sampleRequests.status, "awaiting_confirmation")))
      .orderBy(asc(sampleRequests.transferReportedAt));
  }

  /** Reported longer ago than the confirmation promise on the page. */
  static isOverdue(request: SampleRequest, now: Date): boolean {
    return request.transferReportedAt !== null && now.getTime() - request.transferReportedAt.getTime() > CONFIRM_WITHIN_HOURS * MS_PER_HOUR;
  }

  /**
   * Whether paying a lapsed request keeps the batch within capacity. The same sampler's live holds and reported
   * transfers in the batch don't count: paying this request releases them.
   */
  private static async hasRoomFor(db: SampleDatabase, request: SampleRequest, capacity: number): Promise<boolean> {
    const batchId = request.batchId;
    if (batchId === null) return false;
    const [ownHolds] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sampleRequests)
      .where(
        and(
          eq(sampleRequests.batchId, batchId),
          eq(sampleRequests.email, request.email),
          inArray(sampleRequests.status, UNPAID_HOLDING_STATUSES),
          eq(sampleRequests.isTest, false)
        )
      );

    return (await SampleRequestService.countClaiming(db, batchId)) - (ownHolds?.count ?? 0) < capacity;
  }

  /** Leaves the refund note for this request's code once, however often Confirm is pressed. */
  private static async noteRefundOnce(db: SampleDatabase, request: SampleRequest): Promise<void> {
    const code = request.paymentCode ?? "";
    if (request.adminNote?.includes(`REFUND DUE: ${code}`)) return;
    await SampleRequestService.noteRefundDue(db, request, code);
  }
}
