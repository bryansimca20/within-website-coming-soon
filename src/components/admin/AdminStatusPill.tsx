import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { adminStatusLook } from "./utils/admin-status";

interface AdminStatusPillProps {
  /** A request status (`paid`) or a batch phase (`open`); anything else shows as written. */
  status: string;
  className?: string;
}

/** A request status or batch phase as a small tinted pill with a dot. */
export function AdminStatusPill({ status, className }: AdminStatusPillProps) {
  const look = adminStatusLook(status);

  return (
    <Badge className={cn("h-6 gap-1.5 rounded-full px-2.5", look.pill, className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", look.dot)} />
      {look.label}
    </Badge>
  );
}
