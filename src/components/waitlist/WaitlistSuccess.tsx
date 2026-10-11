import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

import { WaitlistInstagramGlyph } from "./svg/WaitlistGlyphs";
import { WAITLIST_COPY } from "./utils/waitlist-copy";

interface WaitlistSuccessProps {
  /** The address the launch-day code will go to. */
  email: string;
  /** Returns to the form with the visitor's details still filled in. */
  onEdit: () => void;
}

/** Confirmation shown in the same sheet, with the Instagram follow as the next step. */
export function WaitlistSuccess({ email, onEdit }: WaitlistSuccessProps) {
  const { success } = WAITLIST_COPY;

  return (
    <div role="status" className="flex flex-col gap-2.5 border-t border-brand-ink/24 pt-3 desk:gap-3 desk:pt-4">
      <p className="m-0 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted">{success.label}</p>
      <p className="m-0 text-xl leading-[26px] font-semibold desk:text-[22px] desk:leading-7">
        {success.title}
      </p>
      <p className="m-0 text-[15px] leading-[22px] text-brand-muted desk:text-base desk:leading-6">
        {success.bodyBeforeEmail}
        <span className="break-all">{email}</span>
        {success.bodyAfterEmail}
      </p>
      <span className="font-script text-[30px] leading-9 desk:text-[32px] desk:leading-10">
        {success.signOff}
      </span>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener"
        className="flex h-[52px] items-center justify-center gap-2.5 bg-brand-ink text-base font-semibold text-brand-mist no-underline transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] motion-reduce:transition-none desk:h-14"
      >
        <WaitlistInstagramGlyph className="size-5" />
        <span>
          {success.follow}
          {INSTAGRAM_HANDLE}
        </span>
      </a>
      <button
        type="button"
        onClick={onEdit}
        className="h-11 cursor-pointer self-center bg-transparent px-3 text-sm font-semibold text-brand-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
      >
        {success.edit}
      </button>
    </div>
  );
}
