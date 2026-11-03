import { ArrowSquareOut } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { formatJakarta } from "@/components/sample/utils/jakarta-date";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeliveryState, type IDeliveryIssue, STUCK_AFTER_DAYS } from "@/services/sample-delivery.service";

interface AdminDeliveryIssuesProps {
  issues: IDeliveryIssue[];
  /** Which tab is showing; null shows both. */
  show: DeliveryState.Failed | DeliveryState.Stuck | null;
}

const LOOK = {
  [DeliveryState.Failed]: { pill: "bg-wi-error/10 text-wi-error", dot: "bg-wi-error" },
  [DeliveryState.Stuck]: { pill: "bg-wi-mist text-wi-ink-700", dot: "bg-wi-ink-500" },
} as const;

/** Failed and stalled deliveries across every batch: who, which courier, what the courier said, and the way to fix it. */
export function AdminDeliveryIssues({ issues, show }: AdminDeliveryIssuesProps) {
  const failed = issues.filter((issue) => issue.state === DeliveryState.Failed).length;
  const tabs = [
    { key: null, label: "All", count: issues.length },
    { key: DeliveryState.Failed, label: "Failed", count: failed },
    { key: DeliveryState.Stuck, label: "Stuck", count: issues.length - failed },
  ];
  const visible = show === null ? issues : issues.filter((issue) => issue.state === show);

  return (
    <section aria-labelledby="delivery-issues" className="rounded-[var(--wi-radius-card)] bg-wi-paper shadow-[var(--wi-shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-2">
        <h2 id="delivery-issues" className="m-0 flex items-center gap-2 text-body font-medium text-wi-black">
          Needs attention
          {issues.length > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-wi-error px-1.5 text-2xs font-semibold text-wi-paper tabular-nums">{issues.length}</span>}
        </h2>
        <nav aria-label="Filter deliveries" className="flex gap-0.5 rounded-[var(--wi-radius-control)] bg-wi-paper-dim p-0.5">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.key === null ? "/admin" : `/admin?show=${tab.key}`}
              scroll={false}
              aria-current={tab.key === show ? "page" : undefined}
              className="flex h-7 items-center gap-1.5 rounded-[calc(var(--wi-radius-control)-2px)] px-2.5 text-xs text-wi-ink-500 transition-colors duration-150 hover:text-wi-black aria-[current=page]:bg-wi-paper aria-[current=page]:text-wi-black aria-[current=page]:shadow-[var(--wi-shadow-card)]"
            >
              {tab.label} <span className="tabular-nums">{tab.count}</span>
            </Link>
          ))}
        </nav>
      </div>
      {visible.length === 0 ? (
        <p className="m-0 px-5 pt-2 pb-6 text-sm text-wi-ink-500">
          {issues.length === 0 ? `Nothing failed, and every box on the road has moved in the last ${STUCK_AFTER_DAYS} days.` : "Nothing in this view."}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col px-2 pb-2">
          {visible.map((issue) => (
            <li key={issue.requestId} className="grid grid-cols-1 gap-x-5 gap-y-2 border-t border-wi-line/70 px-3 py-4 first:border-0 md:grid-cols-[minmax(0,10rem)_minmax(0,9rem)_minmax(0,1fr)_6rem_9rem] md:items-center">
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-wi-black">{issue.name}</span>
                <span className="wi-readout text-xs text-wi-ink-500">{issue.boxLabel}</span>
              </div>
              <div className="flex min-w-0 flex-col text-sm">
                <span className="text-wi-black">{issue.courier}</span>
                <span className="wi-readout truncate text-xs text-wi-ink-500">{issue.waybillId ?? "No waybill yet"}</span>
              </div>
              <div className="flex min-w-0 flex-col items-start gap-1.5">
                <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium", LOOK[issue.state].pill)}>
                  <span aria-hidden className={cn("size-1.5 rounded-full", LOOK[issue.state].dot)} />
                  {issue.statusLabel}
                </span>
                <p className="m-0 text-sm text-wi-ink-700">{issue.courierNote === null ? "The courier left no note." : `“${issue.courierNote}”`}</p>
              </div>
              <span className="text-xs text-wi-ink-500 tabular-nums">{formatJakarta(issue.lastMovedAt)}</span>
              <div className="flex items-center gap-1 md:justify-end">
                {issue.trackingLink !== null && (
                  <a href={issue.trackingLink} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    Track <ArrowSquareOut aria-hidden className="size-3.5" />
                  </a>
                )}
                <Link href={`/admin/requests/${issue.requestId}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  {issue.state === DeliveryState.Failed ? "Reship" : "Open"}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
