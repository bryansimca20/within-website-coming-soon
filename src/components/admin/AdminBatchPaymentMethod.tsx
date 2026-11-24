"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setBatchPaymentMethodAction } from "@/app/actions/admin-batch.action";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SamplePaymentMethod } from "@/db/schema";

import { AdminConfirmDialog } from "./AdminConfirmDialog";
import { PAYMENT_METHOD_LABEL } from "./utils/admin-status";

const PAYMENT_METHOD_ITEMS: Array<{ value: SamplePaymentMethod; label: string }> = [
  { value: "midtrans", label: PAYMENT_METHOD_LABEL.midtrans },
  { value: "bank_transfer", label: PAYMENT_METHOD_LABEL.bank_transfer },
];

/** What the confirmation popup says for each method, in terms of what new samplers will do. */
function confirmCopy(method: SamplePaymentMethod, label: string) {
  if (method === "bank_transfer") {
    return {
      title: `Take ${label} payments by bank transfer?`,
      body: `New requests in ${label} pay the courier fee by bank transfer and send the proof on WhatsApp. You confirm each payment under Payments to confirm. Requests made before keep the way they started.`,
      confirm: "Use bank transfer",
    };
  }
  return {
    title: `Take ${label} payments through Midtrans?`,
    body: `New requests in ${label} pay the courier fee through Midtrans. Requests made before keep the way they started.`,
    confirm: "Use Midtrans",
  };
}

interface AdminBatchPaymentMethodProps {
  batchId: string;
  label: string;
  method: SamplePaymentMethod;
}

/** How a batch takes the courier fee. Picking the other method opens a popup; nothing changes until it is confirmed. */
export function AdminBatchPaymentMethod({ batchId, label, method }: AdminBatchPaymentMethodProps) {
  const [pending, setPending] = useState<SamplePaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();
  const router = useRouter();
  const copy = confirmCopy(pending ?? method, label);

  function pick(value: string | null) {
    const next = PAYMENT_METHOD_ITEMS.find((item) => item.value === value)?.value;
    if (next === undefined || next === method) return;
    setError(null);
    setPending(next);
  }

  function confirm() {
    if (pending === null) return;
    startTransition(async () => {
      const result = await setBatchPaymentMethodAction(batchId, pending);
      if (result.ok) {
        setPending(null);
        // revalidatePath only refreshes /admin itself at once; the batch page sits below it, so re-render it here.
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span>Payment</span>
      <Select items={PAYMENT_METHOD_ITEMS} value={method} onValueChange={pick}>
        <SelectTrigger aria-label={`Payment method of ${label}`} className="bg-wi-paper text-wi-black">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false} className="min-w-40 p-1">
          {PAYMENT_METHOD_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value} className="h-8 pl-2.5">{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AdminConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => { if (!open) setPending(null); }}
        title={copy.title}
        body={copy.body}
        confirmLabel={copy.confirm}
        savingLabel="Saving"
        isSaving={isSaving}
        error={error}
        onConfirm={confirm}
      />
    </div>
  );
}
