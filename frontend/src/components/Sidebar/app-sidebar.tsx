"use client";

import * as React from "react";

import { NavMain } from "@/components/Sidebar/nav-main";
import { NavUser } from "@/components/Sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { type LucideIcon } from "lucide-react";
import { SidebarToggle } from "./sidebar-toggle";
import { useAuth } from "@/auth";
import { useNavigate } from "@tanstack/react-router";

export type LinkItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

export type LinkGroup = {
  name: string;
  items: LinkItem[];
};

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  groups: LinkGroup[];
}

export function AppSidebar({ groups, ...props }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({
      to: "/login",
      search: {
        redirect: "/employee",
      },
    });
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarToggle />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={groups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
