import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

import type { SampleDatabase } from "@/db/database";
import * as schema from "@/db/schema";

/**
 * A fresh in-memory Postgres with every migration applied, for repository tests. Batch 01 ships as
 * coming soon; most tests need it taking requests, so it is opened unless a test asks for a phase.
 */
export async function makeTestDb({ batchPhase = "open" }: { batchPhase?: schema.SampleBatchPhase } = {}): Promise<{ db: SampleDatabase; pg: PGlite }> {
  const pg = new PGlite();
  const db = drizzle(pg, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  await db.update(schema.sampleBatches).set({ phase: batchPhase }).where(eq(schema.sampleBatches.id, "b01"));

  return { db, pg };
}
