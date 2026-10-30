import "server-only";

import { desc, eq } from "drizzle-orm";

import { FEEDBACK_FELT, type FeedbackFelt, SCORE_MAX, SCORE_MIN } from "@/app/utils/sample-options";
import type { SampleDatabase } from "@/db/database";
import { sampleFeedback, sampleRequests } from "@/db/schema";

import { SampleRequestService } from "./sample-request.service";

/** One check-in as the Reviews page shows it. Old six-question rows have no star rating or review text. */
export interface IReviewRow {
  id: string;
  /** Null when the typed email matched no box. */
  requestId: string | null;
  batchId: string | null;
  name: string | null;
  boxLabel: string | null;
  rating: number | null;
  headline: string | null;
  review: string | null;
  taste: number | null;
  effectiveness: number | null;
  felt: FeedbackFelt[];
  createdAt: Date;
}

/** The numbers above the review list. Averages are null until someone has answered. */
export interface IReviewSummary {
  /** Rows with a star rating. */
  rated: number;
  average: number | null;
  /** How many gave 1 to 5 stars, indexed by star count (index 0 unused). */
  distribution: number[];
  tasteAverage: number | null;
  effectivenessAverage: number | null;
  /** Rows that answered "How did you feel", the denominator for `felt`. */
  feltAnswered: number;
  felt: Record<FeedbackFelt, number>;
}

function isScore(value: number | null): value is number {
  return value !== null && Number.isInteger(value) && value >= SCORE_MIN && value <= SCORE_MAX;
}

function average(values: number[]): number | null {
  return values.length === 0 ? null : values.reduce((total, value) => total + value, 0) / values.length;
}

/** Averages, star distribution and felt counts for a set of reviews. Out-of-range scores are ignored. */
export function summarizeReviews(rows: IReviewRow[]): IReviewSummary {
  const ratings = rows.map((row) => row.rating).filter(isScore);
  const distribution = Array.from({ length: SCORE_MAX + 1 }, () => 0);
  for (const rating of ratings) distribution[rating] = (distribution[rating] ?? 0) + 1;
  const felt = Object.fromEntries(FEEDBACK_FELT.map((key) => [key, 0])) as Record<FeedbackFelt, number>;
  const feltRows = rows.filter((row) => row.felt.length > 0);
  for (const row of feltRows) for (const key of row.felt) if (key in felt) felt[key] += 1;

  return {
    rated: ratings.length,
    average: average(ratings),
    distribution,
    tasteAverage: average(rows.map((row) => row.taste).filter(isScore)),
    effectivenessAverage: average(rows.map((row) => row.effectiveness).filter(isScore)),
    feltAnswered: feltRows.length,
    felt,
  };
}

/** Sampler reviews for admin: every check-in, newest first, with the box it belongs to. */
export class SampleReviewService {
  static async list(db: SampleDatabase): Promise<IReviewRow[]> {
    const rows = await db
      .select({ feedback: sampleFeedback, request: sampleRequests })
      .from(sampleFeedback)
      .leftJoin(sampleRequests, eq(sampleFeedback.requestId, sampleRequests.id))
      .orderBy(desc(sampleFeedback.createdAt));

    return rows.map(({ feedback, request }) => ({
      id: feedback.id,
      requestId: feedback.requestId,
      batchId: request?.batchId ?? null,
      name: request?.fullName ?? null,
      boxLabel: request === null ? null : SampleRequestService.boxLabel(request.batchId, request.boxNumber),
      rating: feedback.rating,
      headline: feedback.headline,
      // The old form's free text lived in `comment`.
      review: feedback.review ?? feedback.comment,
      taste: feedback.tasteRating,
      effectiveness: feedback.effectiveness,
      felt: (feedback.felt ?? []).filter((key): key is FeedbackFelt => (FEEDBACK_FELT as readonly string[]).includes(key)),
      createdAt: feedback.createdAt,
    }));
  }
}
