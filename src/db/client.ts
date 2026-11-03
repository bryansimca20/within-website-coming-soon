import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { requireEnv } from "@/lib/env";

import * as schema from "./schema";

type Schema = typeof schema;

let realDb: PostgresJsDatabase<Schema> | undefined;

/** Connects on first use, so importing this module without DATABASE_URL (tests, builds) is harmless. */
function getDb(): PostgresJsDatabase<Schema> {
  if (realDb === undefined) {
    const client = postgres(requireEnv("DATABASE_URL"), { prepare: false });
    realDb = drizzle(client, { schema });
  }

  return realDb;
}

/** The production database handle. A lazy proxy: nothing connects until a query runs. */
export const db: PostgresJsDatabase<Schema> = new Proxy({} as PostgresJsDatabase<Schema>, {
  get(_target, property) {
    const target = getDb();
    const value = Reflect.get(target, property, target);

    return typeof value === "function" ? value.bind(target) : value;
  },
});
