"use client";

import { Link } from "@tanstack/react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { LinkGroup } from "./app-sidebar";

export function NavMain({ groups }: { groups: LinkGroup[] }) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.name}>
          <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={
                    <Link
                      to={item.url}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                    />
                  }
                  tooltip={item.title}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
