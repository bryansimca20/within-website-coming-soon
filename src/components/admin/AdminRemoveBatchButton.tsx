"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { removeBatchAction } from "@/app/actions/admin-batch.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogPopup, DialogPortal, DialogTitle } from "@/components/ui/dialog";

interface AdminRemoveBatchButtonProps {
  batchId: string;
  label: string;
}

/** "Remove" for a batch with no requests, behind a confirmation popup. Its page is gone afterwards, so it returns to the overview. */
export function AdminRemoveBatchButton({ batchId, label }: AdminRemoveBatchButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, startTransition] = useTransition();
  const router = useRouter();

  function remove() {
    startTransition(async () => {
      const result = await removeBatchAction(batchId);
      if (result.ok) {
        setIsOpen(false);
        router.push("/admin");
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <>
      <Button size="sm" variant="ghost" className="text-wi-ink-500 hover:text-wi-error" onClick={() => { setError(null); setIsOpen(true); }}>Remove</Button>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!isRemoving) setIsOpen(open); }}>
        <DialogPortal>
          <DialogBackdrop className="bg-wi-black/40" />
          <DialogPopup className="top-1/2 left-1/2 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper p-5 text-wi-ink-700 shadow-[var(--wi-shadow-lg)] data-ending-style:opacity-0 data-starting-style:opacity-0">
            <DialogTitle className="m-0 text-h3 font-medium text-wi-black">Remove {label}?</DialogTitle>
            <p className="m-0 text-sm leading-relaxed">{label} has no requests, so nothing else is lost. The next batch you create takes its number if it was the newest.</p>
            {error !== null && <p role="alert" className="m-0 text-sm font-medium text-wi-error">{error}</p>}
            <div className="flex justify-end gap-2">
              <DialogClose render={<Button type="button" size="sm" variant="ghost" disabled={isRemoving} />}>Cancel</DialogClose>
              <Button type="button" size="sm" variant="destructive" onClick={remove} disabled={isRemoving || error !== null}>
                {isRemoving ? "Removing" : `Remove ${label}`}
              </Button>
            </div>
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    </>
  );
}
