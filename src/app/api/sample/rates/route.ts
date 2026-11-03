import { checkBotId } from "botid/server";
import type { NextRequest } from "next/server";

import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { BiteshipService } from "@/services/biteship.service";

const allow = createRateLimiter({ windowMs: 10 * 60_000, maxAttempts: 60 });

/** Live courier quotes from the BSD office to the chosen area. */
export async function POST(request: NextRequest) {
  if ((await checkBotId()).isBot) {
    return Response.json({ options: [] }, { status: 403 });
  }
  if (!allow(clientKey(request.headers))) {
    return Response.json({ options: [] }, { status: 429 });
  }
  const body: unknown = await request.json().catch(() => null);
  const areaId =
    typeof body === "object" && body !== null && typeof (body as { areaId?: unknown }).areaId === "string"
      ? (body as { areaId: string }).areaId.trim()
      : "";
  if (areaId === "" || areaId.length > 100) {
    return Response.json({ options: [] }, { status: 400 });
  }

  try {
    return Response.json({ options: await BiteshipService.fetchRates(areaId) });
  } catch (error) {
    console.error("[sample/rates] failed", error);
    return Response.json({ options: [] }, { status: 502 });
  }
}
