import { db } from "@/db/client";
import { currentAdminBatch } from "@/lib/admin-batch";
import { isAdmin } from "@/lib/admin-session";
import { buildRegistrationsCsv, SampleExportService } from "@/services/sample-export.service";

import { csvResponse } from "../utils/csv-response";

/** Downloads the selected batch's registrations, one line per request. */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response(null, { status: 401 });
  }
  const batch = await currentAdminBatch(db);
  if (batch === null) {
    return new Response(null, { status: 404 });
  }
  const { registrations } = await SampleExportService.loadBatch(db, batch.id);

  return csvResponse(buildRegistrationsCsv(registrations, batch.label), `within-${batch.id}-registrations.csv`);
}
