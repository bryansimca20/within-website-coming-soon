import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db/client";
import { requireAdmin } from "@/lib/admin-session";
import { SampleExportService } from "@/services/sample-export.service";

export const dynamic = "force-dynamic";

/** Downloads for the in-person samples: their registrations and their feedback, one CSV each. */
export default async function AdminSeededExportPage() {
  await requireAdmin();
  const { registrations, feedback } = await SampleExportService.loadSeeded(db);
  const files = [
    { href: "/admin/seeded/export/registrations", title: "Registrations", detail: "Everyone handed a sample in person: contact, attribution and training answers.", rows: registrations.length },
    { href: "/admin/seeded/export/feedback", title: "Feedback", detail: "Every check-in from an in-person sample, with its intent group.", rows: feedback.length },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-h1 font-medium tracking-[-0.02em] text-wi-black">Export · Seeded</h1>
        <p className="m-0 text-sm text-wi-ink-500">CSV files open in Excel and Google Sheets. Box, address and courier columns stay empty for in-person samples.</p>
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
