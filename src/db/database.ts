import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import type * as schema from "./schema";

/**
 * Any Drizzle Postgres-family handle over our schema: postgres-js in production, PGlite in
 * tests. Services take this type so the same code runs against both.
 */
export type SampleDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;
