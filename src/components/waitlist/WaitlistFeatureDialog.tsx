"use client";

import type { RefObject } from "react";

import { Dialog, DialogBackdrop, DialogPopup, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { WaitlistFactsCard } from "./WaitlistFactsCard";
import { WaitlistHeatCard } from "./WaitlistHeatCard";
import { type IWaitlistFeature, WaitlistFeatureId } from "./utils/waitlist-copy";

interface WaitlistFeatureDialogProps {
  /** The feature whose card is showing; kept while closed so the exit fade has content. */
  feature: IWaitlistFeature;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** The tile that opened the card; focus returns there on close. */
  triggerRef: RefObject<HTMLButtonElement | null>;
}

/** A feature card over the blurred page: the white facts label, or the dark heat card. */
export function WaitlistFeatureDialog({
  feature,
  isOpen,
  onOpenChange,
  triggerRef,
}: WaitlistFeatureDialogProps) {
  const isFacts = feature.id === WaitlistFeatureId.Facts;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop className="bg-white/55 backdrop-blur-lg" />
        <DialogPopup
          finalFocus={triggerRef}
          className={cn(
            "top-1/2 left-1/2 w-[calc(100vw-32px)] max-w-[380px] -translate-x-1/2 -translate-y-1/2 px-[18px] pt-[18px] pb-5 data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-starting-style:scale-[0.96] data-starting-style:opacity-0 desk:max-w-[440px] desk:px-6 desk:pt-6 desk:pb-[26px]",
            isFacts
              ? "border-2 border-brand-ink bg-white text-brand-ink"
              : "gap-3.5 bg-brand-ink text-brand-mist"
          )}
        >
          {isFacts ? <WaitlistFactsCard /> : <WaitlistHeatCard feature={feature} />}
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
