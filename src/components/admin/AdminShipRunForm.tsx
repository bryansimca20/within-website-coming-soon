"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { bookShipRunAction } from "@/app/actions/admin-sample.action";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { IAdminRow } from "./utils/admin-rows";

interface AdminShipRunFormProps {
  rows: IAdminRow[];
  /** Hides the table chrome on the detail page, where the form books one request. */
  isSingle?: boolean;
}

const CELL = "border-b border-wi-line px-2 py-2 text-left align-top";

/** The request table with a checkbox on each bookable row, and the pickup choice that books them in one run. */
export function AdminShipRunForm({ rows, isSingle = false }: AdminShipRunFormProps) {
  const [state, action, isPending] = useActionState(bookShipRunAction, null);
  const [deliveryType, setDeliveryType] = useState<"now" | "scheduled">("now");

  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset className="m-0 flex flex-wrap items-end gap-3 rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper p-4">
        <legend className="px-1 text-2xs font-bold tracking-[0.14em] text-wi-ink-500 uppercase">{isSingle ? "Ship this box" : "Book shipping run"}</legend>
        <label className="flex h-9 items-center gap-2 text-sm"><input type="radio" name="deliveryType" value="now" checked={deliveryType === "now"} onChange={() => setDeliveryType("now")} /> Pick up now</label>
        <label className="flex h-9 items-center gap-2 text-sm"><input type="radio" name="deliveryType" value="scheduled" checked={deliveryType === "scheduled"} onChange={() => setDeliveryType("scheduled")} /> Schedule</label>
        {deliveryType === "scheduled" && (
          <>
            <input type="date" name="deliveryDate" required className="h-9 rounded-[var(--wi-radius-control)] border border-wi-line-strong bg-wi-paper px-2 text-sm" />
            <input type="time" name="deliveryTime" required className="h-9 rounded-[var(--wi-radius-control)] border border-wi-line-strong bg-wi-paper px-2 text-sm" />
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

      <div className={cn("overflow-x-auto rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper", isSingle && "hidden")}>
        <table className="w-full border-collapse text-sm">
          <thead className="text-2xs tracking-[0.14em] text-wi-ink-500 uppercase">
            <tr>{["", "Box", "Name", "City", "Courier", "Status", "Shipment", "Intent", "Source"].map((heading) => <th key={heading} className={CELL}>{heading}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={cn(row.needsAttention && "bg-wi-signal-tint")}>
                <td className={CELL}>{row.isBookable && <input type="checkbox" name="requestId" value={row.id} defaultChecked={isSingle} aria-label={`Select ${row.boxLabel}`} />}</td>
                <td className={cn(CELL, "wi-readout")}><Link href={`/admin/sample/${row.id}`} className="text-wi-black underline">{row.boxLabel}</Link></td>
                <td className={CELL}>{row.name}<br /><span className="text-xs text-wi-ink-500">{row.email}</span></td>
                <td className={CELL}>{row.city}</td>
                <td className={CELL}>{row.courier}<br /><span className="wi-readout text-xs text-wi-ink-500">Rp {row.fee.toLocaleString("id-ID")}</span></td>
                <td className={CELL}>{row.status}</td>
                <td className={CELL}>{row.shipmentStatus ?? ""}{row.waybillId !== null && <><br /><span className="wi-readout text-xs">{row.waybillId}</span></>}</td>
                <td className={CELL}>{row.intent ?? ""}</td>
                <td className={CELL}>{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="m-0 p-4 text-sm text-wi-ink-500">No requests match.</p>}
      </div>
    </form>
  );
}
