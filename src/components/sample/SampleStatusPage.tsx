import Link from "next/link";

import type { SampleFeedbackRow, SamplePayment, SampleRequest, SampleShipment } from "@/db/schema";

import { SamplePayNow } from "./SamplePayNow";
import { SampleShell } from "./SampleShell";
import { SampleSnapScript } from "./SampleSnapScript";
import { SampleStatusTimeline } from "./SampleStatusTimeline";
import { formatMinutes } from "./utils/jakarta-date";
import { formatRupiah, SAMPLE_COPY } from "./utils/sample-copy";
import { buildStatusSteps } from "./utils/status-steps";

const { status } = SAMPLE_COPY;

interface SampleStatusPageProps {
  request: SampleRequest;
  boxWord: string;
  batchLabel: string;
  minutesLeft: number;
  payment: SamplePayment | null;
  shipment: SampleShipment | null;
  feedback: SampleFeedbackRow | null;
  snapScriptUrl: string;
}

const LABEL_CLASS = "m-0 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted";

function headline(request: SampleRequest): string {
  if (request.status === "pending_payment") return status.almost(request.firstName);
  if (request.status === "expired") return status.lapsedHeadline(request.firstName);
  if (request.status === "cancelled") return status.cancelledHeadline;
  return status.youreIn(request.firstName);
}

/** `/sample/r/[token]`: where a sampler's box is, what they owe if anything, and the one ask. */
export function SampleStatusPage(props: SampleStatusPageProps) {
  const { request, shipment, feedback } = props;
  const hasShipped = request.status === "shipped" || request.status === "delivered";

  return (
    <SampleShell>
      <div className="flex flex-col gap-2 pb-8">
        <p className={LABEL_CLASS}>{status.boxOf(props.boxWord, props.batchLabel).toUpperCase()}</p>
        <h1 className="m-0 text-[32px] leading-9 font-normal tracking-[-0.02em] desk:text-[44px] desk:leading-[48px]">{headline(request)}</h1>
      </div>

      {request.status === "pending_payment" && (
        <section className="mb-10 flex flex-col gap-4 border-t-[6px] border-brand-ink pt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px]">{status.payLabel}</span>
            <span className="text-[15px] font-semibold tabular-nums">{formatRupiah(request.shippingFee)}</span>
          </div>
          <p className="m-0 text-[15px] leading-[22px] text-brand-muted">{status.holdLeft(formatMinutes(props.minutesLeft))}</p>
          <SampleSnapScript src={props.snapScriptUrl} />
          <SamplePayNow token={request.accessToken} amount={request.shippingFee} redirectUrl={props.payment?.snapRedirectUrl ?? null} />
        </section>
      )}

      {request.status === "expired" && (
        <section className="mb-10 flex flex-col gap-4">
          <p className="m-0 text-[17px] leading-[26px]">{status.lapsedBody}</p>
          <Link href="/sample" className="flex h-14 items-center justify-center bg-brand-ink text-base font-semibold text-brand-mist no-underline">
            {status.lapsedCta}
          </Link>
        </section>
      )}

      {request.status !== "expired" && request.status !== "cancelled" && (
        <section className="mb-10">
          <SampleStatusTimeline steps={buildStatusSteps(request, shipment)} />
          {shipment?.trackingLink && (
            <a href={shipment.trackingLink} target="_blank" rel="noopener" className="mt-4 inline-block text-[13px] font-semibold underline">
              {status.track}
            </a>
          )}
        </section>
      )}

      {hasShipped && (
        <section className="mb-10 flex flex-col gap-3 bg-brand-mist p-5">
          <p className={LABEL_CLASS}>{status.feedbackLabel}</p>
          {feedback === null ? (
            <>
              <p className="m-0 text-[17px] leading-[26px]">{status.feedbackBody}</p>
              <Link href={`/sample/feedback?code=${request.accessToken}`} className="flex h-14 items-center justify-center bg-brand-ink text-base font-semibold text-brand-mist no-underline">
                {status.feedbackCta}
              </Link>
            </>
          ) : (
            <p className="m-0 text-[17px] leading-[26px]">{status.feedbackDone}</p>
          )}
        </section>
      )}

      <section className="flex flex-col gap-1 border-t border-brand-ink pt-4 text-[15px] leading-[22px]">
        <p className={`${LABEL_CLASS} mb-1`}>{status.deliveryHeading}</p>
        <span>{request.fullName}</span>
        <span>{request.addressLine}</span>
        <span className="text-brand-muted">{request.areaName}</span>
        <span className="text-brand-muted">{request.courierServiceName}</span>
      </section>
    </SampleShell>
  );
}
