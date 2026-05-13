import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Save, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown,
  Eye, EyeOff, ExternalLink, Image as ImageIcon, Settings, Menu as MenuIcon,
  Star, Sparkles, FileText, Layers, Megaphone, Phone as PhoneIcon, Search,
  Home, Info, Heart, Wrench, Video, MessageSquare, ChevronRight, X,
  Facebook, Twitter, Instagram, Linkedin,
} from "lucide-react";
import {
  defaultSettings, loadSettings, resetSettings, saveSettings,
  type MediCareSettings, type LucideIconName, type Service, type Feature,
  type TestimonialItem, type Partner, type NavItem, type SocialLink, type FooterLink,
} from "@/lib/medicareSettings";
import { MediaPicker } from "@/components/medicare-admin/MediaPicker";
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

/* ---------- Tabs ---------- */
type Tab =
  | "navbar" | "hero" | "partners" | "about" | "whyChoose" | "services"
  | "virtualCare" | "testimonials" | "ctaBanner" | "footer" | "media" | "seo" | "branding";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "branding",     label: "Branding",      icon: Settings },
  { id: "navbar",       label: "Navbar",        icon: MenuIcon },
  { id: "hero",         label: "Hero",          icon: Sparkles },
  { id: "partners",     label: "Partners",      icon: Layers },
  { id: "about",        label: "About",         icon: Info },
  { id: "whyChoose",    label: "Why Choose Us", icon: Heart },
  { id: "services",     label: "Services",      icon: Wrench },
  { id: "virtualCare",  label: "Virtual Care",  icon: Video },
  { id: "testimonials", label: "Testimonials",  icon: MessageSquare },
  { id: "ctaBanner",    label: "CTA Banner",    icon: Megaphone },
  { id: "footer",       label: "Footer",        icon: Home },
  { id: "media",        label: "Media Library", icon: ImageIcon },
  { id: "seo",          label: "SEO Settings",  icon: Search },
];

/* =========================================================
                       Main Admin
========================================================= */
const MediCareAdmin = () => {
  const [s, setS] = useState<MediCareSettings>(defaultSettings);
  const [tab, setTab] = useState<Tab>("hero");
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
        <div className="p-4">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Landing Page CMS</p>
          <nav className="space-y-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            ))}
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
