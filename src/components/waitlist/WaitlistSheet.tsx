"use client";

import { type RefObject, useState } from "react";

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ISubscriberInput } from "@/app/utils/subscriber-input";

import { WaitlistForm } from "./WaitlistForm";
import { WaitlistSuccess } from "./WaitlistSuccess";
import { WaitlistCloseGlyph } from "./svg/WaitlistGlyphs";
import { WAITLIST_COPY } from "./utils/waitlist-copy";

const EMPTY_VALUES: ISubscriberInput = { fullName: "", email: "", instagramHandle: "" };

interface WaitlistSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** True once the visitor has signed up; shows the confirmation instead of the form. */
  isJoined: boolean;
  onJoinedChange: (isJoined: boolean) => void;
  /** The call to action that opened the sheet; focus returns there on close. */
  triggerRef: RefObject<HTMLButtonElement | null>;
}

/** The waitlist form: a bottom sheet on phones, a centred 480px modal on desktop. */
export function WaitlistSheet({
  isOpen,
  onOpenChange,
  isJoined,
  onJoinedChange,
  triggerRef,
}: WaitlistSheetProps) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [joinedEmail, setJoinedEmail] = useState("");
  const { sheet } = WAITLIST_COPY;

  function handleJoined(email: string) {
    setJoinedEmail(email);
    onJoinedChange(true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop className="bg-brand-ink/60" />
        <DialogPopup
          finalFocus={triggerRef}
          className="inset-x-0 bottom-0 max-h-dvh gap-4 overflow-y-auto border-t-[6px] border-brand-ink bg-white px-4 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] text-brand-ink data-ending-style:translate-y-full data-starting-style:translate-y-full desk:inset-x-auto desk:top-1/2 desk:bottom-auto desk:left-1/2 desk:w-[calc(100vw-48px)] desk:max-w-[480px] desk:-translate-x-1/2 desk:-translate-y-1/2 desk:gap-5 desk:border-t-8 desk:px-8 desk:pt-7 desk:pb-8 desk:data-ending-style:-translate-y-1/2 desk:data-ending-style:opacity-0 desk:data-starting-style:-translate-y-1/2 desk:data-starting-style:scale-[0.96] desk:data-starting-style:opacity-0 desk:data-ending-style:scale-[0.96]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 desk:gap-1.5">
              <p className="m-0 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted">
                {sheet.label}
              </p>
              <DialogTitle className="m-0 text-[26px] leading-[30px] font-normal tracking-[-0.01em] desk:text-[32px] desk:leading-9">
                {sheet.title}
              </DialogTitle>
            </div>
            <DialogClose
              aria-label={WAITLIST_COPY.close}
              className="-mt-2 -mr-2 flex size-11 flex-none cursor-pointer items-center justify-center text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink desk:-mr-2.5"
            >
              <WaitlistCloseGlyph className="size-5" />
            </DialogClose>
          </div>
          {isJoined ? (
            <WaitlistSuccess email={joinedEmail} onEdit={() => onJoinedChange(false)} />
          ) : (
            <WaitlistForm values={values} onValuesChange={setValues} onJoined={handleJoined} />
          )}
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
