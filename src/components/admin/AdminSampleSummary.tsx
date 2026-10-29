import type { SampleBatch, SampleRequestStatus } from "@/db/schema";

import { AdminStatusPill } from "./AdminStatusPill";

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
  const filled = Math.min(1, claimed / batch.capacity);

  return (
    <section className="flex flex-col gap-6 rounded-[var(--wi-radius-card)] bg-wi-paper p-6 shadow-[var(--wi-shadow-card)]">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex items-center gap-3">
          <h1 className="m-0 text-h1 font-medium tracking-[-0.02em] text-wi-black">{batch.label}</h1>
          <AdminStatusPill status={batch.phase} />
        </div>
        <div className="flex w-full max-w-64 flex-col gap-2">
          <p className="m-0 text-sm text-wi-ink-500">
            <span className="font-medium text-wi-black tabular-nums">{claimed}</span> of <span className="tabular-nums">{batch.capacity}</span> boxes claimed
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-wi-mist">
            <div className="h-full origin-left rounded-full bg-wi-black transition-transform duration-500 ease-[var(--wi-ease-out)]" style={{ transform: `scaleX(${filled})` }} />
          </div>
        </div>
      </div>
      <dl className="m-0 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ORDER.map((status) => (
          <div key={status} className="flex flex-col gap-1 rounded-[calc(var(--wi-radius-card)-6px)] bg-wi-paper-dim px-3.5 py-3">
            <dt className="text-xs text-wi-ink-500">{LABEL[status]}</dt>
            <dd className="m-0 text-h2 font-medium tracking-[-0.02em] text-wi-black tabular-nums">{summary[status]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
