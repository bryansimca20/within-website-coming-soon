"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reportTransferAction } from "@/app/actions/report-transfer.action";
import { ReportTransferOutcome } from "@/app/utils/sample-state";
import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { SAMPLE_COPY } from "./utils/sample-copy";

const { transfer } = SAMPLE_COPY;

interface SampleTransferReportButtonProps {
  token: string;
}

/** "I've transferred": records the report, then re-renders the page, which shows whatever state is now stored. */
export function SampleTransferReportButton({ token }: SampleTransferReportButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function report() {
    setMessage(null);
    startTransition(async () => {
      const result = await reportTransferAction(token);
      if (result.outcome === ReportTransferOutcome.Error) {
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
        onClick={report}
        disabled={isPending}
        className="flex h-14 cursor-pointer items-center justify-between bg-flavor-orange px-5 text-base font-semibold text-brand-ink transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none"
      >
        <span>{isPending ? transfer.reporting : transfer.reported}</span>
        <WaitlistArrowGlyph />
      </button>
      {message !== null && <p role="alert" className="m-0 text-[13px] font-semibold text-brand-error">{message}</p>}
    </div>
  );
}
