import { SCORE_MAX } from "@/app/utils/sample-options";

import { SampleStarGlyph } from "./svg/SampleStarGlyph";
import { SAMPLE_COPY } from "./utils/sample-copy";

const { feedback: copy } = SAMPLE_COPY;
const STARS = Array.from({ length: SCORE_MAX }, (_, index) => index + 1);

interface SampleFeedbackStarsProps {
  /** The picked rating as the form carries it, "" before a tap. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/** The overall rating as five big stars: native radios, visually hidden, so arrow keys and screen readers work. */
export function SampleFeedbackStars({ value, onChange, error }: SampleFeedbackStarsProps) {
  const rating = Number(value) || 0;
  const errorId = "rating-error";

  return (
    <fieldset className="m-0 flex min-w-0 flex-col items-center gap-2 border-0 p-0" aria-describedby={error === undefined ? undefined : errorId}>
      <legend className="sr-only">{copy.ratingLegend}</legend>
      <div className="flex gap-1">
        {STARS.map((stars) => (
          <label
            key={stars}
            className="relative flex size-14 cursor-pointer items-center justify-center text-brand-ink transition-transform duration-150 ease-brand active:scale-[0.92] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-ink motion-reduce:transition-none"
          >
            <input
              type="radio"
              name="rating"
              value={String(stars)}
              checked={rating === stars}
              onChange={() => onChange(String(stars))}
              aria-label={copy.starLabel(stars)}
              className="absolute size-px opacity-0"
            />
            <SampleStarGlyph isFilled={stars <= rating} className="size-11" />
          </label>
        ))}
      </div>
      <p aria-hidden className="m-0 min-h-5 text-[15px] leading-5 font-semibold">{copy.ratingWords[rating] ?? ""}</p>
      {error !== undefined && (
        <p id={errorId} role="alert" className="m-0 text-[13px] leading-[18px] font-semibold text-brand-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
