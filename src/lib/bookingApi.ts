import { supabase } from "@/integrations/supabase/client";

export type ConcernCategory = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  active: boolean;
};

export type Concern = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  tags: string[];
  severity: string | null;
  sort_order: number;
  active: boolean;
};

export type ClinicianType = {
  id: string;
  title: string;
  description: string | null;
  treats: string | null;
  price_cents: number;
  currency: string;
  wait_time_minutes: number;
  duration_minutes: number;
  badge: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

export type ConcernClinicianMap = {
  id: string;
  concern_id: string;
  clinician_type_id: string;
  priority: number;
  recommended: boolean;
};

export type TimeSlot = {
  id: string;
  clinician_type_id: string | null;
  slot_date: string;
  slot_time: string;
  capacity: number;
  booked_count: number;
  status: string;
};

export type IntakeField = {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  placeholder: string | null;
  options: any;
  required: boolean;
  visible: boolean;
  sort_order: number;
};

export type LegalAgreement = {
  id: string;
  key: string;
  title: string;
  body: string;
  required: boolean;
  agreement_type: string;
  sort_order: number;
  active: boolean;
};

export type PaymentMethod = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  icon: string | null;
  enabled: boolean;
  sort_order: number;
};

export type HmoProvider = { id: string; name: string; active: boolean };
export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  billing_period: string;
  perks: string[];
  active: boolean;
};

export type BookingSettings = {
  id: string;
  currency: string;
  currency_symbol: string;
  emergency_warning: string;
  booking_notice: string;
  confirmation_message: string;
  tax_percent: number;
};

export async function fetchBookingData() {
  const [
    cats,
    concerns,
    clinicians,
    map,
    intake,
    legal,
    methods,
    hmos,
    plans,
    settings,
  ] = await Promise.all([
    supabase.from("booking_concern_categories").select("*").eq("active", true).order("sort_order"),
    supabase.from("booking_concerns").select("*").eq("active", true).order("sort_order"),
    supabase.from("booking_clinician_types").select("*").eq("active", true).order("sort_order"),
    supabase.from("booking_concern_clinician_map").select("*"),
    supabase.from("booking_intake_fields").select("*").eq("visible", true).order("sort_order"),
    supabase.from("booking_legal_agreements").select("*").eq("active", true).order("sort_order"),
    supabase.from("booking_payment_methods").select("*").eq("enabled", true).order("sort_order"),
    supabase.from("booking_hmo_providers").select("*").eq("active", true).order("sort_order"),
    supabase.from("booking_subscription_plans").select("*").eq("active", true).order("sort_order"),
    supabase.from("booking_settings").select("*").maybeSingle(),
  ]);

  return {
    categories: (cats.data || []) as ConcernCategory[],
    concerns: (concerns.data || []) as Concern[],
    clinicians: (clinicians.data || []) as ClinicianType[],
    map: (map.data || []) as ConcernClinicianMap[],
    intakeFields: (intake.data || []) as IntakeField[],
    legal: (legal.data || []) as LegalAgreement[],
    methods: (methods.data || []) as PaymentMethod[],
    hmos: (hmos.data || []) as HmoProvider[],
    plans: (plans.data || []) as SubscriptionPlan[],
    settings: (settings.data || null) as BookingSettings | null,
  };
}

export async function fetchSlotsFor(clinicianTypeId: string, fromDate: string, toDate: string) {
  const { data } = await supabase
    .from("booking_time_slots")
    .select("*")
    .eq("clinician_type_id", clinicianTypeId)
    .gte("slot_date", fromDate)
    .lte("slot_date", toDate)
    .order("slot_date")
    .order("slot_time");
  return (data || []) as TimeSlot[];
}

export function formatPrice(cents: number, symbol = "₦") {
  return `${symbol}${(cents / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}
