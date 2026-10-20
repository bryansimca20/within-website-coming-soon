"use client";

import type { RefObject } from "react";

import { WithinLogo } from "@/components/brand/WithinLogo";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

import { WaitlistCloseGlyph, WaitlistInstagramGlyph } from "./svg/WaitlistGlyphs";
import { formatJoinedTitle, WAITLIST_COPY } from "./utils/waitlist-copy";

interface WaitlistJoinedDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** The visitor's first name, as the form normalized it. */
  firstName: string;
  /** Returns to the form with the visitor's details still filled in. */
  onEdit: () => void;
  /** The call to action that opened the dialog; focus returns there on close. */
  triggerRef: RefObject<HTMLButtonElement | null>;
}

/** Shared by every staggered line of the note: a short lift and fade from the popup's starting style. */
const LINE_CLASS =
  "transition-[opacity,translate] duration-[700ms] ease-brand group-data-starting-style:translate-y-2.5 group-data-starting-style:opacity-0 motion-reduce:transition-none";

/** One paragraph lands every 600ms after the headline, paced so each is read before the next arrives. */
const PARAGRAPH_DELAY_CLASS = ["delay-[1000ms]", "delay-[1600ms]", "delay-[2200ms]"] as const;

/**
 * The confirmation: a centred popup on every screen size, read rather than operated, so it enters
 * slower than the sheet and its lines arrive one at a time, paced for reading. Opens the moment the
 * sheet leaves. Reduced motion shows it whole at once.
 */
export function WaitlistJoinedDialog({
  isOpen,
  onOpenChange,
  firstName,
  onEdit,
  triggerRef,
}: WaitlistJoinedDialogProps) {
  const { joined } = WAITLIST_COPY;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop className="bg-brand-ink/60" />
        <DialogPopup
          finalFocus={triggerRef}
          className="group inset-x-4 top-1/2 -translate-y-1/2 border-t-[6px] border-brand-ink bg-white px-5 pt-8 pb-6 text-brand-ink duration-[360ms] delay-[140ms] data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-ending-style:delay-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0 desk:inset-x-auto desk:left-1/2 desk:w-[calc(100vw-48px)] desk:max-w-[480px] desk:-translate-x-1/2 desk:border-t-8 desk:px-8 desk:pt-9 desk:pb-8"
        >
          <DialogClose
            aria-label={WAITLIST_COPY.close}
            className="absolute top-3.5 right-2.5 flex size-11 cursor-pointer items-center justify-center text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink desk:top-4 desk:right-4"
          >
            <WaitlistCloseGlyph className="size-5" />
          </DialogClose>
          <DialogTitle
            className={`${LINE_CLASS} m-0 mb-4 pr-9 text-[32px] leading-9 font-normal tracking-[-0.02em] text-pretty delay-[380ms] desk:text-4xl desk:leading-10`}
          >
            {formatJoinedTitle(firstName)}
          </DialogTitle>
          <div className="flex flex-col gap-3">
            {joined.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={`${LINE_CLASS} m-0 text-[17px] leading-[26px] desk:text-lg desk:leading-7 ${PARAGRAPH_DELAY_CLASS[index] ?? PARAGRAPH_DELAY_CLASS[PARAGRAPH_DELAY_CLASS.length - 1]}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div
            aria-hidden
            className="mt-[18px] h-px origin-left scale-x-100 bg-brand-ink/24 transition-[scale] duration-[600ms] delay-[2700ms] ease-brand group-data-starting-style:scale-x-0 motion-reduce:transition-none"
          />
          <div className={`${LINE_CLASS} flex items-baseline justify-between pt-3 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted delay-[2800ms]`}>
            <WithinLogo height={13} />
            <span>{joined.signaturePlace}</span>
          </div>
          <div className={`${LINE_CLASS} mt-[18px] flex flex-col gap-1 delay-[3000ms]`}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener"
              className="flex h-[52px] items-center justify-center gap-2.5 bg-brand-ink text-base font-semibold text-brand-mist no-underline transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] motion-reduce:transition-none desk:h-14"
            >
              <WaitlistInstagramGlyph className="size-5" />
              <span>
                {joined.follow}
                {INSTAGRAM_HANDLE}
              </span>
            </a>
            <button
              type="button"
              onClick={onEdit}
              className="-mb-2 h-10 cursor-pointer self-center bg-transparent px-3 text-[13px] font-semibold text-brand-muted underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              {joined.edit}
            </button>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
