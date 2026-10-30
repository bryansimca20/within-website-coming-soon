import { Skeleton } from "@/components/ui/skeleton";

/** The Requests page while it loads: summary card, search, shipping run and table, shaped like the real page. */
export default function AdminRequestsLoading() {
  return (
    <main aria-busy className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 md:px-10 md:py-10">
      <span className="sr-only" role="status">Loading requests</span>
      <section className="flex flex-col gap-6 rounded-[var(--wi-radius-card)] bg-wi-paper p-6 shadow-[var(--wi-shadow-card)]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex w-full max-w-64 flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-[74px] rounded-[calc(var(--wi-radius-card)-6px)] bg-wi-paper-dim" />)}
        </div>
      </section>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 bg-wi-paper shadow-[var(--wi-shadow-card)]" />
        <Skeleton className="h-9 w-32 bg-wi-paper shadow-[var(--wi-shadow-card)]" />
      </div>
      <Skeleton className="h-[68px] rounded-[var(--wi-radius-card)] bg-wi-paper shadow-[var(--wi-shadow-card)]" />
      <div className="flex flex-col rounded-[var(--wi-radius-card)] bg-wi-paper px-5 shadow-[var(--wi-shadow-card)]">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-6 border-b border-wi-line/70 py-4 last:border-0">
            <Skeleton className="h-4 w-16" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="hidden h-4 w-24 sm:block" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
