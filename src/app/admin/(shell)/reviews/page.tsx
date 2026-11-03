import Link from "next/link";

import { AdminReviewList } from "@/components/admin/AdminReviewList";
import { AdminReviewSummary } from "@/components/admin/AdminReviewSummary";
import { db } from "@/db/client";
import { requireAdmin } from "@/lib/admin-session";
import { SampleBatchService } from "@/services/sample-batch.service";
import { SampleReviewService, summarizeReviews } from "@/services/sample-review.service";

export const dynamic = "force-dynamic";

/** `/admin/reviews` with the given filters; null drops one. */
function reviewsHref(batch: string | null, stars: number | null): string {
  const params = new URLSearchParams();
  if (batch !== null) params.set("batch", batch);
  if (stars !== null) params.set("stars", String(stars));
  const query = params.toString();

  return query === "" ? "/admin/reviews" : `/admin/reviews?${query}`;
}

/** The review score across every batch or one: average, star split, taste, effect, how they felt, then each review. */
export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ batch?: string; stars?: string }> }) {
  await requireAdmin();
  const [query, batches, all] = await Promise.all([searchParams, SampleBatchService.list(db, new Date()), SampleReviewService.list(db)]);
  const batch = batches.some((summary) => summary.batch.id === query.batch) ? (query.batch ?? null) : null;
  const starsValue = Number(query.stars);
  const stars = Number.isInteger(starsValue) && starsValue >= 1 && starsValue <= 5 ? starsValue : null;
  const inBatch = batch === null ? all : all.filter((review) => review.batchId === batch);
  const visible = stars === null ? inBatch : inBatch.filter((review) => review.rating === stars);
  const tabs = [{ id: null, label: "All batches" }, ...batches.map((summary) => ({ id: summary.batch.id, label: summary.batch.label }))];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-h1 font-medium tracking-[-0.02em] text-wi-black">Reviews</h1>
          <p className="m-0 text-sm text-wi-ink-500">What samplers said after their box arrived. Nothing here is published.</p>
        </div>
        <nav aria-label="Batch" className="flex flex-wrap gap-0.5 rounded-[var(--wi-radius-control)] bg-wi-paper p-0.5 shadow-[var(--wi-shadow-card)]">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={reviewsHref(tab.id, stars)}
              aria-current={tab.id === batch ? "page" : undefined}
              className="flex h-8 items-center rounded-[calc(var(--wi-radius-control)-2px)] px-3 text-sm text-wi-ink-500 transition-colors duration-150 hover:text-wi-black aria-[current=page]:bg-wi-paper-dim aria-[current=page]:text-wi-black"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <AdminReviewSummary summary={summarizeReviews(inBatch)} stars={stars} hrefForStars={(next) => reviewsHref(batch, next)} />

      <section aria-labelledby="review-list" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="review-list" className="m-0 text-sm font-medium text-wi-black">
            {stars === null ? "All reviews" : `${stars}-star reviews`} <span className="font-normal text-wi-ink-500 tabular-nums">{visible.length}</span>
          </h2>
          {stars !== null && <Link href={reviewsHref(batch, null)} scroll={false} className="text-sm text-wi-ink-500 hover:text-wi-black">Show all stars</Link>}
        </div>
        <AdminReviewList reviews={visible} isFiltered={stars !== null || batch !== null} />
      </section>
    </main>
  );
}
