import type { ReactNode } from "react";

import { cancelRequestAction, saveAdminNoteAction } from "@/app/actions/admin-sample.action";
import { Button } from "@/components/ui/button";
import type { SampleFeedbackRow, SamplePayment, SampleRequest, SampleShipment, SampleWebhookEvent } from "@/db/schema";

import { AdminRowActions } from "./AdminRowActions";
import { AdminStatusPill } from "./AdminStatusPill";

interface AdminSampleDetailProps {
  request: SampleRequest;
  boxLabel: string;
  payments: SamplePayment[];
  shipments: SampleShipment[];
  feedback: SampleFeedbackRow | null;
  events: SampleWebhookEvent[];
  /** The re-ship form, rendered by the page. */
  shipForm: ReactNode;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[var(--wi-radius-card)] bg-wi-paper p-5 text-sm shadow-[var(--wi-shadow-card)]">
      <h2 className="m-0 text-sm font-medium text-wi-black">{title}</h2>
      {children}
    </section>
  );
}

function Fields({ entries }: { entries: Array<[string, unknown]> }) {
  return (
    <dl className="m-0 grid grid-cols-[minmax(120px,max-content)_1fr] gap-x-6 gap-y-1.5">
      {entries.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-wi-ink-500">{key}</dt>
          <dd className="m-0 break-words text-wi-black">{value instanceof Date ? value.toISOString() : value === null || value === undefined ? "" : String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Everything stored about one request, plus the founder controls. */
export function AdminSampleDetail({ request, boxLabel, payments, shipments, feedback, events, shipForm }: AdminSampleDetailProps) {
  const { id, accessToken, ...fields } = request;
  void id;
  void accessToken;
  const live = shipments.at(-1) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="wi-readout m-0 text-h1 text-wi-black">{boxLabel}</h1>
        <AdminStatusPill status={request.status} />
      </div>
      <AdminRowActions requestId={request.id} shipmentId={live?.id ?? null} />
      {shipForm}
      <Card title="Request"><Fields entries={Object.entries(fields)} /></Card>
      <Card title={`Payments (${payments.length})`}>
        {payments.map((payment) => <Fields key={payment.id} entries={[["order", payment.midtransOrderId], ["status", payment.status], ["amount", payment.grossAmount], ["method", payment.paymentType], ["settled", payment.settledAt], ["created", payment.createdAt]]} />)}
      </Card>
      <Card title={`Shipments (${shipments.length})`}>
        {shipments.map((shipment) => (
          <div key={shipment.id} className="flex flex-col gap-2 border-t border-wi-line/70 pt-3 first:border-0 first:pt-0">
            <Fields entries={[["attempt", shipment.attempt], ["reference", shipment.referenceId], ["biteship id", shipment.biteshipOrderId], ["status", shipment.status], ["waybill", shipment.waybillId], ["link", shipment.trackingLink], ["price", shipment.price], ["shipped email", shipment.shippedEmailSentAt], ["delivered email", shipment.deliveredEmailSentAt]]} />
            <pre className="m-0 overflow-x-auto rounded-[calc(var(--wi-radius-card)-6px)] bg-wi-paper-dim p-3 text-xs text-wi-ink-500">{JSON.stringify(shipment.history, null, 2)}</pre>
          </div>
        ))}
      </Card>
      <Card title="Feedback">{feedback === null ? <p className="m-0 text-wi-ink-500">None yet.</p> : <Fields entries={Object.entries(feedback)} />}</Card>
      <Card title={`Webhook events (${events.length})`}>
        {events.map((event) => <p key={event.id} className="wi-readout m-0 text-xs">{event.receivedAt.toISOString()} {event.provider} {event.error ?? "ok"}</p>)}
      </Card>
      <Card title="Founder note">
        <form action={saveAdminNoteAction} className="flex flex-col gap-2">
          <input type="hidden" name="requestId" value={request.id} />
          <textarea name="note" rows={3} defaultValue={request.adminNote ?? ""} className="rounded-[var(--wi-radius-control)] border border-wi-line-strong bg-wi-paper p-3 text-sm outline-none focus-visible:border-wi-black" />
          <Button type="submit" size="sm" variant="secondary" className="self-start">Save note</Button>
        </form>
      </Card>
      {request.status !== "cancelled" && (
        <Card title="Cancel">
          <form action={cancelRequestAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="requestId" value={request.id} />
            <input name="note" placeholder="Reason, refund reference" className="h-9 flex-1 rounded-[var(--wi-radius-control)] border border-wi-line-strong bg-wi-paper px-3 text-sm outline-none focus-visible:border-wi-black" />
            <Button type="submit" size="sm" variant="destructive">Cancel request</Button>
          </form>
          <p className="m-0 text-xs text-wi-ink-500">Refund the courier fee in the Midtrans dashboard first.</p>
        </Card>
      )}
    </div>
  );
}
