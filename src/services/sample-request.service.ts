import "server-only";

import { and, desc, eq, ilike, inArray, isNotNull, isNull, lte, max, ne, or, type SQL, sql } from "drizzle-orm";

import type { ISampleRequestValues } from "@/app/utils/sample-request-input";
import { generateAccessToken } from "@/app/utils/token";
import type { SampleDatabase } from "@/db/database";
import {
  type SampleBatch,
  type SampleBatchPhase,
  sampleBatches,
  type SampleRequest,
  type SampleRequestStatus,
  sampleRequests,
} from "@/db/schema";

import { SampleBatchService } from "./sample-batch.service";

/** What a claim attempt produced. */
export type ClaimResult =
  | { kind: "claimed"; request: SampleRequest }
  | { kind: "full" }
  | { kind: "already-requested"; request: SampleRequest }
  | { kind: "closed" };

/** What a settled payment did: paid the request, was a repeat, or must be refunded by a founder. */
export type SettleResult =
  | { kind: "paid"; request: SampleRequest }
  | { kind: "repeat" }
  | { kind: "refund"; request: SampleRequest };

/** The batch as a visitor reads it. */
export interface ISampleBatchShown {
  label: string;
  capacity: number;
}

/** What `/sample` shows. */
export type SamplePageState =
  | { kind: "upcoming"; batch: ISampleBatchShown }
  | { kind: "open"; batch: ISampleBatchShown; claimed: number }
  | { kind: "closed"; batch: ISampleBatchShown }
  | { kind: "none" };

/** Statuses that own a box for good: a second request from the same email is refused. */
export const ACTIVE_STATUSES: SampleRequestStatus[] = ["paid", "shipped", "delivered"];

/** Statuses that occupy a slot in the batch count: active ones plus live holds. */
const CLAIMING_STATUSES: SampleRequestStatus[] = ["pending_payment", ...ACTIVE_STATUSES];

const MS_PER_MINUTE = 60_000;

/** Requests and batches: the hold, the count, the box number, and the lifecycle writes. */
export class SampleRequestService {
  /** The one batch taking requests, or null when none is open. */
  static async getOpenBatch(db: SampleDatabase): Promise<SampleBatch | null> {
    const [batch] = await db
      .select()
      .from(sampleBatches)
      .where(eq(sampleBatches.phase, "open"))
      .orderBy(sampleBatches.createdAt)
      .limit(1);

    return batch ?? null;
  }

  /** What `/sample` shows, from the batch it serves (see `SampleBatchService.forSamplePage`). An open batch that is full shows closed. */
  static async pageState(db: SampleDatabase, now: Date): Promise<SamplePageState> {
    const batch = await SampleBatchService.forSamplePage(db);
    if (batch === null) {
      return { kind: "none" };
    }
    const shown = { label: batch.label, capacity: batch.capacity };
    if (batch.phase !== "open") {
      return { kind: batch.phase, batch: shown };
    }
    const claimed = await SampleRequestService.countClaimed(db, batch.id, now);

    return claimed < batch.capacity ? { kind: "open", batch: shown, claimed } : { kind: "closed", batch: shown };
  }

  /** Writes `expired` on every hold whose window has passed. Returns how many it closed. */
  static async expireLapsedHolds(db: SampleDatabase, batchId: string, now: Date): Promise<number> {
    const rows = await db
      .update(sampleRequests)
      .set({ status: "expired" })
      .where(
        and(
          eq(sampleRequests.batchId, batchId),
          eq(sampleRequests.status, "pending_payment"),
          lte(sampleRequests.expiresAt, now)
        )
      )
      .returning({ id: sampleRequests.id });

    return rows.length;
  }

  /** Live holds plus paid and later, after closing lapsed holds. The number on the page. */
  static async countClaimed(db: SampleDatabase, batchId: string, now: Date): Promise<number> {
    await SampleRequestService.expireLapsedHolds(db, batchId, now);

    return SampleRequestService.countClaiming(db, batchId);
  }

  private static async countClaiming(db: SampleDatabase, batchId: string): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sampleRequests)
      .where(and(eq(sampleRequests.batchId, batchId), inArray(sampleRequests.status, CLAIMING_STATUSES)));

    return row?.count ?? 0;
  }

  /**
   * Holds a box for one request, in one transaction with the batch row locked: lapsed holds are
   * closed, a pending hold from the same email is replaced, a paid box for the same email is
   * returned instead, a full or closed batch is refused, and the next box number is taken.
   */
  static async claim(
    db: SampleDatabase,
    batchId: string,
    values: ISampleRequestValues,
    now: Date
  ): Promise<ClaimResult> {
    return db.transaction(async (tx) => {
      const [batch] = await tx.select().from(sampleBatches).where(eq(sampleBatches.id, batchId)).for("update");
      if (batch === undefined || batch.phase !== "open") {
        return { kind: "closed" };
      }

      await SampleRequestService.expireLapsedHolds(tx, batchId, now);
      await tx
        .update(sampleRequests)
        .set({ status: "expired" })
        // In every batch: one email never holds boxes in two batches at once.
        .where(and(eq(sampleRequests.email, values.email), eq(sampleRequests.status, "pending_payment")));

      const existing = await SampleRequestService.findActiveByEmail(tx, values.email);
      if (existing !== null) {
        return { kind: "already-requested", request: existing };
      }

      if ((await SampleRequestService.countClaiming(tx, batchId)) >= batch.capacity) {
        return { kind: "full" };
      }

      const [highest] = await tx
        .select({ boxNumber: max(sampleRequests.boxNumber) })
        .from(sampleRequests)
        .where(eq(sampleRequests.batchId, batchId));
      const boxNumber = (highest?.boxNumber ?? 0) + 1;
      const { attribution, wantsLaunchEmail, ...rest } = values;

      const [request] = await tx
        .insert(sampleRequests)
        .values({
          ...rest,
          ref: attribution.ref,
          utmSource: attribution.utmSource,
          utmMedium: attribution.utmMedium,
          utmCampaign: attribution.utmCampaign,
          utmContent: attribution.utmContent,
          utmTerm: attribution.utmTerm,
          batchId,
          boxNumber,
          accessToken: generateAccessToken(),
          status: "pending_payment",
          consentedAt: wantsLaunchEmail ? now : null,
          createdAt: now,
          expiresAt: new Date(now.getTime() + batch.paymentWindowMinutes * MS_PER_MINUTE),
        })
        .returning();

      return { kind: "claimed", request };
    });
  }

  static async findBatch(db: SampleDatabase, batchId: string): Promise<SampleBatch | null> {
    const [batch] = await db.select().from(sampleBatches).where(eq(sampleBatches.id, batchId)).limit(1);

    return batch ?? null;
  }

  static async findByToken(db: SampleDatabase, token: string): Promise<SampleRequest | null> {
    const [request] = await db.select().from(sampleRequests).where(eq(sampleRequests.accessToken, token)).limit(1);

    return request ?? null;
  }

  static async findById(db: SampleDatabase, id: string): Promise<SampleRequest | null> {
    const [request] = await db.select().from(sampleRequests).where(eq(sampleRequests.id, id)).limit(1);

    return request ?? null;
  }

  /** The newest paid, shipped or delivered request for an email, in any batch. */
  static async findActiveByEmail(db: SampleDatabase, email: string): Promise<SampleRequest | null> {
    const [request] = await db
      .select()
      .from(sampleRequests)
      .where(
        and(eq(sampleRequests.email, email.trim().toLowerCase()), inArray(sampleRequests.status, ACTIVE_STATUSES))
      )
      .orderBy(desc(sampleRequests.createdAt))
      .limit(1);

    return request ?? null;
  }

  /** Moves a request to paid the first time only; a request already paid returns null. */
  static async markPaid(db: SampleDatabase, requestId: string, paidAt: Date): Promise<SampleRequest | null> {
    const [request] = await db
      .update(sampleRequests)
      .set({ status: "paid", paidAt })
      .where(and(eq(sampleRequests.id, requestId), sql`${sampleRequests.paidAt} is null`))
      .returning();

    return request ?? null;
  }

  /**
   * Applies a settled payment with the batch row locked. A cancelled request, or an email that already
   * owns a box, is not paid again. Paying closes the same email's other holds, so they free their slots.
   */
  static async settle(db: SampleDatabase, requestId: string, paidAt: Date): Promise<SettleResult> {
    return db.transaction(async (tx) => {
      const unlocked = await SampleRequestService.findById(tx, requestId);
      if (unlocked === null) {
        return { kind: "repeat" };
      }
      await tx.select({ id: sampleBatches.id }).from(sampleBatches).where(eq(sampleBatches.id, unlocked.batchId)).for("update");
      const request = (await SampleRequestService.findById(tx, requestId)) ?? unlocked;
      if (request.paidAt !== null) {
        return { kind: "repeat" };
      }
      if (request.status === "cancelled" || (await SampleRequestService.findActiveByEmail(tx, request.email)) !== null) {
        return { kind: "refund", request };
      }

      const paid = await SampleRequestService.markPaid(tx, request.id, paidAt);
      if (paid === null) {
        return { kind: "repeat" };
      }
      await tx
        .update(sampleRequests)
        .set({ status: "expired" })
        .where(and(eq(sampleRequests.email, request.email), eq(sampleRequests.status, "pending_payment"), ne(sampleRequests.id, request.id)));

      return { kind: "paid", request: paid };
    });
  }

  /** Leaves a founder the order to refund, keeping any note already on the request. */
  static async noteRefundDue(db: SampleDatabase, request: SampleRequest, orderId: string): Promise<void> {
    const note = `REFUND DUE: ${orderId} was paid after this request closed or the email already had a box.`;
    await db
      .update(sampleRequests)
      .set({ adminNote: request.adminNote === null ? note : `${request.adminNote}\n${note}` })
      .where(eq(sampleRequests.id, request.id));
  }

  /** Claims the once-only paid email: true when this caller won. */
  static async claimPaidEmail(db: SampleDatabase, requestId: string, at: Date): Promise<boolean> {
    const rows = await db
      .update(sampleRequests)
      .set({ paidEmailSentAt: at })
      .where(and(eq(sampleRequests.id, requestId), isNull(sampleRequests.paidEmailSentAt)))
      .returning({ id: sampleRequests.id });

    return rows.length > 0;
  }

  /** Gives the claim back after a failed send, so the daily cron can retry. */
  static async releasePaidEmail(db: SampleDatabase, requestId: string): Promise<void> {
    await db.update(sampleRequests).set({ paidEmailSentAt: null }).where(eq(sampleRequests.id, requestId));
  }

  /** Paid requests whose confirmation email never went out. */
  static async duePaidEmails(db: SampleDatabase): Promise<SampleRequest[]> {
    return db
      .select()
      .from(sampleRequests)
      .where(and(isNotNull(sampleRequests.paidAt), isNull(sampleRequests.paidEmailSentAt), inArray(sampleRequests.status, ACTIVE_STATUSES)));
  }

  /** Writes `expired` on a pending request whose window has passed; otherwise returns it untouched. */
  static async markExpiredIfLapsed(db: SampleDatabase, request: SampleRequest, now: Date): Promise<SampleRequest> {
    if (request.status !== "pending_payment" || request.expiresAt.getTime() > now.getTime()) {
      return request;
    }
    const [updated] = await db
      .update(sampleRequests)
      .set({ status: "expired" })
      .where(and(eq(sampleRequests.id, request.id), eq(sampleRequests.status, "pending_payment")))
      .returning();

    // No row means a payment landed after `request` was read: the stored state wins.
    return updated ?? (await SampleRequestService.findById(db, request.id)) ?? request;
  }

  static async setStatus(
    db: SampleDatabase,
    id: string,
    status: SampleRequestStatus,
    patch: Partial<Pick<SampleRequest, "shippedAt" | "deliveredAt" | "adminNote">> = {}
  ): Promise<void> {
    await db.update(sampleRequests).set({ status, ...patch }).where(eq(sampleRequests.id, id));
  }

  static async setShopifyOutcome(db: SampleDatabase, id: string, outcome: string): Promise<void> {
    await db.update(sampleRequests).set({ shopifyOutcome: outcome }).where(eq(sampleRequests.id, id));
  }

  static async updateBatch(
    db: SampleDatabase,
    batchId: string,
    patch: { capacity?: number; phase?: SampleBatchPhase }
  ): Promise<void> {
    await db.update(sampleBatches).set(patch).where(eq(sampleBatches.id, batchId));
  }

  /** Requests for the admin table, newest box first. `query` matches a box number, a name or an email. */
  static async listForAdmin(
    db: SampleDatabase,
    batchId: string,
    filter: { status?: SampleRequestStatus; query?: string }
  ): Promise<SampleRequest[]> {
    const conditions: SQL[] = [eq(sampleRequests.batchId, batchId)];
    if (filter.status !== undefined) {
      conditions.push(eq(sampleRequests.status, filter.status));
    }
    const query = (filter.query ?? "").trim();
    if (query !== "") {
      const digits = query.replace(/^b\d+-/i, "").replace(/^0+(?=\d)/, "");
      const pattern = `%${query.replace(/[%_\\]/g, (character) => `\\${character}`)}%`;
      const matches: SQL[] = [ilike(sampleRequests.fullName, pattern), ilike(sampleRequests.email, pattern)];
      if (/^\d+$/.test(digits)) {
        matches.push(eq(sampleRequests.boxNumber, Number(digits)));
      }
      const anyMatch = or(...matches);
      if (anyMatch !== undefined) conditions.push(anyMatch);
    }

    return db
      .select()
      .from(sampleRequests)
      .where(and(...conditions))
      .orderBy(desc(sampleRequests.boxNumber));
  }

  /** How many requests sit in each status. */
  static async summary(db: SampleDatabase, batchId: string): Promise<Record<SampleRequestStatus, number>> {
    const rows = await db
      .select({ status: sampleRequests.status, count: sql<number>`count(*)::int` })
      .from(sampleRequests)
      .where(eq(sampleRequests.batchId, batchId))
      .groupBy(sampleRequests.status);
    const summary: Record<SampleRequestStatus, number> = {
      pending_payment: 0,
      paid: 0,
      shipped: 0,
      delivered: 0,
      expired: 0,
      cancelled: 0,
    };
    for (const row of rows) summary[row.status] = row.count;

    return summary;
  }

  /** `B01-042`: the human identifier printed in admin and emails. */
  static boxLabel(batchId: string, boxNumber: number): string {
    return `${batchId.toUpperCase()}-${String(boxNumber).padStart(3, "0")}`;
  }

  /** `No. 042`: how the sampler reads their number. */
  static boxWord(boxNumber: number): string {
    return `No. ${String(boxNumber).padStart(3, "0")}`;
  }

  /** Whole minutes left in the hold, never negative. */
  static minutesLeft(request: SampleRequest, now: Date): number {
    return Math.max(0, Math.floor((request.expiresAt.getTime() - now.getTime()) / MS_PER_MINUTE));
  }
}
