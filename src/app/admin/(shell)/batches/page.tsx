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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-h2 font-medium text-wi-black">Batches</h1>
          <p className="m-0 text-sm text-wi-ink-500">Only one batch can be Open at a time. Close it before opening or creating another.</p>
        </div>
        <AdminNewBatchDialog key={next.id} nextLabel={next.label} defaultCapacity={summaries[0]?.batch.capacity ?? 100} openLabel={summaries.find(({ batch }) => batch.phase === "open")?.batch.label ?? null} />
      </div>
      <div className="overflow-x-auto rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper">
        <Table>
          <TableHeader>
            <TableRow>
              {HEADINGS.map((heading) => <TableHead key={heading} className="text-2xs tracking-[0.14em] text-wi-ink-500 uppercase">{heading}</TableHead>)}
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
