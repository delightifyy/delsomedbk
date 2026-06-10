import { LayoutDashboard, CalendarDays, History, Pill, CreditCard, Settings as SettingsIcon, Stethoscope } from "lucide-react";
import type { PortalNavItem } from "@/components/portal/PortalLayout";

export const patientNav: PortalNavItem[] = [
  { title: "Dashboard", url: "/patient", icon: LayoutDashboard },
  { title: "Appointments", url: "/patient/appointments", icon: CalendarDays },
  { title: "Find Doctors", url: "/doctors", icon: Stethoscope },
  { title: "Consultation History", url: "/patient/consultations", icon: History },
  { title: "Prescriptions", url: "/patient/prescriptions", icon: Pill },
  { title: "Payments", url: "/patient/payments", icon: CreditCard },
  { title: "Settings", url: "/patient/settings", icon: SettingsIcon },
];
