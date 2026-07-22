import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { LayoutDashboard, Plus, BookOpenIcon, User } from "lucide-react";

const employeeLinks = [
  {
    title: "Overview",
    url: "/employee",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Submit a request",
    url: "/employee/ticket/submit",
    icon: Plus,
  },
  {
    title: "Knowledge Base",
    url: "/employee/kb",
    icon: BookOpenIcon,
  },
  {
    title: "My Profile",
    url: "/employee/profile",
    icon: User,
  },
];

export default function EmployeeSidebar() {
  return <AppSidebar links={employeeLinks} />;
}
