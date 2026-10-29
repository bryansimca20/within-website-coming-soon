"use client";

import { DownloadSimple, SignOut, Stack, Tray } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

import { AdminBatchSwitcher, type IAdminBatchOption } from "./AdminBatchSwitcher";

interface AdminSidebarProps {
  batches: IAdminBatchOption[];
  selectedId: string;
}

const THIS_BATCH = [
  { href: "/admin/requests", label: "Requests", icon: Tray },
  { href: "/admin/export", label: "Export", icon: DownloadSimple },
] as const;

/** The admin's left rail: batch switcher, the per-batch pages, the Batches page, sign out. */
export function AdminSidebar({ batches, selectedId }: AdminSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar>
      <SidebarHeader className="gap-6 px-3 pt-5 pb-3">
        <WithinLogo kind="logotype" height={16} className="h-4 w-auto self-start" />
        <AdminBatchSwitcher batches={batches} selectedId={selectedId} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>This batch</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {THIS_BATCH.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton isActive={isActive(item.href)} render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.label}</span>
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
                <SidebarMenuButton isActive={isActive("/admin/batches")} render={<Link href="/admin/batches" />}>
                  <Stack />
                  <span>Batches</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <form action={adminLogoutAction}>
          <SidebarMenuButton type="submit">
            <SignOut />
            <span>Sign out</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
