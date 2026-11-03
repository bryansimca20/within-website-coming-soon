import type { ReactNode } from "react";

import { AdminBatchOverview } from "@/components/admin/AdminBatchOverview";
import { AdminDeliveryIssues } from "@/components/admin/AdminDeliveryIssues";
import { AdminNewBatchDialog } from "@/components/admin/AdminNewBatchDialog";
import { db } from "@/db/client";
import { requireAdmin } from "@/lib/admin-session";
import { cn } from "@/lib/utils";
import { SampleBatchService } from "@/services/sample-batch.service";
import { DeliveryState, SampleDeliveryService, STUCK_AFTER_DAYS } from "@/services/sample-delivery.service";
import { SampleReviewService, summarizeReviews } from "@/services/sample-review.service";

export const dynamic = "force-dynamic";

/** One headline number with its context line. */
function AdminOverviewStat({ label, value, detail, isAlert = false, children }: { label: string; value: ReactNode; detail: string; isAlert?: boolean; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-wi-line px-5 py-4 not-first:border-t sm:not-first:border-t-0 sm:not-first:border-l">
      <dt className="text-xs text-wi-ink-500">{label}</dt>
      <dd className={cn("m-0 text-h2 leading-tight font-medium tracking-[-0.02em] tabular-nums", isAlert ? "text-wi-error" : "text-wi-black")}>{value}</dd>
      {children}
      <p className="m-0 text-xs text-wi-ink-500">{detail}</p>
    </div>
  );
}

/** The sampling control panel: deliveries in flight, what failed and why, check-in rate, and every batch side by side. */
export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireAdmin();
  const now = new Date();
  const [{ show }, summaries, board, next, reviews] = await Promise.all([searchParams, SampleBatchService.list(db, now), SampleDeliveryService.board(db, now), SampleBatchService.nextName(db), SampleReviewService.list(db)]);
  const reviewsByBatch = Object.groupBy(reviews, (review) => review.batchId ?? "");
  const reviewSummaries = Object.fromEntries(Object.entries(reviewsByBatch).map(([batchId, rows]) => [batchId, summarizeReviews(rows ?? [])]));
  const filter = show === DeliveryState.Failed || show === DeliveryState.Stuck ? show : null;
  const counts = Object.values(board.byBatch);
  const sum = (pick: (value: { inTransit: number; stuck: number; failed: number }) => number) => counts.reduce((total, value) => total + pick(value), 0);
  const shipped = summaries.reduce((total, summary) => total + summary.shipped, 0);
  const delivered = summaries.reduce((total, summary) => total + summary.delivered, 0);
  const feedback = summaries.reduce((total, summary) => total + summary.feedback, 0);
  const stuck = sum((value) => value.stuck);
  const failed = sum((value) => value.failed);
  const rate = delivered === 0 ? null : feedback / delivered;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-h1 font-medium tracking-[-0.02em] text-wi-black">Sampling</h1>
          <p className="m-0 text-sm text-wi-ink-500">Deliveries and check-ins across every batch. One batch can be open at a time.</p>
        </div>
        <AdminNewBatchDialog key={next.id} nextLabel={next.label} defaultCapacity={summaries[0]?.batch.capacity ?? 100} openLabel={summaries.find(({ batch }) => batch.phase === "open")?.batch.label ?? null} />
      </div>

      <dl className="m-0 grid rounded-[var(--wi-radius-card)] bg-wi-paper shadow-[var(--wi-shadow-card)] sm:grid-cols-2 lg:grid-cols-4">
        <AdminOverviewStat label="In transit" value={sum((value) => value.inTransit)} detail={stuck === 0 ? "Every box has moved recently." : `${stuck} with no movement in ${STUCK_AFTER_DAYS}+ days`} />
        <AdminOverviewStat label="Delivered" value={<>{delivered}<span className="ml-1.5 text-sm font-normal tracking-normal text-wi-ink-500">of {shipped} shipped</span></>} detail={shipped === 0 ? "Nothing shipped yet." : `${((delivered / shipped) * 100).toFixed(1)}% delivered`} />
        <AdminOverviewStat label="Failed delivery" value={failed} isAlert={failed > 0} detail="Returned, rejected, on hold or no courier" />
        <AdminOverviewStat label="Feedback rate" value={rate === null ? "–" : <>{Math.round(rate * 100)}%<span className="ml-1.5 text-sm font-normal tracking-normal text-wi-ink-500">{feedback} of {delivered}</span></>} detail="Delivered boxes that checked in">
          <div className="h-1 overflow-hidden rounded-full bg-wi-mist">
            <div className="h-full origin-left rounded-full bg-wi-success" style={{ transform: `scaleX(${Math.min(1, rate ?? 0)})` }} />
          </div>
        </AdminOverviewStat>
      </dl>

      <AdminDeliveryIssues issues={board.issues} show={filter} />
      <AdminBatchOverview summaries={summaries} deliveries={board.byBatch} reviews={reviewSummaries} />
    </main>
  );
}
