import {
  Stethoscope, ShieldCheck, Bot, Clock, FileText, Headphones, Globe2, Award,
  HeartPulse, Brain, Pill, Eye, Activity, FlaskConical, Video, MessageSquare,
  Phone, Mail, MapPin, Users, Building2, CheckCircle2, Star, Sparkles,
  Smartphone, Baby, Bone, Microscope, Syringe, Ambulance, Search,
  CalendarCheck, MonitorSmartphone, BellRing, Languages, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { LucideIconName } from "@/lib/medicareSettings";

export const ICONS: Record<LucideIconName, LucideIcon> = {
  Stethoscope, ShieldCheck, Bot, Clock, FileText, Headphones, Globe2, Award,
  HeartPulse, Brain, Pill, Eye, Activity, FlaskConical, Video, MessageSquare,
  Phone, Mail, MapPin, Users, Building2, CheckCircle2, Star, Sparkles,
  Smartphone, Baby, Bone, Microscope, Syringe, Ambulance, Search,
  CalendarCheck, MonitorSmartphone, BellRing, Languages, ArrowRight,
};

export const ICON_NAMES = Object.keys(ICONS) as LucideIconName[];

export const Icon = ({ name, className }: { name: LucideIconName; className?: string }) => {
  const Cmp = ICONS[name] ?? Stethoscope;
  return <Cmp className={className} />;
};
