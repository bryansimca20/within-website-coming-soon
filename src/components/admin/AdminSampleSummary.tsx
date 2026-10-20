import { updateBatchAction } from "@/app/actions/admin-sample.action";
import { Button } from "@/components/ui/button";
import type { SampleBatch, SampleRequestStatus } from "@/db/schema";

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

/** Batch counts and the capacity / open controls. */
export function AdminSampleSummary({ batch, summary }: AdminSampleSummaryProps) {
  const claimed = summary.pending_payment + summary.paid + summary.shipped + summary.delivered;

  return (
    <section className="flex flex-col gap-4 rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="m-0 text-h2 font-medium text-wi-black">{batch.label}</h1>
        <span className="wi-readout text-sm">{claimed} / {batch.capacity} claimed · {batch.isOpen ? "open" : "closed"}</span>
      </div>
      <dl className="m-0 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ORDER.map((status) => (
          <div key={status} className="flex flex-col gap-1">
            <dt className="text-2xs font-bold tracking-[0.14em] text-wi-ink-500 uppercase">{LABEL[status]}</dt>
            <dd className="wi-readout m-0 text-h3 text-wi-black">{summary[status]}</dd>
          </div>
        ))}
      </dl>
      <form action={updateBatchAction} className="flex flex-wrap items-end gap-3 border-t border-wi-line pt-4">
        <input type="hidden" name="batchId" value={batch.id} />
        <label className="flex flex-col gap-1 text-2xs font-bold tracking-[0.14em] text-wi-ink-500 uppercase">
          Capacity
          <input name="capacity" type="number" min={1} defaultValue={batch.capacity} className="h-9 w-24 rounded-[var(--wi-radius-control)] border border-wi-line-strong bg-wi-paper px-2 text-sm text-wi-black" />
        </label>
        <label className="flex h-9 items-center gap-2 text-sm">
          <input name="isOpen" type="checkbox" defaultChecked={batch.isOpen} /> Taking requests
        </label>
        <Button type="submit" size="sm" variant="secondary">Save</Button>
      </form>
    </section>
  );
}
