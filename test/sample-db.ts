import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

import type { SampleDatabase } from "@/db/database";
import * as schema from "@/db/schema";

/** A fresh in-memory Postgres with every migration applied, for repository tests. */
export async function makeTestDb(): Promise<{ db: SampleDatabase; pg: PGlite }> {
  const pg = new PGlite();
  const db = drizzle(pg, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });

  return { db, pg };
}
