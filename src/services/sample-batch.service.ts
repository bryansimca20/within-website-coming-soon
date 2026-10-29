import "server-only";

import { and, eq, isNotNull, ne, sql } from "drizzle-orm";

import type { SampleDatabase } from "@/db/database";
import { type SampleBatch, type SampleBatchPhase, sampleBatches, sampleFeedback, sampleRequests } from "@/db/schema";

import { SampleRequestService } from "./sample-request.service";

/** One batch with the counts the Batches page shows. */
export interface IBatchSummary {
  batch: SampleBatch;
  claimed: number;
  paid: number;
  shipped: number;
  delivered: number;
  feedback: number;
}

/** Outcome of creating the next batch. */
export type CreateBatchResult = { ok: true; batch: SampleBatch } | { ok: false; message: string };

/** Outcome of changing a batch's phase. */
export type SetPhaseResult = { ok: true } | { ok: false; message: string };

const MIN_CAPACITY = 1;
const MAX_CAPACITY = 10_000;
const UNIQUE_VIOLATION = "23505";

/** Batch numbers come from ids: `b02` is 2, `b100` is 100. */
function batchNumber(id: string): number {
  const match = /^b(\d+)$/.exec(id);

  return match === null ? 0 : Number(match[1]);
}

function isValidCapacity(capacity: number): boolean {
  return Number.isInteger(capacity) && capacity >= MIN_CAPACITY && capacity <= MAX_CAPACITY;
}

function newestFirst(batches: SampleBatch[]): SampleBatch[] {
  return [...batches].sort((a, b) => batchNumber(b.id) - batchNumber(a.id));
}

function isUniqueViolation(error: unknown): boolean {
  const cause = error instanceof Error && "cause" in error ? (error.cause as { code?: string } | undefined) : undefined;
  const direct = (error as { code?: string } | null)?.code;

  return direct === UNIQUE_VIOLATION || cause?.code === UNIQUE_VIOLATION;
}

/** Numbered sample batches: listing, creating the next one, and the one-open-at-a-time rule. */
export class SampleBatchService {
  static async findById(db: SampleDatabase, id: string): Promise<SampleBatch | null> {
    const [batch] = await db.select().from(sampleBatches).where(eq(sampleBatches.id, id)).limit(1);

    return batch ?? null;
  }

  /** The highest-numbered batch. */
  static async newest(db: SampleDatabase): Promise<SampleBatch | null> {
    return newestFirst(await db.select().from(sampleBatches))[0] ?? null;
  }

  /** The next name in sequence: `Batch 02` / `b02`, past 99 `Batch 100` / `b100`. */
  static async nextName(db: SampleDatabase): Promise<{ id: string; label: string }> {
    const ids = await db.select({ id: sampleBatches.id }).from(sampleBatches);
    const next = Math.max(0, ...ids.map((row) => batchNumber(row.id))) + 1;
    const padded = String(next).padStart(2, "0");

    return { id: `b${padded}`, label: `Batch ${padded}` };
  }

  /**
   * Creates the next batch as coming soon. Refused while any batch is open, so a founder finishes one
   * round before starting the next, and refused for a capacity outside 1 to 10 000.
   */
  static async create(db: SampleDatabase, capacity: number, now: Date): Promise<CreateBatchResult> {
    if (!isValidCapacity(capacity)) {
      return { ok: false, message: "Capacity must be a whole number from 1 to 10000." };
    }
    const open = await SampleRequestService.getOpenBatch(db);
    if (open !== null) {
      return { ok: false, message: `Close ${open.label} before creating the next batch.` };
    }
    const { id, label } = await SampleBatchService.nextName(db);
    const newest = await SampleBatchService.newest(db);
    const [batch] = await db
      .insert(sampleBatches)
      .values({ id, label, capacity, phase: "upcoming", paymentWindowMinutes: newest?.paymentWindowMinutes ?? 1440, createdAt: now })
      .returning();

    return batch === undefined ? { ok: false, message: "The batch could not be created." } : { ok: true, batch };
  }

  /** Sets what /sample shows for a batch. Opening is refused while another batch is open. */
  static async setPhase(db: SampleDatabase, batchId: string, phase: SampleBatchPhase): Promise<SetPhaseResult> {
    try {
      return await db.transaction(async (tx) => {
        const [batch] = await tx.select().from(sampleBatches).where(eq(sampleBatches.id, batchId)).for("update");
        if (batch === undefined) {
          return { ok: false, message: "That batch doesn't exist." };
        }
        if (phase === "open") {
          const [other] = await tx
            .select()
            .from(sampleBatches)
            .where(and(eq(sampleBatches.phase, "open"), ne(sampleBatches.id, batchId)))
            .for("update");
          if (other !== undefined) {
            return { ok: false, message: `Close ${other.label} first.` };
          }
        }
        await tx.update(sampleBatches).set({ phase }).where(eq(sampleBatches.id, batchId));
        return { ok: true };
      });
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }
      // Another batch was opened between our check and our write; the index kept it to one.
      const open = await SampleRequestService.getOpenBatch(db);
      return { ok: false, message: `Close ${open?.label ?? "the open batch"} first.` };
    }
  }

  /** Changes capacity. Lowering it below the claimed count is allowed; the batch then reads as full. */
  static async setCapacity(db: SampleDatabase, batchId: string, capacity: number): Promise<boolean> {
    if (!isValidCapacity(capacity)) {
      return false;
    }
    const rows = await db.update(sampleBatches).set({ capacity }).where(eq(sampleBatches.id, batchId)).returning({ id: sampleBatches.id });

    return rows.length > 0;
  }

  /** The batch /sample shows: the open one, else the newest coming soon, else the newest. */
  static async forSamplePage(db: SampleDatabase): Promise<SampleBatch | null> {
    const batches = newestFirst(await db.select().from(sampleBatches));

    return batches.find((batch) => batch.phase === "open") ?? batches.find((batch) => batch.phase === "upcoming") ?? batches[0] ?? null;
  }

  /** Every batch, newest first, with its counts. Lapsed holds are expired first so "claimed" is live. */
  static async list(db: SampleDatabase, now: Date): Promise<IBatchSummary[]> {
    const batches = newestFirst(await db.select().from(sampleBatches));
    const summaries: IBatchSummary[] = [];
    for (const batch of batches) {
      const claimed = await SampleRequestService.countClaimed(db, batch.id, now);
      const counts = await SampleRequestService.summary(db, batch.id);
      const [feedback] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(sampleFeedback)
        .innerJoin(sampleRequests, eq(sampleFeedback.requestId, sampleRequests.id))
        .where(and(eq(sampleRequests.batchId, batch.id), isNotNull(sampleFeedback.requestId)));
      summaries.push({
        batch,
        claimed,
        paid: counts.paid + counts.shipped + counts.delivered,
        shipped: counts.shipped + counts.delivered,
        delivered: counts.delivered,
        feedback: feedback?.count ?? 0,
      });
    }

    return summaries;
  }
}

