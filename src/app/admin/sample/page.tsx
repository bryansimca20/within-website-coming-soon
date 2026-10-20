import Link from "next/link";

import { adminLogoutAction } from "@/app/actions/admin-auth.action";
import { AdminSampleSummary } from "@/components/admin/AdminSampleSummary";
import { AdminShipRunForm } from "@/components/admin/AdminShipRunForm";
import { toAdminRow } from "@/components/admin/utils/admin-rows";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db/client";
import { sampleBatches, type SampleRequestStatus, sampleRequestStatusEnum } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-session";
import { SampleAdminDataService } from "@/services/sample-admin-data.service";
import { SampleFeedbackService } from "@/services/sample-feedback.service";
import { SampleRequestService } from "@/services/sample-request.service";

export const dynamic = "force-dynamic";

function isStatus(value: string | undefined): value is SampleRequestStatus {
  return value !== undefined && (sampleRequestStatusEnum.enumValues as string[]).includes(value);
}

/** The founders' sampling dashboard. */
export default async function AdminSamplePage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin();
  const { status, q } = await searchParams;
  const [batch] = await db.select().from(sampleBatches).orderBy(sampleBatches.createdAt).limit(1);
  if (batch === undefined) return <p className="p-6">No batch exists. Run the migrations.</p>;

  await SampleRequestService.expireLapsedHolds(db, batch.id, new Date());
  const [summary, requests, unmatched] = await Promise.all([
    SampleRequestService.summary(db, batch.id),
    SampleRequestService.listForAdmin(db, batch.id, { status: isStatus(status) ? status : undefined, query: q }),
    SampleFeedbackService.listUnmatched(db),
  ]);
  const ids = requests.map((request) => request.id);
  const [shipments, feedback] = await Promise.all([
    SampleAdminDataService.latestShipments(db, ids),
    SampleAdminDataService.feedbackByRequest(db, ids),
  ]);
  const rows = requests.map((request) => toAdminRow(request, shipments.get(request.id) ?? null, feedback.get(request.id) ?? null));

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <span className="text-2xs font-bold tracking-[0.14em] text-wi-ink-500 uppercase">WITHIN sampling</span>
        <div className="flex gap-2">
          <Link href="/admin/sample/export" prefetch={false} className={buttonVariants({ variant: "secondary", size: "sm" })}>Export CSV</Link>
          <form action={adminLogoutAction}><button type="submit" className={buttonVariants({ variant: "ghost", size: "sm" })}>Sign out</button></form>
        </div>
      </div>
      <AdminSampleSummary batch={batch} summary={summary} />
      <form className="flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q ?? ""} placeholder="Box, name or email" className="h-9 min-w-56 flex-1 rounded-[var(--wi-radius-control)] border border-wi-line-strong bg-wi-paper px-3 text-sm" />
        <select name="status" defaultValue={isStatus(status) ? status : ""} className="h-9 rounded-[var(--wi-radius-control)] border border-wi-line-strong bg-wi-paper px-2 text-sm">
          <option value="">All statuses</option>
          {sampleRequestStatusEnum.enumValues.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <button type="submit" className={buttonVariants({ variant: "secondary", size: "sm" })}>Filter</button>
        {(q !== undefined || status !== undefined) && <Link href="/admin/sample" className={buttonVariants({ variant: "ghost", size: "sm" })}>Clear</Link>}
      </form>
      <AdminShipRunForm rows={rows} />
      {unmatched.length > 0 && (
        <section className="rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper p-4 text-sm">
          <h2 className="m-0 mb-2 text-2xs font-bold tracking-[0.14em] text-wi-ink-500 uppercase">Feedback with no matching box ({unmatched.length})</h2>
          <ul className="m-0 list-none p-0">{unmatched.map((row) => <li key={row.id}>{row.email}: taste {row.tasteRating}, {row.wouldReachAgain}{row.comment === null ? "" : `, "${row.comment}"`}</li>)}</ul>
        </section>
      )}
    </main>
  );
}
