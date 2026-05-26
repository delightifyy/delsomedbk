const STORAGE_KEY = "medicare:services-cms:v1";

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

type CmsState = {
  categories: ServiceCategory[];
  services: Service[];
  faqs: ServiceFaq[];
  page: ServicesPage;
};

const uid = (p = "id") => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const defaultState = (): CmsState => ({
  categories: [
    { id: "cat-1", name: "General Practice", slug: "general-practice", description: "Everyday primary care and check-ups.", icon: "Stethoscope", banner_image: null, color: null, search_keywords: null, sort_order: 0, visible: true },
    { id: "cat-2", name: "Specialist Consultations", slug: "specialist", description: "Access leading specialists across multiple disciplines.", icon: "HeartPulse", banner_image: null, color: null, search_keywords: null, sort_order: 1, visible: true },
    { id: "cat-3", name: "Diagnostics & Screening", slug: "diagnostics", description: "Comprehensive health checks and laboratory tests.", icon: "FlaskConical", banner_image: null, color: null, search_keywords: null, sort_order: 2, visible: true },
  ],
  services: [
    { id: "svc-1", category_id: "cat-1", title: "GP Consultation", slug: "gp-consultation", summary: "Same-day appointments with experienced general practitioners.", description: "Comprehensive in-person or video consultations covering everyday illnesses, minor injuries, prescriptions and referrals.", icon: "Stethoscope", hero_image: null, gallery_images: [], tags: ["Same-day", "In-person", "Video"], search_keywords: null, price_amount: 95, price_currency: "GBP", price_label: "From £95", duration_minutes: 20, recommended_clinicians: ["GP", "Family Doctor"], whats_included: ["Full medical assessment", "Prescription if needed", "Referral letters", "Follow-up notes"], preparation: null, featured: true, visible: true, sort_order: 0, cta_label: null, cta_href: null },
    { id: "svc-2", category_id: "cat-3", title: "Health Screening", slug: "health-screening", summary: "Comprehensive head-to-toe screening tailored to your age and lifestyle.", description: "A full-body screening including bloods, ECG, and a detailed report with lifestyle recommendations.", icon: "Activity", hero_image: null, gallery_images: [], tags: ["Preventive", "Bloods", "ECG"], search_keywords: null, price_amount: 450, price_currency: "GBP", price_label: "From £450", duration_minutes: 90, recommended_clinicians: ["GP", "Cardiologist"], whats_included: ["Blood panel", "ECG", "Body composition", "Doctor consultation", "Written report"], preparation: null, featured: false, visible: true, sort_order: 1, cta_label: null, cta_href: null },
  ],
  faqs: [
    { id: "faq-1", service_id: null, question: "How quickly can I be seen?", answer: "Most appointments are available same day or next day, both in-person and via video.", sort_order: 0, visible: true },
    { id: "faq-2", service_id: null, question: "Do you accept private medical insurance?", answer: "Yes — we are recognised by all major private health insurers.", sort_order: 1, visible: true },
  ],
  page: {
    id: "page-1",
    hero_eyebrow: "Our Services",
    hero_title: "Healthcare designed around you",
    hero_description: "Discover our full range of medical services — from everyday GP care to specialist consultations.",
    hero_image: null,
    intro_stats: [{ label: "Clinicians", value: "12+" }],
    cta_badge: "Ready when you are",
    cta_title: "Book your consultation today",
    cta_description: "Speak to a certified doctor in minutes. Same-day appointments available.",
    cta_primary_label: "Book Appointment",
    cta_primary_href: "#cta",
    cta_secondary_label: "Talk to Us",
    cta_secondary_href: "#contact",
    cta_image: null,
    seo_title: "Services — MediCare",
    seo_description: "Explore the full range of MediCare services.",
  },
});

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const loadState = (): CmsState => {
  if (typeof window === "undefined") return defaultState();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = defaultState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return clone(initial);
  }
  try {
    const parsed = JSON.parse(raw) as Partial<CmsState>;
    const initial = defaultState();
    return {
      categories: Array.isArray(parsed.categories) ? (parsed.categories as ServiceCategory[]) : initial.categories,
      services: Array.isArray(parsed.services) ? (parsed.services as Service[]) : initial.services,
      faqs: Array.isArray(parsed.faqs) ? (parsed.faqs as ServiceFaq[]) : initial.faqs,
      page: parsed.page ? ({ ...initial.page, ...(parsed.page as ServicesPage) } as ServicesPage) : initial.page,
    };
  } catch {
    const initial = defaultState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return clone(initial);
  }
};

const saveState = (state: CmsState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const normalizeService = (row: Partial<Service>, fallbackOrder: number): Service => ({
  id: row.id ?? uid("svc"),
  category_id: row.category_id ?? null,
  title: row.title ?? "New service",
  slug: row.slug ?? slugify(row.title ?? "new-service"),
  summary: row.summary ?? null,
  description: row.description ?? null,
  icon: row.icon ?? "Stethoscope",
  hero_image: row.hero_image ?? null,
  gallery_images: Array.isArray(row.gallery_images) ? row.gallery_images : [],
  tags: Array.isArray(row.tags) ? row.tags : [],
  search_keywords: row.search_keywords ?? null,
  price_amount: row.price_amount ?? null,
  price_currency: row.price_currency ?? "GBP",
  price_label: row.price_label ?? null,
  duration_minutes: row.duration_minutes ?? null,
  recommended_clinicians: Array.isArray(row.recommended_clinicians) ? row.recommended_clinicians : [],
  whats_included: Array.isArray(row.whats_included) ? row.whats_included : [],
  preparation: row.preparation ?? null,
  featured: row.featured ?? false,
  visible: row.visible ?? true,
  sort_order: row.sort_order ?? fallbackOrder,
  cta_label: row.cta_label ?? null,
  cta_href: row.cta_href ?? null,
});

const normalizeCategory = (row: Partial<ServiceCategory>, fallbackOrder: number): ServiceCategory => ({
  id: row.id ?? uid("cat"),
  name: row.name ?? "New category",
  slug: row.slug ?? slugify(row.name ?? "new-category"),
  description: row.description ?? null,
  icon: row.icon ?? "Stethoscope",
  banner_image: row.banner_image ?? null,
  color: row.color ?? null,
  search_keywords: row.search_keywords ?? null,
  sort_order: row.sort_order ?? fallbackOrder,
  visible: row.visible ?? true,
});

export async function fetchAll() {
  const { categories, services, faqs, page } = loadState();
  return {
    categories: clone(categories).sort((a, b) => a.sort_order - b.sort_order),
    services: clone(services).sort((a, b) => a.sort_order - b.sort_order),
    faqs: clone(faqs).sort((a, b) => a.sort_order - b.sort_order),
    page: clone(page),
  };
}

export async function upsertCategory(row: Partial<ServiceCategory>) {
  const state = loadState();
  const next = normalizeCategory(row, state.categories.length);
  const index = state.categories.findIndex((item) => item.id === next.id);
  if (index >= 0) state.categories[index] = { ...state.categories[index], ...next };
  else state.categories.push(next);
  saveState(state);
  return clone(next);
}
export async function deleteCategory(id: string) {
  const state = loadState();
  state.categories = state.categories.filter((item) => item.id !== id);
  state.services = state.services.map((service) => (service.category_id === id ? { ...service, category_id: null } : service));
  saveState(state);
}

export async function upsertService(row: Partial<Service>) {
  const state = loadState();
  const next = normalizeService(row, state.services.length);
  const index = state.services.findIndex((item) => item.id === next.id);
  if (index >= 0) state.services[index] = { ...state.services[index], ...next };
  else state.services.push(next);
  saveState(state);
  return clone(next);
}
export async function deleteService(id: string) {
  const state = loadState();
  state.services = state.services.filter((item) => item.id !== id);
  state.faqs = state.faqs.filter((faq) => faq.service_id !== id);
  saveState(state);
}

export async function upsertFaq(row: Partial<ServiceFaq>) {
  const state = loadState();
  const next: ServiceFaq = {
    id: row.id ?? uid("faq"),
    service_id: row.service_id ?? null,
    question: row.question ?? "New question",
    answer: row.answer ?? "",
    sort_order: row.sort_order ?? state.faqs.length,
    visible: row.visible ?? true,
  };
  const index = state.faqs.findIndex((item) => item.id === next.id);
  if (index >= 0) state.faqs[index] = { ...state.faqs[index], ...next };
  else state.faqs.push(next);
  saveState(state);
  return clone(next);
}
export async function deleteFaq(id: string) {
  const state = loadState();
  state.faqs = state.faqs.filter((item) => item.id !== id);
  saveState(state);
}

export async function updatePage(row: Partial<ServicesPage> & { id: string }) {
  const state = loadState();
  state.page = { ...state.page, ...row, id: row.id };
  saveState(state);
  return clone(state.page);
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
