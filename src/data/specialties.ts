import {
  Heart, Baby, Brain, Stethoscope, Sparkles, Bone, Eye, Activity, Pill, Users,
  type LucideIcon,
} from "lucide-react";

export type SpecialtyChip = {
  name: string;
  count: number;
  icon: LucideIcon;
};

export const SPECIALTY_CHIPS: SpecialtyChip[] = [
  { name: "Internal Medicine", count: 51, icon: Activity },
  { name: "Surgery", count: 33, icon: Stethoscope },
  { name: "Paediatrics", count: 68, icon: Baby },
  { name: "Obstetrics & Gynaecology", count: 42, icon: Heart },
  { name: "Psychiatry", count: 35, icon: Brain },
  { name: "Primary & Preventive Care", count: 20, icon: Users },
];
