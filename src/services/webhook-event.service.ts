import "server-only";

import { desc, eq, inArray } from "drizzle-orm";

import type { SampleDatabase } from "@/db/database";
import { sampleWebhookEvents } from "@/db/schema";

/** Webhook bodies are stored before they are processed, so a failure is recoverable and a replay visible. */
export class WebhookEventService {
  /** Stores one body and returns the event id. */
  static async record(
    db: SampleDatabase,
    provider: "midtrans" | "biteship",
    externalRef: string | null,
    payload: unknown,
    receivedAt: Date
  ): Promise<string> {
    const [event] = await db
      .insert(sampleWebhookEvents)
      .values({ provider, externalRef, payload: payload ?? {}, receivedAt })
      .returning({ id: sampleWebhookEvents.id });

    return event.id;
  }

  /** Closes the event, with the error text when processing failed. */
  static async markProcessed(db: SampleDatabase, id: string, error: string | null, at: Date): Promise<void> {
    await db.update(sampleWebhookEvents).set({ processedAt: at, error }).where(eq(sampleWebhookEvents.id, id));
  }

  /** Events whose external reference is one of the given order ids, newest first. */
  static async listForRefs(db: SampleDatabase, refs: string[]) {
    if (refs.length === 0) {
      return [];
    }

    return db.select().from(sampleWebhookEvents).where(inArray(sampleWebhookEvents.externalRef, refs)).orderBy(desc(sampleWebhookEvents.receivedAt));
  }
}
