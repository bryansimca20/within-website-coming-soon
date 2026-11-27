import Link from "next/link";

import { whatsappUrl } from "@/app/utils/bank-transfer";
import { formatJakarta } from "@/components/sample/utils/jakarta-date";
import { formatRupiah } from "@/components/sample/utils/sample-copy";
import { Badge } from "@/components/ui/badge";
import type { SampleRequest } from "@/db/schema";
import { SampleRequestService } from "@/services/sample-request.service";
import { SampleTransferService } from "@/services/sample-transfer.service";

import { AdminTransferDecision } from "./AdminTransferDecision";

interface AdminTransfersToConfirmProps {
  /** The batch's reported transfers, oldest report first. */
  requests: SampleRequest[];
  now: Date;
}

/** The founder's queue for a bank-transfer batch: each reported transfer, how long it has waited, and Confirm or Reject. */
export function AdminTransfersToConfirm({ requests, now }: AdminTransfersToConfirmProps) {
  if (requests.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-[var(--wi-radius-card)] bg-wi-paper p-5 text-sm shadow-[var(--wi-shadow-card)]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="m-0 text-sm font-medium text-wi-black">Payments to confirm ({requests.length})</h2>
        <p className="m-0 text-xs text-wi-ink-500">Confirm only what you see in the bank. A screenshot is not proof.</p>
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        {requests.map((request) => {
          const chat = whatsappUrl(request.whatsapp);
          return (
            <li key={request.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-wi-line py-3 first:border-t-0">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="wi-readout text-base text-wi-black">{request.paymentCode}</span>
                  <Link href={`/admin/requests/${request.id}`} className="text-wi-ink-500 underline-offset-4 hover:text-wi-black hover:underline">
                    {SampleRequestService.boxLabel(request.batchId, request.boxNumber)}
                  </Link>
                  {SampleTransferService.isOverdue(request, now) && <Badge variant="destructive">Overdue</Badge>}
                  {request.isTest && <Badge variant="secondary">Test</Badge>}
                </div>
                <span className="text-wi-black">
                  {request.fullName}, <span className="tabular-nums">{formatRupiah(request.shippingFee ?? 0)}</span>
                </span>
                <span className="text-xs text-wi-ink-500">
                  {request.transferReportedAt === null ? "" : `Reported ${formatJakarta(request.transferReportedAt)}`}
                  {chat !== null && (
                    <>
                      {" · "}
                      <a href={chat} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-wi-black">WhatsApp {request.firstName}</a>
                    </>
                  )}
                </span>
              </div>
              <AdminTransferDecision requestId={request.id} code={request.paymentCode ?? ""} amount={request.shippingFee ?? 0} canConfirm canReject />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
