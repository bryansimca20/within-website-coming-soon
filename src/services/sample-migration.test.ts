import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, expect, test } from "vitest";

import { sampleRequests, type NewSampleRequest } from "@/db/schema";
import type { SampleDatabase } from "@/db/database";
import { makeTestDb } from "../../test/sample-db";

/** A copy of the migrations folder holding only the first `count` migrations. */
function firstMigrations(count: number): string {
  const folder = mkdtempSync(join(tmpdir(), "within-migrations-"));
  mkdirSync(join(folder, "meta"));
  const journal = JSON.parse(readFileSync("./drizzle/meta/_journal.json", "utf8")) as { entries: Array<{ tag: string }> };
  const entries = journal.entries.slice(0, count);
  for (const entry of entries) cpSync(`./drizzle/${entry.tag}.sql`, join(folder, `${entry.tag}.sql`));
  writeFileSync(join(folder, "meta", "_journal.json"), JSON.stringify({ ...journal, entries }));
  return folder;
}

describe("training questions migration", () => {
  test("existing feedback keeps its answer as a one-item array and old requests stay readable", async () => {
    const pg = new PGlite();
    const db = drizzle(pg);
    await migrate(db, { migrationsFolder: firstMigrations(2) });

    await pg.exec(`
      INSERT INTO sample_requests (batch_id, box_number, access_token, main_sport, sessions_per_week, session_length,
        train_where, hydration_goal, full_name, first_name, email, whatsapp, instagram_handle, address_line, area_id,
        area_name, province, city, district, postal_code, consented_at, courier_company, courier_type,
        courier_service_name, shipping_fee, shipping_eta, expires_at)
      VALUES ('b01', 1, 'tok-old', 'running', 'three_to_four', 'over_90', 'outdoors', 'cramps', 'Fanny Lie', 'Fanny',
        'fanny@example.com', '+6281234567890', 'fanny.runs', 'Jl. Sudirman No. 12', 'area', 'Area', 'DKI Jakarta',
        'Jakarta Selatan', 'Pesanggrahan', '12250', now(), 'jne', 'reg', 'JNE Regular', 10000, '2 to 3 days', now());
      INSERT INTO sample_feedback (request_id, email, session_type, session_length, taste_rating, felt, would_reach_again)
      SELECT id, email, 'long_run', 'over_90', 4, 'more_energy', 'probably' FROM sample_requests;
    `);

    await migrate(db, { migrationsFolder: "./drizzle" });

    const feedback = await pg.query<{ felt: string[]; session_type: string[]; session_length: string[] }>(
      "SELECT felt, session_type, session_length FROM sample_feedback"
    );
    expect(feedback.rows[0]).toEqual({ felt: ["more_energy"], session_type: ["running"], session_length: ["over_90"] });

    const request = await pg.query<{ main_sport: string; training_types: string[] | null; hopes: string[] | null }>(
      "SELECT main_sport, training_types, hopes FROM sample_requests"
    );
    expect(request.rows[0]).toEqual({ main_sport: "running", training_types: null, hopes: null });
  });
});

describe("paid email guard migration", () => {
  test("a box paid before the column existed is not emailed again", async () => {
    const pg = new PGlite();
    const db = drizzle(pg);
    await migrate(db, { migrationsFolder: firstMigrations(9) });

    await pg.exec(`
      INSERT INTO sample_requests (batch_id, box_number, access_token, status, sessions_per_week, session_length,
        full_name, first_name, email, whatsapp, instagram_handle, address_line, area_id, area_name, province, city,
        district, postal_code, courier_company, courier_type, courier_service_name, shipping_fee, shipping_eta,
        expires_at, paid_at)
      VALUES ('b01', 1, 'tok-paid', 'paid', 'three_to_four', 'over_90', 'Fanny Lie', 'Fanny', 'fanny@example.com',
        '+6281234567890', 'fanny.runs', 'Jl. Sudirman No. 12', 'area', 'Area', 'DKI Jakarta', 'Jakarta Selatan',
        'Pesanggrahan', '12250', 'jne', 'reg', 'JNE Regular', 10000, '2 to 3 days', now(), '2026-10-27T03:00:00Z');
    `);

    await migrate(db, { migrationsFolder: "./drizzle" });

    const { rows } = await pg.query<{ paid_at: Date; paid_email_sent_at: Date | null }>("SELECT paid_at, paid_email_sent_at FROM sample_requests");
    expect(rows[0]?.paid_email_sent_at).toEqual(rows[0]?.paid_at);
    await pg.close();
  });
});

describe("batch 01 starts upcoming migration", () => {
  test("a fresh database does not open the form", async () => {
    const pg = new PGlite();
    await migrate(drizzle(pg), { migrationsFolder: "./drizzle" });

    const { rows } = await pg.query<{ id: string; phase: string }>("SELECT id, phase FROM sample_batches");
    expect(rows).toEqual([{ id: "b01", phase: "upcoming" }]);
    await pg.close();
  });

  test("an open batch that already took requests stays open", async () => {
    const pg = new PGlite();
    const db = drizzle(pg);
    await migrate(db, { migrationsFolder: firstMigrations(10) });
    await pg.exec(`
      INSERT INTO sample_requests (batch_id, box_number, access_token, sessions_per_week, session_length,
        full_name, first_name, email, whatsapp, instagram_handle, address_line, area_id, area_name, province, city,
        district, postal_code, courier_company, courier_type, courier_service_name, shipping_fee, shipping_eta, expires_at)
      VALUES ('b01', 1, 'tok-live', 'three_to_four', 'over_90', 'Fanny Lie', 'Fanny', 'fanny@example.com',
        '+6281234567890', 'fanny.runs', 'Jl. Sudirman No. 12', 'area', 'Area', 'DKI Jakarta', 'Jakarta Selatan',
        'Pesanggrahan', '12250', 'jne', 'reg', 'JNE Regular', 10000, '2 to 3 days', now());
    `);

    await migrate(db, { migrationsFolder: "./drizzle" });

    const { rows } = await pg.query<{ phase: string }>("SELECT phase FROM sample_batches");
    expect(rows[0]?.phase).toBe("open");
    await pg.close();
  });
});

describe("in-person source migration", () => {
  /** Inserts a valid shipped request merged with the overrides. */
  async function insertRequest(db: SampleDatabase, overrides: Partial<NewSampleRequest> = {}) {
    const [row] = await db
      .insert(sampleRequests)
      .values({
        batchId: "b01", boxNumber: 1, accessToken: "tok-seed", sessionsPerWeek: "three_to_four", sessionLength: "over_90",
        fullName: "Fanny Lie", firstName: "Fanny", email: "fanny@example.com", whatsapp: "+6281234567890",
        instagramHandle: "fanny.runs", addressLine: "Jl. Sudirman No. 12", areaId: "area", areaName: "Area",
        province: "DKI Jakarta", city: "Jakarta Selatan", district: "Pesanggrahan", postalCode: "12250",
        courierCompany: "jne", courierType: "reg", courierServiceName: "JNE Regular", shippingFee: 10000,
        shippingEta: "2 to 3 days", expiresAt: new Date(), ...overrides,
      })
      .returning();
    if (!row) throw new Error("insert returned no row");
    return row;
  }

  test("rejects a shipped request without an address", async () => {
    const { db, pg } = await makeTestDb();
    await expect(insertRequest(db, { source: "shipped", addressLine: null })).rejects.toThrow();
    await pg.close();
  });

  test("accepts an in-person request with no batch, box, address or courier", async () => {
    const { db, pg } = await makeTestDb();
    const row = await insertRequest(db, {
      source: "in_person", status: "delivered", batchId: null, boxNumber: null,
      addressLine: null, areaId: null, areaName: null, province: null, city: null, district: null, postalCode: null,
      courierCompany: null, courierType: null, courierServiceName: null, shippingFee: null, shippingEta: null,
    });
    expect(row.isTest).toBe(false);
    expect(row.batchId).toBeNull();
    await pg.close();
  });
});
