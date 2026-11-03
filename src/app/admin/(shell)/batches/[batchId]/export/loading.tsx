import { Skeleton } from "@/components/ui/skeleton";

/** The Export page while it loads: heading and the two download cards. */
export default function AdminExportLoading() {
  return (
    <main aria-busy className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
      <span className="sr-only" role="status">Loading export</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      {Array.from({ length: 2 }, (_, index) => (
        <section key={index} className="flex items-center justify-between gap-4 rounded-[var(--wi-radius-card)] bg-wi-paper p-5 shadow-[var(--wi-shadow-card)]">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-72 max-w-full" />
          </div>
          <Skeleton className="h-[34px] w-32" />
        </section>
      ))}
    </main>
  );
}
