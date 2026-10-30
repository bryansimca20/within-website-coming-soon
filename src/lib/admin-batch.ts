import "server-only";

import type { SampleDatabase } from "@/db/database";
import type { SampleBatch } from "@/db/schema";
import { SampleBatchService } from "@/services/sample-batch.service";
import { SampleRequestService } from "@/services/sample-request.service";

/** Where old batch-less admin links land: the open batch, else the newest. Null only when no batch exists. */
export async function defaultAdminBatch(db: SampleDatabase): Promise<SampleBatch | null> {
  return (await SampleRequestService.getOpenBatch(db)) ?? (await SampleBatchService.newest(db));
}
