import Link from "next/link";
import type { ReactNode } from "react";

import { AdminSeededList } from "@/components/admin/AdminSeededList";
import { db } from "@/db/client";
import { requireAdmin } from "@/lib/admin-session";
import { SampleAdminDataService } from "@/services/sample-admin-data.service";
import { SampleRequestService } from "@/services/sample-request.service";
import { SampleReviewService, summarizeReviews } from "@/services/sample-review.service";

export const dynamic = "force-dynamic";

const TABS = [
  { id: null, label: "Everyone" },
  { id: "yes", label: "Checked in" },
  { id: "no", label: "Not yet" },
] as const;

/** One headline number with its context line, in the overview's style. */
function SeededStat({ label, value, detail }: { label: string; value: ReactNode; detail: string }) {
  return (
    <div className="flex flex-col gap-1.5 border-wi-line px-5 py-4 not-first:border-t sm:not-first:border-t-0 sm:not-first:border-l">
      <dt className="text-xs text-wi-ink-500">{label}</dt>
      <dd className="m-0 text-h2 leading-tight font-medium tracking-[-0.02em] text-wi-black tabular-nums">{value}</dd>
      <p className="m-0 text-xs text-wi-ink-500">{detail}</p>
    </div>
  );
}

/** Samples handed out in person: how many, how many checked in, and what they scored. */
export default async function AdminSeededPage({ searchParams }: { searchParams: Promise<{ checkedIn?: string }> }) {
  await requireAdmin();
  const [{ checkedIn }, listed, reviews] = await Promise.all([searchParams, SampleRequestService.listSeeded(db, { includeTest: true }), SampleReviewService.list(db)]);
  // Test rows are listed so they can be found and unmarked, but never counted.
  const requests = listed.filter((request) => !request.isTest);
  const feedback = await SampleAdminDataService.feedbackByRequest(db, listed.map((request) => request.id));
  const filter = checkedIn === "yes" || checkedIn === "no" ? checkedIn : null;
  const visible = filter === null ? listed : listed.filter((request) => feedback.has(request.id) === (filter === "yes"));
  const summary = summarizeReviews(reviews.filter((review) => review.source === "in_person"));
  const checkedInCount = requests.filter((request) => feedback.has(request.id)).length;
  const rate = requests.length === 0 ? null : checkedInCount / requests.length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-h1 font-medium tracking-[-0.02em] text-wi-black">Seeded</h1>
          <p className="m-0 text-sm text-wi-ink-500">Samples handed out in person. Not part of any batch.</p>
        </div>
        <nav aria-label="Check-in" className="flex flex-wrap gap-0.5 rounded-[var(--wi-radius-control)] bg-wi-paper p-0.5 shadow-[var(--wi-shadow-card)]">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tab.id === null ? "/admin/seeded" : `/admin/seeded?checkedIn=${tab.id}`}
              aria-current={tab.id === filter ? "page" : undefined}
              className="flex h-8 items-center rounded-[calc(var(--wi-radius-control)-2px)] px-3 text-sm text-wi-ink-500 transition-colors duration-150 hover:text-wi-black aria-[current=page]:bg-wi-paper-dim aria-[current=page]:text-wi-black"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <dl className="m-0 grid rounded-[var(--wi-radius-card)] bg-wi-paper shadow-[var(--wi-shadow-card)] sm:grid-cols-3">
        <SeededStat label="Seeded" value={requests.length} detail="Handed out in person" />
        <SeededStat label="Checked in" value={<>{checkedInCount}<span className="ml-1.5 text-sm font-normal tracking-normal text-wi-ink-500">of {requests.length}</span></>} detail={rate === null ? "Nobody seeded yet." : `${Math.round(rate * 100)}% checked in`} />
        <SeededStat label="Average stars" value={summary.average === null ? "–" : summary.average.toFixed(1)} detail={`${summary.rated} rated`} />
      </dl>

      <AdminSeededList requests={visible} feedback={feedback} isFiltered={filter !== null} />
    </main>
  );
}
