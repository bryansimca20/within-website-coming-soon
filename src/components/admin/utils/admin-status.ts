/** How a request status or batch phase looks: its label, its pill tint, and its dot colour. */
export interface IAdminStatusLook {
  label: string;
  pill: string;
  dot: string;
}

const LOOK: Record<string, IAdminStatusLook> = {
  pending_payment: { label: "Holding", pill: "bg-wi-paper-dim text-wi-ink-700", dot: "bg-wi-ink-300" },
  paid: { label: "Paid", pill: "bg-wi-signal-tint text-wi-black", dot: "bg-wi-black" },
  shipped: { label: "Shipped", pill: "bg-wi-signal-tint text-wi-black", dot: "bg-wi-ink-500" },
  delivered: { label: "Delivered", pill: "bg-wi-success/10 text-wi-success", dot: "bg-wi-success" },
  expired: { label: "Expired", pill: "bg-wi-mist text-wi-ink-500", dot: "bg-wi-ink-300" },
  cancelled: { label: "Cancelled", pill: "bg-wi-error/10 text-wi-error", dot: "bg-wi-error" },
  upcoming: { label: "Coming soon", pill: "bg-flavor-orange/15 text-wi-black", dot: "bg-flavor-orange" },
  open: { label: "Open", pill: "bg-wi-success/10 text-wi-success", dot: "bg-wi-success" },
  closed: { label: "Closed", pill: "bg-wi-mist text-wi-ink-500", dot: "bg-wi-ink-300" },
};

/** The look for a request status (`paid`) or batch phase (`open`); anything unknown shows as written, in grey. */
export function adminStatusLook(status: string): IAdminStatusLook {
  return LOOK[status] ?? { label: status, pill: "bg-wi-mist text-wi-ink-700", dot: "bg-wi-ink-300" };
}
