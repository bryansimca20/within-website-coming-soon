"use client";

import { useState, useTransition } from "react";

import { setBatchPhaseAction } from "@/app/actions/admin-batch.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogPopup, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SampleBatchPhase } from "@/db/schema";

const STATUS_ITEMS: Array<{ value: SampleBatchPhase; label: string }> = [
  { value: "upcoming", label: "Coming soon" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

/** What the confirmation popup says for each status, in the founder's terms: what visitors will see. */
function confirmCopy(phase: SampleBatchPhase, label: string, capacity: number) {
  if (phase === "open") {
    return {
      title: `Open ${label}?`,
      body: `/sample starts taking requests for ${label}, up to ${capacity} boxes. People can claim and pay right away.`,
      confirm: `Open ${label}`,
    };
  }
  if (phase === "closed") {
    return {
      title: `Close ${label}?`,
      body: `/sample stops taking requests and shows "${label} is claimed." Anyone already holding a box can still pay until their hold runs out.`,
      confirm: `Close ${label}`,
    };
  }
  return {
    title: `Set ${label} to Coming soon?`,
    body: "/sample shows the coming-soon page, with no form. Anyone already holding a box can still pay until their hold runs out.",
    confirm: "Set to Coming soon",
  };
}

interface AdminBatchStatusControlProps {
  batchId: string;
  label: string;
  capacity: number;
  phase: SampleBatchPhase;
}

/** A batch's status as a dropdown. Picking a new status opens a popup; nothing changes until it is confirmed. */
export function AdminBatchStatusControl({ batchId, label, capacity, phase }: AdminBatchStatusControlProps) {
  const [pending, setPending] = useState<SampleBatchPhase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();
  const copy = pending === null ? null : confirmCopy(pending, label, capacity);

  function pick(value: string | null) {
    const next = STATUS_ITEMS.find((item) => item.value === value)?.value;
    if (next === undefined || next === phase) return;
    setError(null);
    setPending(next);
  }

  function confirm() {
    if (pending === null) return;
    startTransition(async () => {
      const result = await setBatchPhaseAction(batchId, pending);
      if (result.ok) {
        setPending(null);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <>
      <Select items={STATUS_ITEMS} value={phase} onValueChange={pick}>
        <SelectTrigger className="h-8 w-36 bg-wi-paper" aria-label={`Status of ${label}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Dialog open={pending !== null} onOpenChange={(open) => { if (!open && !isSaving) setPending(null); }}>
        <DialogPortal>
          <DialogBackdrop className="bg-wi-black/40" />
          <DialogPopup className="top-1/2 left-1/2 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper p-5 text-wi-ink-700 shadow-[var(--wi-shadow-lg)] data-ending-style:opacity-0 data-starting-style:opacity-0">
            {copy !== null && (
              <>
                <DialogTitle className="m-0 text-h3 font-medium text-wi-black">{copy.title}</DialogTitle>
                <p className="m-0 text-sm leading-relaxed">{copy.body}</p>
                {error !== null && <p role="alert" className="m-0 text-sm font-medium text-wi-error">{error}</p>}
                <div className="flex justify-end gap-2">
                  <DialogClose render={<Button type="button" size="sm" variant="ghost" disabled={isSaving} />}>Cancel</DialogClose>
                  <Button type="button" size="sm" onClick={confirm} disabled={isSaving || error !== null}>
                    {isSaving ? "Saving" : copy.confirm}
                  </Button>
                </div>
              </>
            )}
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    </>
  );
}
