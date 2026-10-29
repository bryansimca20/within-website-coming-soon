import type { SampleBatch, SampleBatchPhase, SampleRequestStatus } from "@/db/schema";

const PHASE_LABEL: Record<SampleBatchPhase, string> = { upcoming: "coming soon", open: "open", closed: "closed" };

interface AdminSampleSummaryProps {
  batch: SampleBatch;
  summary: Record<SampleRequestStatus, number>;
}

const ORDER: SampleRequestStatus[] = ["pending_payment", "paid", "shipped", "delivered", "expired", "cancelled"];
const LABEL: Record<SampleRequestStatus, string> = {
  pending_payment: "Holding",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  expired: "Expired",
  cancelled: "Cancelled",
};

/** The selected batch's counts by status. Capacity and phase are set on the Batches page. */
export function AdminSampleSummary({ batch, summary }: AdminSampleSummaryProps) {
  const claimed = summary.pending_payment + summary.paid + summary.shipped + summary.delivered;

  return (
    <section className="flex flex-col gap-4 rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="m-0 text-h2 font-medium text-wi-black">{batch.label}</h1>
        <span className="wi-readout text-sm">{claimed} / {batch.capacity} claimed · {PHASE_LABEL[batch.phase]}</span>
      </div>
      <dl className="m-0 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ORDER.map((status) => (
          <div key={status} className="flex flex-col gap-1">
            <dt className="text-2xs font-bold tracking-[0.14em] text-wi-ink-500 uppercase">{LABEL[status]}</dt>
            <dd className="wi-readout m-0 text-h3 text-wi-black">{summary[status]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
