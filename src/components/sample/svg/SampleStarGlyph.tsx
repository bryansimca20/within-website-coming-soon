import { cn } from "@/lib/utils";

interface SampleStarGlyphProps {
  /** Solid when the star is part of the rating, outlined when not. */
  isFilled: boolean;
  className?: string;
}

/** One rating star, drawn in the current text colour. */
export function SampleStarGlyph({ isFilled, className }: SampleStarGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("flex-none", className)}>
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"
        fill={isFilled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
