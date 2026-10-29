import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import Form from "next/form";
import Link from "next/link";

import { AdminSampleSummary } from "@/components/admin/AdminSampleSummary";
import { AdminShipRunForm } from "@/components/admin/AdminShipRunForm";
import { toAdminRow } from "@/components/admin/utils/admin-rows";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db/client";
import { type SampleRequestStatus, sampleRequestStatusEnum } from "@/db/schema";
import { currentAdminBatch } from "@/lib/admin-batch";
import { requireAdmin } from "@/lib/admin-session";
import { SampleAdminDataService } from "@/services/sample-admin-data.service";
import { SampleFeedbackService } from "@/services/sample-feedback.service";
import { SampleRequestService } from "@/services/sample-request.service";

export const dynamic = "force-dynamic";

function isStatus(value: string | undefined): value is SampleRequestStatus {
  return value !== undefined && (sampleRequestStatusEnum.enumValues as string[]).includes(value);
}

/** The selected batch's requests: counts, search, ship runs, and check-ins that matched no box. */
export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin();
  const { status, q } = await searchParams;
  const batch = await currentAdminBatch(db);
  if (batch === null) return <p className="p-10 text-sm text-wi-ink-500">No batch exists. Create one on the Batches page.</p>;

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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 md:px-10 md:py-10">
      <AdminSampleSummary batch={batch} summary={summary} />
      <Form action="/admin/requests" className="flex flex-wrap gap-2" role="search">
        <label className="relative flex min-w-56 flex-1 items-center">
          <span className="sr-only">Search requests</span>
          <MagnifyingGlass aria-hidden className="pointer-events-none absolute left-3 size-4 text-wi-ink-300" />
          <input name="q" defaultValue={q ?? ""} placeholder="Box, name or email" className="h-9 w-full rounded-[var(--wi-radius-control)] border-0 bg-wi-paper pr-3 pl-9 text-sm shadow-[var(--wi-shadow-card)] outline-none placeholder:text-wi-ink-300 focus-visible:ring-2 focus-visible:ring-wi-black/15" />
        </label>
        <select name="status" aria-label="Status" defaultValue={isStatus(status) ? status : ""} className="h-9 rounded-[var(--wi-radius-control)] border-0 bg-wi-paper px-3 text-sm shadow-[var(--wi-shadow-card)] outline-none focus-visible:ring-2 focus-visible:ring-wi-black/15">
          <option value="">All statuses</option>
          {sampleRequestStatusEnum.enumValues.map((value) => <option key={value} value={value}>{value === "pending_payment" ? "Holding" : value.charAt(0).toUpperCase() + value.slice(1)}</option>)}
        </select>
        <button type="submit" className={buttonVariants({ variant: "secondary", size: "sm" })}>Filter</button>
        {(q !== undefined || status !== undefined) && <Link href="/admin/requests" className={buttonVariants({ variant: "ghost", size: "sm" })}>Clear</Link>}
      </Form>
      <AdminShipRunForm rows={rows} />
      {unmatched.length > 0 && (
        <section className="rounded-[var(--wi-radius-card)] bg-wi-paper p-5 text-sm shadow-[var(--wi-shadow-card)]">
          <h2 className="m-0 mb-2 text-sm font-medium text-wi-black">Feedback with no matching box ({unmatched.length})</h2>
          <ul className="m-0 list-none p-0">{unmatched.map((row) => <li key={row.id}>{row.email}: taste {row.tasteRating}, {row.wouldReachAgain}{row.comment === null ? "" : `, "${row.comment}"`}</li>)}</ul>
        </section>
      )}
    </main>
  );
}
