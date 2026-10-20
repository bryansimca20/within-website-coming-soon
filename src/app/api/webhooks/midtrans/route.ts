import { db } from "@/db/client";
import { requireEnv } from "@/lib/env";
import { WebhookHandlers } from "@/services/webhook-handlers.service";

/** Midtrans HTTP notification. Set this URL in the Midtrans dashboard. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const { status } = await WebhookHandlers.handleMidtrans(db, body, requireEnv("MIDTRANS_SERVER_KEY"), new Date());

  return new Response(null, { status });
}
