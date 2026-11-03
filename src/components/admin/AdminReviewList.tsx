import Link from "next/link";

import { OPTION_LABEL } from "@/components/sample/utils/sample-copy";
import { formatJakarta } from "@/components/sample/utils/jakarta-date";
import type { IReviewRow } from "@/services/sample-review.service";

import { AdminStars } from "./AdminStars";

interface AdminReviewListProps {
  reviews: IReviewRow[];
  /** Shown when a filter leaves nothing, instead of the no-reviews line. */
  isFiltered: boolean;
}

/** Every review in the current view, newest first: stars, headline, words, how they felt, and whose box it was. */
export function AdminReviewList({ reviews, isFiltered }: AdminReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="m-0 rounded-[var(--wi-radius-card)] bg-wi-paper p-6 text-sm text-wi-ink-500 shadow-[var(--wi-shadow-card)]">
        {isFiltered ? "No reviews match this filter." : "No reviews yet. They arrive from the delivered and reminder emails, and from the card's QR."}
      </p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col rounded-[var(--wi-radius-card)] bg-wi-paper px-2 shadow-[var(--wi-shadow-card)]">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col gap-2 border-t border-wi-line/70 px-4 py-5 first:border-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {review.rating === null ? <span className="text-xs text-wi-ink-500">Old check-in, no stars</span> : <AdminStars value={review.rating} />}
            {review.headline !== null && <h3 className="m-0 text-body font-semibold text-wi-black">{review.headline}</h3>}
          </div>
          {review.review !== null && <p className="m-0 max-w-[65ch] text-sm leading-relaxed text-wi-ink-700">{review.review}</p>}
          {(review.taste !== null || review.effectiveness !== null || review.felt.length > 0) && (
            <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 text-xs text-wi-ink-500">
              {review.taste !== null && <span>Taste <span className="text-wi-black tabular-nums">{review.taste}/5</span></span>}
              {review.effectiveness !== null && <span>Effect <span className="text-wi-black tabular-nums">{review.effectiveness}/5</span></span>}
              {review.felt.length > 0 && <span>{review.felt.map((key) => OPTION_LABEL.felt[key]).join(", ")}</span>}
            </p>
          )}
          <p className="m-0 text-xs text-wi-ink-500">
            {review.requestId === null ? (
              "Email matched no box"
            ) : (
              <Link href={`/admin/requests/${review.requestId}`} className="text-wi-ink-700 underline-offset-4 hover:text-wi-black hover:underline">
                {review.name} · <span className="wi-readout">{review.boxLabel}</span>
              </Link>
            )}
            <span className="tabular-nums"> · {formatJakarta(review.createdAt)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
