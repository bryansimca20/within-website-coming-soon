import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type { SampleDatabase } from "@/db/database";
import { sampleFeedback } from "@/db/schema";

import { makeTestDb } from "../../test/sample-db";
import { NOW, sampleValues, seedValues } from "../../test/sample-fixtures";
import { buildJudgeMeCsv, JUDGEME_CSV_COLUMNS, JudgeMeExportService } from "./judgeme-export.service";
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

async function reviewed(email: string, shareConsent: "yes" | "no", options: { isTest?: boolean } = {}) {
  const claim = await SampleRequestService.claim(db, "b01", sampleValues({ email, firstName: email.split("@")[0] }), NOW, options);
  if (claim.kind !== "claimed") throw new Error(claim.kind);
  const request = await SampleRequestService.markPaid(db, claim.request.id, NOW);
  if (request === null) throw new Error("not paid");
  return SampleFeedbackService.saveReview(db, request.id, { rating: 5, review: `From ${email}`, shareConsent }, email, NOW);
}

describe("JudgeMeExportService.load", () => {
  test("keeps shared and notice-era reviews, drops private, test, unmatched and starless rows", async () => {
    const shared = await reviewed("ayu@example.com", "yes");
    const notice = await reviewed("budi@example.com", "yes");
    await db.update(sampleFeedback).set({ shareConsent: "notice" }).where(eq(sampleFeedback.id, notice.id));
    await reviewed("citra@example.com", "no");
    await reviewed("test+1@example.com", "yes", { isTest: true });
    await SampleFeedbackService.saveReview(db, null, { rating: 5, review: "Who am I", shareConsent: "yes" }, "stranger@example.com", NOW);
    const starless = await reviewed("dewi@example.com", "yes");
    await db.update(sampleFeedback).set({ rating: null }).where(eq(sampleFeedback.id, starless.id));

    const rows = await JudgeMeExportService.load(db);

    expect(rows.map((row) => row.feedback.id).sort()).toEqual([shared.id, notice.id].sort());
  });

  test("includes in-person samplers who chose to share", async () => {
    const seeded = await SampleRequestService.seed(db, seedValues({ email: "eka@example.com" }), NOW);
    if (seeded.kind !== "seeded") throw new Error(seeded.kind);
    await SampleFeedbackService.saveReview(db, seeded.request.id, { rating: 4, review: "Good", shareConsent: "yes" }, "eka@example.com", NOW);

    expect(await JudgeMeExportService.load(db)).toHaveLength(1);
  });
});

describe("buildJudgeMeCsv", () => {
  test("writes Judge.me's header with no BOM, and each review held for curation", async () => {
    const saved = await reviewed("ayu@example.com", "yes");
    await SampleFeedbackService.addToReview(db, saved.id, { headline: "Salty in a good way" }, NOW);
    const rows = await JudgeMeExportService.load(db);

    const [header, line, end] = buildJudgeMeCsv(rows, null).split("\r\n");
    const columns = header.split(",");
    const cells = line.split(",");

    expect(header).toBe(JUDGEME_CSV_COLUMNS.join(","));
    expect(columns).toEqual(["title", "body", "rating", "review_date", "reviewer_name", "reviewer_email", "product_id", "product_handle", "curated"]);
    expect(cells[columns.indexOf("title")]).toBe("Salty in a good way");
    expect(cells[columns.indexOf("rating")]).toBe("5");
    expect(cells[columns.indexOf("reviewer_name")]).toBe("ayu");
    expect(cells[columns.indexOf("reviewer_email")]).toBe("ayu@example.com");
    expect(cells[columns.indexOf("product_handle")]).toBe("");
    expect(cells[columns.indexOf("curated")]).toBe("not-yet");
    expect(end).toBe("");
  });

  test("dates the review in Jakarta time as dd/mm/yyyy", async () => {
    await reviewed("ayu@example.com", "yes");
    const [row] = await JudgeMeExportService.load(db);
    // 17:30 UTC on 31 Dec is already 1 Jan in Jakarta.
    row.feedback.createdAt = new Date("2026-12-31T17:30:00.000Z");

    const cells = buildJudgeMeCsv([row], null).split("\r\n")[1].split(",");

    expect(cells[3]).toBe("01/01/2027");
  });

  test("keeps the sampler's words exactly, quoting only what CSV needs", async () => {
    const saved = await reviewed("ayu@example.com", "yes");
    await db.update(sampleFeedback).set({ review: '-2 cramps, "finally"\nGood' }).where(eq(sampleFeedback.id, saved.id));
    const rows = await JudgeMeExportService.load(db);

    const csv = buildJudgeMeCsv(rows, "within-orange");

    expect(csv).toContain('"-2 cramps, ""finally""\nGood"');
    expect(csv).toContain(",within-orange,not-yet");
  });
});
