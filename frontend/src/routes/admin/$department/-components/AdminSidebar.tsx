import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import {
  LayoutDashboard,
  Plus,
  BookOpenIcon,
  User,
  GalleryVerticalIcon,
  Computer,
  PersonStanding,
} from "lucide-react";

const dashboards = [
  {
    name: "Employee Portal",
    icon: GalleryVerticalIcon,
  },
  {
    name: "IT Dashboard",
    icon: Computer,
  },
  {
    name: "HR Dashboard",
    icon: PersonStanding,
  },
];
const adminLinks = [
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

export default function AdminSidebar() {
  return <AppSidebar dashboards={dashboards} links={adminLinks} />;
}
