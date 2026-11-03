import { checkBotId } from "botid/server";
import type { NextRequest } from "next/server";

import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { BiteshipService } from "@/services/biteship.service";

const allow = createRateLimiter({ windowMs: 10 * 60_000, maxAttempts: 60 });

const MIN_QUERY = 3;
const MAX_QUERY = 60;

/** Area autocomplete for the request form, proxied so the Biteship key stays on the server. */
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (query.length < MIN_QUERY || query.length > MAX_QUERY) {
    return Response.json({ areas: [] });
  }
  if ((await checkBotId()).isBot) {
    return Response.json({ areas: [] }, { status: 403 });
  }
  if (!allow(clientKey(request.headers))) {
    return Response.json({ areas: [] }, { status: 429 });
  }

  try {
    return Response.json({ areas: (await BiteshipService.searchAreas(query)).slice(0, 8) });
  } catch (error) {
    console.error("[sample/areas] failed", error);
    return Response.json({ areas: [] }, { status: 502 });
  }
}
