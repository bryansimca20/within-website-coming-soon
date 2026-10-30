import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type { SampleDatabase } from "@/db/database";
import { sampleBatches } from "@/db/schema";

import { makeTestDb } from "../../test/sample-db";
import { NOW, sampleValues } from "../../test/sample-fixtures";
import { SampleBatchService } from "./sample-batch.service";
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

/** Creates the next batch the way a founder must: with nothing open. Whatever was open is reopened after, by direct write since Closed is final. */
async function makeBatch(capacity = 50) {
  const open = await SampleRequestService.getOpenBatch(db);
  if (open !== null) await SampleBatchService.setPhase(db, open.id, "closed");
  const result = await SampleBatchService.create(db, capacity, NOW);
  if (open !== null) await db.update(sampleBatches).set({ phase: "open" }).where(eq(sampleBatches.id, open.id));
  if (!result.ok) throw new Error(result.message);
  return result.batch;
}

describe("SampleBatchService.nextName", () => {
  test("follows Batch 01 with Batch 02", async () => {
    expect(await SampleBatchService.nextName(db)).toEqual({ id: "b02", label: "Batch 02" });
  });

  test("counts past nine and past ninety-nine", async () => {
    for (let n = 2; n <= 9; n += 1) await makeBatch();
    expect(await SampleBatchService.nextName(db)).toEqual({ id: "b10", label: "Batch 10" });

    await db.insert(sampleBatches).values({ id: "b99", label: "Batch 99", capacity: 10 });
    expect(await SampleBatchService.nextName(db)).toEqual({ id: "b100", label: "Batch 100" });
  });
});

describe("SampleBatchService.create", () => {
  test("creates the next batch as coming soon with the newest batch's payment window", async () => {
    await db.update(sampleBatches).set({ paymentWindowMinutes: 720, phase: "closed" }).where(eq(sampleBatches.id, "b01"));

    const result = await SampleBatchService.create(db, 150, NOW);

    expect(result.ok && result.batch).toMatchObject({
      id: "b02",
      label: "Batch 02",
      capacity: 150,
      phase: "upcoming",
      paymentWindowMinutes: 720,
    });
  });

  test.each([0, 10_001, 1.5, Number.NaN])("refuses capacity %s", async (capacity) => {
    await SampleBatchService.setPhase(db, "b01", "closed");

    expect(await SampleBatchService.create(db, capacity, NOW)).toEqual({ ok: false, message: "Capacity must be a whole number from 1 to 10000." });
    expect(await db.select().from(sampleBatches)).toHaveLength(1);
  });
});

describe("SampleBatchService.create while a batch is open", () => {
  test("is refused, naming the open batch", async () => {
    expect(await SampleBatchService.create(db, 150, NOW)).toEqual({ ok: false, message: "Close Batch 01 before creating the next batch." });
    expect(await db.select().from(sampleBatches)).toHaveLength(1);
  });

  test("is allowed once the open batch is closed or set to coming soon", async () => {
    await SampleBatchService.setPhase(db, "b01", "upcoming");

    expect((await SampleBatchService.create(db, 150, NOW)).ok).toBe(true);
  });
});

describe("SampleBatchService.setPhase", () => {
  test.each(["open", "upcoming"] as const)("keeps a closed batch closed instead of moving it to %s", async (phase) => {
    await SampleBatchService.setPhase(db, "b01", "closed");

    expect(await SampleBatchService.setPhase(db, "b01", phase)).toEqual({ ok: false, message: "Batch 01 is closed. Closed is final." });
    expect((await SampleBatchService.findById(db, "b01"))?.phase).toBe("closed");
  });

  test("refuses a second open batch, naming the open one", async () => {
    await makeBatch();

    expect(await SampleBatchService.setPhase(db, "b02", "open")).toEqual({ ok: false, message: "Close Batch 01 first." });
    expect((await SampleBatchService.findById(db, "b02"))?.phase).toBe("upcoming");
  });

  test("opens a batch once the other is closed", async () => {
    await makeBatch();
    expect(await SampleBatchService.setPhase(db, "b01", "closed")).toEqual({ ok: true });

    expect(await SampleBatchService.setPhase(db, "b02", "open")).toEqual({ ok: true });
    expect((await SampleBatchService.findById(db, "b02"))?.phase).toBe("open");
  });

  test("two batches opened at the same moment leave exactly one open", async () => {
    await makeBatch();
    await makeBatch();
    await SampleBatchService.setPhase(db, "b01", "closed");

    const results = await Promise.all([SampleBatchService.setPhase(db, "b02", "open"), SampleBatchService.setPhase(db, "b03", "open")]);

    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect((await db.select().from(sampleBatches)).filter((batch) => batch.phase === "open")).toHaveLength(1);
  });

  test("the database itself refuses a second open batch", async () => {
    await makeBatch();

    await expect(db.update(sampleBatches).set({ phase: "open" }).where(eq(sampleBatches.id, "b02"))).rejects.toThrow();
  });

  test("an unknown batch is refused", async () => {
    expect(await SampleBatchService.setPhase(db, "b77", "closed")).toEqual({ ok: false, message: "That batch doesn't exist." });
  });
});

describe("SampleBatchService.setCapacity", () => {
  test("changes capacity within bounds, even below the claimed count", async () => {
    expect(await SampleBatchService.setCapacity(db, "b01", 5)).toEqual({ ok: true });
    expect(await SampleBatchService.setCapacity(db, "b01", 0)).toEqual({ ok: false, message: "Capacity must be a whole number from 1 to 10000." });
    expect((await SampleBatchService.findById(db, "b01"))?.capacity).toBe(5);
  });

  test("refuses a closed batch and leaves its capacity alone", async () => {
    await SampleBatchService.setPhase(db, "b01", "closed");

    expect(await SampleBatchService.setCapacity(db, "b01", 5)).toEqual({ ok: false, message: "Batch 01 is closed. Its capacity can't change." });
    expect((await SampleBatchService.findById(db, "b01"))?.capacity).not.toBe(5);
  });
});

describe("SampleBatchService.forSamplePage", () => {
  test("prefers the open batch", async () => {
    await makeBatch();

    expect((await SampleBatchService.forSamplePage(db))?.id).toBe("b01");
  });

  test("with none open, shows the newest coming-soon batch", async () => {
    await makeBatch();
    await makeBatch();
    await SampleBatchService.setPhase(db, "b01", "closed");

    expect((await SampleBatchService.forSamplePage(db))?.id).toBe("b03");
  });

  test("with everything closed, shows the newest batch", async () => {
    await makeBatch();
    await SampleBatchService.setPhase(db, "b01", "closed");
    await SampleBatchService.setPhase(db, "b02", "closed");

    expect((await SampleBatchService.forSamplePage(db))?.id).toBe("b02");
  });
});

describe("SampleBatchService.list", () => {
  test("lists newest first with counts", async () => {
    const claim = await SampleRequestService.claim(db, "b01", sampleValues(), NOW);
    if (claim.kind !== "claimed") throw new Error(claim.kind);
    await SampleRequestService.markPaid(db, claim.request.id, NOW);
    await makeBatch(150);

    const summaries = await SampleBatchService.list(db, NOW);

    expect(summaries.map((summary) => summary.batch.id)).toEqual(["b02", "b01"]);
    expect(summaries[1]).toMatchObject({ requests: 1, claimed: 1, paid: 1, shipped: 0, delivered: 0, feedback: 0 });
    expect(summaries[0]).toMatchObject({ requests: 0, claimed: 0, paid: 0 });
  });
});

describe("SampleBatchService.remove", () => {
  test("removes an empty batch, and its number is used again", async () => {
    await makeBatch();

    expect(await SampleBatchService.remove(db, "b02")).toEqual({ ok: true });
    expect(await SampleBatchService.findById(db, "b02")).toBeNull();
    expect((await SampleBatchService.nextName(db)).id).toBe("b02");
  });

  test("refuses a batch that has any request, even an expired one", async () => {
    await SampleRequestService.claim(db, "b01", sampleValues(), NOW);
    await SampleBatchService.setPhase(db, "b01", "closed");

    expect(await SampleBatchService.remove(db, "b01")).toEqual({ ok: false, message: "Batch 01 has requests, so it stays. Close it instead." });
    expect(await SampleBatchService.findById(db, "b01")).not.toBeNull();
  });

  test("refuses the open batch", async () => {
    expect(await SampleBatchService.remove(db, "b01")).toEqual({ ok: false, message: "Batch 01 is open. Close it or set it to Coming soon first." });
  });

  test("reports a batch that doesn't exist", async () => {
    expect(await SampleBatchService.remove(db, "b77")).toEqual({ ok: false, message: "That batch doesn't exist." });
  });
});
