import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { db } from "@/db/client";
import { currentAdminBatch } from "@/lib/admin-batch";
import { requireAdmin } from "@/lib/admin-session";
import { SampleBatchService } from "@/services/sample-batch.service";

export const dynamic = "force-dynamic";

const PHASE_LABEL = { upcoming: "Coming soon", open: "Open", closed: "Closed" } as const;

/** Every signed-in admin page: the sidebar with the batch switcher, then the page. */
export default async function AdminShellLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const [selected, summaries] = await Promise.all([currentAdminBatch(db), SampleBatchService.list(db, new Date())]);
  const batches = summaries.map(({ batch, claimed }) => ({
    id: batch.id,
    label: batch.label,
    detail: `${PHASE_LABEL[batch.phase]} · ${claimed} / ${batch.capacity}`,
  }));

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar batches={batches} selectedId={selected?.id ?? ""} />
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
