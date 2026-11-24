import Link from "next/link";

import { readBankTransferDetails, whatsappUrl } from "@/app/utils/bank-transfer";
import type { SampleFeedbackRow, SamplePayment, SampleRequest, SampleShipment } from "@/db/schema";

import { SamplePayNow } from "./SamplePayNow";
import { SampleShell } from "./SampleShell";
import { SampleSnapScript } from "./SampleSnapScript";
import { SampleStatusTimeline } from "./SampleStatusTimeline";
import { SampleTransferPay } from "./SampleTransferPay";
import { SampleTransferProof } from "./SampleTransferProof";
import { SampleTransferSteps } from "./SampleTransferSteps";
import { formatMinutes } from "./utils/jakarta-date";
import { formatRupiah, SAMPLE_COPY } from "./utils/sample-copy";
import { buildStatusSteps } from "./utils/status-steps";

const { status, transfer } = SAMPLE_COPY;

interface SampleStatusPageProps {
  request: SampleRequest;
  boxWord: string;
  batchLabel: string;
  minutesLeft: number;
  payment: SamplePayment | null;
  shipment: SampleShipment | null;
  feedback: SampleFeedbackRow | null;
  /** Midtrans requests only; a bank-transfer request never loads snap.js. */
  snapScriptUrl: string | null;
}

const LABEL_CLASS = "m-0 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted";

function headline(request: SampleRequest): string {
  if (request.status === "pending_payment") return status.almost(request.firstName);
  if (request.status === "awaiting_confirmation") return transfer.proofHeadline;
  if (request.status === "expired") return status.lapsedHeadline(request.firstName);
  if (request.status === "cancelled") return status.cancelledHeadline;
  return status.youreIn(request.firstName);
}

/** `/sample/r/[token]`: where a sampler's box is, what they owe if anything, and the one ask. */
export function SampleStatusPage(props: SampleStatusPageProps) {
  const { request, shipment, feedback } = props;
  const isInPerson = request.source === "in_person";
  const hasShipped = request.status === "shipped" || request.status === "delivered";
  const code = request.paymentCode;
  const bank = readBankTransferDetails();
  const transferStep: 1 | 2 | null = code === null ? null : request.status === "pending_payment" ? 1 : request.status === "awaiting_confirmation" ? 2 : null;
  const proofUrl =
    code === null ? null : whatsappUrl(bank.whatsappNumber, transfer.proofMessage(code, formatRupiah(request.shippingFee ?? 0), request.fullName));

  return (
    <SampleShell>
      {transferStep !== null && (
        <div className="mb-6">
          <SampleTransferSteps step={transferStep} />
        </div>
      )}
      <div className="flex flex-col gap-2 pb-8">
        {!isInPerson && <p className={LABEL_CLASS}>{status.boxOf(props.boxWord, props.batchLabel).toUpperCase()}</p>}
        <h1 className="m-0 text-[32px] leading-9 font-normal tracking-[-0.02em] desk:text-[44px] desk:leading-[48px]">{headline(request)}</h1>
      </div>

      {request.status === "pending_payment" && code !== null && (
        <SampleTransferPay token={request.accessToken} code={code} bank={bank} amount={request.shippingFee ?? 0} holdLeft={status.holdLeft(formatMinutes(props.minutesLeft))} />
      )}

      {request.status === "awaiting_confirmation" && code !== null && <SampleTransferProof code={code} proofUrl={proofUrl} />}

      {request.status === "pending_payment" && code === null && (
        <section className="mb-10 flex flex-col gap-4 border-t-[6px] border-brand-ink pt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px]">{status.payLabel}</span>
            <span className="text-[15px] font-semibold tabular-nums">{formatRupiah(request.shippingFee ?? 0)}</span>
          </div>
          <p className="m-0 text-[15px] leading-[22px] text-brand-muted">{status.holdLeft(formatMinutes(props.minutesLeft))}</p>
          {props.snapScriptUrl !== null && <SampleSnapScript src={props.snapScriptUrl} />}
          <SamplePayNow token={request.accessToken} amount={request.shippingFee ?? 0} redirectUrl={props.payment?.snapRedirectUrl ?? null} />
        </section>
      )}

      {request.status === "expired" && (
        <section className="mb-10 flex flex-col gap-4">
          <p className="m-0 text-[17px] leading-[26px]">{status.lapsedBody}</p>
          <Link href="/sample" className="flex h-14 items-center justify-center bg-brand-ink text-base font-semibold text-brand-mist no-underline">
            {status.lapsedCta}
          </Link>
          {proofUrl !== null && (
            <a href={proofUrl} target="_blank" rel="noopener" className="self-center py-2 text-[15px] font-semibold underline underline-offset-4">
              {transfer.lapsedProof}
            </a>
          )}
        </section>
      )}

      {request.status === "cancelled" && proofUrl !== null && (
        <section className="mb-10">
          <a href={proofUrl} target="_blank" rel="noopener" className="text-[17px] leading-[26px] underline underline-offset-4">
            {transfer.cancelledProof}
          </a>
        </section>
      )}

      {!isInPerson && request.status !== "expired" && request.status !== "cancelled" && (
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

      {!isInPerson && (
        <section className="flex flex-col gap-1 border-t border-brand-ink pt-4 text-[15px] leading-[22px]">
          <p className={`${LABEL_CLASS} mb-1`}>{status.deliveryHeading}</p>
          <span>{request.fullName}</span>
          <span>{request.addressLine}</span>
          <span className="text-brand-muted">{request.areaName}</span>
          <span className="text-brand-muted">{request.courierServiceName}</span>
        </section>
      )}
    </SampleShell>
  );
}
