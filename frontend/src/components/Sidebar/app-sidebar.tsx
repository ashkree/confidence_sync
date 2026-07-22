"use client";

import * as React from "react";

import { NavMain } from "@/components/Sidebar/nav-main";
import { NavUser } from "@/components/Sidebar/nav-user";
import { DashboardSwitcher } from "@/components/Sidebar/dashboard-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { type LucideIcon } from "lucide-react";
import { SidebarToggle } from "./sidebar-toggle";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export type DashboardItem = {
  name: string;
  icon: LucideIcon;
};

export type LinkItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
};

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  dashboards?: DashboardItem[];
  links: LinkItem[];
}

export function AppSidebar({ dashboards, links, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarToggle />
        <DashboardSwitcher dashboards={dashboards} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={links} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
