import { SampleStarGlyph } from "@/components/sample/svg/SampleStarGlyph";
import { cn } from "@/lib/utils";

interface AdminStarsProps {
  /** 1 to 5; an average is rounded to the nearest whole star. */
  value: number;
  className?: string;
}

/** Five stars, filled up to the rating: the same star samplers tap on the review form. */
export function AdminStars({ value, className }: AdminStarsProps) {
  const filled = Math.round(value);

  return (
    <span role="img" aria-label={`${value.toFixed(1)} out of 5 stars`} className={cn("inline-flex gap-0.5 text-wi-black", className)}>
      {[1, 2, 3, 4, 5].map((star) => <SampleStarGlyph key={star} isFilled={star <= filled} className={cn("size-3.5", star > filled && "text-wi-line-strong")} />)}
    </span>
  );
}
