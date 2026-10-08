import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

import { WAITLIST_COPY } from "./utils/waitlist-copy";

interface WaitlistSuccessProps {
  /** The address the launch-day code will go to. */
  email: string;
  /** Returns to the form with the visitor's details still filled in. */
  onEdit: () => void;
}

/** Confirmation shown in the same sheet once the visitor is on the list. */
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
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener"
          className="text-brand-ink underline hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        >
          {INSTAGRAM_HANDLE}
        </a>
        .
      </p>
      <span className="font-script text-[30px] leading-9 desk:text-[32px] desk:leading-10">
        {success.signOff}
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="h-12 cursor-pointer border border-brand-ink bg-transparent text-[15px] font-semibold text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink desk:self-start desk:px-6"
      >
        {success.edit}
      </button>
    </div>
  );
}
