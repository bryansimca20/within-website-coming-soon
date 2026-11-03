import Link from "next/link";

import { FEEDBACK_FELT } from "@/app/utils/sample-options";
import { OPTION_LABEL } from "@/components/sample/utils/sample-copy";
import { cn } from "@/lib/utils";
import type { IReviewSummary } from "@/services/sample-review.service";

import { AdminStars } from "./AdminStars";

interface AdminReviewSummaryProps {
  summary: IReviewSummary;
  /** The star filter in use, so its row reads as selected. */
  stars: number | null;
  /** Builds the link for a star row; null clears the star filter. */
  hrefForStars: (stars: number | null) => string;
}

/** A bar filled to `share` (0 to 1). */
function AdminReviewBar({ share, className }: { share: number; className?: string }) {
  return (
    <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full bg-wi-mist", className)}>
      <div className="h-full origin-left rounded-full bg-wi-black" style={{ transform: `scaleX(${Math.min(1, share)})` }} />
    </div>
  );
}

/** One "x.x / 5" score. */
function AdminScore({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-wi-ink-500">{label}</dt>
      <dd className="m-0 text-h3 font-medium tracking-[-0.02em] text-wi-black tabular-nums">
        {value === null ? "–" : value.toFixed(1)}<span className="ml-1 text-sm font-normal tracking-normal text-wi-ink-500">/ 5</span>
      </dd>
    </div>
  );
}

/** The review score at a glance: average stars, how the stars split, taste and effectiveness, and how people felt. */
export function AdminReviewSummary({ summary, stars, hrefForStars }: AdminReviewSummaryProps) {
  const feltRows = FEEDBACK_FELT.map((key) => ({ key, count: summary.felt[key] })).sort((a, b) => b.count - a.count);

  return (
    <section aria-label="Review score" className="grid gap-8 rounded-[var(--wi-radius-card)] bg-wi-paper p-6 shadow-[var(--wi-shadow-card)] lg:grid-cols-[auto_1fr_1fr]">
      <div className="flex flex-col gap-2 lg:pr-4">
        <p className="m-0 text-display-md leading-none font-medium tracking-[-0.03em] text-wi-black tabular-nums">{summary.average === null ? "–" : summary.average.toFixed(1)}</p>
        {summary.average !== null && <AdminStars value={summary.average} className="[&_svg]:size-4" />}
        <p className="m-0 text-sm text-wi-ink-500">{summary.rated === 1 ? "1 review" : `${summary.rated} reviews`}</p>
      </div>

      <ul aria-label="Stars" className="m-0 flex list-none flex-col gap-1 p-0">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.distribution[star] ?? 0;
          const isSelected = stars === star;
          return (
            <li key={star}>
              <Link
                href={hrefForStars(isSelected ? null : star)}
                scroll={false}
                aria-current={isSelected ? "true" : undefined}
                className="flex items-center gap-3 rounded-[var(--wi-radius-control)] px-2 py-1 text-sm text-wi-ink-700 transition-colors duration-150 hover:bg-wi-paper-dim aria-[current=true]:bg-wi-paper-dim aria-[current=true]:text-wi-black"
              >
                <span className="w-12 tabular-nums">{star} star</span>
                <AdminReviewBar share={summary.rated === 0 ? 0 : count / summary.rated} />
                <span className="w-8 text-right text-wi-ink-500 tabular-nums">{count}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-5">
        <dl className="m-0 grid grid-cols-2 gap-4">
          <AdminScore label="Taste" value={summary.tasteAverage} />
          <AdminScore label="Effectiveness" value={summary.effectivenessAverage} />
        </dl>
        <div className="flex flex-col gap-2">
          <p className="m-0 text-xs text-wi-ink-500">How they felt{summary.feltAnswered > 0 && <span className="tabular-nums"> · {summary.feltAnswered} answered</span>}</p>
          {feltRows.map(({ key, count }) => (
            <div key={key} className="flex items-center gap-3 text-sm text-wi-ink-700">
              <span className="w-40 truncate">{OPTION_LABEL.felt[key]}</span>
              <AdminReviewBar share={summary.feltAnswered === 0 ? 0 : count / summary.feltAnswered} className="h-1 [&>div]:bg-wi-success" />
              <span className="w-10 text-right text-wi-ink-500 tabular-nums">{summary.feltAnswered === 0 ? "–" : `${Math.round((count / summary.feltAnswered) * 100)}%`}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
