import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { db } from "@/db/client";
import { requireAdmin } from "@/lib/admin-session";
import { SampleBatchService } from "@/services/sample-batch.service";
import { SampleDeliveryService } from "@/services/sample-delivery.service";

export const dynamic = "force-dynamic";

const PHASE_LABEL = { upcoming: "Soon", open: "", closed: "Closed" } as const;

/** Every signed-in admin page: the sidebar with a section per batch, then the page. */
export default async function AdminShellLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const now = new Date();
  const [summaries, board] = await Promise.all([SampleBatchService.list(db, now), SampleDeliveryService.board(db, now)]);
  const batches = summaries.map(({ batch, claimed }) => {
    const counts = board.byBatch[batch.id];
    return {
      id: batch.id,
      label: batch.label,
      phase: batch.phase,
      detail: batch.phase === "open" ? `${claimed}/${batch.capacity}` : PHASE_LABEL[batch.phase],
      issues: (counts?.failed ?? 0) + (counts?.stuck ?? 0),
    };
  });

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar batches={batches} issues={board.issues.length} />
        <SidebarInset className="bg-wi-paper-dim">
          <header className="flex h-12 items-center border-b border-wi-line px-3 md:hidden">
            <SidebarTrigger />
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
