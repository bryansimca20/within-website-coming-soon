"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ISubscriberInput } from "@/app/utils/subscriber-input";

import { WaitlistBottle } from "./WaitlistBottle";
import { WaitlistForm } from "./WaitlistForm";
import { WaitlistCloseGlyph } from "./svg/WaitlistGlyphs";
import { WAITLIST_COPY } from "./utils/waitlist-copy";

const EMPTY_VALUES: ISubscriberInput = { fullName: "", email: "", instagramHandle: "" };

interface WaitlistSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Called with the visitor's first name once Shopify has the signup; the page then swaps this sheet for the confirmation. */
  onJoined: (firstName: string) => void;
  /** The call to action that opened the sheet; focus returns there on close. */
  triggerRef: RefObject<HTMLButtonElement | null>;
}

/**
 * The waitlist form: a bottom sheet on phones, a centred two-column modal on desktop with the free bottle beside the form. It owns the typed
 * values so they survive closing it and "Edit my details".
 */
export function WaitlistSheet({ isOpen, onOpenChange, onJoined, triggerRef }: WaitlistSheetProps) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  // True from a successful submit until the next open: the confirmation dialog takes focus, not the button.
  const isHandingOffRef = useRef(false);
  const { sheet } = WAITLIST_COPY;

  useEffect(() => {
    if (isOpen) {
      isHandingOffRef.current = false;
    }
  }, [isOpen]);

  function handleJoined(firstName: string) {
    isHandingOffRef.current = true;
    onJoined(firstName);
  }

  /** Desktop starts the cursor in the first field. A touch open does not, or the keyboard would cover the sheet at once. */
  function pickInitialFocus(openType: string) {
    return openType === "touch" ? true : (firstInputRef.current ?? true);
  }

  /** A plain close returns focus to the button. Closing on success leaves it for the confirmation to take. */
  function pickFinalFocus() {
    return isHandingOffRef.current ? false : (triggerRef.current ?? true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop className="bg-brand-ink/60" />
        <DialogPopup
          finalFocus={pickFinalFocus}
          initialFocus={pickInitialFocus}
          className="inset-x-0 bottom-0 max-h-dvh gap-4 overflow-y-auto border-t-[6px] border-brand-ink bg-white px-4 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] text-brand-ink data-ending-style:translate-y-full data-starting-style:translate-y-full desk:inset-x-auto desk:top-1/2 desk:bottom-auto desk:left-1/2 desk:w-[calc(100vw-48px)] desk:grid desk:max-w-[880px] desk:-translate-x-1/2 desk:-translate-y-1/2 desk:grid-cols-2 desk:grid-rows-[auto_1fr] desk:gap-x-10 desk:gap-y-5desk:border-t-8 desk:px-8 desk:pt-7 desk:pb-8 desk:data-ending-style:-translate-y-1/2 desk:data-ending-style:opacity-0 desk:data-starting-style:-translate-y-1/2 desk:data-starting-style:scale-[0.96] desk:data-starting-style:opacity-0 desk:data-ending-style:scale-[0.96]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 desk:gap-1.5">
              <DialogTitle className="m-0 text-[26px] leading-[30px] font-normal tracking-[-0.01em] desk:text-[32px] desk:leading-9">
                {sheet.title}
              </DialogTitle>
              <p className="m-0 mt-1 text-sm leading-5 text-pretty desk:text-base desk:leading-6">
                {sheet.offer.body}
              </p>
            </div>
            <DialogClose
              aria-label={WAITLIST_COPY.close}
              className="-mt-2 -mr-2 flex size-11 flex-none cursor-pointer items-center justify-center text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink desk:-mr-2.5"
            >
              <WaitlistCloseGlyph className="size-5" />
            </DialogClose>
          </div>
          {/* The bottle is the centrepiece: under the title on phones, its own left column on desktop. */}
          <WaitlistBottle className="h-[min(300px,34vh)] w-full desk:col-start-1 desk:row-span-2 desk:row-start-1 desk:h-[min(560px,64vh)] desk:self-center" />
          <WaitlistForm
            values={values}
            onValuesChange={setValues}
            onJoined={handleJoined}
            firstInputRef={firstInputRef}
          />
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
