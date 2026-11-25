import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";

import type { SampleDatabase } from "@/db/database";
import { sampleFeedback, type SampleFeedbackRow, type SampleRequest, sampleRequests } from "@/db/schema";

/** A review that may go to Judge.me, with the request that proves a box reached its author. */
export interface IJudgeMeRow {
  request: SampleRequest;
  feedback: SampleFeedbackRow;
}

/** Judge.me's import template columns, in its order. */
export const JUDGEME_CSV_COLUMNS = [
  "title",
  "body",
  "rating",
  "review_date",
  "reviewer_name",
  "reviewer_email",
  "product_id",
  "product_handle",
  "curated",
] as const;

/** Lands every import in Judge.me's "To curate" queue, so a founder reads each one before it is public. */
const CURATED_PENDING = "not-yet";
const LINE = "\r\n";
const JAKARTA_DATE = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", day: "2-digit", month: "2-digit", year: "numeric" });

/** Quotes only what CSV needs. No formula prefix: Judge.me would import it into the review text. */
function cell(value: string | number | null): string {
  const text = value === null ? "" : String(value);

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The import file: one line per shareable review, against one product or (null handle) the store. */
export function buildJudgeMeCsv(rows: IJudgeMeRow[], productHandle: string | null): string {
  const lines = [
    JUDGEME_CSV_COLUMNS.join(","),
    ...rows.map(({ request, feedback }) =>
      [
        feedback.headline,
        feedback.review,
        feedback.rating,
        JAKARTA_DATE.format(feedback.createdAt),
        request.firstName,
        feedback.email,
        null,
        productHandle,
        CURATED_PENDING,
      ]
        .map(cell)
        .join(",")
    ),
  ];

  return lines.join(LINE) + LINE;
}

/** Reviews a sampler agreed to share (or wrote under the old notice), from a real box, with stars and words. */
export class JudgeMeExportService {
  static async load(db: SampleDatabase): Promise<IJudgeMeRow[]> {
    return db
      .select({ request: sampleRequests, feedback: sampleFeedback })
      .from(sampleFeedback)
      .innerJoin(sampleRequests, eq(sampleFeedback.requestId, sampleRequests.id))
      .where(
        and(
          eq(sampleRequests.isTest, false),
          inArray(sampleFeedback.shareConsent, ["yes", "notice"]),
          isNotNull(sampleFeedback.rating),
          isNotNull(sampleFeedback.review)
        )
      )
      .orderBy(asc(sampleFeedback.createdAt));
  }
}
