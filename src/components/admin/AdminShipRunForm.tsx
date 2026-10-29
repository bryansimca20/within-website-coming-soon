"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { bookShipRunAction } from "@/app/actions/admin-sample.action";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AdminStatusPill } from "./AdminStatusPill";
import type { IAdminRow } from "./utils/admin-rows";

interface AdminShipRunFormProps {
  rows: IAdminRow[];
  /** Hides the table chrome on the detail page, where the form books one request. */
  isSingle?: boolean;
}

const CELL = "whitespace-nowrap border-b border-wi-line/70 px-3 py-3 text-left align-top first:pl-5 last:pr-5";
const PICKUP = [{ value: "now", label: "Pick up now" }, { value: "scheduled", label: "Schedule" }] as const;
const FIELD = "h-9 rounded-[var(--wi-radius-control)] border border-wi-line-strong bg-wi-paper px-2.5 text-sm outline-none focus-visible:border-wi-black";

/** The request table with a checkbox on each bookable row, and the pickup choice that books them in one run. */
export function AdminShipRunForm({ rows, isSingle = false }: AdminShipRunFormProps) {
  const [state, action, isPending] = useActionState(bookShipRunAction, null);
  const [deliveryType, setDeliveryType] = useState<"now" | "scheduled">("now");

  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset className="m-0 flex flex-wrap items-center gap-3 rounded-[var(--wi-radius-card)] border-0 bg-wi-paper p-4 pl-5 shadow-[var(--wi-shadow-card)]">
        <legend className="float-left mr-2 text-sm font-medium text-wi-black">{isSingle ? "Ship this box" : "Book shipping run"}</legend>
        <div className="flex rounded-full bg-wi-mist p-1">
          {PICKUP.map((option) => (
            <label key={option.value} className="flex h-7 cursor-pointer items-center rounded-full px-3 text-sm text-wi-ink-500 transition-[background-color,color,box-shadow] duration-150 has-checked:bg-wi-paper has-checked:text-wi-black has-checked:shadow-[var(--wi-shadow-sm)] has-focus-visible:ring-2 has-focus-visible:ring-wi-black/20">
              <input type="radio" name="deliveryType" value={option.value} checked={deliveryType === option.value} onChange={() => setDeliveryType(option.value)} className="sr-only" />
              {option.label}
            </label>
          ))}
        </div>
        {deliveryType === "scheduled" && (
          <>
            <input type="date" name="deliveryDate" required aria-label="Pickup date" className={FIELD} />
            <input type="time" name="deliveryTime" required aria-label="Pickup time" className={FIELD} />
          </>
        )}
        <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Booking" : "Book selected"}</Button>
        <span className="text-xs text-wi-ink-500">Jakarta time. Labels print from the Biteship dashboard.</span>
      </fieldset>

      {state !== null && "error" in state && <p role="alert" className="m-0 text-sm text-wi-black">{state.error}</p>}
      {state !== null && "results" in state && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
          {state.results.map((result) => (
            <li key={result.requestId} className="wi-readout">{result.boxLabel}: {result.ok ? `booked, waybill ${result.waybillId ?? "pending"}` : result.error}</li>
          ))}
        </ul>
      )}

      <div className={cn("overflow-x-auto rounded-[var(--wi-radius-card)] bg-wi-paper shadow-[var(--wi-shadow-card)]", isSingle && "hidden")}>
        <table className="w-full border-collapse text-sm">
          <thead className="text-xs text-wi-ink-500">
            <tr>{["", "Box", "Name", "City", "Courier", "Status", "Shipment", "Intent", "Source"].map((heading) => <th key={heading} className={cn(CELL, "py-2.5 font-medium")}>{heading}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={cn("transition-colors duration-150 last:[&>td]:border-0 hover:bg-wi-paper-dim", row.needsAttention && "bg-wi-signal-tint/60")}>
                <td className={CELL}>{row.isBookable && <input type="checkbox" name="requestId" value={row.id} defaultChecked={isSingle} aria-label={`Select ${row.boxLabel}`} className="size-4 accent-wi-black" />}</td>
                <td className={cn(CELL, "wi-readout")}><Link href={`/admin/requests/${row.id}`} className="font-medium text-wi-black underline-offset-4 hover:underline">{row.boxLabel}</Link></td>
                <td className={CELL}><span className="font-medium text-wi-black">{row.name}</span><br /><span className="text-xs text-wi-ink-500">{row.email}</span></td>
                <td className={CELL}>{row.city}</td>
                <td className={CELL}>{row.courier}<br /><span className="wi-readout text-xs text-wi-ink-500">Rp {row.fee.toLocaleString("id-ID")}</span></td>
                <td className={CELL}><AdminStatusPill status={row.status} /></td>
                <td className={CELL}>{row.shipmentStatus ?? ""}{row.waybillId !== null && <><br /><span className="wi-readout text-xs">{row.waybillId}</span></>}</td>
                <td className={CELL}>{row.intent ?? ""}</td>
                <td className={CELL}>{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="m-0 px-5 py-10 text-center text-sm text-wi-ink-500">No requests match.</p>}
      </div>
    </form>
  );
}
