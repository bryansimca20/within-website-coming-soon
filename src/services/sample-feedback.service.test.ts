import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type { ISampleFeedbackValues } from "@/app/utils/sample-feedback-input";
import type { SampleDatabase } from "@/db/database";
import { sampleFeedback } from "@/db/schema";

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

function feedback(patch: Partial<ISampleFeedbackValues> = {}): ISampleFeedbackValues {
  return {
    code: null,
    email: null,
    sessionType: "long_run",
    sessionLength: "over_90",
    tasteRating: 4,
    felt: "less_cramping",
    feltOther: null,
    wouldReachAgain: "yes_definitely",
    comment: "Salty in a good way.",
    ...patch,
  };
}

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

describe("SampleFeedbackService.upsert", () => {
  test("a second submission for the same request updates the first row", async () => {
    const request = await paidRequest("a@example.com");

    const first = await SampleFeedbackService.upsert(db, request.id, feedback({ tasteRating: 3 }), request.email, NOW);
    const second = await SampleFeedbackService.upsert(
      db,
      request.id,
      feedback({ tasteRating: 5 }),
      request.email,
      minutesAfter(10)
    );

    expect(second.id).toBe(first.id);
    expect(second.tasteRating).toBe(5);
    expect(second.createdAt).toEqual(NOW);
    expect(second.updatedAt).toEqual(minutesAfter(10));
    expect(await db.select().from(sampleFeedback)).toHaveLength(1);
  });

  test("an unmatched submission is stored with its email and no request", async () => {
    const row = await SampleFeedbackService.upsert(db, null, feedback(), "stranger@example.com", NOW);

    expect(row.requestId).toBeNull();
    expect(row.email).toBe("stranger@example.com");
    expect(await SampleFeedbackService.listUnmatched(db)).toHaveLength(1);
  });

  test("reads back the feedback for a request", async () => {
    const request = await paidRequest("a@example.com");
    await SampleFeedbackService.upsert(db, request.id, feedback(), request.email, NOW);

    expect((await SampleFeedbackService.forRequest(db, request.id))?.wouldReachAgain).toBe("yes_definitely");
    expect(await SampleFeedbackService.forRequest(db, "00000000-0000-0000-0000-000000000000")).toBeNull();
  });
});
