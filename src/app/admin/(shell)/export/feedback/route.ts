import { db } from "@/db/client";
import { currentAdminBatch } from "@/lib/admin-batch";
import { isAdmin } from "@/lib/admin-session";
import { buildFeedbackCsv, SampleExportService } from "@/services/sample-export.service";

import { csvResponse } from "../utils/csv-response";

/** Downloads the selected batch's check-ins, one line per submission. */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response(null, { status: 401 });
  }
  const batch = await currentAdminBatch(db);
  if (batch === null) {
    return new Response(null, { status: 404 });
  }
  const { feedback } = await SampleExportService.loadBatch(db, batch.id);

  return csvResponse(buildFeedbackCsv(feedback, batch.label), `within-${batch.id}-feedback.csv`);
}
