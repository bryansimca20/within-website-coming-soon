"use client";

import { CircleNotch, DownloadSimple, SignOut, Stack, Tray } from "@phosphor-icons/react";
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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { AdminBatchSwitcher, type IAdminBatchOption } from "./AdminBatchSwitcher";

interface AdminSidebarProps {
  batches: IAdminBatchOption[];
  selectedId: string;
}

const THIS_BATCH = [
  { href: "/admin/requests", label: "Requests", icon: Tray },
  { href: "/admin/export", label: "Export", icon: DownloadSimple },
] as const;

/** The current page lifts off the rail as a white tile. */
const ACTIVE = "h-9 px-2.5 text-wi-ink-700 data-active:bg-wi-paper data-active:text-wi-black data-active:shadow-[var(--wi-shadow-card)] [&_svg]:text-wi-ink-500 data-active:[&_svg]:text-wi-black";

/** A spinner that fades in on the clicked nav item until the next page starts rendering. Always rendered, so nothing shifts. */
function AdminNavPending() {
  const { pending } = useLinkStatus();

  return <CircleNotch aria-hidden className={cn("ml-auto opacity-0 transition-opacity duration-150", pending && "animate-spin opacity-100")} />;
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

/** The admin's left rail: batch switcher, the per-batch pages, the Batches page, sign out. */
export function AdminSidebar({ batches, selectedId }: AdminSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar>
      <SidebarHeader className="gap-5 px-3 pt-6 pb-3">
        <WithinLogo kind="logotype" height={16} className="ml-2 h-4 w-auto self-start" />
        <AdminBatchSwitcher batches={batches} selectedId={selectedId} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>This batch</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {THIS_BATCH.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton className={ACTIVE} isActive={isActive(item.href)} render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.label}</span>
                    <AdminNavPending />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>All batches</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className={ACTIVE} isActive={isActive("/admin/batches")} render={<Link href="/admin/batches" />}>
                  <Stack />
                  <span>Batches</span>
                  <AdminNavPending />
                </SidebarMenuButton>
              </SidebarMenuItem>
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
