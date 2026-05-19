import { supabase } from "@/integrations/supabase/client";

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  banner_image: string | null;
  color: string | null;
  search_keywords: string | null;
  sort_order: number;
  visible: boolean;
};

export type Service = {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  icon: string | null;
  hero_image: string | null;
  gallery_images: string[];
  tags: string[];
  search_keywords: string | null;
  price_amount: number | null;
  price_currency: string | null;
  price_label: string | null;
  duration_minutes: number | null;
  recommended_clinicians: string[];
  whats_included: string[];
  preparation: string | null;
  featured: boolean;
  visible: boolean;
  sort_order: number;
  cta_label: string | null;
  cta_href: string | null;
};

export type ServiceFaq = {
  id: string;
  service_id: string | null;
  question: string;
  answer: string;
  sort_order: number;
  visible: boolean;
};

export type ServicesPage = {
  id: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  hero_image: string | null;
  intro_stats: { label: string; value: string }[];
  cta_badge: string;
  cta_title: string;
  cta_description: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  cta_image: string | null;
  seo_title: string;
  seo_description: string;
};

const T = {
  cats: "medicare_service_categories" as const,
  svcs: "medicare_services" as const,
  faqs: "medicare_service_faqs" as const,
  page: "medicare_services_page" as const,
};

const arr = (v: any): any[] => (Array.isArray(v) ? v : []);

export async function fetchAll() {
  const [cats, svcs, faqs, page] = await Promise.all([
    supabase.from(T.cats as any).select("*").order("sort_order"),
    supabase.from(T.svcs as any).select("*").order("sort_order"),
    supabase.from(T.faqs as any).select("*").order("sort_order"),
    supabase.from(T.page as any).select("*").limit(1).maybeSingle(),
  ]);

  return {
    categories: ((cats.data || []) as unknown) as ServiceCategory[],
    services: (((svcs.data || []) as unknown) as any[]).map((s) => ({
      ...s,
      gallery_images: arr(s.gallery_images),
      tags: arr(s.tags),
      recommended_clinicians: arr(s.recommended_clinicians),
      whats_included: arr(s.whats_included),
    })) as Service[],
    faqs: ((faqs.data || []) as unknown) as ServiceFaq[],
    page: page.data
      ? ({ ...(page.data as any), intro_stats: arr((page.data as any).intro_stats) } as ServicesPage)
      : null,
  };
}

export async function upsertCategory(row: Partial<ServiceCategory>) {
  const payload: any = { ...row };
  if (!payload.id) delete payload.id;
  const { data, error } = await supabase.from(T.cats as any).upsert(payload).select().maybeSingle();
  if (error) throw error;
  return data;
}
export async function deleteCategory(id: string) {
  const { error } = await supabase.from(T.cats as any).delete().eq("id", id);
  if (error) throw error;
}

export async function upsertService(row: Partial<Service>) {
  const payload: any = { ...row };
  if (!payload.id) delete payload.id;
  const { data, error } = await supabase.from(T.svcs as any).upsert(payload).select().maybeSingle();
  if (error) throw error;
  return data;
}
export async function deleteService(id: string) {
  const { error } = await supabase.from(T.svcs as any).delete().eq("id", id);
  if (error) throw error;
}

export async function upsertFaq(row: Partial<ServiceFaq>) {
  const payload: any = { ...row };
  if (!payload.id) delete payload.id;
  const { data, error } = await supabase.from(T.faqs as any).upsert(payload).select().maybeSingle();
  if (error) throw error;
  return data;
}
export async function deleteFaq(id: string) {
  const { error } = await supabase.from(T.faqs as any).delete().eq("id", id);
  if (error) throw error;
}

export async function updatePage(row: Partial<ServicesPage> & { id: string }) {
  const { data, error } = await supabase.from(T.page as any).update(row).eq("id", row.id).select().maybeSingle();
  if (error) throw error;
  return data;
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
