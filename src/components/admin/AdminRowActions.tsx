"use client";

import { useState, useTransition } from "react";

import { refreshShipmentAction, resendSampleEmailAction } from "@/app/actions/admin-sample.action";
import type { AdminActionResult } from "@/app/utils/admin-state";
import { Button } from "@/components/ui/button";
import { SampleEmailKind } from "@/services/sample-email-templates";

interface AdminRowActionsProps {
  requestId: string;
  /** The live shipment, when there is one, for the Biteship refresh. */
  shipmentId: string | null;
  /** In-person rows have no payment or shipment, so only the seeded email and the reminder apply. */
  isInPerson: boolean;
}

const RESEND: Array<{ kind: SampleEmailKind; label: string }> = [
  { kind: SampleEmailKind.Paid, label: "Resend paid" },
  { kind: SampleEmailKind.Shipped, label: "Resend shipped" },
  { kind: SampleEmailKind.Delivered, label: "Resend delivered" },
  { kind: SampleEmailKind.FeedbackReminder, label: "Resend reminder" },
];
const RESEND_IN_PERSON = [
  { kind: SampleEmailKind.Seeded, label: "Resend seeded" },
  { kind: SampleEmailKind.FeedbackReminder, label: "Resend reminder" },
];

/** Email resends and the Biteship refresh, each reporting its own result. */
export function AdminRowActions({ requestId, shipmentId, isInPerson }: AdminRowActionsProps) {
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(task: () => Promise<AdminActionResult>) {
    startTransition(async () => setResult(await task()));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {shipmentId !== null && (
          <Button size="sm" variant="secondary" disabled={isPending} onClick={() => run(() => refreshShipmentAction(shipmentId))}>Refresh from Biteship</Button>
        )}
        {(isInPerson ? RESEND_IN_PERSON : RESEND).map((item) => (
          <Button key={item.kind} size="sm" variant="ghost" disabled={isPending} onClick={() => run(() => resendSampleEmailAction(requestId, item.kind))}>{item.label}</Button>
        ))}
      </div>
      {result !== null && <p role="status" className="m-0 text-sm text-wi-black">{result.message}</p>}
    </div>
  );
}
