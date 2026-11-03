import { CaretRight } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { IBatchSummary } from "@/services/sample-batch.service";
import type { IDeliveryCounts } from "@/services/sample-delivery.service";
import type { IReviewSummary } from "@/services/sample-review.service";

import { AdminStars } from "./AdminStars";
import { AdminStatusPill } from "./AdminStatusPill";

interface AdminBatchOverviewProps {
  summaries: IBatchSummary[];
  deliveries: Record<string, IDeliveryCounts>;
  /** Review summary per batch id; a batch with no reviews is missing. */
  reviews: Record<string, IReviewSummary>;
}

const HEADINGS = ["Batch", "Status", "Claimed", "Shipped", "Delivered", "Failed", "Feedback", "Rating", ""];

/** A thin bar filled to `share` (0 to 1). */
function AdminMeter({ share, className }: { share: number; className?: string }) {
  return (
    <div className={cn("h-1 overflow-hidden rounded-full bg-wi-mist", className)}>
      <div className="h-full origin-left rounded-full bg-wi-black" style={{ transform: `scaleX(${Math.min(1, share)})` }} />
    </div>
  );
}

/** The open batch, featured: how full it is and how far its boxes have got. */
function AdminLiveBatch({ summary }: { summary: IBatchSummary }) {
  const { batch, claimed, paid, shipped, delivered, feedback } = summary;
  const steps = [
    { label: "Holding", count: claimed - paid },
    { label: "Paid", count: paid },
    { label: "Shipped", count: shipped },
    { label: "Delivered", count: delivered },
    { label: "Feedback", count: feedback },
  ];

  return (
    <section className="grid gap-8 rounded-[var(--wi-radius-card)] bg-wi-paper p-6 shadow-[var(--wi-shadow-card)] lg:grid-cols-[1fr_1.4fr] lg:items-center">
      <div className="flex flex-col gap-4">
        <h2 className="m-0 flex items-center gap-2.5 text-h3 font-medium tracking-[-0.02em] text-wi-black">{batch.label} <AdminStatusPill status={batch.phase} /></h2>
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm text-wi-ink-500"><span className="font-medium text-wi-black tabular-nums">{claimed}</span> of <span className="tabular-nums">{batch.capacity}</span> boxes claimed</p>
          <AdminMeter share={claimed / batch.capacity} className="h-1.5" />
        </div>
        <Link href={`/admin/batches/${batch.id}/requests`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "self-start")}>Open requests</Link>
      </div>
      <dl className="m-0 grid grid-cols-2 gap-0.5 sm:grid-cols-5">
        {steps.map((step) => (
          <div key={step.label} className="flex flex-col gap-2.5 bg-wi-paper-dim px-3.5 py-3 first:rounded-l-[calc(var(--wi-radius-card)-6px)] last:rounded-r-[calc(var(--wi-radius-card)-6px)]">
            <dt className="text-xs text-wi-ink-500">{step.label}</dt>
            <dd className="m-0 text-h3 font-medium tracking-[-0.02em] text-wi-black tabular-nums">{step.count}</dd>
            <AdminMeter share={claimed === 0 ? 0 : step.count / claimed} />
          </div>
        ))}
      </dl>
    </section>
  );
}

/** The open batch up top, then every batch side by side: fill, deliveries, failures, how many checked in and their stars. */
export function AdminBatchOverview({ summaries, deliveries, reviews }: AdminBatchOverviewProps) {
  const live = summaries.find(({ batch }) => batch.phase === "open");

  return (
    <>
      {live !== undefined && <AdminLiveBatch summary={live} />}
      <section aria-labelledby="all-batches" className="flex flex-col gap-3">
        <h2 id="all-batches" className="m-0 text-sm font-medium text-wi-black">All batches</h2>
        <div className="overflow-x-auto rounded-[var(--wi-radius-card)] bg-wi-paper px-2 shadow-[var(--wi-shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow>
                {HEADINGS.map((heading, index) => <TableHead key={heading} className={cn("text-xs text-wi-ink-500", index > 2 && "text-right")}>{heading}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map(({ batch, claimed, shipped, delivered, feedback }) => {
                const failed = deliveries[batch.id]?.failed ?? 0;
                const hasShipped = shipped > 0;
                const rate = delivered === 0 ? null : feedback / delivered;
                const rating = reviews[batch.id]?.average ?? null;
                return (
                  <TableRow key={batch.id} className="border-wi-line/70">
                    <TableCell className="py-3.5 font-medium">
                      <Link href={`/admin/batches/${batch.id}/requests`} className="text-wi-black underline-offset-4 hover:underline">{batch.label}</Link>
                    </TableCell>
                    <TableCell><AdminStatusPill status={batch.phase} /></TableCell>
                    <TableCell className="min-w-40">
                      <div className="flex flex-col gap-1.5 text-xs text-wi-ink-500 tabular-nums">
                        {claimed} / {batch.capacity}
                        <AdminMeter share={claimed / batch.capacity} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-wi-black tabular-nums">{hasShipped ? shipped : "–"}</TableCell>
                    <TableCell className="text-right text-wi-black tabular-nums">{hasShipped ? delivered : "–"}</TableCell>
                    <TableCell className={cn("text-right tabular-nums", failed > 0 ? "text-wi-error" : "text-wi-ink-300")}>{hasShipped ? failed : "–"}</TableCell>
                    <TableCell className="text-right">
                      {rate === null ? (
                        <span className="text-wi-ink-300">–</span>
                      ) : (
                        <span className="inline-flex items-center gap-2.5 text-wi-black tabular-nums" title={`${feedback} of ${delivered} delivered boxes checked in`}>
                          {Math.round(rate * 100)}%
                          <AdminMeter share={rate} className="w-12 [&>div]:bg-wi-success" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {rating === null ? (
                        <span className="text-wi-ink-300">–</span>
                      ) : (
                        <Link href={`/admin/reviews?batch=${batch.id}`} className="inline-flex items-center gap-2 text-wi-black tabular-nums hover:underline" title={`${reviews[batch.id]?.rated ?? 0} reviews`}>
                          {rating.toFixed(1)}
                          <AdminStars value={rating} className="[&_svg]:size-3" />
                        </Link>
                      )}
                    </TableCell>
                    <TableCell className="w-8 text-right">
                      <Link href={`/admin/batches/${batch.id}/requests`} aria-label={`Open ${batch.label}`} className="inline-flex text-wi-ink-300 transition-colors hover:text-wi-black"><CaretRight className="size-3.5" /></Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}
