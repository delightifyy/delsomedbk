import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Save, Layers,
  Wrench, MessageSquare, Settings as SettingsIcon, ExternalLink, Star, StarOff,
  ChevronRight, Loader2, X,
} from "lucide-react";
import {
  fetchAll, upsertCategory, deleteCategory, upsertService, deleteService,
  upsertFaq, deleteFaq, updatePage, slugify,
  type Service, type ServiceCategory, type ServiceFaq, type ServicesPage,
} from "@/lib/medicareServicesApi";
import { ImageUploader } from "@/components/medicare-admin/ImageUploader";
import { Icon, ICON_NAMES } from "@/components/medicare-admin/icons";
import type { LucideIconName } from "@/lib/medicareSettings";

const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";
const textareaCls = inputCls + " min-h-[90px]";

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="block">
    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
  </label>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 ${className}`}>{children}</div>
);

const SectionHeader = ({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) => (
  <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {desc && <p className="text-sm text-slate-500 mt-1">{desc}</p>}
    </div>
    {action}
  </div>
);

const IconPicker = ({ value, onChange }: { value: string; onChange: (n: string) => void }) => (
  <select value={value || "Stethoscope"} onChange={(e) => onChange(e.target.value)} className={inputCls}>
    {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
  </select>
);

const ModalShell = ({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 p-5">{footer}</div>}
      </div>
    </div>
  );
};

type Tab = "page" | "categories" | "services" | "faqs";
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "page", label: "Page Content", icon: SettingsIcon },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "services", label: "Services", icon: Wrench },
  { id: "faqs", label: "FAQs", icon: MessageSquare },
];

const MediCareServicesAdmin = () => {
  const [tab, setTab] = useState<Tab>("page");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [faqs, setFaqs] = useState<ServiceFaq[]>([]);
  const [page, setPage] = useState<ServicesPage | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const r = await fetchAll();
      setCategories(r.categories);
      setServices(r.services);
      setFaqs(r.faqs);
      setPage(r.page);
    } catch (e: any) {
      toast.error(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "MediCare — Services Admin";
    reload();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/doctor-portal/admin" className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" /> Back to CMS
            </Link>
            <span className="hidden sm:block h-5 w-px bg-slate-200" />
            <h1 className="hidden sm:block font-bold text-slate-900">Services CMS</h1>
          </div>
          <a href="/doctor-portal/services" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
            <ExternalLink className="h-4 w-4" /> View page
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <main>
          {loading ? (
            <div className="grid place-items-center py-24 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {/* All service admin editors on a single page (no sidebar/tabs) */}
              <PageEditor page={page} reload={reload} />
              <CategoriesEditor categories={categories} reload={reload} services={services} />
              <ServicesEditor services={services} categories={categories} reload={reload} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MediCareServicesAdmin;

/* ============== Page Editor ============== */
const PageEditor = ({ page, reload }: { page: ServicesPage | null; reload: () => void }) => {
  const [draft, setDraft] = useState<ServicesPage | null>(page);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(page), [page]);

  if (!draft) return <Card><p className="text-sm text-slate-500">Page data not initialized.</p></Card>;

  const set = (patch: Partial<ServicesPage>) => setDraft((p) => p ? { ...p, ...patch } : p);
  const stats = draft.intro_stats || [];

  const save = async () => {
    setSaving(true);
    try { await updatePage(draft); toast.success("Page saved"); reload(); }
    catch (e: any) { toast.error(e.message || "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Page Content" desc="Hero, intro stats, CTA banner and SEO."
        action={<button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>}
      />

      <Card>
        <h3 className="font-bold mb-4">Hero</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow"><input className={inputCls} value={draft.hero_eyebrow || ""} onChange={(e) => set({ hero_eyebrow: e.target.value })} /></Field>
          <Field label="Title"><input className={inputCls} value={draft.hero_title || ""} onChange={(e) => set({ hero_title: e.target.value })} /></Field>
          <Field label="Description" hint="Shown under the title">
            <textarea className={textareaCls} value={draft.hero_description || ""} onChange={(e) => set({ hero_description: e.target.value })} />
          </Field>
          <Field label="Hero image">
            <ImageUploader value={draft.hero_image || ""} onChange={(url) => set({ hero_image: url })} />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Intro stats</h3>
          <button onClick={() => set({ intro_stats: [...stats, { label: "New stat", value: "0" }] })}
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600"><Plus className="h-4 w-4" /> Add</button>
        </div>
        <div className="space-y-2">
          {stats.map((st, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input className={inputCls} placeholder="Value e.g. 98%" value={st.value} onChange={(e) => set({ intro_stats: stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x) })} />
              <input className={inputCls} placeholder="Label e.g. Satisfaction" value={st.label} onChange={(e) => set({ intro_stats: stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} />
              <button onClick={() => set({ intro_stats: stats.filter((_, j) => j !== i) })} className="text-rose-600 hover:bg-rose-50 rounded-lg px-2"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-4">CTA Banner</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Badge"><input className={inputCls} value={draft.cta_badge || ""} onChange={(e) => set({ cta_badge: e.target.value })} /></Field>
          <Field label="Title"><input className={inputCls} value={draft.cta_title || ""} onChange={(e) => set({ cta_title: e.target.value })} /></Field>
          <Field label="Description"><textarea className={textareaCls} value={draft.cta_description || ""} onChange={(e) => set({ cta_description: e.target.value })} /></Field>
          <Field label="Background image">
            <ImageUploader value={draft.cta_image || ""} onChange={(url) => set({ cta_image: url })} />
          </Field>
          <Field label="Primary button label"><input className={inputCls} value={draft.cta_primary_label || ""} onChange={(e) => set({ cta_primary_label: e.target.value })} /></Field>
          <Field label="Primary button link"><input className={inputCls} value={draft.cta_primary_href || ""} onChange={(e) => set({ cta_primary_href: e.target.value })} /></Field>
          <Field label="Secondary button label"><input className={inputCls} value={draft.cta_secondary_label || ""} onChange={(e) => set({ cta_secondary_label: e.target.value })} /></Field>
          <Field label="Secondary button link"><input className={inputCls} value={draft.cta_secondary_href || ""} onChange={(e) => set({ cta_secondary_href: e.target.value })} /></Field>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-4">SEO</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Page title"><input className={inputCls} value={draft.seo_title || ""} onChange={(e) => set({ seo_title: e.target.value })} /></Field>
          <Field label="Meta description"><textarea className={textareaCls} value={draft.seo_description || ""} onChange={(e) => set({ seo_description: e.target.value })} /></Field>
        </div>
      </Card>
    </div>
  );
};

/* ============== Categories Editor ============== */
const CategoriesEditor = ({
  categories, reload, services,
}: { categories: ServiceCategory[]; reload: () => void; services: Service[] }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<Partial<ServiceCategory>>({
    name: "",
    slug: "",
    description: "",
    icon: "Stethoscope",
    banner_image: null,
    color: null,
    search_keywords: "",
    sort_order: categories.length,
    visible: true,
  });

  useEffect(() => {
    if (!addOpen) return;
    setAddDraft({
      name: "",
      slug: "",
      description: "",
      icon: "Stethoscope",
      banner_image: null,
      color: null,
      search_keywords: "",
      sort_order: categories.length,
      visible: true,
    });
  }, [addOpen, categories.length]);

  const saveNewCategory = async () => {
    const name = (addDraft.name ?? "").trim();
    if (!name) return toast.error("Category name is required");
    try {
      await upsertCategory({
        ...addDraft,
        name,
        slug: slugify(addDraft.slug?.trim() || name),
        sort_order: addDraft.sort_order ?? categories.length,
        visible: addDraft.visible ?? true,
      });
      toast.success("Category added");
      setAddOpen(false);
      reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to add category");
    }
  };

  const move = async (c: ServiceCategory, dir: -1 | 1) => {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === c.id);
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx], b = sorted[swap];
    try {
      await Promise.all([
        upsertCategory({ id: a.id, sort_order: b.sort_order } as any),
        upsertCategory({ id: b.id, sort_order: a.sort_order } as any),
      ]);
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Categories" desc="Group services into navigable categories."
        action={<button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"><Plus className="h-4 w-4" /> Add</button>}
      />
      {categories.length === 0 && <Card><p className="text-sm text-slate-500">No categories yet.</p></Card>}
      {categories.map((c) => (
        <CategoryRow key={c.id} cat={c} reload={reload} move={move}
          serviceCount={services.filter((s) => s.category_id === c.id).length} />
      ))}

      <ModalShell
        open={addOpen}
        title="Add Category"
        onClose={() => setAddOpen(false)}
        footer={(
          <>
            <button onClick={() => setAddOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button onClick={saveNewCategory} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700">
              <Save className="h-4 w-4" /> Save Category
            </button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input className={inputCls} value={addDraft.name ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, name: e.target.value, slug: d.slug?.trim() ? d.slug : slugify(e.target.value) }))} />
          </Field>
          <Field label="Slug">
            <input className={inputCls} value={addDraft.slug ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} />
          </Field>
          <Field label="Icon">
            <IconPicker value={(addDraft.icon as string) || "Stethoscope"} onChange={(v) => setAddDraft((d) => ({ ...d, icon: v }))} />
          </Field>
          <Field label="Color tag">
            <input className={inputCls} value={addDraft.color ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, color: e.target.value }))} placeholder="#1F8FFF" />
          </Field>
          <Field label="Description">
            <textarea className={textareaCls} value={addDraft.description ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, description: e.target.value }))} />
          </Field>
          <Field label="Banner image">
            <ImageUploader value={addDraft.banner_image || ""} onChange={(url) => setAddDraft((d) => ({ ...d, banner_image: url }))} />
          </Field>
          <Field label="Search keywords" hint="Helps users find this category">
            <input className={inputCls} value={addDraft.search_keywords ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, search_keywords: e.target.value }))} />
          </Field>
          <Field label="Sort order">
            <input type="number" className={inputCls} value={addDraft.sort_order ?? categories.length} onChange={(e) => setAddDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))} />
          </Field>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            <input type="checkbox" checked={addDraft.visible ?? true} onChange={(e) => setAddDraft((d) => ({ ...d, visible: e.target.checked }))} />
            Visible
          </label>
        </div>
      </ModalShell>
    </div>
  );
};

const CategoryRow = ({
  cat, reload, move, serviceCount,
}: { cat: ServiceCategory; reload: () => void; move: (c: ServiceCategory, d: -1 | 1) => void; serviceCount: number }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(cat);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(cat), [cat]);

  const set = (p: Partial<ServiceCategory>) => setDraft((d) => ({ ...d, ...p }));
  const save = async () => {
    setSaving(true);
    try { await upsertCategory(draft); toast.success("Saved"); reload(); }
    catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async () => {
    if (!confirm(`Delete "${cat.name}"? Services in this category will be uncategorised.`)) return;
    try { await deleteCategory(cat.id); toast.success("Deleted"); reload(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
          <Icon name={(cat.icon as LucideIconName) || "Stethoscope"} className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{cat.name}</div>
          <div className="text-xs text-slate-500">{serviceCount} services · /{cat.slug}</div>
        </div>
        <button onClick={() => upsertCategory({ id: cat.id, visible: !cat.visible } as any).then(reload)}
          className="p-2 rounded-lg hover:bg-slate-50" title={cat.visible ? "Visible" : "Hidden"}>
          {cat.visible ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
        </button>
        <button onClick={() => move(cat, -1)} className="p-2 rounded-lg hover:bg-slate-50"><ArrowUp className="h-4 w-4" /></button>
        <button onClick={() => move(cat, 1)} className="p-2 rounded-lg hover:bg-slate-50"><ArrowDown className="h-4 w-4" /></button>
        <button onClick={() => setOpen((o) => !o)} className="p-2 rounded-lg hover:bg-slate-50"><ChevronRight className={`h-4 w-4 transition ${open ? "rotate-90" : ""}`} /></button>
        <button onClick={del} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="h-4 w-4" /></button>
      </div>

      {open && (
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <Field label="Name"><input className={inputCls} value={draft.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Field label="Slug"><input className={inputCls} value={draft.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} /></Field>
          <Field label="Icon"><IconPicker value={draft.icon || ""} onChange={(v) => set({ icon: v })} /></Field>
          <Field label="Color tag"><input className={inputCls} value={draft.color || ""} onChange={(e) => set({ color: e.target.value })} placeholder="#1F8FFF" /></Field>
          <Field label="Description"><textarea className={textareaCls} value={draft.description || ""} onChange={(e) => set({ description: e.target.value })} /></Field>
          <Field label="Banner image">
            <ImageUploader value={draft.banner_image || ""} onChange={(url) => set({ banner_image: url })} />
          </Field>
          <Field label="Search keywords" hint="Helps users find this category">
            <input className={inputCls} value={draft.search_keywords || ""} onChange={(e) => set({ search_keywords: e.target.value })} />
          </Field>
          <div className="sm:col-span-2 flex justify-end">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save category
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

/* ============== Services Editor ============== */
const ServicesEditor = ({
  services, categories, reload,
}: { services: Service[]; categories: ServiceCategory[]; reload: () => void }) => {
  const [filter, setFilter] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<Partial<Service>>({
    title: "",
    slug: "",
    category_id: categories[0]?.id || null,
    icon: "Stethoscope",
    summary: "",
    description: "",
    hero_image: null,
    gallery_images: [],
    tags: [],
    search_keywords: "",
    price_amount: null,
    price_currency: "GBP",
    price_label: "",
    duration_minutes: null,
    recommended_clinicians: [],
    whats_included: [],
    preparation: "",
    featured: false,
    visible: true,
    sort_order: services.length,
    cta_label: "",
    cta_href: "",
  });

  useEffect(() => {
    if (!addOpen) return;
    setAddDraft({
      title: "",
      slug: "",
      category_id: categories[0]?.id || null,
      icon: "Stethoscope",
      summary: "",
      description: "",
      hero_image: null,
      gallery_images: [],
      tags: [],
      search_keywords: "",
      price_amount: null,
      price_currency: "GBP",
      price_label: "",
      duration_minutes: null,
      recommended_clinicians: [],
      whats_included: [],
      preparation: "",
      featured: false,
      visible: true,
      sort_order: services.length,
      cta_label: "",
      cta_href: "",
    });
  }, [addOpen, categories, services.length]);

  const saveNewService = async () => {
    const title = (addDraft.title ?? "").trim();
    if (!title) return toast.error("Service title is required");
    try {
      await upsertService({
        ...addDraft,
        title,
        slug: slugify(addDraft.slug?.trim() || title),
        category_id: addDraft.category_id || null,
        summary: addDraft.summary ?? null,
        description: addDraft.description ?? null,
        hero_image: addDraft.hero_image ?? null,
        search_keywords: addDraft.search_keywords ?? null,
        price_amount: addDraft.price_amount ?? null,
        price_currency: addDraft.price_currency || "GBP",
        price_label: addDraft.price_label ?? null,
        duration_minutes: addDraft.duration_minutes ?? null,
        preparation: addDraft.preparation ?? null,
        cta_label: addDraft.cta_label ?? null,
        cta_href: addDraft.cta_href ?? null,
        gallery_images: addDraft.gallery_images || [],
        tags: addDraft.tags || [],
        recommended_clinicians: addDraft.recommended_clinicians || [],
        whats_included: addDraft.whats_included || [],
        featured: addDraft.featured ?? false,
        visible: addDraft.visible ?? true,
        sort_order: addDraft.sort_order ?? services.length,
      });
      toast.success("Service added");
      setAddOpen(false);
      reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to add service");
    }
  };

  const filtered = useMemo(() => {
    if (!filter) return services;
    return services.filter((s) => s.category_id === filter);
  }, [services, filter]);

  const add = async () => {
    const title = `New service ${services.length + 1}`;
    try {
      await upsertService({
        title, slug: slugify(title) + "-" + Math.random().toString(36).slice(2, 6),
        icon: "Stethoscope", sort_order: services.length, visible: true, featured: false,
        category_id: categories[0]?.id || null,
      });
      toast.success("Service added"); reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const move = async (s: Service, dir: -1 | 1) => {
    const sorted = [...services].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === s.id);
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx], b = sorted[swap];
    try {
      await Promise.all([
        upsertService({ id: a.id, sort_order: b.sort_order } as any),
        upsertService({ id: b.id, sort_order: a.sort_order } as any),
      ]);
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Services" desc="Manage every service card visible on the Services page."
        action={
          <div className="flex items-center gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={inputCls + " w-auto"}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"><Plus className="h-4 w-4" /> Add service</button>
          </div>
        }
      />
      {filtered.length === 0 && <Card><p className="text-sm text-slate-500">No services yet.</p></Card>}
      {filtered.map((s) => (
        <ServiceRow key={s.id} svc={s} categories={categories} reload={reload} move={move} />
      ))}

      <ModalShell
        open={addOpen}
        title="Add Service"
        onClose={() => setAddOpen(false)}
        footer={(
          <>
            <button onClick={() => setAddOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button onClick={saveNewService} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700">
              <Save className="h-4 w-4" /> Save Service
            </button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input className={inputCls} value={addDraft.title ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, title: e.target.value, slug: d.slug?.trim() ? d.slug : slugify(e.target.value) }))} />
          </Field>
          <Field label="Slug">
            <input className={inputCls} value={addDraft.slug ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} />
          </Field>
          <Field label="Category">
            <select className={inputCls} value={addDraft.category_id || ""} onChange={(e) => setAddDraft((d) => ({ ...d, category_id: e.target.value || null }))}>
              <option value="">Uncategorised</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Icon">
            <IconPicker value={(addDraft.icon as string) || "Stethoscope"} onChange={(v) => setAddDraft((d) => ({ ...d, icon: v as any }))} />
          </Field>
          <Field label="Summary" hint="Short line under the title">
            <input className={inputCls} value={addDraft.summary ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, summary: e.target.value }))} />
          </Field>
          <Field label="Hero image">
            <ImageUploader value={addDraft.hero_image || ""} onChange={(url) => setAddDraft((d) => ({ ...d, hero_image: url }))} />
          </Field>
          <Field label="Long description">
            <textarea className={textareaCls} value={addDraft.description ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, description: e.target.value }))} />
          </Field>
          <Field label="Preparation notes">
            <textarea className={textareaCls} value={addDraft.preparation ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, preparation: e.target.value }))} />
          </Field>
          <Field label="Price amount">
            <input type="number" step="0.01" className={inputCls} value={addDraft.price_amount ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, price_amount: e.target.value ? Number(e.target.value) : null }))} />
          </Field>
          <Field label="Currency">
            <select className={inputCls} value={addDraft.price_currency || "GBP"} onChange={(e) => setAddDraft((d) => ({ ...d, price_currency: e.target.value }))}>
              {["GBP", "USD", "EUR", "NGN"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Price label override"><input className={inputCls} value={addDraft.price_label ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, price_label: e.target.value }))} placeholder="From £95" /></Field>
          <Field label="Duration (mins)"><input type="number" className={inputCls} value={addDraft.duration_minutes ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, duration_minutes: e.target.value ? Number(e.target.value) : null }))} /></Field>
          <Field label="Tags / chips" hint="Comma-separated">
            <input className={inputCls} value={(addDraft.tags || []).join(", ")} onChange={(e) => setAddDraft((d) => ({ ...d, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))} />
          </Field>
          <Field label="Recommended clinicians" hint="Comma-separated">
            <input className={inputCls} value={(addDraft.recommended_clinicians || []).join(", ")} onChange={(e) => setAddDraft((d) => ({ ...d, recommended_clinicians: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))} />
          </Field>
          <Field label="What's included" hint="One per line">
            <textarea className={textareaCls} value={(addDraft.whats_included || []).join("\n")} onChange={(e) => setAddDraft((d) => ({ ...d, whats_included: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) }))} />
          </Field>
          <Field label="Search keywords">
            <input className={inputCls} value={addDraft.search_keywords ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, search_keywords: e.target.value }))} />
          </Field>
          <Field label="CTA label"><input className={inputCls} value={addDraft.cta_label ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, cta_label: e.target.value }))} placeholder="Book consultation" /></Field>
          <Field label="CTA link"><input className={inputCls} value={addDraft.cta_href ?? ""} onChange={(e) => setAddDraft((d) => ({ ...d, cta_href: e.target.value }))} placeholder="/doctor-portal#cta" /></Field>
          <Field label="Sort order"><input type="number" className={inputCls} value={addDraft.sort_order ?? services.length} onChange={(e) => setAddDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))} /></Field>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            <input type="checkbox" checked={addDraft.featured ?? false} onChange={(e) => setAddDraft((d) => ({ ...d, featured: e.target.checked }))} />
            Featured
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            <input type="checkbox" checked={addDraft.visible ?? true} onChange={(e) => setAddDraft((d) => ({ ...d, visible: e.target.checked }))} />
            Visible
          </label>
        </div>
      </ModalShell>
    </div>
  );
};

const ServiceRow = ({
  svc, categories, reload, move,
}: { svc: Service; categories: ServiceCategory[]; reload: () => void; move: (s: Service, d: -1 | 1) => void }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(svc);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(svc), [svc]);

  const set = (p: Partial<Service>) => setDraft((d) => ({ ...d, ...p }));
  const save = async () => {
    setSaving(true);
    try { await upsertService(draft as any); toast.success("Saved"); reload(); }
    catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async () => {
    if (!confirm(`Delete "${svc.title}"?`)) return;
    try { await deleteService(svc.id); toast.success("Deleted"); reload(); }
    catch (e: any) { toast.error(e.message); }
  };
  const toggle = async (patch: Partial<Service>) => {
    try { await upsertService({ id: svc.id, ...patch } as any); reload(); }
    catch (e: any) { toast.error(e.message); }
  };

  const cat = categories.find((c) => c.id === svc.category_id);

  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 grid place-items-center shrink-0">
          <Icon name={(svc.icon as LucideIconName) || "Stethoscope"} className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate flex items-center gap-2">
            {svc.title}
            {svc.featured && <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold">FEATURED</span>}
          </div>
          <div className="text-xs text-slate-500 truncate">{cat?.name || "Uncategorised"} · {svc.duration_minutes ?? "—"}min · {svc.price_label || (svc.price_amount ? `${svc.price_currency || "GBP"} ${svc.price_amount}` : "no price")}</div>
        </div>
        <button onClick={() => toggle({ featured: !svc.featured })} className="p-2 rounded-lg hover:bg-slate-50" title="Featured">
          {svc.featured ? <Star className="h-4 w-4 text-amber-500 fill-current" /> : <StarOff className="h-4 w-4 text-slate-400" />}
        </button>
        <button onClick={() => toggle({ visible: !svc.visible })} className="p-2 rounded-lg hover:bg-slate-50">
          {svc.visible ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
        </button>
        <button onClick={() => move(svc, -1)} className="p-2 rounded-lg hover:bg-slate-50"><ArrowUp className="h-4 w-4" /></button>
        <button onClick={() => move(svc, 1)} className="p-2 rounded-lg hover:bg-slate-50"><ArrowDown className="h-4 w-4" /></button>
        <button onClick={() => setOpen((o) => !o)} className="p-2 rounded-lg hover:bg-slate-50"><ChevronRight className={`h-4 w-4 transition ${open ? "rotate-90" : ""}`} /></button>
        <button onClick={del} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="h-4 w-4" /></button>
      </div>

      {open && (
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <Field label="Title"><input className={inputCls} value={draft.title} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field label="Slug"><input className={inputCls} value={draft.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} /></Field>
          <Field label="Category">
            <select className={inputCls} value={draft.category_id || ""} onChange={(e) => set({ category_id: e.target.value || null })}>
              <option value="">Uncategorised</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Icon"><IconPicker value={draft.icon || ""} onChange={(v) => set({ icon: v })} /></Field>
          <Field label="Summary" hint="Short line under the title">
            <input className={inputCls} value={draft.summary || ""} onChange={(e) => set({ summary: e.target.value })} />
          </Field>
          <Field label="Hero image">
            <ImageUploader value={draft.hero_image || ""} onChange={(url) => set({ hero_image: url })} />
          </Field>
          <Field label="Long description">
            <textarea className={textareaCls} value={draft.description || ""} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <Field label="Preparation notes">
            <textarea className={textareaCls} value={draft.preparation || ""} onChange={(e) => set({ preparation: e.target.value })} />
          </Field>

          <Field label="Price amount">
            <input type="number" step="0.01" className={inputCls} value={draft.price_amount ?? ""} onChange={(e) => set({ price_amount: e.target.value ? Number(e.target.value) : null })} />
          </Field>
          <Field label="Currency">
            <select className={inputCls} value={draft.price_currency || "GBP"} onChange={(e) => set({ price_currency: e.target.value })}>
              {["GBP","USD","EUR","NGN"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Price label override" hint="Overrides amount/currency display"><input className={inputCls} value={draft.price_label || ""} onChange={(e) => set({ price_label: e.target.value })} placeholder="From £95" /></Field>
          <Field label="Consultation duration (mins)">
            <input type="number" className={inputCls} value={draft.duration_minutes ?? ""} onChange={(e) => set({ duration_minutes: e.target.value ? Number(e.target.value) : null })} />
          </Field>

          <Field label="Tags / chips" hint="Comma-separated">
            <input className={inputCls} value={(draft.tags || []).join(", ")} onChange={(e) => set({ tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
          </Field>
          <Field label="Recommended clinicians" hint="Comma-separated">
            <input className={inputCls} value={(draft.recommended_clinicians || []).join(", ")} onChange={(e) => set({ recommended_clinicians: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
          </Field>
          <Field label="What's included" hint="One per line">
            <textarea className={textareaCls} value={(draft.whats_included || []).join("\n")} onChange={(e) => set({ whats_included: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} />
          </Field>
          <Field label="Search keywords">
            <input className={inputCls} value={draft.search_keywords || ""} onChange={(e) => set({ search_keywords: e.target.value })} />
          </Field>

          <Field label="CTA label"><input className={inputCls} value={draft.cta_label || ""} onChange={(e) => set({ cta_label: e.target.value })} placeholder="Book consultation" /></Field>
          <Field label="CTA link"><input className={inputCls} value={draft.cta_href || ""} onChange={(e) => set({ cta_href: e.target.value })} placeholder="/doctor-portal#cta" /></Field>

          <div className="sm:col-span-2 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={draft.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={draft.visible} onChange={(e) => set({ visible: e.target.checked })} /> Visible</label>
            </div>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save service
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

/* ============== FAQs Editor ============== */
const FaqsEditor = ({
  faqs, services, reload,
}: { faqs: ServiceFaq[]; services: Service[]; reload: () => void }) => {
  const add = async () => {
    try {
      await upsertFaq({ question: "New question", answer: "Answer goes here.", sort_order: faqs.length, visible: true, service_id: null });
      toast.success("FAQ added"); reload();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="FAQs" desc="Page-level FAQs appear on the Services page. Per-service FAQs can be tied to a service."
        action={<button onClick={add} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"><Plus className="h-4 w-4" /> Add FAQ</button>}
      />
      {faqs.length === 0 && <Card><p className="text-sm text-slate-500">No FAQs yet.</p></Card>}
      {faqs.map((f) => <FaqRow key={f.id} faq={f} services={services} reload={reload} />)}
    </div>
  );
};

const FaqRow = ({ faq, services, reload }: { faq: ServiceFaq; services: Service[]; reload: () => void }) => {
  const [draft, setDraft] = useState(faq);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(faq), [faq]);

  const set = (p: Partial<ServiceFaq>) => setDraft((d) => ({ ...d, ...p }));
  const save = async () => {
    setSaving(true);
    try { await upsertFaq(draft); toast.success("Saved"); reload(); }
    catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async () => {
    if (!confirm("Delete FAQ?")) return;
    try { await deleteFaq(faq.id); toast.success("Deleted"); reload(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Question"><input className={inputCls} value={draft.question} onChange={(e) => set({ question: e.target.value })} /></Field>
        <Field label="Linked to">
          <select className={inputCls} value={draft.service_id || ""} onChange={(e) => set({ service_id: e.target.value || null })}>
            <option value="">Page-level (general FAQ)</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </Field>
        <Field label="Answer" hint="Plain text"><textarea className={textareaCls} value={draft.answer} onChange={(e) => set({ answer: e.target.value })} /></Field>
        <Field label="Order"><input type="number" className={inputCls} value={draft.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} /></Field>
        <div className="sm:col-span-2 flex items-center justify-between border-t border-slate-100 pt-4">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.visible} onChange={(e) => set({ visible: e.target.checked })} /> Visible</label>
          <div className="flex items-center gap-2">
            <button onClick={del} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 text-rose-600 px-3 py-2 text-sm font-semibold hover:bg-rose-50"><Trash2 className="h-4 w-4" /> Delete</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
