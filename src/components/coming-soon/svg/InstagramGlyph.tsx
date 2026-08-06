/** Props for the inlined Instagram glyph. */
interface InstagramGlyphProps {
  size?: number;
}

/** Instagram mark — inlined because Lucide dropped brand icons; matches the design's glyph. */
export function InstagramGlyph({ size = 18 }: InstagramGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}
