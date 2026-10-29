"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { selectBatchAction } from "@/app/actions/admin-batch.action";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** One batch as the switcher lists it. */
export interface IAdminBatchOption {
  id: string;
  label: string;
  /** "Open · 38 / 150" */
  detail: string;
}

interface AdminBatchSwitcherProps {
  batches: IAdminBatchOption[];
  selectedId: string;
}

/** Picks the batch every per-batch admin page shows; the choice is remembered in a cookie. */
export function AdminBatchSwitcher({ batches, selectedId }: AdminBatchSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const items = batches.map((batch) => ({ value: batch.id, label: batch.label }));

  function select(value: string | null) {
    if (value === null || value === selectedId) return;
    startTransition(async () => {
      await selectBatchAction(value);
      router.refresh();
    });
  }

  return (
    <Select items={items} value={selectedId} onValueChange={select} disabled={isPending}>
      <SelectTrigger className="h-auto w-full bg-wi-paper py-2" aria-label="Batch">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {batches.map((batch) => (
          <SelectItem key={batch.id} value={batch.id}>
            <span className="flex flex-col">
              <span className="font-semibold text-wi-black">{batch.label}</span>
              <span className="text-xs text-wi-ink-500">{batch.detail}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
