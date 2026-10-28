import { describe, expect, test } from "vitest";

import { sampleBatches } from "./schema";
import { makeTestDb } from "../../test/sample-db";

describe("sample schema", () => {
  test("migrations apply and seed Batch 01 as coming soon", async () => {
    const { db, pg } = await makeTestDb({ batchPhase: "upcoming" });

    const batches = await db.select().from(sampleBatches);

    expect(batches).toHaveLength(1);
    expect(batches[0]).toMatchObject({
      id: "b01",
      label: "Batch 01",
      capacity: 100,
      phase: "upcoming",
      paymentWindowMinutes: 1440,
    });

    await pg.close();
  });
});
