import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type { SampleDatabase } from "@/db/database";
import { eq } from "drizzle-orm";

import { FeedbackEligibility } from "@/app/utils/feedback-eligibility";
import { sampleFeedback, sampleRequests } from "@/db/schema";

import { makeTestDb } from "../../test/sample-db";
import { minutesAfter, NOW, sampleValues } from "../../test/sample-fixtures";
import { SampleFeedbackService } from "./sample-feedback.service";
import { SampleRequestService } from "./sample-request.service";

let db: SampleDatabase;
let close: () => Promise<void>;

beforeEach(async () => {
  const handle = await makeTestDb();
  db = handle.db;
  close = () => handle.pg.close();
});

afterEach(async () => {
  await close();
});

const REVIEW = { rating: 4, review: "Salty in a good way." };

async function paidRequest(email: string) {
  const result = await SampleRequestService.claim(db, "b01", sampleValues({ email }), NOW);
  if (result.kind !== "claimed") throw new Error(result.kind);
  const paid = await SampleRequestService.markPaid(db, result.request.id, NOW);
  if (paid === null) throw new Error("not paid");
  return paid;
}

describe("SampleFeedbackService.resolveRequest", () => {
  test("a code wins over a different email", async () => {
    const mine = await paidRequest("a@example.com");
    await paidRequest("b@example.com");

    const resolved = await SampleFeedbackService.resolveRequest(db, { code: mine.accessToken, email: "b@example.com" });

    expect(resolved?.id).toBe(mine.id);
  });

  test("an email resolves to its paid request, not an expired hold", async () => {
    const hold = await SampleRequestService.claim(db, "b01", sampleValues({ email: "a@example.com" }), NOW);
    if (hold.kind !== "claimed") throw new Error(hold.kind);
    await SampleRequestService.markExpiredIfLapsed(db, hold.request, minutesAfter(2000));
    const paid = await paidRequest("a@example.com");

    const resolved = await SampleFeedbackService.resolveRequest(db, { code: null, email: "A@example.com" });

    expect(resolved?.id).toBe(paid.id);
  });

  test("an unknown code and email resolve to nothing", async () => {
    expect(await SampleFeedbackService.resolveRequest(db, { code: "x".repeat(24), email: "nobody@example.com" })).toBeNull();
  });
});

describe("SampleFeedbackService.saveReview", () => {
  test("a second review for the same request replaces the first and keeps what was added since", async () => {
    const request = await paidRequest("a@example.com");

    const first = await SampleFeedbackService.saveReview(db, request.id, { rating: 3, review: "Fine." }, request.email, NOW);
    await SampleFeedbackService.addToReview(db, first.id, { tasteRating: 5 }, minutesAfter(1));
    const second = await SampleFeedbackService.saveReview(db, request.id, { rating: 5, review: "Better." }, request.email, minutesAfter(10));

    expect(second.id).toBe(first.id);
    expect(second).toMatchObject({ rating: 5, review: "Better.", tasteRating: 5 });
    expect(second.createdAt).toEqual(NOW);
    expect(second.updatedAt).toEqual(minutesAfter(10));
    expect(await db.select().from(sampleFeedback)).toHaveLength(1);
  });

  test("an unmatched review is stored with its email and no request", async () => {
    const row = await SampleFeedbackService.saveReview(db, null, REVIEW, "Stranger@example.com", NOW);

    expect(row.requestId).toBeNull();
    expect(row.email).toBe("stranger@example.com");
    expect(await SampleFeedbackService.listUnmatched(db)).toHaveLength(1);
  });

  test("reads back the review for a request", async () => {
    const request = await paidRequest("a@example.com");
    await SampleFeedbackService.saveReview(db, request.id, REVIEW, request.email, NOW);

    expect((await SampleFeedbackService.forRequest(db, request.id))?.review).toBe("Salty in a good way.");
    expect(await SampleFeedbackService.forRequest(db, "00000000-0000-0000-0000-000000000000")).toBeNull();
  });
});

describe("SampleFeedbackService.addToReview", () => {
  test("each later screen adds its own fields", async () => {
    const request = await paidRequest("a@example.com");
    const saved = await SampleFeedbackService.saveReview(db, request.id, REVIEW, request.email, NOW);

    await SampleFeedbackService.addToReview(db, saved.id, { headline: "New long-run drink" }, minutesAfter(1));
    await SampleFeedbackService.addToReview(db, saved.id, { tasteRating: 5, effectiveness: 4 }, minutesAfter(2));
    const done = await SampleFeedbackService.addToReview(db, saved.id, { felt: ["more_energy"], feltOther: null }, minutesAfter(3));

    expect(done).toMatchObject({ rating: 4, review: "Salty in a good way.", headline: "New long-run drink", tasteRating: 5, effectiveness: 4, felt: ["more_energy"] });
  });

  test("refuses an unknown id and a review left alone for over two hours", async () => {
    const request = await paidRequest("a@example.com");
    const saved = await SampleFeedbackService.saveReview(db, request.id, REVIEW, request.email, NOW);

    expect(await SampleFeedbackService.addToReview(db, "00000000-0000-0000-0000-000000000000", { tasteRating: 5 }, minutesAfter(1))).toBeNull();
    expect(await SampleFeedbackService.addToReview(db, saved.id, { tasteRating: 5 }, minutesAfter(121))).toBeNull();
    expect((await SampleFeedbackService.forRequest(db, request.id))?.tasteRating).toBeNull();
  });
});

const DAY = 24 * 60 * 60 * 1000;

async function withStatus(email: string, status: "shipped" | "delivered", deliveredAt: Date | null = null) {
  const paid = await paidRequest(email);
  const [updated] = await db.update(sampleRequests).set({ status, deliveredAt }).where(eq(sampleRequests.id, paid.id)).returning();
  return updated;
}

describe("SampleFeedbackService.checkEmail", () => {
  test("an email with no order is not found", async () => {
    expect(await SampleFeedbackService.checkEmail(db, "nobody@example.com")).toMatchObject({ eligibility: FeedbackEligibility.NotFound, firstName: null });
  });

  test("a paid order that has not shipped is not ready", async () => {
    await paidRequest("a@example.com");
    expect((await SampleFeedbackService.checkEmail(db, "a@example.com")).eligibility).toBe(FeedbackEligibility.NotShipped);
  });

  test("a shipped order may give feedback, and is greeted by first name", async () => {
    await withStatus("a@example.com", "shipped");
    expect(await SampleFeedbackService.checkEmail(db, "A@Example.com")).toMatchObject({ eligibility: FeedbackEligibility.Ok, firstName: "Fanny" });
  });

  test("a delivered order wins over a newer lapsed hold for the same email", async () => {
    const hold = await SampleRequestService.claim(db, "b01", sampleValues({ email: "a@example.com" }), NOW);
    if (hold.kind !== "claimed") throw new Error(hold.kind);
    await SampleRequestService.markExpiredIfLapsed(db, hold.request, minutesAfter(2000));
    await withStatus("a@example.com", "delivered", NOW);
    await db.update(sampleRequests).set({ createdAt: minutesAfter(9000) }).where(eq(sampleRequests.id, hold.request.id));

    expect((await SampleFeedbackService.checkEmail(db, "a@example.com")).eligibility).toBe(FeedbackEligibility.Ok);
  });

  test("feedback already given is reported", async () => {
    const request = await withStatus("a@example.com", "delivered", NOW);
    await SampleFeedbackService.saveReview(db, request.id, REVIEW, request.email, NOW);

    expect((await SampleFeedbackService.checkEmail(db, "a@example.com")).eligibility).toBe(FeedbackEligibility.AlreadyGiven);
  });
});

describe("SampleFeedbackService.dueReminders", () => {
  test("only delivered 7+ days ago, no feedback, not yet reminded", async () => {
    const due = await withStatus("due@example.com", "delivered", new Date(NOW.getTime() - 8 * DAY));
    await withStatus("recent@example.com", "delivered", new Date(NOW.getTime() - 6 * DAY));
    const answered = await withStatus("answered@example.com", "delivered", new Date(NOW.getTime() - 9 * DAY));
    await SampleFeedbackService.saveReview(db, answered.id, REVIEW, answered.email, NOW);
    const reminded = await withStatus("reminded@example.com", "delivered", new Date(NOW.getTime() - 9 * DAY));
    await SampleFeedbackService.markReminderSent(db, reminded.id, NOW);
    await withStatus("shipped@example.com", "shipped");

    const rows = await SampleFeedbackService.dueReminders(db, NOW);

    expect(rows.map((row) => row.id)).toEqual([due.id]);
  });
});
