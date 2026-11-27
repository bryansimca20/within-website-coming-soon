import type { MouseEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { WaitlistLabelGlyph, WaitlistPlusGlyph, WaitlistSunGlyph } from "./svg/WaitlistGlyphs";
import { type IWaitlistFeature, WaitlistFeatureId } from "./utils/waitlist-copy";

/** Where one tile sits on the circle, which way its label and badge face, and when it lands. */
interface IWaitlistTilePlacement {
  spot: string;
  label: string;
  badge: string;
  /** Entrance delay: the moment the ring's opening fill sweeps past this tile. */
  enter: string;
}

/**
 * Opposite ends of one diagonal of a circle whose radius is 48% of its box: 50 ± 48 × cos 45°.
 * Labels sit outside the circle, so above the top tile and below the bottom one.
 */
const TILE_PLACEMENT: Record<WaitlistFeatureId, IWaitlistTilePlacement> = {
  [WaitlistFeatureId.Facts]: {
    spot: "left-[16.06%] top-[16.06%]",
    label: "bottom-[calc(100%+8px)] left-0 text-left desk:bottom-[calc(100%+12px)]",
    badge: "-left-[9px] desk:-left-3",
    enter: "[--tw-animation-delay:180ms]",
  },
  [WaitlistFeatureId.Heat]: {
    spot: "left-[83.94%] top-[83.94%]",
    label: "top-[calc(100%+8px)] right-0 text-right desk:top-[calc(100%+12px)]",
    badge: "-right-[9px] desk:-right-3",
    enter: "[--tw-animation-delay:600ms]",
  },
};

const TILE_ICON = "size-6 desk:size-[34px]";

/** The icon inside each square. */
const TILE_FACE: Record<WaitlistFeatureId, ReactNode> = {
  [WaitlistFeatureId.Facts]: <WaitlistLabelGlyph className={TILE_ICON} />,
  [WaitlistFeatureId.Heat]: <WaitlistSunGlyph className={TILE_ICON} />,
};

interface WaitlistOrbitTileProps {
  /** The feature this tile opens. */
  feature: IWaitlistFeature;
  /** Opens the feature's card; receives the tile so focus can return to it. */
  onOpen: (id: WaitlistFeatureId, trigger: HTMLButtonElement) => void;
}

/** One square feature tile on the dotted circle, with its ink "+" badge and two-line label. */
export function WaitlistOrbitTile({ feature, onOpen }: WaitlistOrbitTileProps) {
  const placement = TILE_PLACEMENT[feature.id];

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onOpen(feature.id, event.currentTarget);
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={feature.cardLabel}
      onClick={handleClick}
      className={cn(
        "group absolute z-2 size-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer p-0 text-brand-ink transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] motion-reduce:transition-none desk:size-[72px]",
        "animate-in fill-mode-backwards animation-duration-300 fade-in zoom-in-90 motion-reduce:animate-none",
        placement.spot,
        placement.enter
      )}
    >
      <span
        className={cn(
          "absolute bg-white py-0.5 text-[11px] leading-4 font-bold tracking-[0.06em] whitespace-nowrap desk:text-[13px] desk:leading-[18px]",
          placement.label
        )}
      >
        {feature.labelLines[0]}
        <br />
        {feature.labelLines[1]}
      </span>
      {/* The white ring clears the dotted circle off the square's corners. */}
      <span className="absolute inset-0 flex items-center justify-center border border-brand-ink/45 bg-white ring-6 ring-white transition-colors duration-150 group-hover:border-brand-ink">
        {TILE_FACE[feature.id]}
        {/* Ink stamp, as on the joined button: wipes in from the left carrying the same icon in mist. */}
        <span
          aria-hidden
          className="absolute -inset-px flex items-center justify-center bg-brand-ink text-brand-mist transition-[clip-path] duration-200 ease-brand [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0)] group-focus-visible:[clip-path:inset(0)] motion-reduce:transition-none"
        >
          {TILE_FACE[feature.id]}
        </span>
        <span
          aria-hidden
          className={cn(
            "absolute -top-[9px] flex size-5 items-center justify-center bg-brand-ink text-brand-mist desk:-top-3 desk:size-[26px]",
            placement.badge
          )}
        >
          <WaitlistPlusGlyph className="size-[11px] desk:size-3.5" />
        </span>
      </span>
    </button>
  );
}
