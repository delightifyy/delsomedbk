import { LayoutDashboard, CalendarDays, FileText, Pill, CreditCard, Settings as SettingsIcon } from "lucide-react";
import type { PortalNavItem } from "@/components/portal/PortalLayout";

export const patientNav: PortalNavItem[] = [
  { title: "Dashboard", url: "/patient", icon: LayoutDashboard },
  { title: "Appointments", url: "/patient/appointments", icon: CalendarDays },
  { title: "Medical Records", url: "/patient/records", icon: FileText },
  { title: "Prescriptions", url: "/patient/prescriptions", icon: Pill },
  { title: "Payments", url: "/patient/payments", icon: CreditCard },
  { title: "Settings", url: "/patient/settings", icon: SettingsIcon },
];
