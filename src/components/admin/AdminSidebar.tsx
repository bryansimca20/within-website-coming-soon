"use client";

import { ChatCenteredText, CircleNotch, DownloadSimple, SignOut, SquaresFour, Tray } from "@phosphor-icons/react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";

import { adminLogoutAction } from "@/app/actions/admin-auth.action";
import { WithinLogo } from "@/components/brand/WithinLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { SampleBatchPhase } from "@/db/schema";
import { cn } from "@/lib/utils";

import { adminStatusLook } from "./utils/admin-status";

/** One batch as the sidebar lists it. */
export interface IAdminSidebarBatch {
  id: string;
  label: string;
  phase: SampleBatchPhase;
  /** "38/150" while it runs, else its phase. */
  detail: string;
  /** Failed or stuck deliveries in this batch. */
  issues: number;
}

interface AdminSidebarProps {
  batches: IAdminSidebarBatch[];
  /** Failed or stuck deliveries across every batch. */
  issues: number;
}

const BATCH_PAGES = [
  { segment: "requests", label: "Requests", icon: Tray },
  { segment: "export", label: "Export", icon: DownloadSimple },
] as const;

/** The current page lifts off the rail as a white tile. */
const ACTIVE = "h-9 px-2.5 text-wi-ink-700 data-active:bg-wi-paper data-active:text-wi-black data-active:shadow-[var(--wi-shadow-card)] [&_svg]:text-wi-ink-500 data-active:[&_svg]:text-wi-black";

/** A spinner that fades in on the clicked nav item until the next page starts rendering. Always rendered, so nothing shifts. */
function AdminNavPending() {
  const { pending } = useLinkStatus();

  return <CircleNotch aria-hidden className={cn("ml-auto opacity-0 transition-opacity duration-150", pending && "animate-spin opacity-100")} />;
}

/** A red count of deliveries that need a founder; nothing at zero. */
function AdminIssueCount({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;

  return <span aria-label={label} className="flex h-5 min-w-5 items-center justify-center rounded-full bg-wi-error px-1.5 text-2xs font-semibold text-wi-paper tabular-nums">{count}</span>;
}

/** Sign out, which says so while the session is being cleared. */
function AdminSignOutButton() {
  const { pending } = useFormStatus();

  return (
    <SidebarMenuButton type="submit" className={ACTIVE} disabled={pending}>
      {pending ? <CircleNotch className="animate-spin" /> : <SignOut />}
      <span>{pending ? "Signing out" : "Sign out"}</span>
    </SidebarMenuButton>
  );
}

/** The admin's left rail: overview and reviews across batches, then one section per batch with its own pages, then sign out. */
export function AdminSidebar({ batches, issues }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="gap-5 px-3 pt-6 pb-3">
        <WithinLogo kind="logotype" height={16} className="ml-2 h-4 w-auto self-start" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className={ACTIVE} isActive={pathname === "/admin"} render={<Link href="/admin" />}>
              <SquaresFour />
              <span>Overview</span>
              <span className="ml-auto flex items-center gap-1.5">
                <AdminIssueCount count={issues} label={`${issues} deliveries need attention`} />
                <AdminNavPending />
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className={ACTIVE} isActive={pathname === "/admin/reviews"} render={<Link href="/admin/reviews" />}>
              <ChatCenteredText />
              <span>Reviews</span>
              <AdminNavPending />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Batches</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {batches.map((batch) => {
                const base = `/admin/batches/${batch.id}`;
                // The batch you are in and the open batch show their pages; the rest fold to one line.
                const isExpanded = pathname.startsWith(`${base}/`) || batch.phase === "open";

                return (
                  <SidebarMenuItem key={batch.id}>
                    <SidebarMenuButton className="h-9 px-2.5 font-medium text-wi-black" render={<Link href={`${base}/requests`} />}>
                      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", adminStatusLook(batch.phase).dot)} />
                      <span>{batch.label}</span>
                      <span className="text-xs font-normal text-wi-ink-500 tabular-nums">{batch.detail}</span>
                      {!isExpanded && (
                        <span className="ml-auto flex items-center">
                          <AdminIssueCount count={batch.issues} label={`${batch.issues} deliveries in ${batch.label} need attention`} />
                        </span>
                      )}
                    </SidebarMenuButton>
                    {isExpanded && (
                      <SidebarMenuSub>
                        {BATCH_PAGES.map((page) => {
                          const href = `${base}/${page.segment}`;
                          return (
                            <SidebarMenuSubItem key={page.segment}>
                              <SidebarMenuSubButton className={ACTIVE} isActive={pathname === href || pathname.startsWith(`${href}/`)} render={<Link href={href} />}>
                                <page.icon />
                                <span>{page.label}</span>
                                <span className="ml-auto flex items-center gap-1.5">
                                  {page.segment === "requests" && <AdminIssueCount count={batch.issues} label={`${batch.issues} deliveries need attention`} />}
                                  <AdminNavPending />
                                </span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <form action={adminLogoutAction}>
          <AdminSignOutButton />
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
