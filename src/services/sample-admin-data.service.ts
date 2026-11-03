import "server-only";

import { desc, eq, inArray } from "drizzle-orm";

import type { SampleDatabase } from "@/db/database";
import { type SampleFeedbackRow, sampleFeedback, type SampleShipment, sampleShipments } from "@/db/schema";

/** Bulk reads for the admin table and export: the latest shipment and the feedback per request. */
export class SampleAdminDataService {
  static async latestShipments(db: SampleDatabase, requestIds: string[]): Promise<Map<string, SampleShipment>> {
    const map = new Map<string, SampleShipment>();
    if (requestIds.length === 0) return map;
    const rows = await db.select().from(sampleShipments).where(inArray(sampleShipments.requestId, requestIds)).orderBy(desc(sampleShipments.attempt));
    for (const row of rows) if (!map.has(row.requestId)) map.set(row.requestId, row);

    return map;
  }

  static async feedbackByRequest(db: SampleDatabase, requestIds: string[]): Promise<Map<string, SampleFeedbackRow>> {
    const map = new Map<string, SampleFeedbackRow>();
    if (requestIds.length === 0) return map;
    const rows = await db.select().from(sampleFeedback).where(inArray(sampleFeedback.requestId, requestIds));
    for (const row of rows) if (row.requestId !== null) map.set(row.requestId, row);

    return map;
  }

  static async shipmentById(db: SampleDatabase, id: string): Promise<SampleShipment | null> {
    const [row] = await db.select().from(sampleShipments).where(eq(sampleShipments.id, id)).limit(1);

    return row ?? null;
  }
}
