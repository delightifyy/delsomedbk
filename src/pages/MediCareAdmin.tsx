import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Save, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown,
  Eye, EyeOff, ExternalLink, Image as ImageIcon, Settings, Menu as MenuIcon,
  Star, Sparkles, FileText, Layers, Megaphone, Phone as PhoneIcon, Search,
  Home, Info, Heart, Wrench, Video, MessageSquare, ChevronRight, ChevronDown, X,
  Facebook, Twitter, Instagram, Linkedin, Newspaper, Mail, MapPin,
} from "lucide-react";
import {
  defaultSettings, loadSettings, resetSettings, saveSettings,
  type MediCareSettings, type LucideIconName, type Service, type Feature,
  type TestimonialItem, type Partner, type NavItem, type SocialLink, type FooterLink,
} from "@/lib/medicareSettings";
import { MediaPicker } from "@/components/medicare-admin/MediaPicker";
import { ImageUploader } from "@/components/medicare-admin/ImageUploader";
import { Icon, ICON_NAMES } from "@/components/medicare-admin/icons";

const uid = (p = "id") => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/* ---------- Tiny atoms ---------- */
const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";
const textareaCls = inputCls + " min-h-[90px]";
const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="block">
    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
  </label>
);
const SectionHeader = ({ title, desc }: { title: string; desc?: string }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    {desc && <p className="text-sm text-slate-500 mt-1">{desc}</p>}
  </div>
);
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 ${className}`}>{children}</div>
);

const ConfirmDialog = ({
  open, title, message, onConfirm, onCancel,
}: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) =>
  !open ? null : (
    <div className="fixed inset-0 z-[150] grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
        <p className="text-sm text-slate-600 mt-2">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="rounded-lg bg-rose-600 text-white px-4 py-2 text-sm font-semibold hover:bg-rose-700">Delete</button>
        </div>
      </div>
    </div>
  );

const IconPicker = ({ value, onChange }: { value: LucideIconName; onChange: (n: LucideIconName) => void }) => (
  <select value={value} onChange={(e) => onChange(e.target.value as LucideIconName)} className={inputCls}>
    {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
  </select>
);

/* ---------- Reorder helpers ---------- */
const reorder = <T extends { order: number }>(items: T[], id: string, dir: -1 | 1, idKey: keyof T = "id" as any): T[] => {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((x: any) => x[idKey] === id);
  if (idx < 0) return items;
  const swap = idx + dir;
  if (swap < 0 || swap >= sorted.length) return items;
  const a = sorted[idx], b = sorted[swap];
  const ao = a.order, bo = b.order;
  return items.map((x: any) => x[idKey] === a[idKey] ? { ...x, order: bo } : x[idKey] === b[idKey] ? { ...x, order: ao } : x);
};

/* ---------- Page-grouped navigation (mirrors public site) ---------- */
type Tab =
  | "home" | "navbar" | "hero" | "partners" | "about" | "whyChoose" | "services"
  | "virtualCare" | "testimonials" | "ctaBanner" | "footer" | "media" | "seo"
  | "branding" | "contact" | "blog" | "servicesPage";

type PageGroup = {
  id: string;
  label: string;
  icon: any;
  /** Sections that exist on this public page */
  sections: { id: Tab; label: string; externalHref?: string; icon?: any }[];
};

/**
 * The admin sidebar mirrors the 5 public MediCare pages.
 * Each group lists ONLY the sections that actually exist on that public page.
 */
const PAGE_GROUPS: PageGroup[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    sections: [
      { id: "home", label: "Home Page" },
    ],
  },

  {
    id: "about",
    label: "About Us",
    icon: Info,
    sections: [
      { id: "about", label: "About Section" },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: Wrench,
    sections: [
      { id: "services",     label: "Featured Services" },
      { id: "servicesPage", label: "Services Page CMS →" },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    icon: Newspaper,
    sections: [
      { id: "blog", label: "Blog Posts" },
    ],
  },
  {
    id: "contact",
    label: "Contact Us",
    icon: PhoneIcon,
    sections: [
      { id: "contact", label: "Contact Info" },
      { id: "footer",  label: "Footer Links" },
    ],
  },
];

/* =========================================================
                       Main Admin
========================================================= */
const MediCareAdmin = () => {
  const [s, setS] = useState<MediCareSettings>(defaultSettings);
  const [tab, setTab] = useState<Tab>("home");
  const [openGroup, setOpenGroup] = useState<string>("home");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | { title: string; message: string; onConfirm: () => void }>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    document.title = "MediCare — Admin";
    setS(loadSettings());
  }, []);

  const update = (patch: Partial<MediCareSettings>) => { setS((p) => ({ ...p, ...patch })); setDirty(true); };
  const setSettings = (updater: (s: MediCareSettings) => MediCareSettings) => { setS(updater); setDirty(true); };

  const onSave = () => {
    try { saveSettings(s); setDirty(false); toast.success("Changes saved successfully"); }
    catch { toast.error("Save failed — storage may be full. Try smaller media."); }
  };
  const onReset = () => setConfirm({
    title: "Reset everything?",
    message: "This restores all sections to their original defaults. This cannot be undone.",
    onConfirm: () => { resetSettings(); setS(defaultSettings); setDirty(false); setConfirm(null); toast.success("Settings reset to defaults"); },
  });
  const askDelete = (label: string, fn: () => void) => setConfirm({
    title: `Delete ${label}?`,
    message: "This action cannot be undone.",
    onConfirm: () => { fn(); setConfirm(null); toast.success(`${label} deleted`); },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
          <Link to="/doctor-portal" className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden grid place-items-center h-8 w-8 rounded-lg hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Manage Pages</p>
          <nav className="space-y-1">
            {PAGE_GROUPS.map((g) => {
              // Single-section group → render as flat button (no dropdown)
              if (g.sections.length === 1) {
                const sec = g.sections[0];
                const active = tab === sec.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => { setTab(sec.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                      active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <g.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{g.label}</span>
                  </button>
                );
              }
              const isOpen = openGroup === g.id;
              return (
                <div key={g.id}>
                  <button
                    onClick={() => setOpenGroup(isOpen ? "" : g.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                      isOpen ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <g.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{g.label}</span>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {isOpen && (
                    <div className="mt-1 ml-3 pl-3 border-l border-slate-200 space-y-0.5">
                      {g.sections.map((sec, idx) => {
                        if (sec.externalHref) {
                          const SecIcon = sec.icon;
                          return (
                            <Link
                              key={`${sec.id}-${idx}-${sec.label}`}
                              to={sec.externalHref}
                              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                            >
                              {SecIcon ? <SecIcon className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                              <span className="flex-1">{sec.label}</span>
                              <ExternalLink className="h-3 w-3 opacity-50" />
                            </Link>
                          );
                        }
                        if (sec.id === "servicesPage") {
                          return (
                            <Link
                              key={sec.id}
                              to="/doctor-portal/admin/services"
                              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> {sec.label}
                            </Link>
                          );
                        }
                        return (
                          <button
                            key={sec.id}
                            onClick={() => { setTab(sec.id); setSidebarOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition ${
                              tab === sec.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {sec.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}


            <div className="my-3 border-t border-slate-200" />
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Site-wide</p>
            <button
              onClick={() => { setTab("branding"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${tab === "branding" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <Settings className="h-4 w-4" /> Branding
            </button>
            <button
              onClick={() => { setTab("media"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${tab === "media" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <ImageIcon className="h-4 w-4" /> Media Library
            </button>
            <button
              onClick={() => { setTab("seo"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${tab === "seo" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <Search className="h-4 w-4" /> SEO
            </button>
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden grid place-items-center h-9 w-9 rounded-lg hover:bg-slate-100">
                <MenuIcon className="h-4 w-4" />
              </button>
              <h1 className="font-bold text-slate-900 truncate">MediCare CMS</h1>
              {dirty && <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[11px] font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Unsaved changes</span>}
            </div>
            <div className="flex items-center gap-2">
              <a href="/doctor-portal" target="_blank" rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <ExternalLink className="h-4 w-4" /> Preview
              </a>
              <button onClick={onReset} className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
              <button onClick={onSave} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-5xl w-full mx-auto">
          {tab === "home"         && <HomeEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "branding"     && <BrandingEditor s={s} update={update} setSettings={setSettings} />}

          {tab === "navbar"       && <NavbarEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "hero"         && <HeroEditor s={s} setSettings={setSettings} />}
          {tab === "partners"     && <PartnersEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "about"        && <AboutEditor s={s} setSettings={setSettings} />}
          {tab === "whyChoose"    && <WhyChooseEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "services"     && <ServicesEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "virtualCare"  && <VirtualCareEditor s={s} setSettings={setSettings} />}
          {tab === "testimonials" && <TestimonialsEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "ctaBanner"    && <CtaBannerEditor s={s} setSettings={setSettings} />}
          {tab === "footer"       && <FooterEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "media"        && <MediaLibraryEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "seo"          && <SeoEditor s={s} setSettings={setSettings} />}
          {tab === "contact"      && <ContactEditor s={s} setSettings={setSettings} />}
          {tab === "blog"         && <BlogEditor />}
        </main>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        onConfirm={() => confirm?.onConfirm()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default MediCareAdmin;

/* ---------- CONTACT ---------- */
const ContactEditor = ({ s, setSettings }: EProps) => {
  const set = (patch: Partial<MediCareSettings["contact"]>) =>
    setSettings((st) => ({ ...st, contact: { ...st.contact, ...patch } }));
  return (
    <div className="space-y-6">
      <SectionHeader title="Contact Info" desc="Email, phone and address shown across the site." />
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input className={inputCls + " pl-9"} value={s.contact.email} onChange={(e) => set({ email: e.target.value })} />
            </div>
          </Field>
          <Field label="Phone">
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input className={inputCls + " pl-9"} value={s.contact.phone} onChange={(e) => set({ phone: e.target.value })} />
            </div>
          </Field>
          <Field label="Address">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input className={inputCls + " pl-9"} value={s.contact.address} onChange={(e) => set({ address: e.target.value })} />
            </div>
          </Field>
        </div>
      </Card>
    </div>
  );
};

/* ---------- BLOG ---------- */
import { supabase } from "@/integrations/supabase/client";
import { BLOG_CATEGORIES } from "@/data/blogs";

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category: string | null;
  author_name: string | null;
  author_role: string | null;
  read_time: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  publish_date: string;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const emptyPost = (): Partial<BlogRow> => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category: "Wellness",
  author_name: "",
  author_role: "",
  read_time: "5 min read",
  featured: false,
  published: true,
  sort_order: 0,
});

const BlogEditor = () => {
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BlogRow> | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<BlogRow | null>(null);
  const [query, setQuery] = useState("");
  

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("featured", { ascending: false })
      .order("publish_date", { ascending: false });
    if (error) toast.error(error.message);
    else setPosts((data as BlogRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) =>
      (p.title + " " + (p.author_name ?? "") + " " + (p.category ?? "")).toLowerCase().includes(q)
    );
  }, [posts, query]);

  const save = async () => {
    if (!editing) return;
    const title = (editing.title ?? "").trim();
    if (!title) return toast.error("Title is required");
    const slug = (editing.slug?.trim() || slugify(title));
    setSaving(true);
    const payload = {
      title,
      slug,
      excerpt: editing.excerpt ?? "",
      content: editing.content ?? "",
      cover_image: editing.cover_image ?? null,
      category: editing.category ?? null,
      author_name: editing.author_name ?? null,
      author_role: editing.author_role ?? null,
      read_time: editing.read_time ?? null,
      featured: !!editing.featured,
      published: editing.published !== false,
      sort_order: editing.sort_order ?? 0,
    };
    const { error } = editing.id
      ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Post updated" : "Post created");
    setEditing(null);
    load();
  };

  const remove = async (p: BlogRow) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Post deleted");
    setConfirmDel(null);
    load();
  };

  const togglePublish = async (p: BlogRow) => {
    const { error } = await supabase.from("blog_posts").update({ published: !p.published }).eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Blog Posts" desc="Manage posts shown on the public MediCare Blog page." />

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, authors..."
              className={inputCls + " pl-9"}
            />
          </div>
          <a href="/doctor-portal/blogs" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            <Eye className="h-4 w-4" /> Preview
          </a>
          <button onClick={() => setEditing(emptyPost())} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Post
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading posts...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 rounded-xl">
            <Newspaper className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No blog posts yet. Click "New Post" to create one.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border border-slate-200 p-3 hover:border-blue-300 transition">
                <div className="h-16 w-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-slate-300"><ImageIcon className="h-5 w-5" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.featured && <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><Star className="h-3 w-3" />Featured</span>}
                    {p.category && <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{p.category}</span>}
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.published ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 truncate mt-1">{p.title}</h4>
                  <p className="text-xs text-slate-500 truncate">
                    {p.author_name || "—"} · {new Date(p.publish_date).toLocaleDateString()} · {p.read_time || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => togglePublish(p)} title={p.published ? "Unpublish" : "Publish"} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
                    {p.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setEditing(p)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">Edit</button>
                  <button onClick={() => setConfirmDel(p)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit drawer */}
      {editing && (
        <div className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-4 overflow-auto">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">{editing.id ? "Edit Post" : "New Post"}</h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
              <Field label="Title">
                <input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} className={inputCls} />
              </Field>
              <Field label="Slug" hint="URL identifier (auto-generated from title)">
                <input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className={inputCls} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Category">
                  <select value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inputCls}>
                    {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Read time">
                  <input value={editing.read_time ?? ""} onChange={(e) => setEditing({ ...editing, read_time: e.target.value })} placeholder="6 min read" className={inputCls} />
                </Field>
                <Field label="Author name">
                  <input value={editing.author_name ?? ""} onChange={(e) => setEditing({ ...editing, author_name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Author role">
                  <input value={editing.author_role ?? ""} onChange={(e) => setEditing({ ...editing, author_role: e.target.value })} placeholder="Cardiologist" className={inputCls} />
                </Field>
              </div>
              <Field label="Cover image">
                <ImageUploader
                  value={editing.cover_image ?? ""}
                  onChange={(url) => setEditing((e) => e ? { ...e, cover_image: url } : e)}
                  folder="blog"
                />
                <input value={editing.cover_image ?? ""} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} placeholder="Or paste image URL" className={inputCls + " mt-2"} />
              </Field>
              <Field label="Excerpt">
                <textarea value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className={textareaCls} />
              </Field>
              <Field label="Content" hint="Full article body (shown on the article page).">
                <textarea value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className={textareaCls + " min-h-[180px]"} />
              </Field>
              <div className="flex flex-wrap gap-6">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                  Featured post
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={editing.published !== false} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                  Published
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete post?"
        message={`"${confirmDel?.title}" will be permanently removed.`}
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => confirmDel && remove(confirmDel)}
      />
    </div>
  );
};


/* =========================================================
                     Section Editors
========================================================= */

type EProps = {
  s: MediCareSettings;
  setSettings: (u: (s: MediCareSettings) => MediCareSettings) => void;
};
type EPropsWithDelete = EProps & { askDelete: (label: string, fn: () => void) => void };

/* ---------- BRANDING ---------- */
const BrandingEditor = ({ s, update, setSettings }: EProps & { update: (p: Partial<MediCareSettings>) => void }) => (
  <div className="space-y-6">
    <SectionHeader title="Branding" desc="Site name, logo, and theme colors." />
    <Card>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Site name">
          <input className={inputCls} value={s.siteName} onChange={(e) => update({ siteName: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary color">
            <input type="color" className="h-10 w-full rounded-lg border border-slate-200" value={s.primaryColor} onChange={(e) => update({ primaryColor: e.target.value })} />
          </Field>
          <Field label="Accent color">
            <input type="color" className="h-10 w-full rounded-lg border border-slate-200" value={s.accentColor} onChange={(e) => update({ accentColor: e.target.value })} />
          </Field>
        </div>
      </div>
      <div className="mt-5">
        <MediaPicker label="Logo" value={s.logoDataUrl} onChange={(url) => update({ logoDataUrl: url })} settings={s} setSettings={setSettings} accept="image" />
      </div>
    </Card>
  </div>
);

/* ---------- NAVBAR ---------- */
const NavbarEditor = ({ s, setSettings, askDelete }: EPropsWithDelete) => {
  const items = [...s.nav.items].sort((a, b) => a.order - b.order);
  const setItems = (mut: (items: NavItem[]) => NavItem[]) =>
    setSettings((st) => ({ ...st, nav: { ...st.nav, items: mut(st.nav.items) } }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Navbar" desc="Manage menu links, order, and visibility." />
      <Card>
        <h3 className="font-semibold text-slate-900 mb-3">CTA Button</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Visible">
            <select className={inputCls} value={String(s.nav.cta.enabled)}
              onChange={(e) => setSettings((st) => ({ ...st, nav: { ...st.nav, cta: { ...st.nav.cta, enabled: e.target.value === "true" } } }))}>
              <option value="false">Hidden</option>
              <option value="true">Shown</option>
            </select>
          </Field>
          <Field label="Label"><input className={inputCls} value={s.nav.cta.label} onChange={(e) => setSettings((st) => ({ ...st, nav: { ...st.nav, cta: { ...st.nav.cta, label: e.target.value } } }))} /></Field>
          <Field label="Link URL"><input className={inputCls} value={s.nav.cta.href} onChange={(e) => setSettings((st) => ({ ...st, nav: { ...st.nav, cta: { ...st.nav.cta, href: e.target.value } } }))} /></Field>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Menu items</h3>
          <button onClick={() => setItems((it) => [...it, { id: uid("nav"), label: "New item", href: "#", enabled: true, order: it.length }])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-3 border border-slate-200">
              <input className={inputCls + " col-span-4"} value={it.label}
                onChange={(e) => setItems((arr) => arr.map((x) => x.id === it.id ? { ...x, label: e.target.value } : x))} placeholder="Label" />
              <input className={inputCls + " col-span-5"} value={it.href}
                onChange={(e) => setItems((arr) => arr.map((x) => x.id === it.id ? { ...x, href: e.target.value } : x))} placeholder="#section or URL" />
              <div className="col-span-3 flex items-center justify-end gap-1">
                <button title={it.enabled ? "Hide" : "Show"} onClick={() => setItems((arr) => arr.map((x) => x.id === it.id ? { ...x, enabled: !x.enabled } : x))}
                  className={`grid place-items-center h-8 w-8 rounded ${it.enabled ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}>
                  {it.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button title="Move up" onClick={() => setItems((arr) => reorder(arr, it.id, -1))} className="grid place-items-center h-8 w-8 rounded text-slate-500 hover:bg-slate-100"><ArrowUp className="h-4 w-4" /></button>
                <button title="Move down" onClick={() => setItems((arr) => reorder(arr, it.id, 1))} className="grid place-items-center h-8 w-8 rounded text-slate-500 hover:bg-slate-100"><ArrowDown className="h-4 w-4" /></button>
                <button title="Delete" onClick={() => askDelete(`"${it.label}"`, () => setItems((arr) => arr.filter((x) => x.id !== it.id)))}
                  className="grid place-items-center h-8 w-8 rounded text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* ---------- HERO ---------- */
const HeroEditor = ({ s, setSettings }: EProps) => {
  const set = (patch: Partial<MediCareSettings["hero"]>) =>
    setSettings((st) => ({ ...st, hero: { ...st.hero, ...patch } }));
  return (
    <div className="space-y-6">
      <SectionHeader title="Hero Section" desc="Headline, subtitle, background, and floating cards." />
      <Card>
        <div className="grid gap-4">
          <Field label="Badge text"><input className={inputCls} value={s.hero.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Headline (line 1)"><input className={inputCls} value={s.hero.titleLead} onChange={(e) => set({ titleLead: e.target.value })} /></Field>
            <Field label="Headline (highlighted)"><input className={inputCls} value={s.hero.titleHighlight} onChange={(e) => set({ titleHighlight: e.target.value })} /></Field>
          </div>
          <Field label="Subtitle"><textarea className={textareaCls} value={s.hero.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Button text"><input className={inputCls} value={s.hero.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
            <Field label="Button link"><input className={inputCls} value={s.hero.ctaHref} onChange={(e) => set({ ctaHref: e.target.value })} /></Field>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Background</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <MediaPicker label="Background video URL" value={s.hero.bgVideo} onChange={(v) => set({ bgVideo: v ?? "" })} settings={s} setSettings={setSettings} accept="video" />
          <MediaPicker label="Poster / fallback image" value={s.hero.bgImage} onChange={(v) => set({ bgImage: v ?? "" })} settings={s} setSettings={setSettings} accept="image" />
        </div>
        <Field label={`Overlay darkness: ${Math.round(s.hero.overlayOpacity * 100)}%`}>
          <input type="range" min={0} max={100} value={Math.round(s.hero.overlayOpacity * 100)}
            onChange={(e) => set({ overlayOpacity: Number(e.target.value) / 100 })} className="w-full" />
        </Field>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Floating doctor card</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Doctor name"><input className={inputCls} value={s.hero.doctorCard.name} onChange={(e) => set({ doctorCard: { ...s.hero.doctorCard, name: e.target.value } })} /></Field>
          <Field label="Status / role"><input className={inputCls} value={s.hero.doctorCard.role} onChange={(e) => set({ doctorCard: { ...s.hero.doctorCard, role: e.target.value } })} /></Field>
        </div>
        <div className="mt-4">
          <MediaPicker label="Doctor card image" value={s.hero.doctorCard.imageUrl} onChange={(v) => set({ doctorCard: { ...s.hero.doctorCard, imageUrl: v ?? "" } })} settings={s} setSettings={setSettings} accept="image" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Floating checklist card</h3>
        <Field label="Title"><input className={inputCls} value={s.hero.checklistCard.title} onChange={(e) => set({ checklistCard: { ...s.hero.checklistCard, title: e.target.value } })} /></Field>
        <div className="mt-3 space-y-2">
          {s.hero.checklistCard.items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input className={inputCls + " col-span-3"} value={it.time}
                onChange={(e) => set({ checklistCard: { ...s.hero.checklistCard, items: s.hero.checklistCard.items.map((x, j) => i === j ? { ...x, time: e.target.value } : x) } })} placeholder="09:30" />
              <input className={inputCls + " col-span-8"} value={it.label}
                onChange={(e) => set({ checklistCard: { ...s.hero.checklistCard, items: s.hero.checklistCard.items.map((x, j) => i === j ? { ...x, label: e.target.value } : x) } })} placeholder="Activity" />
              <button onClick={() => set({ checklistCard: { ...s.hero.checklistCard, items: s.hero.checklistCard.items.filter((_, j) => i !== j) } })}
                className="grid place-items-center h-9 w-9 rounded text-rose-600 hover:bg-rose-50 col-span-1"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => set({ checklistCard: { ...s.hero.checklistCard, items: [...s.hero.checklistCard.items, { time: "12:00", label: "New item" }] } })}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700">
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Vitals card</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Label"><input className={inputCls} value={s.hero.vitalsCard.label} onChange={(e) => set({ vitalsCard: { ...s.hero.vitalsCard, label: e.target.value } })} /></Field>
          <Field label="Value"><input className={inputCls} value={s.hero.vitalsCard.value} onChange={(e) => set({ vitalsCard: { ...s.hero.vitalsCard, value: e.target.value } })} /></Field>
          <Field label="Unit"><input className={inputCls} value={s.hero.vitalsCard.unit} onChange={(e) => set({ vitalsCard: { ...s.hero.vitalsCard, unit: e.target.value } })} /></Field>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Satisfaction card</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Value"><input className={inputCls} value={s.hero.satisfactionCard.value} onChange={(e) => set({ satisfactionCard: { ...s.hero.satisfactionCard, value: e.target.value } })} /></Field>
          <Field label="Label"><input className={inputCls} value={s.hero.satisfactionCard.label} onChange={(e) => set({ satisfactionCard: { ...s.hero.satisfactionCard, label: e.target.value } })} /></Field>
        </div>
      </Card>
    </div>
  );
};

/* ---------- PARTNERS ---------- */
const PartnersEditor = ({ s, setSettings, askDelete }: EPropsWithDelete) => {
  const set = (mut: (arr: Partner[]) => Partner[]) => setSettings((st) => ({ ...st, partners: mut(st.partners) }));
  const [name, setName] = useState("");
  return (
    <div className="space-y-6">
      <SectionHeader title="Partners Slider" desc="Manage the partners marquee shown under the hero." />
      <Card>
        <div className="flex flex-wrap gap-2">
          <input className={inputCls + " flex-1 min-w-[200px]"} placeholder="Partner name" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={() => { if (name.trim()) { set((arr) => [...arr, { id: uid("p"), name: name.trim(), logoDataUrl: null }]); setName(""); } }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-semibold hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add partner
          </button>
        </div>
      </Card>
      <Card>
        <div className="space-y-2">
          {s.partners.map((p, i) => (
            <div key={p.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-3 border border-slate-200">
              <input className={inputCls + " col-span-6"} value={p.name}
                onChange={(e) => set((arr) => arr.map((x) => x.id === p.id ? { ...x, name: e.target.value } : x))} />
              <div className="col-span-4">
                <MediaPicker value={p.logoDataUrl} onChange={(url) => set((arr) => arr.map((x) => x.id === p.id ? { ...x, logoDataUrl: url } : x))}
                  settings={s} setSettings={setSettings} accept="image" />
              </div>
              <div className="col-span-2 flex justify-end gap-1">
                <button onClick={() => set((arr) => { const j = arr.findIndex((x) => x.id === p.id); if (j <= 0) return arr; const c = [...arr]; [c[j-1], c[j]] = [c[j], c[j-1]]; return c; })}
                  className="grid place-items-center h-8 w-8 rounded text-slate-500 hover:bg-slate-100"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => set((arr) => { const j = arr.findIndex((x) => x.id === p.id); if (j < 0 || j >= arr.length - 1) return arr; const c = [...arr]; [c[j+1], c[j]] = [c[j], c[j+1]]; return c; })}
                  className="grid place-items-center h-8 w-8 rounded text-slate-500 hover:bg-slate-100"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => askDelete(`partner "${p.name}"`, () => set((arr) => arr.filter((x) => x.id !== p.id)))}
                  className="grid place-items-center h-8 w-8 rounded text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {s.partners.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No partners yet.</p>}
        </div>
      </Card>
    </div>
  );
};

/* ---------- ABOUT ---------- */
const AboutEditor = ({ s, setSettings }: EProps) => {
  const set = (patch: Partial<MediCareSettings["about"]>) =>
    setSettings((st) => ({ ...st, about: { ...st.about, ...patch } }));
  return (
    <div className="space-y-6">
      <SectionHeader title="About Section" />
      <Card>
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Section label"><input className={inputCls} value={s.about.label} onChange={(e) => set({ label: e.target.value })} /></Field>
            <Field label="Title"><input className={inputCls} value={s.about.title} onChange={(e) => set({ title: e.target.value })} /></Field>
          </div>
          <Field label="Description"><textarea className={textareaCls} value={s.about.body} onChange={(e) => set({ body: e.target.value })} /></Field>
          <MediaPicker label="Image" value={s.about.image} onChange={(v) => set({ image: v ?? "" })} settings={s} setSettings={setSettings} accept="image" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Mission title"><input className={inputCls} value={s.about.mission.title} onChange={(e) => set({ mission: { ...s.about.mission, title: e.target.value } })} /></Field>
            <Field label="Mission text"><textarea className={textareaCls} value={s.about.mission.body} onChange={(e) => set({ mission: { ...s.about.mission, body: e.target.value } })} /></Field>
            <Field label="Vision title"><input className={inputCls} value={s.about.vision.title} onChange={(e) => set({ vision: { ...s.about.vision, title: e.target.value } })} /></Field>
            <Field label="Vision text"><textarea className={textareaCls} value={s.about.vision.body} onChange={(e) => set({ vision: { ...s.about.vision, body: e.target.value } })} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="CTA label"><input className={inputCls} value={s.about.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
            <Field label="CTA link"><input className={inputCls} value={s.about.ctaHref} onChange={(e) => set({ ctaHref: e.target.value })} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Satisfaction value"><input className={inputCls} value={s.about.satisfaction.value} onChange={(e) => set({ satisfaction: { ...s.about.satisfaction, value: e.target.value } })} /></Field>
            <Field label="Satisfaction label"><input className={inputCls} value={s.about.satisfaction.label} onChange={(e) => set({ satisfaction: { ...s.about.satisfaction, label: e.target.value } })} /></Field>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ---------- WHY CHOOSE US ---------- */
const WhyChooseEditor = ({ s, setSettings, askDelete }: EPropsWithDelete) => {
  const set = (patch: Partial<MediCareSettings["whyChoose"]>) =>
    setSettings((st) => ({ ...st, whyChoose: { ...st.whyChoose, ...patch } }));
  const setF = (mut: (arr: Feature[]) => Feature[]) =>
    setSettings((st) => ({ ...st, whyChoose: { ...st.whyChoose, features: mut(st.whyChoose.features) } }));
  const features = [...s.whyChoose.features].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <SectionHeader title="Why Choose Us" />
      <Card>
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Section label"><input className={inputCls} value={s.whyChoose.label} onChange={(e) => set({ label: e.target.value })} /></Field>
            <Field label="Title"><input className={inputCls} value={s.whyChoose.title} onChange={(e) => set({ title: e.target.value })} /></Field>
          </div>
          <Field label="Description"><textarea className={textareaCls} value={s.whyChoose.description} onChange={(e) => set({ description: e.target.value })} /></Field>
          <MediaPicker label="Main image" value={s.whyChoose.image} onChange={(v) => set({ image: v ?? "" })} settings={s} setSettings={setSettings} accept="image" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Feature cards</h3>
          <button onClick={() => setF((arr) => [...arr, { id: uid("f"), icon: "ShieldCheck", title: "New feature", description: "", order: arr.length, active: true }])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add feature
          </button>
        </div>
        <div className="space-y-3">
          {features.map((f) => (
            <div key={f.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-3"><IconPicker value={f.icon} onChange={(n) => setF((arr) => arr.map((x) => x.id === f.id ? { ...x, icon: n } : x))} /></div>
                <input className={inputCls + " col-span-9"} value={f.title}
                  onChange={(e) => setF((arr) => arr.map((x) => x.id === f.id ? { ...x, title: e.target.value } : x))} placeholder="Title" />
                <textarea className={textareaCls + " col-span-12"} value={f.description}
                  onChange={(e) => setF((arr) => arr.map((x) => x.id === f.id ? { ...x, description: e.target.value } : x))} placeholder="Description" />
              </div>
              <div className="mt-2 flex items-center justify-end gap-1">
                <button onClick={() => setF((arr) => arr.map((x) => x.id === f.id ? { ...x, active: !x.active } : x))}
                  className={`grid place-items-center h-8 w-8 rounded ${f.active ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}>
                  {f.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => setF((arr) => reorder(arr, f.id, -1))} className="grid place-items-center h-8 w-8 rounded text-slate-500 hover:bg-slate-100"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => setF((arr) => reorder(arr, f.id, 1))} className="grid place-items-center h-8 w-8 rounded text-slate-500 hover:bg-slate-100"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => askDelete(`feature "${f.title}"`, () => setF((arr) => arr.filter((x) => x.id !== f.id)))}
                  className="grid place-items-center h-8 w-8 rounded text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* ---------- SERVICES ---------- */
const ServicesEditor = ({ s, setSettings, askDelete }: EPropsWithDelete) => {
  const set = (patch: Partial<MediCareSettings["services"]>) =>
    setSettings((st) => ({ ...st, services: { ...st.services, ...patch } }));
  const setI = (mut: (arr: Service[]) => Service[]) =>
    setSettings((st) => ({ ...st, services: { ...st.services, items: mut(st.services.items) } }));
  const items = [...s.services.items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <SectionHeader title="Services" />
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Section label"><input className={inputCls} value={s.services.label} onChange={(e) => set({ label: e.target.value })} /></Field>
          <Field label="Title"><input className={inputCls} value={s.services.title} onChange={(e) => set({ title: e.target.value })} /></Field>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Service cards</h3>
          <button onClick={() => setI((arr) => [...arr, { id: uid("s"), icon: "Stethoscope", title: "New service", description: "", image: "", order: arr.length, active: true, ctaLabel: "", ctaHref: "" }])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add service
          </button>
        </div>
        <div className="space-y-4">
          {items.map((it) => (
            <div key={it.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Title"><input className={inputCls} value={it.title}
                  onChange={(e) => setI((arr) => arr.map((x) => x.id === it.id ? { ...x, title: e.target.value } : x))} /></Field>
                <Field label="Icon"><IconPicker value={it.icon} onChange={(n) => setI((arr) => arr.map((x) => x.id === it.id ? { ...x, icon: n } : x))} /></Field>
              </div>
              <Field label="Description"><textarea className={textareaCls} value={it.description}
                onChange={(e) => setI((arr) => arr.map((x) => x.id === it.id ? { ...x, description: e.target.value } : x))} /></Field>
              <div className="mt-3"><MediaPicker label="Image" value={it.image} onChange={(v) => setI((arr) => arr.map((x) => x.id === it.id ? { ...x, image: v } : x))} settings={s} setSettings={setSettings} accept="image" /></div>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <Field label="Button label"><input className={inputCls} value={it.ctaLabel ?? ""} onChange={(e) => setI((arr) => arr.map((x) => x.id === it.id ? { ...x, ctaLabel: e.target.value } : x))} /></Field>
                <Field label="Button link"><input className={inputCls} value={it.ctaHref ?? ""} onChange={(e) => setI((arr) => arr.map((x) => x.id === it.id ? { ...x, ctaHref: e.target.value } : x))} /></Field>
              </div>
              <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-200 pt-3">
                <button onClick={() => setI((arr) => arr.map((x) => x.id === it.id ? { ...x, active: !x.active } : x))}
                  className={`grid place-items-center h-8 w-8 rounded ${it.active ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}>
                  {it.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => setI((arr) => reorder(arr, it.id, -1))} className="grid place-items-center h-8 w-8 rounded text-slate-500 hover:bg-slate-100"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => setI((arr) => reorder(arr, it.id, 1))} className="grid place-items-center h-8 w-8 rounded text-slate-500 hover:bg-slate-100"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => askDelete(`service "${it.title}"`, () => setI((arr) => arr.filter((x) => x.id !== it.id)))}
                  className="grid place-items-center h-8 w-8 rounded text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* ---------- VIRTUAL CARE ---------- */
const VirtualCareEditor = ({ s, setSettings }: EProps) => {
  const set = (patch: Partial<MediCareSettings["virtualCare"]>) =>
    setSettings((st) => ({ ...st, virtualCare: { ...st.virtualCare, ...patch } }));
  return (
    <div className="space-y-6">
      <SectionHeader title="Virtual Care Section" />
      <Card>
        <div className="grid gap-4">
          <Field label="Badge"><input className={inputCls} value={s.virtualCare.badge} onChange={(e) => set({ badge: e.target.value })} /></Field>
          <Field label="Title"><input className={inputCls} value={s.virtualCare.title} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field label="Description"><textarea className={textareaCls} value={s.virtualCare.description} onChange={(e) => set({ description: e.target.value })} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="CTA label"><input className={inputCls} value={s.virtualCare.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
            <Field label="CTA link"><input className={inputCls} value={s.virtualCare.ctaHref} onChange={(e) => set({ ctaHref: e.target.value })} /></Field>
          </div>
          <MediaPicker label="Phone mockup image" value={s.virtualCare.mockupImage} onChange={(v) => set({ mockupImage: v ?? "" })} settings={s} setSettings={setSettings} accept="image" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-3">Feature checklist</h3>
        <div className="space-y-2">
          {s.virtualCare.checklist.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls + " flex-1"} value={c}
                onChange={(e) => set({ checklist: s.virtualCare.checklist.map((x, j) => i === j ? e.target.value : x) })} />
              <button onClick={() => set({ checklist: s.virtualCare.checklist.filter((_, j) => i !== j) })}
                className="grid place-items-center h-9 w-9 rounded text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => set({ checklist: [...s.virtualCare.checklist, "New feature"] })}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-3">Dashboard card</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title"><input className={inputCls} value={s.virtualCare.dashboard.title} onChange={(e) => set({ dashboard: { ...s.virtualCare.dashboard, title: e.target.value } })} /></Field>
          <Field label="Subtitle"><input className={inputCls} value={s.virtualCare.dashboard.subtitle} onChange={(e) => set({ dashboard: { ...s.virtualCare.dashboard, subtitle: e.target.value } })} /></Field>
        </div>
        <div className="mt-3 space-y-2">
          {s.virtualCare.dashboard.stats.map((st, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input className={inputCls + " col-span-5"} value={st.label} placeholder="Label"
                onChange={(e) => set({ dashboard: { ...s.virtualCare.dashboard, stats: s.virtualCare.dashboard.stats.map((x, j) => i === j ? { ...x, label: e.target.value } : x) } })} />
              <input className={inputCls + " col-span-5"} value={st.value} placeholder="Value"
                onChange={(e) => set({ dashboard: { ...s.virtualCare.dashboard, stats: s.virtualCare.dashboard.stats.map((x, j) => i === j ? { ...x, value: e.target.value } : x) } })} />
              <button onClick={() => set({ dashboard: { ...s.virtualCare.dashboard, stats: s.virtualCare.dashboard.stats.filter((_, j) => i !== j) } })}
                className="col-span-2 grid place-items-center h-9 rounded text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => set({ dashboard: { ...s.virtualCare.dashboard, stats: [...s.virtualCare.dashboard.stats, { label: "Stat", value: "0" }] } })}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700">
          <Plus className="h-3.5 w-3.5" /> Add stat
        </button>
      </Card>
    </div>
  );
};

/* ---------- TESTIMONIALS ---------- */
const TestimonialsEditor = ({ s, setSettings, askDelete }: EPropsWithDelete) => {
  const set = (patch: Partial<MediCareSettings["testimonials"]>) =>
    setSettings((st) => ({ ...st, testimonials: { ...st.testimonials, ...patch } }));
  const setI = (mut: (arr: TestimonialItem[]) => TestimonialItem[]) =>
    setSettings((st) => ({ ...st, testimonials: { ...st.testimonials, items: mut(st.testimonials.items) } }));
  const items = [...s.testimonials.items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <SectionHeader title="Testimonials" />
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Section label"><input className={inputCls} value={s.testimonials.label} onChange={(e) => set({ label: e.target.value })} /></Field>
          <Field label="Title"><input className={inputCls} value={s.testimonials.title} onChange={(e) => set({ title: e.target.value })} /></Field>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Testimonial cards</h3>
          <button onClick={() => setI((arr) => [...arr, { id: uid("t"), quote: "", name: "New patient", location: "", imageDataUrl: null, rating: 5, order: arr.length }])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="space-y-4">
          {items.map((t) => (
            <div key={t.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <Field label="Quote"><textarea className={textareaCls} value={t.quote}
                onChange={(e) => setI((arr) => arr.map((x) => x.id === t.id ? { ...x, quote: e.target.value } : x))} /></Field>
              <div className="mt-3 grid sm:grid-cols-3 gap-3">
                <Field label="Name"><input className={inputCls} value={t.name}
                  onChange={(e) => setI((arr) => arr.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x))} /></Field>
                <Field label="Age / Location"><input className={inputCls} value={t.location}
                  onChange={(e) => setI((arr) => arr.map((x) => x.id === t.id ? { ...x, location: e.target.value } : x))} /></Field>
                <Field label="Star rating">
                  <select className={inputCls} value={t.rating}
                    onChange={(e) => setI((arr) => arr.map((x) => x.id === t.id ? { ...x, rating: Number(e.target.value) } : x))}>
                    {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </Field>
              </div>
              <div className="mt-3"><MediaPicker label="Patient image" value={t.imageDataUrl} onChange={(v) => setI((arr) => arr.map((x) => x.id === t.id ? { ...x, imageDataUrl: v } : x))} settings={s} setSettings={setSettings} accept="image" /></div>
              <div className="mt-3 flex justify-end gap-1 border-t border-slate-200 pt-3">
                <button onClick={() => setI((arr) => reorder(arr, t.id, -1))} className="grid place-items-center h-8 w-8 rounded text-slate-500 hover:bg-slate-100"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => setI((arr) => reorder(arr, t.id, 1))} className="grid place-items-center h-8 w-8 rounded text-slate-500 hover:bg-slate-100"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => askDelete(`testimonial from ${t.name}`, () => setI((arr) => arr.filter((x) => x.id !== t.id)))}
                  className="grid place-items-center h-8 w-8 rounded text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* ---------- CTA BANNER ---------- */
const CtaBannerEditor = ({ s, setSettings }: EProps) => {
  const set = (patch: Partial<MediCareSettings["ctaBanner"]>) =>
    setSettings((st) => ({ ...st, ctaBanner: { ...st.ctaBanner, ...patch } }));
  return (
    <div className="space-y-6">
      <SectionHeader title="CTA Banner" />
      <Card>
        <div className="grid gap-4">
          <Field label="Badge"><input className={inputCls} value={s.ctaBanner.badge} onChange={(e) => set({ badge: e.target.value })} /></Field>
          <Field label="Title"><input className={inputCls} value={s.ctaBanner.title} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field label="Description"><textarea className={textareaCls} value={s.ctaBanner.description} onChange={(e) => set({ description: e.target.value })} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <MediaPicker label="Background video" value={s.ctaBanner.bgVideo} onChange={(v) => set({ bgVideo: v ?? "" })} settings={s} setSettings={setSettings} accept="video" />
            <MediaPicker label="Background image (poster)" value={s.ctaBanner.bgImage} onChange={(v) => set({ bgImage: v ?? "" })} settings={s} setSettings={setSettings} accept="image" />
          </div>
          <Field label={`Overlay darkness: ${Math.round(s.ctaBanner.overlayOpacity * 100)}%`}>
            <input type="range" min={0} max={100} value={Math.round(s.ctaBanner.overlayOpacity * 100)}
              onChange={(e) => set({ overlayOpacity: Number(e.target.value) / 100 })} className="w-full" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Primary button label"><input className={inputCls} value={s.ctaBanner.primary.label} onChange={(e) => set({ primary: { ...s.ctaBanner.primary, label: e.target.value } })} /></Field>
            <Field label="Primary button link"><input className={inputCls} value={s.ctaBanner.primary.href} onChange={(e) => set({ primary: { ...s.ctaBanner.primary, href: e.target.value } })} /></Field>
            <Field label="Secondary button label"><input className={inputCls} value={s.ctaBanner.secondary.label} onChange={(e) => set({ secondary: { ...s.ctaBanner.secondary, label: e.target.value } })} /></Field>
            <Field label="Secondary button link"><input className={inputCls} value={s.ctaBanner.secondary.href} onChange={(e) => set({ secondary: { ...s.ctaBanner.secondary, href: e.target.value } })} /></Field>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ---------- FOOTER ---------- */
const FooterLinkList = ({
  title, items, onChange, askDelete, label,
}: {
  title: string; items: FooterLink[];
  onChange: (mut: (arr: FooterLink[]) => FooterLink[]) => void;
  askDelete: (lbl: string, fn: () => void) => void;
  label: string;
}) => (
  <Card>
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <button onClick={() => onChange((arr) => [...arr, { id: uid("l"), label: "New link", href: "#" }])}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700">
        <Plus className="h-3.5 w-3.5" /> Add
      </button>
    </div>
    <div className="space-y-2">
      {items.map((l) => (
        <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
          <input className={inputCls + " col-span-5"} value={l.label}
            onChange={(e) => onChange((arr) => arr.map((x) => x.id === l.id ? { ...x, label: e.target.value } : x))} />
          <input className={inputCls + " col-span-6"} value={l.href}
            onChange={(e) => onChange((arr) => arr.map((x) => x.id === l.id ? { ...x, href: e.target.value } : x))} />
          <button onClick={() => askDelete(`${label} link`, () => onChange((arr) => arr.filter((x) => x.id !== l.id)))}
            className="col-span-1 grid place-items-center h-9 rounded text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  </Card>
);

const FooterEditor = ({ s, setSettings, askDelete }: EPropsWithDelete) => {
  const set = (patch: Partial<MediCareSettings["footer"]>) =>
    setSettings((st) => ({ ...st, footer: { ...st.footer, ...patch } }));
  return (
    <div className="space-y-6">
      <SectionHeader title="Footer" />
      <Card>
        <div className="grid gap-4">
          <Field label="Description"><textarea className={textareaCls} value={s.footer.description} onChange={(e) => set({ description: e.target.value })} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Copyright" hint="Use {year} and {site} placeholders">
              <input className={inputCls} value={s.footer.copyright} onChange={(e) => set({ copyright: e.target.value })} />
            </Field>
            <Field label="Availability text"><input className={inputCls} value={s.footer.availabilityText} onChange={(e) => set({ availabilityText: e.target.value })} /></Field>
          </div>
          <Field label="Background color">
            <input type="color" className="h-10 w-24 rounded-lg border border-slate-200" value={s.footer.bgColor} onChange={(e) => set({ bgColor: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-3">Social media</h3>
        <div className="space-y-2">
          {s.footer.socials.map((so) => (
            <div key={so.id} className="grid grid-cols-12 gap-2 items-center">
              <select className={inputCls + " col-span-3"} value={so.platform}
                onChange={(e) => set({ socials: s.footer.socials.map((x) => x.id === so.id ? { ...x, platform: e.target.value as any } : x) })}>
                <option value="facebook">Facebook</option><option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option><option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option><option value="tiktok">TikTok</option>
              </select>
              <input className={inputCls + " col-span-8"} value={so.href}
                onChange={(e) => set({ socials: s.footer.socials.map((x) => x.id === so.id ? { ...x, href: e.target.value } : x) })} />
              <button onClick={() => askDelete("social link", () => set({ socials: s.footer.socials.filter((x) => x.id !== so.id) }))}
                className="col-span-1 grid place-items-center h-9 rounded text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => set({ socials: [...s.footer.socials, { id: uid("so"), platform: "facebook", href: "#" }] })}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700">
          <Plus className="h-3.5 w-3.5" /> Add social
        </button>
      </Card>

      <FooterLinkList title="Specialist links" label="specialist" items={s.footer.specialistLinks}
        onChange={(mut) => set({ specialistLinks: mut(s.footer.specialistLinks) })} askDelete={askDelete} />
      <FooterLinkList title="Quick links" label="quick"      items={s.footer.quickLinks}
        onChange={(mut) => set({ quickLinks: mut(s.footer.quickLinks) })} askDelete={askDelete} />
      <FooterLinkList title="Support links" label="support"  items={s.footer.supportLinks}
        onChange={(mut) => set({ supportLinks: mut(s.footer.supportLinks) })} askDelete={askDelete} />
    </div>
  );
};

/* ---------- MEDIA LIBRARY ---------- */
const MediaLibraryEditor = ({ s, setSettings, askDelete }: EPropsWithDelete) => {
  return (
    <div className="space-y-6">
      <SectionHeader title="Media Library" desc="All uploaded images and videos." />
      <Card>
        <MediaPicker label="" value={null} onChange={() => { /* picker is for adding only */ }} settings={s} setSettings={setSettings} accept="any" />
        <p className="text-xs text-slate-400 mt-3">Tip: media added here is reusable across every section.</p>
      </Card>
      <Card>
        {s.media.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">Library is empty. Use the picker above to upload.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {s.media.map((m) => (
              <div key={m.id} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50 group">
                {m.type === "video" ? <video src={m.dataUrl} muted className="h-full w-full object-cover" /> : <img src={m.dataUrl} alt={m.name} className="h-full w-full object-cover" />}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-[10px] font-semibold truncate">{m.name}</div>
                <button onClick={() => askDelete(`"${m.name}"`, () => setSettings((st) => ({ ...st, media: st.media.filter((x) => x.id !== m.id) })))}
                  className="absolute top-1 right-1 grid place-items-center h-7 w-7 rounded-full bg-white/90 text-rose-600 shadow opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

/* ---------- SEO ---------- */
const SeoEditor = ({ s, setSettings }: EProps) => {
  const set = (patch: Partial<MediCareSettings["seo"]>) =>
    setSettings((st) => ({ ...st, seo: { ...st.seo, ...patch } }));
  return (
    <div className="space-y-6">
      <SectionHeader title="SEO Settings" />
      <Card>
        <div className="grid gap-4">
          <Field label="Page title" hint="Recommended < 60 characters"><input className={inputCls} value={s.seo.pageTitle} onChange={(e) => set({ pageTitle: e.target.value })} /></Field>
          <Field label="Meta description" hint="Recommended < 160 characters"><textarea className={textareaCls} value={s.seo.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} /></Field>
          <Field label="Keywords" hint="Comma-separated"><input className={inputCls} value={s.seo.keywords} onChange={(e) => set({ keywords: e.target.value })} /></Field>
          <MediaPicker label="Open Graph image (1200x630)" value={s.seo.ogImage} onChange={(v) => set({ ogImage: v ?? "" })} settings={s} setSettings={setSettings} accept="image" />
          <MediaPicker label="Favicon" value={s.seo.favicon} onChange={(v) => set({ favicon: v ?? "" })} settings={s} setSettings={setSettings} accept="image" />
        </div>
      </Card>
    </div>
  );
};
