import { db } from "@/db/client";
import { sampleBatches } from "@/db/schema";
import { isAdmin } from "@/lib/admin-session";
import { SampleAdminDataService } from "@/services/sample-admin-data.service";
import { buildSampleCsv } from "@/services/sample-export.service";
import { SampleRequestService } from "@/services/sample-request.service";

/** Every request of the first batch with its live shipment and feedback, as CSV. */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response(null, { status: 401 });
  }
  const [batch] = await db.select().from(sampleBatches).orderBy(sampleBatches.createdAt).limit(1);
  if (batch === undefined) {
    return new Response(null, { status: 404 });
  }
  const requests = await SampleRequestService.listForAdmin(db, batch.id, {});
  const ids = requests.map((request) => request.id);
  const [shipments, feedback] = await Promise.all([
    SampleAdminDataService.latestShipments(db, ids),
    SampleAdminDataService.feedbackByRequest(db, ids),
  ]);
  const csv = buildSampleCsv(
    [...requests].reverse().map((request) => ({ request, shipment: shipments.get(request.id) ?? null, feedback: feedback.get(request.id) ?? null }))
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="within-sample-${batch.id}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
