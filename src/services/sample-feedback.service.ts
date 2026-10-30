import "server-only";

import { and, desc, eq, gte, inArray, isNull, lte } from "drizzle-orm";

import { FeedbackEligibility, feedbackEligibility } from "@/app/utils/feedback-eligibility";
import type { ISampleFeedbackExtras } from "@/app/utils/sample-feedback-input";
import type { SampleDatabase } from "@/db/database";
import { sampleFeedback, type SampleFeedbackRow, type SampleRequest, sampleRequests } from "@/db/schema";

import { ACTIVE_STATUSES, SampleRequestService } from "./sample-request.service";

/** The check-in reminder goes out this long after delivery. */
const REMINDER_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

/** The later screens can add to a review only this long after its last save. */
const EDIT_WINDOW_MS = 2 * 60 * 60 * 1000;

/** The check-in answers: matching them to a request and keeping one row per box. */
export class SampleFeedbackService {
  /** The personal link's token first; otherwise the newest paid, shipped or delivered request for the email. */
  static async resolveRequest(
    db: SampleDatabase,
    identity: { code: string | null; email: string | null }
  ): Promise<SampleRequest | null> {
    if (identity.code !== null) {
      const byToken = await SampleRequestService.findByToken(db, identity.code);
      if (byToken !== null) {
        return byToken;
      }
    }
    if (identity.email === null) {
      return null;
    }

    const [request] = await db
      .select()
      .from(sampleRequests)
      .where(and(eq(sampleRequests.email, identity.email.toLowerCase()), inArray(sampleRequests.status, ACTIVE_STATUSES)))
      .orderBy(desc(sampleRequests.createdAt))
      .limit(1);

    return request ?? null;
  }

  /** The QR path's gate: does this email have samples on the way or delivered, and no check-in yet? */
  static async checkEmail(
    db: SampleDatabase,
    email: string
  ): Promise<{ eligibility: FeedbackEligibility; request: SampleRequest | null }> {
    const requests = await db
      .select()
      .from(sampleRequests)
      .where(eq(sampleRequests.email, email.trim().toLowerCase()))
      .orderBy(desc(sampleRequests.createdAt));
    const request = requests.find((row) => row.status === "shipped" || row.status === "delivered") ?? requests[0] ?? null;
    if (request === null) {
      return { eligibility: FeedbackEligibility.NotFound, request: null };
    }
    const hasFeedback = (await SampleFeedbackService.forRequest(db, request.id)) !== null;

    return { eligibility: feedbackEligibility(request.status, hasFeedback), request };
  }

  /** Delivered at least seven days before `now`, no check-in yet, and not reminded before. */
  static async dueReminders(db: SampleDatabase, now: Date): Promise<SampleRequest[]> {
    const cutoff = new Date(now.getTime() - REMINDER_AFTER_MS);
    const rows = await db
      .select({ request: sampleRequests })
      .from(sampleRequests)
      .leftJoin(sampleFeedback, eq(sampleFeedback.requestId, sampleRequests.id))
      .where(
        and(
          eq(sampleRequests.status, "delivered"),
          lte(sampleRequests.deliveredAt, cutoff),
          isNull(sampleRequests.feedbackReminderSentAt),
          isNull(sampleFeedback.id)
        )
      );

    return rows.map((row) => row.request);
  }

  static async markReminderSent(db: SampleDatabase, requestId: string, sentAt: Date): Promise<void> {
    await db.update(sampleRequests).set({ feedbackReminderSentAt: sentAt }).where(eq(sampleRequests.id, requestId));
  }

  /** One row per request: the first screen's rating and review. A repeat replaces them and keeps the rest. */
  static async saveReview(
    db: SampleDatabase,
    requestId: string | null,
    review: { rating: number; review: string },
    email: string,
    now: Date
  ): Promise<SampleFeedbackRow> {
    const answers = { email: email.toLowerCase(), rating: review.rating, review: review.review, updatedAt: now };

    if (requestId !== null) {
      const existing = await SampleFeedbackService.forRequest(db, requestId);
      if (existing !== null) {
        const [updated] = await db.update(sampleFeedback).set(answers).where(eq(sampleFeedback.id, existing.id)).returning();
        return updated ?? existing;
      }
    }

    const [inserted] = await db
      .insert(sampleFeedback)
      .values({ ...answers, requestId, createdAt: now })
      .returning();

    return inserted;
  }

  /**
   * Adds to a review saved within the last two hours, by the id only its author's browser holds.
   * Returns null for an unknown or stale id. shortcut: id-as-capability, move to a signed token if ids ever leave the browser.
   */
  static async addToReview(
    db: SampleDatabase,
    feedbackId: string,
    patch: ISampleFeedbackExtras & { rating?: number; review?: string },
    now: Date
  ): Promise<SampleFeedbackRow | null> {
    const [updated] = await db
      .update(sampleFeedback)
      .set({ ...patch, updatedAt: now })
      .where(and(eq(sampleFeedback.id, feedbackId), gte(sampleFeedback.updatedAt, new Date(now.getTime() - EDIT_WINDOW_MS))))
      .returning();

    return updated ?? null;
  }

  static async forRequest(db: SampleDatabase, requestId: string): Promise<SampleFeedbackRow | null> {
    const [row] = await db.select().from(sampleFeedback).where(eq(sampleFeedback.requestId, requestId)).limit(1);

    return row ?? null;
  }

  /** Submissions whose email matched no box, for a founder to match by hand. */
  static async listUnmatched(db: SampleDatabase): Promise<SampleFeedbackRow[]> {
    return db.select().from(sampleFeedback).where(isNull(sampleFeedback.requestId)).orderBy(desc(sampleFeedback.createdAt));
  }

}
