import { db } from "@/db/client";
import { isAdmin } from "@/lib/admin-session";
import { buildFeedbackCsv, SampleExportService } from "@/services/sample-export.service";

import { csvResponse } from "../../../batches/[batchId]/export/utils/csv-response";

/** Downloads the in-person check-ins, one line per submission. */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response(null, { status: 401 });
  }
  const { feedback } = await SampleExportService.loadSeeded(db);

  return csvResponse(buildFeedbackCsv(feedback, "In person"), "within-seeded-feedback.csv");
}
