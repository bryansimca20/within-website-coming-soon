import { DialogClose, DialogTitle } from "@/components/ui/dialog";

import { WaitlistLossScale } from "./WaitlistLossScale";
import { WaitlistCloseGlyph } from "./svg/WaitlistGlyphs";
import { type IWaitlistFeature, WAITLIST_COPY, WAITLIST_SWEAT_LOSS } from "./utils/waitlist-copy";

interface WaitlistHeatCardProps {
  /** Supplies the card's label, title and body. */
  feature: IWaitlistFeature;
}

/** The dark card: why heat matters, then the measured sweat loss per hour and its source. */
export function WaitlistHeatCard({ feature }: WaitlistHeatCardProps) {
  const { heat } = WAITLIST_COPY;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted-dark">
            {feature.cardLabel}
          </p>
          <DialogTitle className="m-0 text-2xl leading-7 font-semibold tracking-[-0.01em] desk:text-[30px] desk:leading-[34px]">
            {feature.cardTitle}
          </DialogTitle>
        </div>
        <DialogClose
          aria-label={WAITLIST_COPY.close}
          className="flex size-11 flex-none cursor-pointer items-center justify-center bg-brand-mist text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flavor-orange"
        >
          <WaitlistCloseGlyph />
        </DialogClose>
      </div>
      <p className="m-0 text-base leading-6 desk:text-[17px] desk:leading-[25px]">{feature.cardBody}</p>
      <div>
        <p className="m-0 border-b border-brand-mist pt-1 pb-[5px] text-xs leading-4 font-bold tracking-[0.06em]">
          {heat.lossHeading}
        </p>
        {WAITLIST_SWEAT_LOSS.map((loss) => (
          <WaitlistLossScale key={loss.name} loss={loss} />
        ))}
        <p className="mt-2.5 mb-0 text-xs leading-4 text-brand-muted-dark">
          {heat.sourceNote}{" "}
          <a
            href={heat.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-mist underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flavor-orange"
          >
            {heat.sourceLabel}
          </a>
          .
        </p>
      </div>
    </>
  );
}
