import { LayoutDashboard, CalendarClock, Stethoscope, Users, Pill, FlaskConical, Send, Settings as SettingsIcon } from "lucide-react";
import type { PortalNavItem } from "@/components/portal/PortalLayout";

export const doctorNav: PortalNavItem[] = [
  { title: "Dashboard", url: "/doctor", icon: LayoutDashboard },
  { title: "Schedule", url: "/doctor/schedule", icon: CalendarClock },
  { title: "Consultations", url: "/doctor/consultations", icon: Stethoscope },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Prescriptions", url: "/doctor/prescriptions", icon: Pill },
  { title: "Investigations", url: "/doctor/investigations", icon: FlaskConical },
  { title: "Referrals", url: "/doctor/referrals", icon: Send },
  { title: "Settings", url: "/doctor/settings", icon: SettingsIcon },
];
