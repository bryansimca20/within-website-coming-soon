import { AdminBatchRow } from "@/components/admin/AdminBatchRow";
import { AdminNewBatchDialog } from "@/components/admin/AdminNewBatchDialog";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/db/client";
import { requireAdmin } from "@/lib/admin-session";
import { SampleBatchService } from "@/services/sample-batch.service";

export const dynamic = "force-dynamic";

const HEADINGS = ["Batch", "Status", "Capacity", "Claimed", "Paid", "Shipped", "Delivered", "Feedback", ""];

/** Every batch, newest first: create the next one, set its status and capacity. */
export default async function AdminBatchesPage() {
  await requireAdmin();
  const [summaries, next] = await Promise.all([SampleBatchService.list(db, new Date()), SampleBatchService.nextName(db)]);
  const rows = summaries.map(({ batch, ...counts }) => ({ id: batch.id, label: batch.label, capacity: batch.capacity, phase: batch.phase, ...counts }));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-h1 font-medium tracking-[-0.02em] text-wi-black">Batches</h1>
          <p className="m-0 text-sm text-wi-ink-500">Only one batch can be Open at a time. Close it before opening or creating another.</p>
        </div>
        <AdminNewBatchDialog key={next.id} nextLabel={next.label} defaultCapacity={summaries[0]?.batch.capacity ?? 100} openLabel={summaries.find(({ batch }) => batch.phase === "open")?.batch.label ?? null} />
      </div>
      <div className="overflow-x-auto rounded-[var(--wi-radius-card)] bg-wi-paper px-2 shadow-[var(--wi-shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              {HEADINGS.map((heading) => <TableHead key={heading} className="text-xs text-wi-ink-500">{heading}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => <AdminBatchRow key={row.id} row={row} />)}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
