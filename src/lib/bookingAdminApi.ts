import { supabase } from "@/integrations/supabase/client";

export type TableName =
  | "booking_concern_categories"
  | "booking_concerns"
  | "booking_clinician_types"
  | "booking_concern_clinician_map"
  | "booking_time_slots"
  | "booking_intake_fields"
  | "booking_legal_agreements"
  | "booking_payment_methods"
  | "booking_hmo_providers"
  | "booking_subscription_plans"
  | "booking_settings"
  | "bookings";

export async function listAll(table: TableName, orderBy = "sort_order") {
  const { data, error } = await supabase
    .from(table as any)
    .select("*")
    .order(orderBy as any, { ascending: true });
  if (error) throw error;
  return (data || []) as any[];
}

export async function listBy(table: TableName, orderBy: string, asc = true) {
  const { data, error } = await supabase
    .from(table as any)
    .select("*")
    .order(orderBy as any, { ascending: asc });
  if (error) throw error;
  return (data || []) as any[];
}

export async function upsertRow(table: TableName, row: any) {
  const isNew = !row.id;
  if (isNew) delete row.id;
  const { data, error } = await supabase
    .from(table as any)
    .upsert(row)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteRow(table: TableName, id: string) {
  const { error } = await supabase.from(table as any).delete().eq("id", id);
  if (error) throw error;
}
