"use client";

import { useState, useTransition } from "react";

import { confirmTransferAction, rejectTransferAction } from "@/app/actions/admin-sample.action";
import type { AdminActionResult } from "@/app/utils/admin-state";
import { formatRupiah } from "@/components/sample/utils/sample-copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AdminConfirmDialog } from "./AdminConfirmDialog";

interface AdminTransferDecisionProps {
  requestId: string;
  code: string;
  /** The courier fee the sampler should have sent, in rupiah. */
  amount: number;
  canConfirm: boolean;
  canReject: boolean;
}

/** Confirm and Reject for one bank transfer, each behind a popup that says what the founder is deciding. */
export function AdminTransferDecision({ requestId, code, amount, canConfirm, canReject }: AdminTransferDecisionProps) {
  const [open, setOpen] = useState<"confirm" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  function show(dialog: "confirm" | "reject") {
    setError(null);
    setOpen(dialog);
  }

  function run(task: () => Promise<AdminActionResult>) {
    startTransition(async () => {
      const result = await task();
      if (result.ok) {
        setOpen(null);
        setDone(result.message);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex gap-2">
        {canConfirm && <Button size="sm" onClick={() => show("confirm")}>Confirm</Button>}
        {canReject && <Button size="sm" variant="ghost" className="text-wi-ink-500 hover:text-wi-error" onClick={() => show("reject")}>Reject</Button>}
      </div>
      {done !== null && <p role="status" className="m-0 text-xs text-wi-black">{done}</p>}
      <AdminConfirmDialog
        open={open === "confirm"}
        onOpenChange={(isOpen) => { if (!isOpen) setOpen(null); }}
        title={`Confirm ${code}?`}
        body={`Confirm only after ${formatRupiah(amount)} with ${code} shows in the bank. A screenshot is not proof. The sampler gets the paid email and the box can be booked.`}
        confirmLabel="Confirm payment"
        savingLabel="Confirming"
        isSaving={isSaving}
        error={error}
        onConfirm={() => run(() => confirmTransferAction(requestId))}
      />
      <AdminConfirmDialog
        open={open === "reject"}
        onOpenChange={(isOpen) => { if (!isOpen) setOpen(null); }}
        title={`Reject ${code}?`}
        body={`Reject only when ${formatRupiah(amount)} with ${code} still hasn't arrived after a working day: some transfers between banks land late. The request is cancelled and its box goes back to the batch. If the money turns up later, it is a refund.`}
        confirmLabel="Reject"
        savingLabel="Rejecting"
        isSaving={isSaving}
        error={error}
        onConfirm={() => run(() => rejectTransferAction(requestId, note))}
        isDestructive
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-wi-ink-500">Note (optional)</span>
          <Input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="No transfer after a working day" className="bg-wi-paper" />
        </label>
      </AdminConfirmDialog>
    </div>
  );
}
