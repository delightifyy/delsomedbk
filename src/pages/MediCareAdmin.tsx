import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Save, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown,
  Eye, EyeOff, ExternalLink, Image as ImageIcon, Settings, Menu as MenuIcon,
  Star, Sparkles, FileText, Layers, Megaphone, Phone as PhoneIcon, Search,
  Home, Info, Heart, Wrench, Video, MessageSquare, ChevronRight, ChevronDown, X,
  Facebook, Twitter, Instagram, Linkedin, Newspaper, Mail, MapPin,
  CalendarClock, Loader2,
} from "lucide-react";
import {
  defaultSettings, loadSettings, resetSettings, saveSettings,
  type MediCareSettings, type LucideIconName, type Service, type Feature,
  type TestimonialItem, type Partner, type NavItem, type SocialLink, type FooterLink,
} from "@/lib/medicareSettings";
import {
  DAY_NAMES,
  formatDateValue,
  normalizeAvailabilityBundle,
  type AvailabilityBundle,
  type AvailabilityException,
  type AvailabilityExceptionType,
  type AvailabilitySettings,
  type WeeklyWindow,
} from "@/lib/miniSiteAvailability";
import { ApiError, api as medicareApi } from "@/lib/api";
import { MediaPicker } from "@/components/medicare-admin/MediaPicker";
import { ImageUploader } from "@/components/medicare-admin/ImageUploader";
import { Icon, ICON_NAMES } from "@/components/medicare-admin/icons";

const uid = (p = "id") => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const asRecord = (value: unknown): Record<string, unknown> => (value && typeof value === "object" ? value as Record<string, unknown> : {});

const getText = (record: Record<string, unknown>, key: string) => {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
};

const getRemoteId = (item: unknown) => {
  const record = asRecord(item);
  const candidate = record.id ?? record.uuid ?? record.slug ?? record.link_id ?? record.social_link_id ?? record.card_id;
  return typeof candidate === "string" || typeof candidate === "number" ? candidate : undefined;
};

const mergeRemoteMiniSite = (current: MediCareSettings, remote: Record<string, unknown>): MediCareSettings => {
  const hero = asRecord(remote.hero);
  const about = asRecord(remote.about);
  const services = asRecord(remote.services);
  const contact = asRecord(remote.contact);
  const footer = asRecord(remote.footer);
  const serviceCards = Array.isArray(remote.servicesCards) ? remote.servicesCards : [];
  const footerSocialLinks = Array.isArray(remote.footerSocialLinks) ? remote.footerSocialLinks : [];
  const footerSpecialistLinks = Array.isArray(remote.footerSpecialistLinks) ? remote.footerSpecialistLinks : [];
  const footerQuickLinks = Array.isArray(remote.footerQuickLinks) ? remote.footerQuickLinks : [];
  const footerSupportLinks = Array.isArray(remote.footerSupportLinks) ? remote.footerSupportLinks : [];

  return {
    ...current,
    hero: {
      ...current.hero,
      titleLead: getText(hero, "headline") ?? getText(hero, "titleLead") ?? current.hero.titleLead,
      titleHighlight: getText(hero, "highlighted_headline") ?? getText(hero, "titleHighlight") ?? current.hero.titleHighlight,
      subtitle: getText(hero, "body") ?? getText(hero, "subtitle") ?? current.hero.subtitle,
      ctaLabel: getText(hero, "button_text") ?? getText(hero, "ctaLabel") ?? current.hero.ctaLabel,
      ctaHref: getText(hero, "button_link") ?? getText(hero, "ctaHref") ?? current.hero.ctaHref,
    },
    about: {
      ...current.about,
      label: getText(about, "section_label") ?? getText(about, "label") ?? current.about.label,
      title: getText(about, "title") ?? current.about.title,
      body: getText(about, "description") ?? getText(about, "body") ?? current.about.body,
      mission: {
        ...current.about.mission,
        title: getText(about, "mission_title") ?? current.about.mission.title,
        body: getText(about, "mission_text") ?? current.about.mission.body,
      },
      vision: {
        ...current.about.vision,
        title: getText(about, "vision_title") ?? current.about.vision.title,
        body: getText(about, "vision_text") ?? current.about.vision.body,
      },
      ctaLabel: getText(about, "cta_label") ?? current.about.ctaLabel,
      ctaHref: getText(about, "cta_link") ?? current.about.ctaHref,
      satisfaction: {
        ...current.about.satisfaction,
        value: getText(about, "satisfaction_value") ?? current.about.satisfaction.value,
        label: getText(about, "satisfaction_label") ?? current.about.satisfaction.label,
      },
    },
    services: {
      ...current.services,
      label: getText(services, "section_label") ?? getText(services, "label") ?? current.services.label,
      title: getText(services, "section_title") ?? getText(services, "title") ?? current.services.title,
      items: serviceCards.map((item, index) => {
        const record = asRecord(item);
        return {
          id: String(record.id ?? record.uuid ?? index),
          icon: (record.icon ?? "Stethoscope") as LucideIconName,
          title: getText(record, "title") ?? "",
          description: getText(record, "description") ?? "",
          price_amount: record.price_amount != null ? Number(record.price_amount) : null,
          price_currency: "NGN",
          price_label: getText(record, "price_label") ?? "",
          order: Number(record.order ?? index),
          active: record.is_visible !== false,
        };
      }),
    },
    contact: {
      ...current.contact,
      email: getText(contact, "email") ?? current.contact.email,
      phone: getText(contact, "phone") ?? current.contact.phone,
      address: getText(contact, "address") ?? current.contact.address,
    },
    footer: {
      ...current.footer,
      description: getText(footer, "description") ?? current.footer.description,
      copyright: getText(footer, "copyright") ?? current.footer.copyright,
      availabilityText: getText(footer, "availability_text") ?? getText(footer, "availabilityText") ?? current.footer.availabilityText,
      bgColor: getText(footer, "background_color") ?? getText(footer, "bgColor") ?? current.footer.bgColor,
      socials: footerSocialLinks.map((item, index) => {
        const record = asRecord(item);
        return {
          id: String(record.id ?? record.uuid ?? index),
          platform: String(record.platform ?? "facebook") as SocialLink["platform"],
          href: getText(record, "url") ?? getText(record, "href") ?? "",
        };
      }),
      specialistLinks: footerSpecialistLinks.map((item, index) => {
        const record = asRecord(item);
        return {
          id: String(record.id ?? record.uuid ?? index),
          label: getText(record, "label") ?? "",
          href: getText(record, "url") ?? getText(record, "href") ?? "",
        };
      }),
      quickLinks: footerQuickLinks.map((item, index) => {
        const record = asRecord(item);
        return {
          id: String(record.id ?? record.uuid ?? index),
          label: getText(record, "label") ?? "",
          href: getText(record, "url") ?? getText(record, "href") ?? "",
        };
      }),
      supportLinks: footerSupportLinks.map((item, index) => {
        const record = asRecord(item);
        return {
          id: String(record.id ?? record.uuid ?? index),
          label: getText(record, "label") ?? "",
          href: getText(record, "url") ?? getText(record, "href") ?? "",
        };
      }),
    },
  };
};

const deleteRemoteCollection = async (
  items: unknown[],
  deleteItem: (id: string | number) => Promise<unknown>,
) => {
  for (const item of items) {
    const id = getRemoteId(item);
    if (id !== undefined && id !== null && `${id}`.trim()) {
      await deleteItem(id);
    }
  }
};

const syncFooterLinks = async (group: "specialist" | "quick" | "support", links: FooterLink[]) => {
    const current = await medicareApi.medicare.self.footer.links.list({ group });
  await deleteRemoteCollection(current.data ?? [], (id) => medicareApi.medicare.self.footer.links.delete(id));
  for (const link of links) {
    await medicareApi.medicare.self.footer.links.create({ group, label: link.label, url: link.href });
  }
};

const syncSocialLinks = async (socials: SocialLink[]) => {
  const current = await medicareApi.medicare.self.footer.socialLinks.list();
  await deleteRemoteCollection(current.data ?? [], (id) => medicareApi.medicare.self.footer.socialLinks.delete(id));
  for (const social of socials) {
    await medicareApi.medicare.self.footer.socialLinks.create({ platform: social.platform, url: social.href });
  }
};

const syncServiceCards = async (items: Service[]) => {
  const current = await medicareApi.medicare.self.services.cards.list();
  await deleteRemoteCollection(current.data ?? [], (id) => medicareApi.medicare.self.services.cards.delete(id));
  for (const item of [...items].sort((a, b) => a.order - b.order)) {
    await medicareApi.medicare.self.services.cards.create({
      title: item.title,
      icon: item.icon,
      description: item.description,
      price_amount: item.price_amount ?? null,
      price_currency: "NGN",
      price_label: item.price_label ?? null,
      is_visible: item.active,
    });
  }
};

const syncMiniSiteToApi = async (settings: MediCareSettings) => {
  await medicareApi.medicare.self.hero.update({
    headline: settings.hero.titleLead,
    highlighted_headline: settings.hero.titleHighlight,
    body: settings.hero.subtitle,
    button_text: settings.hero.ctaLabel,
    button_link: settings.hero.ctaHref,
  });

  await medicareApi.medicare.self.about.update({
    section_label: settings.about.label,
    title: settings.about.title,
    description: settings.about.body,
    mission_title: settings.about.mission.title,
    mission_text: settings.about.mission.body,
    vision_title: settings.about.vision.title,
    vision_text: settings.about.vision.body,
    cta_label: settings.about.ctaLabel,
    cta_link: settings.about.ctaHref,
    satisfaction_value: settings.about.satisfaction.value,
    satisfaction_label: settings.about.satisfaction.label,
  });

  await medicareApi.medicare.self.services.update({
    section_label: settings.services.label,
    section_title: settings.services.title,
  });

  await medicareApi.medicare.self.contact.update({
    email: settings.contact.email,
    phone: settings.contact.phone,
    address: settings.contact.address,
  });

  await medicareApi.medicare.self.footer.update({
    description: settings.footer.description,
    copyright: settings.footer.copyright,
    availability_text: settings.footer.availabilityText,
    background_color: settings.footer.bgColor,
  });

  await syncServiceCards(settings.services.items);
  await syncSocialLinks(settings.footer.socials);
  await syncFooterLinks("specialist", settings.footer.specialistLinks);
  await syncFooterLinks("quick", settings.footer.quickLinks);
  await syncFooterLinks("support", settings.footer.supportLinks);
};

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
  | "home" | "navbar" | "hero" | "partners" | "about" | "whyChoose"
  | "services" | "media" | "seo"
  | "branding" | "contact" | "blog" | "servicesPage" | "availability";

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
      { id: "services", label: "Services" },
    ],
  },
  {
    id: "availability",
    label: "Availability",
    icon: CalendarClock,
    sections: [
      { id: "availability", label: "Schedule" },
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
      { id: "contact", label: "Contact Info + Footer" },
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

  useEffect(() => {
    let active = true;
    const hydrateRemote = async () => {
      try {
        const [bundle, servicesCards, socialLinks, specialistLinks, quickLinks, supportLinks] = await Promise.all([
          medicareApi.medicare.self.bundle(),
          medicareApi.medicare.self.services.cards.list(),
          medicareApi.medicare.self.footer.socialLinks.list(),
          medicareApi.medicare.self.footer.links.list({ group: "specialist" }),
          medicareApi.medicare.self.footer.links.list({ group: "quick" }),
          medicareApi.medicare.self.footer.links.list({ group: "support" }),
        ]);

        if (!active) return;

        const remote = {
          ...asRecord(bundle.data),
          servicesCards: servicesCards.data,
          footerSocialLinks: socialLinks.data,
          footerSpecialistLinks: specialistLinks.data,
          footerQuickLinks: quickLinks.data,
          footerSupportLinks: supportLinks.data,
        };

        setS((current) => mergeRemoteMiniSite(current, remote));
      } catch {
        // Local settings remain in use when the API is unavailable.
      }
    };

    void hydrateRemote();
    return () => {
      active = false;
    };
  }, []);

  const update = (patch: Partial<MediCareSettings>) => { setS((p) => ({ ...p, ...patch })); setDirty(true); };
  const setSettings = (updater: (s: MediCareSettings) => MediCareSettings) => { setS(updater); setDirty(true); };

  const onSave = async () => {
    try {
      saveSettings(s);
    } catch {
      toast.error("Save failed — storage may be full. Try smaller media.");
      return;
    }
    try {
      await syncMiniSiteToApi(s);
      toast.success("Saved locally and synced to MediCare CMS");
      setDirty(false);
    } catch (error) {
      setDirty(true);
      const message = error instanceof Error ? error.message : "Remote sync failed.";
      toast.error(`Saved locally, but remote sync failed: ${message}`);
    }
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
          {tab === "home" && (
            <div className="space-y-12">
              {/* Home page header removed per request */}
              {/* NavbarEditor removed per request - previously allowed editing navbar links */}
              <HeroEditor s={s} setSettings={setSettings} />
            </div>
          )}
          {tab === "branding"     && <BrandingEditor s={s} update={update} setSettings={setSettings} />}

          {/* NavbarEditor disabled - component commented out above */}
          {/* {tab === "navbar"       && <NavbarEditor s={s} setSettings={setSettings} askDelete={askDelete} />} */}
          {tab === "hero"         && <HeroEditor s={s} setSettings={setSettings} />}
          {tab === "partners"     && <PartnersEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "about"        && <AboutEditor s={s} setSettings={setSettings} />}
          {tab === "whyChoose"    && <WhyChooseEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "services" && <ServicesEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "availability" && <AvailabilityEditor askDelete={askDelete} />}
          {tab === "media"        && <MediaLibraryEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
          {tab === "seo"          && <SeoEditor s={s} setSettings={setSettings} />}
          {tab === "contact"      && <ContactEditor s={s} setSettings={setSettings} askDelete={askDelete} />}
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

/* ---------- HOME (composite of all home-page sections) ---------- */
// const HomeEditor = ({ s, setSettings, askDelete }: EPropsWithDelete) => (
//   <div className="space-y-12">
//     <SectionHeader title="Home Page" desc="Edit every section that appears on the public MediCare home page." />
//     {/* NavbarEditor removed per request - previously allowed editing navbar links */}
//     <HeroEditor s={s} setSettings={setSettings} />
//   </div>
// );


/* ---------- AVAILABILITY ---------- */
const defaultAvailabilityBundle: AvailabilityBundle = {
  settings: {
    slot_duration_minutes: 30,
    booking_window_days: 60,
    minimum_lead_time_hours: 2,
  },
  weekly_windows: [],
  exceptions: [],
};

const sortWindows = (items: WeeklyWindow[]) =>
  [...items].sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time));

const sortExceptions = (items: AvailabilityException[]) =>
  [...items].sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type));

const needsExceptionTime = (type: AvailabilityExceptionType) => type !== "closed_all_day";

const validateTimeRange = (start: string, end: string) => {
  if (!start || !end) {
    toast.error("Start and end time are required.");
    return false;
  }
  if (start >= end) {
    toast.error("End time must be after start time.");
    return false;
  }
  return true;
};

const AvailabilityEditor = ({ askDelete }: { askDelete: (label: string, fn: () => void) => void }) => {
  const [bundle, setBundle] = useState<AvailabilityBundle>(defaultAvailabilityBundle);
  const [settingsDraft, setSettingsDraft] = useState<AvailabilitySettings>(defaultAvailabilityBundle.settings);
  const [newWindow, setNewWindow] = useState({ day_of_week: 1, start_time: "09:00", end_time: "12:00" });
  const [newException, setNewException] = useState<{
    date: string;
    type: AvailabilityExceptionType;
    start_time: string;
    end_time: string;
    reason: string;
  }>({
    date: formatDateValue(new Date()),
    type: "closed_all_day",
    start_time: "12:00",
    end_time: "13:00",
    reason: "",
  });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await medicareApi.medicare.self.availability.bundle();
      const next = normalizeAvailabilityBundle(response.data);
      setBundle(next);
      setSettingsDraft(next.settings);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        try {
          const [settingsResponse, windowsResponse, exceptionsResponse] = await Promise.all([
            medicareApi.medicare.self.availability.settings.show(),
            medicareApi.medicare.self.availability.weeklyWindows.list(),
            medicareApi.medicare.self.availability.exceptions.list({ from: formatDateValue(new Date()) }),
          ]);

          const next = normalizeAvailabilityBundle({
            data: {
              settings: settingsResponse.data,
              weekly_windows: Array.isArray(windowsResponse.data) ? windowsResponse.data : [],
              exceptions: Array.isArray(exceptionsResponse.data) ? exceptionsResponse.data : [],
            },
          });

          setBundle(next);
          setSettingsDraft(next.settings);
          return;
        } catch {
          setBundle(defaultAvailabilityBundle);
          setSettingsDraft(defaultAvailabilityBundle.settings);
          return;
        }
      }

      const message = err instanceof Error ? err.message : "Could not load availability.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAvailability();
  }, []);

  const saveSettings = async () => {
    const payload = {
      slot_duration_minutes: Number(settingsDraft.slot_duration_minutes),
      booking_window_days: Number(settingsDraft.booking_window_days),
      minimum_lead_time_hours: Number(settingsDraft.minimum_lead_time_hours),
    };
    setPending("settings");
    try {
      await medicareApi.medicare.self.availability.settings.update(payload);
      toast.success("Availability settings saved");
      await loadAvailability();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setPending(null);
    }
  };

  const createWindow = async () => {
    if (!validateTimeRange(newWindow.start_time, newWindow.end_time)) return;
    setPending("new-window");
    try {
      await medicareApi.medicare.self.availability.weeklyWindows.create({
        day_of_week: Number(newWindow.day_of_week),
        start_time: newWindow.start_time,
        end_time: newWindow.end_time,
      });
      toast.success("Weekly window added");
      await loadAvailability();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add weekly window.");
    } finally {
      setPending(null);
    }
  };

  const updateWindow = async (window: WeeklyWindow) => {
    if (!validateTimeRange(window.start_time, window.end_time)) return;
    setPending(`window-${window.id}`);
    try {
      await medicareApi.medicare.self.availability.weeklyWindows.update(window.id, {
        day_of_week: Number(window.day_of_week),
        start_time: window.start_time,
        end_time: window.end_time,
      });
      toast.success("Weekly window saved");
      await loadAvailability();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save weekly window.");
    } finally {
      setPending(null);
    }
  };

  const deleteWindow = async (window: WeeklyWindow) => {
    setPending(`window-${window.id}`);
    try {
      await medicareApi.medicare.self.availability.weeklyWindows.delete(window.id);
      toast.success("Weekly window removed");
      await loadAvailability();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove weekly window.");
    } finally {
      setPending(null);
    }
  };

  const updateWindowLocal = (id: string | number, patch: Partial<WeeklyWindow>) => {
    setBundle((current) => ({
      ...current,
      weekly_windows: current.weekly_windows.map((window) =>
        window.id === id ? { ...window, ...patch, day_name: DAY_NAMES[Number(patch.day_of_week ?? window.day_of_week)] ?? window.day_name } : window,
      ),
    }));
  };

  const createException = async () => {
    if (!newException.date) {
      toast.error("Date is required.");
      return;
    }
    if (needsExceptionTime(newException.type) && !validateTimeRange(newException.start_time, newException.end_time)) return;

    setPending("new-exception");
    try {
      await medicareApi.medicare.self.availability.exceptions.create({
        date: newException.date,
        type: newException.type,
        start_time: needsExceptionTime(newException.type) ? newException.start_time : null,
        end_time: needsExceptionTime(newException.type) ? newException.end_time : null,
        reason: newException.reason || null,
      });
      toast.success("Exception added");
      setNewException((current) => ({ ...current, reason: "" }));
      await loadAvailability();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add exception.");
    } finally {
      setPending(null);
    }
  };

  const updateException = async (exception: AvailabilityException) => {
    if (!exception.date) {
      toast.error("Date is required.");
      return;
    }
    if (
      needsExceptionTime(exception.type) &&
      !validateTimeRange(exception.start_time ?? "", exception.end_time ?? "")
    ) {
      return;
    }

    setPending(`exception-${exception.id}`);
    try {
      await medicareApi.medicare.self.availability.exceptions.update(exception.id, {
        date: exception.date,
        type: exception.type,
        start_time: needsExceptionTime(exception.type) ? exception.start_time : null,
        end_time: needsExceptionTime(exception.type) ? exception.end_time : null,
        reason: exception.reason || null,
      });
      toast.success("Exception saved");
      await loadAvailability();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save exception.");
    } finally {
      setPending(null);
    }
  };

  const deleteException = async (exception: AvailabilityException) => {
    setPending(`exception-${exception.id}`);
    try {
      await medicareApi.medicare.self.availability.exceptions.delete(exception.id);
      toast.success("Exception removed");
      await loadAvailability();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove exception.");
    } finally {
      setPending(null);
    }
  };

  const updateExceptionLocal = (id: string | number, patch: Partial<AvailabilityException>) => {
    setBundle((current) => ({
      ...current,
      exceptions: current.exceptions.map((exception) =>
        exception.id === id ? { ...exception, ...patch } : exception,
      ),
    }));
  };

  const windows = sortWindows(bundle.weekly_windows);
  const exceptions = sortExceptions(bundle.exceptions);

  return (
    <div className="space-y-6">
      <SectionHeader title="Availability" desc="Weekly hours and date exceptions for the public booking form." />

      {loading ? (
        <Card className="grid min-h-48 place-items-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading availability
          </div>
        </Card>
      ) : error ? (
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Availability unavailable</h3>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadAvailability()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Retry
            </button>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">Booking Rules</h3>
                <p className="mt-1 text-xs text-slate-500">Africa/Lagos time</p>
              </div>
              <button
                type="button"
                onClick={saveSettings}
                disabled={pending === "settings"}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {pending === "settings" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Slot duration">
                <select
                  className={inputCls}
                  value={settingsDraft.slot_duration_minutes}
                  onChange={(event) => setSettingsDraft((current) => ({ ...current, slot_duration_minutes: Number(event.target.value) }))}
                >
                  {[15, 20, 30, 45, 60].map((minutes) => (
                    <option key={minutes} value={minutes}>{minutes} minutes</option>
                  ))}
                </select>
              </Field>
              <Field label="Booking window">
                <input
                  className={inputCls}
                  type="number"
                  min={1}
                  max={180}
                  value={settingsDraft.booking_window_days}
                  onChange={(event) => setSettingsDraft((current) => ({ ...current, booking_window_days: Number(event.target.value) }))}
                />
              </Field>
              <Field label="Lead time">
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  max={168}
                  value={settingsDraft.minimum_lead_time_hours}
                  onChange={(event) => setSettingsDraft((current) => ({ ...current, minimum_lead_time_hours: Number(event.target.value) }))}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Weekly Windows</h3>
                <p className="mt-1 text-xs text-slate-500">{windows.length} active window{windows.length === 1 ? "" : "s"}</p>
              </div>
              <button
                type="button"
                onClick={createWindow}
                disabled={pending === "new-window"}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {pending === "new-window" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Window
              </button>
            </div>
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-12">
              <select
                className={`${inputCls} sm:col-span-4`}
                value={newWindow.day_of_week}
                onChange={(event) => setNewWindow((current) => ({ ...current, day_of_week: Number(event.target.value) }))}
              >
                {DAY_NAMES.map((day, index) => <option key={day} value={index}>{day}</option>)}
              </select>
              <input
                className={`${inputCls} sm:col-span-4`}
                type="time"
                value={newWindow.start_time}
                onChange={(event) => setNewWindow((current) => ({ ...current, start_time: event.target.value }))}
              />
              <input
                className={`${inputCls} sm:col-span-4`}
                type="time"
                value={newWindow.end_time}
                onChange={(event) => setNewWindow((current) => ({ ...current, end_time: event.target.value }))}
              />
            </div>

            <div className="mt-4 space-y-2">
              {windows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  No weekly windows yet.
                </div>
              ) : windows.map((window) => (
                <div key={window.id} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-12 sm:items-center">
                  <select
                    className={`${inputCls} sm:col-span-3`}
                    value={window.day_of_week}
                    onChange={(event) => updateWindowLocal(window.id, { day_of_week: Number(event.target.value) })}
                  >
                    {DAY_NAMES.map((day, index) => <option key={day} value={index}>{day}</option>)}
                  </select>
                  <input
                    className={`${inputCls} sm:col-span-3`}
                    type="time"
                    value={window.start_time}
                    onChange={(event) => updateWindowLocal(window.id, { start_time: event.target.value })}
                  />
                  <input
                    className={`${inputCls} sm:col-span-3`}
                    type="time"
                    value={window.end_time}
                    onChange={(event) => updateWindowLocal(window.id, { end_time: event.target.value })}
                  />
                  <div className="flex justify-end gap-2 sm:col-span-3">
                    <button
                      type="button"
                      onClick={() => void updateWindow(window)}
                      disabled={pending === `window-${window.id}`}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {pending === `window-${window.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => askDelete(`${window.day_name} window`, () => void deleteWindow(window))}
                      className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Date Exceptions</h3>
                <p className="mt-1 text-xs text-slate-500">{exceptions.length} future exception{exceptions.length === 1 ? "" : "s"}</p>
              </div>
              <button
                type="button"
                onClick={createException}
                disabled={pending === "new-exception"}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {pending === "new-exception" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Exception
              </button>
            </div>
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-12">
              <input
                className={`${inputCls} sm:col-span-3`}
                type="date"
                value={newException.date}
                onChange={(event) => setNewException((current) => ({ ...current, date: event.target.value }))}
              />
              <select
                className={`${inputCls} sm:col-span-3`}
                value={newException.type}
                onChange={(event) => setNewException((current) => ({ ...current, type: event.target.value as AvailabilityExceptionType }))}
              >
                <option value="closed_all_day">Closed all day</option>
                <option value="closed_partial">Closed partial</option>
                <option value="extra_hours">Extra hours</option>
              </select>
              <input
                className={`${inputCls} sm:col-span-2`}
                type="time"
                value={newException.start_time}
                disabled={!needsExceptionTime(newException.type)}
                onChange={(event) => setNewException((current) => ({ ...current, start_time: event.target.value }))}
              />
              <input
                className={`${inputCls} sm:col-span-2`}
                type="time"
                value={newException.end_time}
                disabled={!needsExceptionTime(newException.type)}
                onChange={(event) => setNewException((current) => ({ ...current, end_time: event.target.value }))}
              />
              <input
                className={`${inputCls} sm:col-span-2`}
                value={newException.reason}
                placeholder="Reason"
                onChange={(event) => setNewException((current) => ({ ...current, reason: event.target.value }))}
              />
            </div>

            <div className="mt-4 space-y-2">
              {exceptions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  No future exceptions.
                </div>
              ) : exceptions.map((exception) => (
                <div key={exception.id} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-12 sm:items-center">
                  <input
                    className={`${inputCls} sm:col-span-2`}
                    type="date"
                    value={exception.date}
                    onChange={(event) => updateExceptionLocal(exception.id, { date: event.target.value })}
                  />
                  <select
                    className={`${inputCls} sm:col-span-3`}
                    value={exception.type}
                    onChange={(event) => updateExceptionLocal(exception.id, { type: event.target.value as AvailabilityExceptionType })}
                  >
                    <option value="closed_all_day">Closed all day</option>
                    <option value="closed_partial">Closed partial</option>
                    <option value="extra_hours">Extra hours</option>
                  </select>
                  <input
                    className={`${inputCls} sm:col-span-2`}
                    type="time"
                    value={exception.start_time ?? ""}
                    disabled={!needsExceptionTime(exception.type)}
                    onChange={(event) => updateExceptionLocal(exception.id, { start_time: event.target.value })}
                  />
                  <input
                    className={`${inputCls} sm:col-span-2`}
                    type="time"
                    value={exception.end_time ?? ""}
                    disabled={!needsExceptionTime(exception.type)}
                    onChange={(event) => updateExceptionLocal(exception.id, { end_time: event.target.value })}
                  />
                  <div className="flex justify-end gap-2 sm:col-span-3">
                    <button
                      type="button"
                      onClick={() => void updateException(exception)}
                      disabled={pending === `exception-${exception.id}`}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {pending === `exception-${exception.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => askDelete(`${exception.date} exception`, () => void deleteException(exception))}
                      className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    className={`${inputCls} sm:col-span-12`}
                    value={exception.reason ?? ""}
                    placeholder="Reason"
                    onChange={(event) => updateExceptionLocal(exception.id, { reason: event.target.value })}
                  />
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};


/* ---------- CONTACT ---------- */
const ContactEditor = ({ s, setSettings, askDelete }: EPropsWithDelete) => {
  const set = (patch: Partial<MediCareSettings["contact"]>) =>
    setSettings((st) => ({ ...st, contact: { ...st.contact, ...patch } }));
  return (
    <div className="space-y-6">
      <SectionHeader title="Contact Us" desc="Contact page details and footer content for the Medicare site." />
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
      <FooterEditor s={s} setSettings={setSettings} askDelete={askDelete} />
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
        <MediaPicker label="Logo" value={s.logoDataUrl} onChange={(url) => update({ logoDataUrl: url })} />
      </div>
    </Card>
  </div>
);

/* ---------- HERO ---------- */
const HeroEditor = ({ s, setSettings }: EProps) => {
  const set = (patch: Partial<MediCareSettings["hero"]>) =>
    setSettings((st) => ({ ...st, hero: { ...st.hero, ...patch } }));
  return (
    <div className="space-y-6">
      <SectionHeader title="Home Boarding" desc="Headline, body copy, button text, and button link." />
      <Card>
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Headline"><input className={inputCls} value={s.hero.titleLead} onChange={(e) => set({ titleLead: e.target.value })} /></Field>
            <Field label="Highlighted headline"><input className={inputCls} value={s.hero.titleHighlight} onChange={(e) => set({ titleHighlight: e.target.value })} /></Field>
          </div>
          <Field label="Body"><textarea className={textareaCls} value={s.hero.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Button text"><input className={inputCls} value={s.hero.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
            <Field label="Button link"><input className={inputCls} value={s.hero.ctaHref} onChange={(e) => set({ ctaHref: e.target.value })} /></Field>
          </div>
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
                <MediaPicker value={p.logoDataUrl} onChange={(url) => set((arr) => arr.map((x) => x.id === p.id ? { ...x, logoDataUrl: url } : x))} />
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
          <MediaPicker label="Image" value={s.about.image} onChange={(v) => set({ image: v ?? "" })} />
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
          <MediaPicker label="Main image" value={s.whyChoose.image} onChange={(v) => set({ image: v ?? "" })} />
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
      <SectionHeader title="Home Services Section" desc="Controls the Services section on the Medicare home page." />
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Section label"><input className={inputCls} value={s.services.label} onChange={(e) => set({ label: e.target.value })} /></Field>
          <Field label="Title"><input className={inputCls} value={s.services.title} onChange={(e) => set({ title: e.target.value })} /></Field>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Service cards</h3>
          <button onClick={() => setI((arr) => [...arr, { id: uid("s"), icon: "Stethoscope", title: "New service", description: "", price_amount: null, price_currency: "NGN", price_label: "", order: arr.length, active: true }])}
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
              
              {/* Price fields - NGN currency, no dropdown */}
              <div className="mt-3 grid sm:grid-cols-3 gap-3">
                <Field label="Price amount (NGN)">
                  <input 
                    type="number" 
                    step="0.01" 
                    className={inputCls} 
                    value={it.price_amount ?? ""} 
                    onChange={(e) => setI((arr) => arr.map((x) => x.id === it.id ? { ...x, price_amount: e.target.value ? Number(e.target.value) : null } : x))} 
                    placeholder="₦99.99"
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Price label">
                    <input 
                      className={inputCls} 
                      value={it.price_label || ""} 
                      onChange={(e) => setI((arr) => arr.map((x) => x.id === it.id ? { ...x, price_label: e.target.value } : x))} 
                      placeholder="From ₦95"
                    />
                  </Field>
                </div>
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
          <MediaPicker label="Phone mockup image" value={s.virtualCare.mockupImage} onChange={(v) => set({ mockupImage: v ?? "" })} />
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
              <div className="mt-3"><MediaPicker label="Patient image" value={t.imageDataUrl} onChange={(v) => setI((arr) => arr.map((x) => x.id === t.id ? { ...x, imageDataUrl: v } : x))} /></div>
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
            <MediaPicker label="Background video" value={s.ctaBanner.bgVideo} onChange={(v) => set({ bgVideo: v ?? "" })} />
            <MediaPicker label="Background image (poster)" value={s.ctaBanner.bgImage} onChange={(v) => set({ bgImage: v ?? "" })} />
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
        <MediaPicker label="" value={null} onChange={() => { /* picker is for adding only */ }} />
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
          <MediaPicker label="Open Graph image (1200x630)" value={s.seo.ogImage} onChange={(v) => set({ ogImage: v ?? "" })} />
          <MediaPicker label="Favicon" value={s.seo.favicon} onChange={(v) => set({ favicon: v ?? "" })} />
        </div>
      </Card>
    </div>
  );
};