import { LayoutDashboard, Users, BarChart3, Receipt, FileText, Settings as SettingsIcon } from "lucide-react";
import type { PortalNavItem } from "@/components/portal/PortalLayout";

export const orgNav: PortalNavItem[] = [
  { title: "Dashboard", url: "/organization", icon: LayoutDashboard },
  { title: "Staff", url: "/organization/staff", icon: Users },
  { title: "Usage", url: "/organization/usage", icon: BarChart3 },
  { title: "Billing", url: "/organization/billing", icon: Receipt },
  { title: "Invoices", url: "/organization/invoices", icon: FileText },
  { title: "Settings", url: "/organization/settings", icon: SettingsIcon },
];
