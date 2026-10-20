"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reopenPaymentAction } from "@/app/actions/reopen-payment.action";
import { ReopenOutcome } from "@/app/utils/sample-state";
import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { formatRupiah, SAMPLE_COPY } from "./utils/sample-copy";
import { openSnap } from "./utils/snap";

interface SamplePayNowProps {
  token: string;
  amount: number;
  /** The hosted Snap page of the last attempt, for when snap.js is blocked. */
  redirectUrl: string | null;
}

/** "Pay now": reuses the open Snap attempt or starts a fresh one, then refreshes the page. */
export function SamplePayNow({ token, amount, redirectUrl }: SamplePayNowProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState(redirectUrl);
  const [isPending, startTransition] = useTransition();

  function pay() {
    setMessage(null);
    startTransition(async () => {
      const result = await reopenPaymentAction(token);
      if (result.outcome === ReopenOutcome.Pay) {
        setFallbackUrl(result.snapRedirectUrl);
        if (!openSnap(result.snapToken, () => router.refresh())) window.location.assign(result.snapRedirectUrl);
        return;
      }
      if (result.outcome === ReopenOutcome.Error) {
        setMessage(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={pay}
        disabled={isPending}
        className="flex h-14 cursor-pointer items-center justify-between bg-flavor-orange px-5 text-base font-semibold text-brand-ink transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none"
      >
        <span>{`${SAMPLE_COPY.status.payNow} ${formatRupiah(amount)}`}</span>
        <WaitlistArrowGlyph />
      </button>
      {fallbackUrl !== null && (
        <a href={fallbackUrl} className="self-center py-2 text-[13px] font-semibold text-brand-muted underline">
          {SAMPLE_COPY.status.payFallback}
        </a>
      )}
      {message !== null && <p role="alert" className="m-0 text-[13px] font-semibold">{message}</p>}
    </div>
  );
}
