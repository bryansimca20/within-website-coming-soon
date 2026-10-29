import { Skeleton } from "@/components/ui/skeleton";

/** The Batches page while it loads: heading, New batch, and a few table rows. */
export default function AdminBatchesLoading() {
  return (
    <main aria-busy className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
      <span className="sr-only" role="status">Loading batches</span>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-[34px] w-28" />
      </div>
      <div className="flex flex-col rounded-[var(--wi-radius-card)] bg-wi-paper px-4 shadow-[var(--wi-shadow-card)]">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center gap-8 border-b border-wi-line/70 py-4 last:border-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="hidden h-4 flex-1 sm:block" />
          </div>
        ))}
      </div>
    </main>
  );
}
