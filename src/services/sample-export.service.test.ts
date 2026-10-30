import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type { SampleDatabase } from "@/db/database";
import { sampleFeedback } from "@/db/schema";

import { makeTestDb } from "../../test/sample-db";
import { NOW, sampleValues } from "../../test/sample-fixtures";
import { buildFeedbackCsv, buildRegistrationsCsv, REGISTRATION_CSV_COLUMNS, SampleExportService } from "./sample-export.service";
import { SampleBatchService } from "./sample-batch.service";
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

describe("buildRegistrationsCsv", () => {
  test("opens with a BOM and the column header", () => {
    const csv = buildRegistrationsCsv([], "Batch 01");

    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1).split("\r\n")[0]).toBe(REGISTRATION_CSV_COLUMNS.join(","));
  });

  test("quotes and doubles a comment with commas and quotes, and derives source and intent", async () => {
    const claim = await SampleRequestService.claim(db, "b01", sampleValues(), NOW);
    if (claim.kind !== "claimed") throw new Error(claim.kind);
    const request = await SampleRequestService.markPaid(db, claim.request.id, NOW);
    if (request === null) throw new Error("not paid");
    // An answer from the old six-question check-in, still exported as it was.
    const [feedback] = await db
      .insert(sampleFeedback)
      .values({
        requestId: request.id,
        email: request.email,
        sessionType: ["running", "padel"],
        sessionLength: ["under_45", "over_90"],
        tasteRating: 5,
        felt: ["less_cramping", "felt_hydrated"],
        wouldReachAgain: "yes_definitely",
        comment: 'Salty, in a "good" way',
        createdAt: NOW,
        updatedAt: NOW,
      })
      .returning();

    const csv = buildRegistrationsCsv([{ request, shipment: null, feedback }], "Batch 01");
    const [header, row] = csv.slice(1).split("\r\n");
    const columns = header.split(",");

    expect(row).toContain('"Salty, in a ""good"" way"');
    expect(row.split(",")[columns.indexOf("training_types")]).toBe("running; hyrox");
    expect(row.split(",")[columns.indexOf("training_primary")]).toBe("running");
    expect(row.split(",")[columns.indexOf("why_reasons")]).toBe("sweat_heat; no_sugar");
    expect(row.split(",")[columns.indexOf("hopes")]).toBe("less_cramping; felt_hydrated");
    expect(row.split(",")[columns.indexOf("felt")]).toBe("less_cramping; felt_hydrated");
    expect(row.split(",")[columns.indexOf("feedback_session")]).toBe("running; padel");
    expect(row.split(",")[columns.indexOf("feedback_length")]).toBe("under_45; over_90");

    const oldForm = { ...request, trainingTypes: null, trainingPrimary: null, heardFrom: null, whyReasons: null, hopes: null, mainSport: "running", trainWhere: "outdoors" };
    const oldRow = buildRegistrationsCsv([{ request: oldForm, shipment: null, feedback: null }], "Batch 01").slice(1).split("\r\n")[1].split(",");
    expect(oldRow[columns.indexOf("main_sport")]).toBe("running");
    expect(oldRow[columns.indexOf("training_types")]).toBe("");
    expect(oldRow[columns.indexOf("hopes")]).toBe("");
    expect(row.split(",")[columns.indexOf("box")]).toBe("B01-001");
    expect(row).toContain(",fanny,");
    expect(row).toContain(",hot,");
  });
});

describe("buildRegistrationsCsv formula injection", () => {
  test("neutralises cells a spreadsheet would run as a formula", async () => {
    const claim = await SampleRequestService.claim(
      db,
      "b01",
      sampleValues({ fullName: "=1+1", firstName: "=1+1", runClub: "@SUM(A1)", deliveryNote: "-2+3" }),
      NOW
    );
    if (claim.kind !== "claimed") throw new Error(claim.kind);

    const [header, row] = buildRegistrationsCsv([{ request: claim.request, shipment: null, feedback: null }], "Batch 01").slice(1).split("\r\n");
    const cells = row.split(",");
    const columns = header.split(",");

    expect(cells[columns.indexOf("name")]).toBe("'=1+1");
    expect(cells[columns.indexOf("run_club")]).toBe("'@SUM(A1)");
    expect(cells[columns.indexOf("delivery_note")]).toBe("'-2+3");
    expect(cells[columns.indexOf("shipping_fee")]).toBe("10000");
  });
});

describe("per-batch exports", () => {
  const REVIEW = { rating: 4, review: "=1+1" };

  async function paidWithFeedback(batchId: string, email: string) {
    const claim = await SampleRequestService.claim(db, batchId, sampleValues({ email }), NOW);
    if (claim.kind !== "claimed") throw new Error(claim.kind);
    const request = await SampleRequestService.markPaid(db, claim.request.id, NOW);
    if (request === null) throw new Error("not paid");
    const saved = await SampleFeedbackService.saveReview(db, request.id, REVIEW, email, NOW);
    await SampleFeedbackService.addToReview(db, saved.id, { headline: "Easy", tasteRating: 5, effectiveness: 3, felt: ["less_cramping"] }, NOW);
    return request;
  }

  test("registrations lead with the batch column", () => {
    expect(buildRegistrationsCsv([], "Batch 02").slice(1).split("\r\n")[0].startsWith("batch,box,")).toBe(true);
  });

  test("a batch's feedback holds only its own requests, never another batch's or unmatched rows", async () => {
    const mine = await paidWithFeedback("b01", "a@example.com");
    await SampleRequestService.updateBatch(db, "b01", { phase: "closed" });
    const second = await SampleBatchService.create(db, 50, NOW);
    if (!second.ok) throw new Error(second.message);
    await SampleBatchService.setPhase(db, second.batch.id, "open");
    await paidWithFeedback("b02", "b@example.com");
    await SampleFeedbackService.saveReview(db, null, REVIEW, "stranger@example.com", NOW);

    const exported = await SampleExportService.loadBatch(db, "b01");

    expect(exported.registrations.map((row) => row.request.id)).toEqual([mine.id]);
    expect(exported.feedback.map((row) => row.request.id)).toEqual([mine.id]);
  });

  test("the feedback file has a BOM, the batch, the box and guards formulas", async () => {
    await paidWithFeedback("b01", "a@example.com");
    const exported = await SampleExportService.loadBatch(db, "b01");

    const csv = buildFeedbackCsv(exported.feedback, "Batch 01");
    const [header, row] = csv.slice(1).split("\r\n");
    const cells = row.split(",");
    const columns = header.split(",");

    expect(csv.startsWith("﻿")).toBe(true);
    expect(columns.slice(0, 4)).toEqual(["batch", "box", "email", "name"]);
    expect(cells[columns.indexOf("batch")]).toBe("Batch 01");
    expect(cells[columns.indexOf("box")]).toBe("B01-001");
    expect(cells[columns.indexOf("review")]).toBe("'=1+1");
    expect(cells[columns.indexOf("rating")]).toBe("4");
    expect(cells[columns.indexOf("headline")]).toBe("Easy");
    expect(cells[columns.indexOf("taste")]).toBe("5");
    expect(cells[columns.indexOf("effectiveness")]).toBe("3");
    expect(cells[columns.indexOf("felt")]).toBe("less_cramping");
    expect(cells[columns.indexOf("intent")]).toBe("");
  });
});
