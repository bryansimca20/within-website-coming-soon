import type { NextRequest } from "next/server";

import { db } from "@/db/client";
import { requireEnv } from "@/lib/env";
import { WebhookHandlers } from "@/services/webhook-handlers.service";

/**
 * Biteship order webhooks. Biteship signs nothing, so the URL carries a secret token, and the
 * handler re-reads the order from Biteship rather than trusting the body.
 */
export async function POST(request: NextRequest) {
  if (request.nextUrl.searchParams.get("token") !== requireEnv("BITESHIP_WEBHOOK_TOKEN")) {
    return new Response(null, { status: 401 });
  }
  const body: unknown = await request.json().catch(() => null);
  const { status } = await WebhookHandlers.handleBiteship(db, body, new Date());

  return new Response(null, { status });
}
