import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSampleDetail } from "@/components/admin/AdminSampleDetail";
import { AdminShipRunForm } from "@/components/admin/AdminShipRunForm";
import { toAdminRow } from "@/components/admin/utils/admin-rows";
import { db } from "@/db/client";
import { samplePayments } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-session";
import { SampleFeedbackService } from "@/services/sample-feedback.service";
import { SampleRequestService } from "@/services/sample-request.service";
import { SampleShipmentService } from "@/services/sample-shipment.service";
import { WebhookEventService } from "@/services/webhook-event.service";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One request in full. */
export default async function AdminSampleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();
  const request = await SampleRequestService.findById(db, id);
  if (request === null) notFound();

  const [payments, shipments, feedback] = await Promise.all([
    db.select().from(samplePayments).where(eq(samplePayments.requestId, id)).orderBy(desc(samplePayments.createdAt)),
    SampleShipmentService.listAttempts(db, id),
    SampleFeedbackService.forRequest(db, id),
  ]);
  const events = await WebhookEventService.listForRefs(db, [...payments.map((payment) => payment.midtransOrderId), ...shipments.map((shipment) => shipment.biteshipOrderId)]);
  const row = toAdminRow(request, shipments.at(-1) ?? null, feedback);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-8">
      <Link href="/admin/requests" className="text-sm text-wi-black underline">All requests</Link>
      <AdminSampleDetail
        request={request}
        boxLabel={row.boxLabel}
        payments={payments}
        shipments={shipments}
        feedback={feedback}
        events={events}
        shipForm={row.isBookable ? <AdminShipRunForm rows={[row]} isSingle /> : null}
      />
    </main>
  );
}
