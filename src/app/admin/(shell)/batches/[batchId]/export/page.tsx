import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db/client";
import { requireAdmin } from "@/lib/admin-session";
import { SampleBatchService } from "@/services/sample-batch.service";
import { SampleExportService } from "@/services/sample-export.service";

export const dynamic = "force-dynamic";

/** Downloads for one batch: its registrations and its feedback, one CSV each. */
export default async function AdminExportPage({ params }: { params: Promise<{ batchId: string }> }) {
  await requireAdmin();
  const batch = await SampleBatchService.findById(db, (await params).batchId);
  if (batch === null) notFound();
  const { registrations, feedback } = await SampleExportService.loadBatch(db, batch.id);
  const files = [
    { href: `/admin/batches/${batch.id}/export/registrations`, title: "Registrations", detail: "Every request: contact, address, courier, attribution and training answers.", rows: registrations.length },
    { href: `/admin/batches/${batch.id}/export/feedback`, title: "Feedback", detail: "Every check-in matched to a box in this batch, with its intent group.", rows: feedback.length },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-h1 font-medium tracking-[-0.02em] text-wi-black">Export · {batch.label}</h1>
        <p className="m-0 text-sm text-wi-ink-500">CSV files open in Excel and Google Sheets. Each batch exports from its own section in the sidebar.</p>
      </div>
      <div className="flex flex-col gap-3">
        {files.map((file) => (
          <section key={file.href} className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--wi-radius-card)] bg-wi-paper p-5 shadow-[var(--wi-shadow-card)]">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="m-0 text-body font-semibold text-wi-black">{file.title} <span className="ml-1 rounded-full bg-wi-mist px-2 py-0.5 align-middle text-xs font-medium text-wi-ink-500 tabular-nums">{file.rows} rows</span></h2>
              <p className="m-0 text-sm text-wi-ink-500">{file.detail}</p>
            </div>
            <Link href={file.href} prefetch={false} className={buttonVariants({ variant: "secondary", size: "sm" })}>Download CSV</Link>
          </section>
        ))}
      </div>
    </main>
  );
}
