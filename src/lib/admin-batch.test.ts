import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type { SampleDatabase } from "@/db/database";
import { sampleBatches } from "@/db/schema";
import { SampleBatchService } from "@/services/sample-batch.service";

import { makeTestDb } from "../../test/sample-db";
import { NOW } from "../../test/sample-fixtures";
import { defaultAdminBatch } from "./admin-batch";

let db: SampleDatabase;
let close: () => Promise<void>;

beforeEach(async () => {
  const handle = await makeTestDb();
  db = handle.db;
  close = () => handle.pg.close();
  await SampleBatchService.setPhase(db, "b01", "closed");
  await SampleBatchService.create(db, 150, NOW);
  await db.update(sampleBatches).set({ phase: "open" }).where(eq(sampleBatches.id, "b01"));
});

afterEach(async () => {
  await close();
});

describe("defaultAdminBatch", () => {
  test("is the open batch", async () => {
    expect((await defaultAdminBatch(db))?.id).toBe("b01");
  });

  test("with nothing open, is the newest batch", async () => {
    await SampleBatchService.setPhase(db, "b01", "closed");

    expect((await defaultAdminBatch(db))?.id).toBe("b02");
  });
});
