import { desc, eq } from "drizzle-orm";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
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
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 md:px-10 md:py-10">
      <Link href={`/admin/batches/${request.batchId}/requests`} className="inline-flex items-center gap-1.5 self-start rounded-full px-2 py-1 -ml-2 text-sm text-wi-ink-500 transition-colors hover:bg-wi-mist hover:text-wi-black"><ArrowLeft aria-hidden className="size-3.5" />All requests</Link>
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
