import { cn } from "@/lib/utils";

/** Shared by every glyph: sizing and colour come from the caller's classes. */
interface WaitlistGlyphProps {
  className?: string;
}

/** Right-pointing arrow on the orange buttons. */
export function WaitlistArrowGlyph({ className }: WaitlistGlyphProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={cn("size-5 flex-none", className)}>
      <path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

/** The X on every dialog's close button. */
export function WaitlistCloseGlyph({ className }: WaitlistGlyphProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={cn("size-[18px]", className)}>
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

/** The "+" inside a feature tile's orange badge. */
export function WaitlistPlusGlyph({ className }: WaitlistGlyphProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden className={className}>
      <path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

/** Instagram outline for the header link. */
export function WaitlistInstagramGlyph({ className }: WaitlistGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

/** Nutrition-label icon for the Product facts tile. */
export function WaitlistLabelGlyph({ className }: WaitlistGlyphProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <rect x="5" y="3" width="18" height="22" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8h10" stroke="currentColor" strokeWidth="2.6" />
      <path d="M9 13h10M9 17h10M9 21h6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Sun icon for the Made for the heat tile. */
export function WaitlistSunGlyph({ className }: WaitlistGlyphProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M14 2v4M14 22v4M2 14h4M22 14h4M5.5 5.5l2.8 2.8M19.7 19.7l2.8 2.8M5.5 22.5l2.8-2.8M19.7 8.3l2.8-2.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}
