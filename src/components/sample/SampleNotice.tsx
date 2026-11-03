import Link from "next/link";

import type { ISampleBatchShown } from "@/services/sample-request.service";

import { batchCopy, SAMPLE_COPY } from "./utils/sample-copy";

/** `full` names the batch when there is one; with no batch at all it says samples aren't available. */
type SampleNoticeProps = { kind: "full"; batch: ISampleBatchShown | null } | { kind: "already"; email: string };

/** The two ends that are not a payment: the batch is claimed, or this email already has a box. */
export function SampleNotice(props: SampleNoticeProps) {
  if (props.kind === "already") {
    return (
      <div className="flex flex-col gap-3" role="status">
        <h2 className="m-0 text-[26px] leading-[30px] font-normal tracking-[-0.01em]">{SAMPLE_COPY.already.headline}</h2>
        <p className="m-0 text-[17px] leading-[26px]">{SAMPLE_COPY.already.body(props.email)}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5" role="status">
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-[26px] leading-[30px] font-normal tracking-[-0.01em]">{props.batch === null ? SAMPLE_COPY.closed.headlineNoBatch : batchCopy(props.batch).closedHeadline}</h2>
        <p className="m-0 text-[17px] leading-[26px]">{SAMPLE_COPY.closed.body}</p>
      </div>
      <Link href="/" className="flex h-14 items-center justify-center bg-brand-ink text-base font-semibold text-brand-mist no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
        {SAMPLE_COPY.closed.cta}
      </Link>
    </div>
  );
}
