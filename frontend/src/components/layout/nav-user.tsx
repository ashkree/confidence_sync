import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/features/auth/types";

import {
  ChevronsUpDownIcon,
  LogOutIcon,
  UserIcon,
  UsersRound,
} from "lucide-react";
import { SHOW_DEV_TOOLS } from "@/lib/env";
import { useAppEnv } from "@/contexts/app-env";
import { useNavigate } from "@tanstack/react-router";
import { MOCK_USERS } from "@/features/auth/api/auth.mock";

export function NavUser({
  user,
  onLogout,
  onSwitchUser,
}: {
  user: User | null;
  onLogout: () => void;
  onSwitchUser?: (email: string, password: string) => Promise<void>;
}) {
  const { isMobile } = useSidebar();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { appEnv } = useAppEnv();
  const navigate = useNavigate();

  const initials = (user?.name ?? "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSwitch = async (email: string) => {
    if (onSwitchUser) {
      await onSwitchUser(email, "Passw0rd!");
      setSheetOpen(false);
      navigate({ to: "/employee" });

      window.location.reload();
    }
  };

  const mockEntries = MOCK_USERS ? Object.entries(MOCK_USERS) : [];
  const employees = mockEntries.filter(([, u]) => u.role === "EMPLOYEE");
  const hrAdmins = mockEntries.filter(
    ([, u]) => u.role === "ADMIN" && u.department === "HR",
  );
  const itAdmins = mockEntries.filter(
    ([, u]) => u.role === "ADMIN" && u.department === "IT",
  );

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  tooltip={user?.name ?? "Account"}
                  className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8! aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
                />
              }
            >
              <Avatar className="size-8 shrink-0 rounded-md">
                <AvatarFallback className="rounded-md bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="truncate text-xs opacity-70">{user?.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-fit"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 shrink-0 rounded-md">
                      <AvatarFallback className="rounded-md bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.name}</span>
                      <span className="truncate text-xs opacity-70">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    navigate({ to: "/profile" });
                  }}
                >
                  <UserIcon />
                  My Profile
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {SHOW_DEV_TOOLS && appEnv !== "prod" && (
                <DropdownMenuItem onClick={() => setSheetOpen(true)}>
                  <UsersRound />
                  Switch User
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  onLogout();
                }}
              >
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {SHOW_DEV_TOOLS && appEnv !== "prod" && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Switch User</SheetTitle>
              <SheetDescription>
                Select a mock user to switch to instantly.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 p-4 overflow-y-auto">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Employees
                </h4>
                <div className="flex flex-col gap-1">
                  {employees.map(([email, u]) => (
                    <Button
                      key={email}
                      variant={user?.email === email ? "default" : "ghost"}
                      className="justify-start h-auto py-2"
                      onClick={() => handleSwitch(email)}
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-medium">{u.name}</span>
                        <span className="text-xs opacity-70">{email}</span>
                      </div>
                      {user?.email === email && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Active
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  HR Admins
                </h4>
                <div className="flex flex-col gap-1">
                  {hrAdmins.map(([email, u]) => (
                    <Button
                      key={email}
                      variant={user?.email === email ? "default" : "ghost"}
                      className="justify-start h-auto py-2"
                      onClick={() => handleSwitch(email)}
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-medium">{u.name}</span>
                        <span className="text-xs opacity-70">{email}</span>
                      </div>
                      {user?.email === email && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Active
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  IT Admins
                </h4>
                <div className="flex flex-col gap-1">
                  {itAdmins.map(([email, u]) => (
                    <Button
                      key={email}
                      variant={user?.email === email ? "default" : "ghost"}
                      className="justify-start h-auto py-2"
                      onClick={() => handleSwitch(email)}
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-medium">{u.name}</span>
                        <span className="text-xs opacity-70">{email}</span>
                      </div>
                      {user?.email === email && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Active
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
