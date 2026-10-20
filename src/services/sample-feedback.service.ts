import "server-only";

import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import type { ISampleFeedbackValues } from "@/app/utils/sample-feedback-input";
import type { SampleDatabase } from "@/db/database";
import { sampleFeedback, type SampleFeedbackRow, type SampleRequest, sampleRequests } from "@/db/schema";

import { ACTIVE_STATUSES, SampleRequestService } from "./sample-request.service";

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

  /** One row per request: a repeat submission replaces the answers and keeps the first `createdAt`. */
  static async upsert(
    db: SampleDatabase,
    requestId: string | null,
    values: ISampleFeedbackValues,
    email: string,
    now: Date
  ): Promise<SampleFeedbackRow> {
    const answers = {
      email: email.toLowerCase(),
      sessionType: values.sessionType,
      sessionLength: values.sessionLength,
      tasteRating: values.tasteRating,
      felt: values.felt,
      feltOther: values.feltOther,
      wouldReachAgain: values.wouldReachAgain,
      comment: values.comment,
      updatedAt: now,
    };

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

  static async forRequest(db: SampleDatabase, requestId: string): Promise<SampleFeedbackRow | null> {
    const [row] = await db.select().from(sampleFeedback).where(eq(sampleFeedback.requestId, requestId)).limit(1);

    return row ?? null;
  }

  /** Submissions whose email matched no box, for a founder to match by hand. */
  static async listUnmatched(db: SampleDatabase): Promise<SampleFeedbackRow[]> {
    return db.select().from(sampleFeedback).where(isNull(sampleFeedback.requestId)).orderBy(desc(sampleFeedback.createdAt));
  }

}
