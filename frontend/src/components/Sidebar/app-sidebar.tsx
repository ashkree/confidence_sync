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
import {
  GalleryVerticalEndIcon,
  BookOpenIcon,
  LayoutDashboard,
  Plus,
  User,
  Computer,
  PersonStanding,
} from "lucide-react";
import { SidebarToggle } from "./sidebar-toggle";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  dashboards: [
    {
      name: "Employee Portal",
      icon: GalleryVerticalEndIcon,
    },
    {
      name: "IT Dashboard",
      icon: Computer,
    },
    {
      name: "HR Dashboard",
      icon: PersonStanding,
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Submit a request",
      url: "#",
      icon: Plus,
    },
    {
      title: "Knowledge Base",
      url: "#",
      icon: BookOpenIcon,
    },
    {
      title: "My Profile",
      url: "#",
      icon: User,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarToggle />
        <DashboardSwitcher dashboards={data.dashboards} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
