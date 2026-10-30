import { db } from "@/db/client";
import { isAdmin } from "@/lib/admin-session";
import { SampleBatchService } from "@/services/sample-batch.service";
import { buildFeedbackCsv, SampleExportService } from "@/services/sample-export.service";

import { csvResponse } from "../utils/csv-response";

/** Downloads one batch's check-ins, one line per submission. */
export async function GET(_request: Request, { params }: { params: Promise<{ batchId: string }> }) {
  if (!(await isAdmin())) {
    return new Response(null, { status: 401 });
  }
  const batch = await SampleBatchService.findById(db, (await params).batchId);
  if (batch === null) {
    return new Response(null, { status: 404 });
  }
  const { feedback } = await SampleExportService.loadBatch(db, batch.id);

  return csvResponse(buildFeedbackCsv(feedback, batch.label), `within-${batch.id}-feedback.csv`);
}
