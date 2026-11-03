import { Skeleton } from "@/components/ui/skeleton";

/** One request's page while it loads: back link, box label, actions, then its cards. */
export default function AdminRequestDetailLoading() {
  return (
    <main aria-busy className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 md:px-10 md:py-10">
      <span className="sr-only" role="status">Loading request</span>
      <Skeleton className="h-5 w-28" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-[34px] w-28" />)}
      </div>
      {[10, 5, 2].map((lines) => (
        <section key={lines} className="flex flex-col gap-3 rounded-[var(--wi-radius-card)] bg-wi-paper p-5 shadow-[var(--wi-shadow-card)]">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: lines }, (_, index) => (
            <div key={index} className="flex gap-6">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-48" />
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
