import "server-only";

import { cookies } from "next/headers";

import type { SampleDatabase } from "@/db/database";
import type { SampleBatch } from "@/db/schema";
import { SampleBatchService } from "@/services/sample-batch.service";
import { SampleRequestService } from "@/services/sample-request.service";

/** Remembers which batch the admin is looking at, across pages and visits. */
export const ADMIN_BATCH_COOKIE = "within_admin_batch";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

/** The batch the cookie names, else the open batch, else the newest. Null only when no batch exists. */
export async function resolveAdminBatch(db: SampleDatabase, cookieValue: string | undefined): Promise<SampleBatch | null> {
  const named = cookieValue === undefined ? null : await SampleBatchService.findById(db, cookieValue);

  return named ?? (await SampleRequestService.getOpenBatch(db)) ?? (await SampleBatchService.newest(db));
}

/** The selected batch for this request, read from the admin's cookie. */
export async function currentAdminBatch(db: SampleDatabase): Promise<SampleBatch | null> {
  return resolveAdminBatch(db, (await cookies()).get(ADMIN_BATCH_COOKIE)?.value);
}

/** Selects a batch for the rest of the admin's session. */
export async function rememberAdminBatch(batchId: string): Promise<void> {
  (await cookies()).set(ADMIN_BATCH_COOKIE, batchId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS_SECONDS,
    path: "/admin",
  });
}
