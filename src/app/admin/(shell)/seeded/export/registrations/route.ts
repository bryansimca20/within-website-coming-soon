import { db } from "@/db/client";
import { isAdmin } from "@/lib/admin-session";
import { buildRegistrationsCsv, SampleExportService } from "@/services/sample-export.service";

import { csvResponse } from "../../../batches/[batchId]/export/utils/csv-response";

/** Downloads the in-person registrations, one line per request. */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response(null, { status: 401 });
  }
  const { registrations } = await SampleExportService.loadSeeded(db);

  return csvResponse(buildRegistrationsCsv(registrations, "In person"), "within-seeded-registrations.csv");
}
