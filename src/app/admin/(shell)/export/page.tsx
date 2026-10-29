import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db/client";
import { currentAdminBatch } from "@/lib/admin-batch";
import { requireAdmin } from "@/lib/admin-session";
import { SampleExportService } from "@/services/sample-export.service";

export const dynamic = "force-dynamic";

/** Downloads for the selected batch: its registrations and its feedback, one CSV each. */
export default async function AdminExportPage() {
  await requireAdmin();
  const batch = await currentAdminBatch(db);
  if (batch === null) return <p className="p-6">No batch exists. Create one on the Batches page.</p>;
  const { registrations, feedback } = await SampleExportService.loadBatch(db, batch.id);
  const files = [
    { href: "/admin/export/registrations", title: "Registrations", detail: "Every request: contact, address, courier, attribution and training answers.", rows: registrations.length },
    { href: "/admin/export/feedback", title: "Feedback", detail: "Every check-in matched to a box in this batch, with its intent group.", rows: feedback.length },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-h2 font-medium text-wi-black">Export · {batch.label}</h1>
        <p className="m-0 text-sm text-wi-ink-500">CSV files open in Excel and Google Sheets. Switch batch in the sidebar to export another.</p>
      </div>
      <div className="flex flex-col gap-3">
        {files.map((file) => (
          <section key={file.href} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper p-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="m-0 text-body font-semibold text-wi-black">{file.title} <span className="wi-readout font-normal text-wi-ink-500">· {file.rows} rows</span></h2>
              <p className="m-0 text-sm text-wi-ink-500">{file.detail}</p>
            </div>
            <Link href={file.href} prefetch={false} className={buttonVariants({ variant: "secondary", size: "sm" })}>Download CSV</Link>
          </section>
        ))}
      </div>
    </main>
  );
}
