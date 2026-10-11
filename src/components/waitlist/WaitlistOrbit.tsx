import Image from "next/image";

import { cn } from "@/lib/utils";

import { WaitlistOrbitTile } from "./WaitlistOrbitTile";
import { WAITLIST_COPY, WAITLIST_FEATURES, type WaitlistFeatureId } from "./utils/waitlist-copy";

interface WaitlistOrbitProps {
  /** Opens a feature card; receives the tile that was pressed. */
  onOpenFeature: (id: WaitlistFeatureId, trigger: HTMLButtonElement) => void;
  className?: string;
}

/**
 * The sachet stage: a dotted circle sized to the smaller of the leftover width or height, the
 * floating sachet at its centre, and the two feature tiles on one diagonal.
 */
export function WaitlistOrbit({ onOpenFeature, className }: WaitlistOrbitProps) {
  return (
    <div className={cn("relative min-h-0 flex-1", className)}>
      <div className="absolute inset-x-1 inset-y-10 [container-type:size] desk:inset-x-4 desk:inset-y-12">
        <div className="absolute top-1/2 left-1/2 size-[min(100cqw,100cqh)] -translate-x-1/2 -translate-y-1/2 desk:max-h-[540px] desk:max-w-[540px]">
          <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full overflow-visible">
            {/* Rotated so the one uneven gap, where the dashes meet, hides behind the bottom-right tile. */}
            <circle
              cx="50"
              cy="50"
              r="48"
              transform="rotate(45 50 50)"
              vectorEffect="non-scaling-stroke"
              className="fill-none stroke-brand-ink stroke-4 [stroke-dasharray:0_18] [stroke-linecap:round] desk:stroke-5 desk:[stroke-dasharray:0_24]"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 z-1 flex h-[94%] max-h-[400px] -translate-x-1/2 -translate-y-1/2 items-center justify-center desk:h-[76%]">
            <Image
              src="/waitlist/sachet.webp"
              alt={WAITLIST_COPY.sachetAlt}
              width={1000}
              height={2161}
              sizes="(min-width: 900px) 200px, 190px"
              preload
              className="block h-full w-auto max-w-none animate-sachet-float motion-reduce:animate-none"
            />
          </div>
          {WAITLIST_FEATURES.map((feature) => (
            <WaitlistOrbitTile key={feature.id} feature={feature} onOpen={onOpenFeature} />
          ))}
        </div>
      </div>
    </div>
  );
}
