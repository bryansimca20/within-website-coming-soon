import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type { SampleDatabase } from "@/db/database";

import { makeTestDb } from "../../test/sample-db";
import { NOW, sampleValues } from "../../test/sample-fixtures";
import { buildSampleCsv, SAMPLE_CSV_COLUMNS } from "./sample-export.service";
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

describe("buildSampleCsv", () => {
  test("opens with a BOM and the column header", () => {
    const csv = buildSampleCsv([]);

    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1).split("\r\n")[0]).toBe(SAMPLE_CSV_COLUMNS.join(","));
  });

  test("quotes and doubles a comment with commas and quotes, and derives source and intent", async () => {
    const claim = await SampleRequestService.claim(db, "b01", sampleValues(), NOW);
    if (claim.kind !== "claimed") throw new Error(claim.kind);
    const request = await SampleRequestService.markPaid(db, claim.request.id, NOW);
    if (request === null) throw new Error("not paid");
    const feedback = await SampleFeedbackService.upsert(
      db,
      request.id,
      {
        code: null,
        email: null,
        sessionType: "long_run",
        sessionLength: "over_90",
        tasteRating: 5,
        felt: ["less_cramping", "felt_hydrated"],
        feltOther: null,
        wouldReachAgain: "yes_definitely",
        comment: 'Salty, in a "good" way',
      },
      request.email,
      NOW
    );

    const csv = buildSampleCsv([{ request, shipment: null, feedback }]);
    const [header, row] = csv.slice(1).split("\r\n");
    const columns = header.split(",");

    expect(row).toContain('"Salty, in a ""good"" way"');
    expect(row.split(",")[columns.indexOf("training_types")]).toBe("running; hyrox");
    expect(row.split(",")[columns.indexOf("training_primary")]).toBe("running");
    expect(row.split(",")[columns.indexOf("why_reasons")]).toBe("sweat_heat; no_sugar");
    expect(row.split(",")[columns.indexOf("hopes")]).toBe("less_cramping; felt_hydrated");
    expect(row.split(",")[columns.indexOf("felt")]).toBe("less_cramping; felt_hydrated");

    const oldForm = { ...request, trainingTypes: null, trainingPrimary: null, heardFrom: null, whyReasons: null, hopes: null, mainSport: "running", trainWhere: "outdoors" };
    const oldRow = buildSampleCsv([{ request: oldForm, shipment: null, feedback: null }]).slice(1).split("\r\n")[1].split(",");
    expect(oldRow[columns.indexOf("main_sport")]).toBe("running");
    expect(oldRow[columns.indexOf("training_types")]).toBe("");
    expect(oldRow[columns.indexOf("hopes")]).toBe("");
    expect(row.split(",")[columns.indexOf("box")]).toBe("B01-001");
    expect(row).toContain(",fanny,");
    expect(row).toContain(",hot,");
  });
});

describe("buildSampleCsv formula injection", () => {
  test("neutralises cells a spreadsheet would run as a formula", async () => {
    const claim = await SampleRequestService.claim(
      db,
      "b01",
      sampleValues({ fullName: "=1+1", firstName: "=1+1", runClub: "@SUM(A1)", deliveryNote: "-2+3" }),
      NOW
    );
    if (claim.kind !== "claimed") throw new Error(claim.kind);

    const [header, row] = buildSampleCsv([{ request: claim.request, shipment: null, feedback: null }]).slice(1).split("\r\n");
    const cells = row.split(",");
    const columns = header.split(",");

    expect(cells[columns.indexOf("name")]).toBe("'=1+1");
    expect(cells[columns.indexOf("run_club")]).toBe("'@SUM(A1)");
    expect(cells[columns.indexOf("delivery_note")]).toBe("'-2+3");
    expect(cells[columns.indexOf("shipping_fee")]).toBe("10000");
  });
});
