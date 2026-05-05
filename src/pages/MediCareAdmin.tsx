import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Upload,
  Check,
  X,
  Plus,
  Trash2,
  Edit2,
  Menu,
  Settings,
  MessageSquare,
  Users,
  HeartHandshake,
  Zap,
  Home,
  type LucideIcon,
} from "lucide-react";
import {
  defaultSettings,
  loadSettings,
  resetSettings,
  saveSettings,
  type MediCareSettings,
  type Faq,
  type Testimonial,
  type Partner,
  type HowItWorksStep,
} from "@/lib/medicareSettings";

const Field = ({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) => (
  <label className="block">
    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
      {label}
    </span>
    {children}
    {error && <span className="text-xs text-rose-600 mt-1 block">{error}</span>}
  </label>
);

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

const btnPrimary =
  "inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition";
const btnSecondary =
  "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-900 px-4 py-2 text-sm hover:bg-slate-50 transition";
const btnSmall =
  "inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-md transition";

type Tab =
  | "branding"
  | "hero"
  | "about"
  | "contact"
  | "faqs"
  | "testimonials"
  | "partners"
  | "howitworks";

const NavItem = ({
  icon: Icon,
  label,
  tab,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  tab: Tab;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
      active
        ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
        : "text-slate-600 hover:bg-slate-50"
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </button>
);

const MediCareAdmin = () => {
  const [s, setS] = useState<MediCareSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("branding");

  // Form states
  const [newFaq, setNewFaq] = useState<Partial<Faq>>({});
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({});
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null);
  const [newPartner, setNewPartner] = useState("");
  // How it works steps
  const [newStep, setNewStep] = useState<Partial<HowItWorksStep>>({});
  const [editingStep, setEditingStep] = useState<string | null>(null);

  useEffect(() => {
    document.title = "MediCare — Admin";
    setS(loadSettings());
  }, []);

  const update = (patch: Partial<MediCareSettings>) =>
    setS((prev) => ({ ...prev, ...patch }));

  const onLogo = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      update({ logoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    saveSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onReset = () => {
    if (!confirm("Reset ALL admin settings to defaults?")) return;
    resetSettings();
    setS(defaultSettings);
  };

  // FAQ handlers
  const addOrUpdateFaq = () => {
    if (!newFaq.q?.trim() || !newFaq.a?.trim()) return;
    if (editingFaq) {
      setS((prev) => ({
        ...prev,
        faqs: prev.faqs.map((f) => (f.id === editingFaq ? (newFaq as Faq) : f)),
      }));
      setEditingFaq(null);
    } else {
      setS((prev) => ({
        ...prev,
        faqs: [
          ...prev.faqs,
          {
            id: Date.now().toString(),
            q: newFaq.q!,
            a: newFaq.a!,
          },
        ],
      }));
    }
    setNewFaq({});
  };

  const deleteFaq = (id: string) => {
    setS((prev) => ({ ...prev, faqs: prev.faqs.filter((f) => f.id !== id) }));
  };

  // Testimonial handlers
  const addOrUpdateTestimonial = () => {
    if (
      !newTestimonial.quote?.trim() ||
      !newTestimonial.name?.trim() ||
      !newTestimonial.role?.trim()
    )
      return;
    if (editingTestimonial) {
      setS((prev) => ({
        ...prev,
        testimonials: prev.testimonials.map((t) =>
          t.id === editingTestimonial ? (newTestimonial as Testimonial) : t
        ),
      }));
      setEditingTestimonial(null);
    } else {
      setS((prev) => ({
        ...prev,
        testimonials: [
          ...prev.testimonials,
          {
            id: Date.now().toString(),
            quote: newTestimonial.quote!,
            name: newTestimonial.name!,
            role: newTestimonial.role!,
          },
        ],
      }));
    }
    setNewTestimonial({});
  };

  const deleteTestimonial = (id: string) => {
    setS((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));
  };

  // Partner handlers
  const addPartner = () => {
    if (!newPartner.trim()) return;
    setS((prev) => ({
      ...prev,
      partners: [
        ...prev.partners,
        { id: Date.now().toString(), name: newPartner },
      ],
    }));
    setNewPartner("");
  };

  const deletePartner = (id: string) => {
    setS((prev) => ({
      ...prev,
      partners: prev.partners.filter((p) => p.id !== id),
    }));
  };
  // How it works handlers
  const addOrUpdateStep = () => {
    if (!newStep.title?.trim() || !newStep.body?.trim()) return;
    if (editingStep) {
      setS((prev) => ({
        ...prev,
        howItWorks: prev.howItWorks.map((h) =>
          h.id === editingStep ? ({ ...h, ...newStep } as HowItWorksStep) : h
        ),
      }));
      setEditingStep(null);
    } else {
      setS((prev) => ({
        ...prev,
        howItWorks: [
          ...prev.howItWorks,
          { id: Date.now().toString(), title: newStep.title!, body: newStep.body! },
        ],
      }));
    }
    setNewStep({});
  };

  const deleteStep = (id: string) => {
    setS((prev) => ({ ...prev, howItWorks: prev.howItWorks.filter((h) => h.id !== id) }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-950 sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
              <span className="hidden sm:inline-block h-4 w-px bg-slate-700" />
              <h1 className="font-bold text-lg text-white">MediCare Control</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-100 px-3 py-2 text-sm hover:bg-slate-700 transition"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button
              onClick={onSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" /> Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-64 bg-white border-r border-slate-200 overflow-y-auto`}
        >
          <nav className="divide-y divide-slate-200">
            <div className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Customization
              </h3>
              <NavItem
                icon={Zap}
                label="Branding"
                tab="branding"
                active={activeTab === "branding"}
                onClick={() => {
                  setActiveTab("branding");
                  setSidebarOpen(false);
                }}
              />
              <NavItem
                icon={Home}
                label="Hero Section"
                tab="hero"
                active={activeTab === "hero"}
                onClick={() => {
                  setActiveTab("hero");
                  setSidebarOpen(false);
                }}
              />
              <NavItem
                icon={HeartHandshake}
                label="About"
                tab="about"
                active={activeTab === "about"}
                onClick={() => {
                  setActiveTab("about");
                  setSidebarOpen(false);
                }}
              />
              <NavItem
                icon={MessageSquare}
                label="Contact"
                tab="contact"
                active={activeTab === "contact"}
                onClick={() => {
                  setActiveTab("contact");
                  setSidebarOpen(false);
                }}
              />
            </div>

            <div className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Content
              </h3>
              <NavItem
                icon={MessageSquare}
                label="FAQs"
                tab="faqs"
                active={activeTab === "faqs"}
                onClick={() => {
                  setActiveTab("faqs");
                  setSidebarOpen(false);
                }}
              />
              <NavItem
                icon={Users}
                label="Testimonials"
                tab="testimonials"
                active={activeTab === "testimonials"}
                onClick={() => {
                  setActiveTab("testimonials");
                  setSidebarOpen(false);
                }}
              />
              <NavItem
                icon={HeartHandshake}
                label="Partners"
                tab="partners"
                active={activeTab === "partners"}
                onClick={() => {
                  setActiveTab("partners");
                  setSidebarOpen(false);
                }}
              />
              <NavItem
                icon={Settings}
                label="How It Works"
                tab="howitworks"
                active={activeTab === "howitworks"}
                onClick={() => {
                  setActiveTab("howitworks");
                  setSidebarOpen(false);
                }}
              />
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {activeTab === "branding" && (
              <BrandingSection s={s} update={update} onLogo={onLogo} />
            )}
            {activeTab === "hero" && (
              <HeroSection s={s} update={update} />
            )}
            {activeTab === "about" && (
              <AboutSection s={s} update={update} />
            )}
            {activeTab === "contact" && (
              <ContactSection s={s} update={update} />
            )}
            {activeTab === "faqs" && (
              <FaqsSection
                faqs={s.faqs}
                newFaq={newFaq}
                setNewFaq={setNewFaq}
                addOrUpdateFaq={addOrUpdateFaq}
                deleteFaq={deleteFaq}
                editingFaq={editingFaq}
                setEditingFaq={setEditingFaq}
              />
            )}
            {activeTab === "testimonials" && (
              <TestimonialsSection
                testimonials={s.testimonials}
                newTestimonial={newTestimonial}
                setNewTestimonial={setNewTestimonial}
                addOrUpdateTestimonial={addOrUpdateTestimonial}
                deleteTestimonial={deleteTestimonial}
                editingTestimonial={editingTestimonial}
                setEditingTestimonial={setEditingTestimonial}
              />
            )}
            {activeTab === "partners" && (
              <PartnersSection
                partners={s.partners}
                newPartner={newPartner}
                setNewPartner={setNewPartner}
                addPartner={addPartner}
                deletePartner={deletePartner}
              />
            )}
            {activeTab === "howitworks" && (
              <HowItWorksSection
                steps={s.howItWorks}
                newStep={newStep}
                setNewStep={setNewStep}
                addOrUpdateStep={addOrUpdateStep}
                deleteStep={deleteStep}
                editingStep={editingStep}
                setEditingStep={setEditingStep}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Section Components

const BrandingSection = ({
  s,
  update,
  onLogo,
}: {
  s: MediCareSettings;
  update: (patch: Partial<MediCareSettings>) => void;
  onLogo: (file?: File | null) => void;
}) => (
  <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Branding</h2>
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Website Name">
          <input
            className={inputCls}
            value={s.siteName}
            onChange={(e) => update({ siteName: e.target.value })}
            placeholder="MediCare"
          />
        </Field>
        <Field label="Logo">
          <div className="flex items-center gap-3">
            <label className={`${btnSmall} border border-dashed border-slate-300 bg-slate-50 text-slate-600 cursor-pointer hover:bg-slate-100`}>
              <Upload className="h-4 w-4" />
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onLogo(e.target.files?.[0])}
              />
            </label>
            {s.logoDataUrl && (
              <>
                <img
                  src={s.logoDataUrl}
                  alt="Logo preview"
                  className="h-10 w-10 rounded-lg object-contain border border-slate-200 bg-white"
                />
                <button
                  onClick={() => update({ logoDataUrl: null })}
                  className="text-xs text-slate-500 hover:text-rose-600"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </Field>
        <Field label="Primary Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={s.primaryColor}
              onChange={(e) => update({ primaryColor: e.target.value })}
              className="h-10 w-14 rounded-lg border border-slate-200 bg-white cursor-pointer"
            />
            <input
              className={inputCls}
              value={s.primaryColor}
              onChange={(e) => update({ primaryColor: e.target.value })}
            />
          </div>
        </Field>
        <Field label="Accent Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={s.accentColor}
              onChange={(e) => update({ accentColor: e.target.value })}
              className="h-10 w-14 rounded-lg border border-slate-200 bg-white cursor-pointer"
            />
            <input
              className={inputCls}
              value={s.accentColor}
              onChange={(e) => update({ accentColor: e.target.value })}
            />
          </div>
        </Field>
      </div>
    </div>
  </section>
);

const HeroSection = ({
  s,
  update,
}: {
  s: MediCareSettings;
  update: (patch: Partial<MediCareSettings>) => void;
}) => (
  <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
    <h2 className="text-2xl font-bold text-slate-900">Hero Section</h2>
    <div className="grid sm:grid-cols-2 gap-6">
      <Field label="Eyebrow Text">
        <input
          className={inputCls}
          value={s.hero.eyebrow}
          onChange={(e) =>
            update({ hero: { ...s.hero, eyebrow: e.target.value } })
          }
          placeholder="e.g. Owner-led practice portal"
        />
      </Field>
      <Field label="CTA Button Label">
        <input
          className={inputCls}
          value={s.hero.ctaLabel}
          onChange={(e) =>
            update({ hero: { ...s.hero, ctaLabel: e.target.value } })
          }
          placeholder="e.g. Open Dashboard"
        />
      </Field>
    </div>
    <Field label="Headline (Lead)">
      <input
        className={inputCls}
        value={s.hero.titleLead}
        onChange={(e) =>
          update({ hero: { ...s.hero, titleLead: e.target.value } })
        }
        placeholder="e.g. Run your practice"
      />
    </Field>
    <Field label="Headline (Highlight)">
      <input
        className={inputCls}
        value={s.hero.titleHighlight}
        onChange={(e) =>
          update({ hero: { ...s.hero, titleHighlight: e.target.value } })
        }
        placeholder="e.g. in one place"
      />
    </Field>
    <Field label="Subtitle">
      <textarea
        rows={4}
        className={inputCls}
        value={s.hero.subtitle}
        onChange={(e) =>
          update({ hero: { ...s.hero, subtitle: e.target.value } })
        }
        placeholder="Describe the hero section"
      />
    </Field>
  </section>
);

const AboutSection = ({
  s,
  update,
}: {
  s: MediCareSettings;
  update: (patch: Partial<MediCareSettings>) => void;
}) => (
  <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
    <h2 className="text-2xl font-bold text-slate-900">About Us</h2>
    <Field label="About Title">
      <input
        className={inputCls}
        value={s.about.title}
        onChange={(e) =>
          update({ about: { ...s.about, title: e.target.value } })
        }
        placeholder="About MediCare"
      />
    </Field>
    <Field label="About Body">
      <textarea
        rows={6}
        className={inputCls}
        value={s.about.body}
        onChange={(e) =>
          update({ about: { ...s.about, body: e.target.value } })
        }
        placeholder="Describe your company..."
      />
    </Field>
    <Field label="Footer Tagline">
      <textarea
        rows={3}
        className={inputCls}
        value={s.footerTagline}
        onChange={(e) => update({ footerTagline: e.target.value })}
        placeholder="Footer tagline"
      />
    </Field>
  </section>
);

const ContactSection = ({
  s,
  update,
}: {
  s: MediCareSettings;
  update: (patch: Partial<MediCareSettings>) => void;
}) => (
  <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
    <h2 className="text-2xl font-bold text-slate-900">Contact Information</h2>
    <Field label="Email">
      <input
        type="email"
        className={inputCls}
        value={s.contact.email}
        onChange={(e) =>
          update({ contact: { ...s.contact, email: e.target.value } })
        }
        placeholder="hello@medicare.app"
      />
    </Field>
    <Field label="Phone">
      <input
        type="tel"
        className={inputCls}
        value={s.contact.phone}
        onChange={(e) =>
          update({ contact: { ...s.contact, phone: e.target.value } })
        }
        placeholder="+1 (800) 633-4227"
      />
    </Field>
    <Field label="Address / Location">
      <input
        className={inputCls}
        value={s.contact.address}
        onChange={(e) =>
          update({ contact: { ...s.contact, address: e.target.value } })
        }
        placeholder="Available worldwide"
      />
    </Field>
  </section>
);

const FaqsSection = ({
  faqs,
  newFaq,
  setNewFaq,
  addOrUpdateFaq,
  deleteFaq,
  editingFaq,
  setEditingFaq,
}: {
  faqs: Faq[];
  newFaq: Partial<Faq>;
  setNewFaq: (faq: Partial<Faq>) => void;
  addOrUpdateFaq: () => void;
  deleteFaq: (id: string) => void;
  editingFaq: string | null;
  setEditingFaq: (id: string | null) => void;
}) => (
  <section className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        <Field label="Question">
          <input
            className={inputCls}
            value={newFaq.q || ""}
            onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
            placeholder="Enter question"
          />
        </Field>
        <Field label="Answer">
          <textarea
            rows={4}
            className={inputCls}
            value={newFaq.a || ""}
            onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
            placeholder="Enter answer"
          />
        </Field>
        <button onClick={addOrUpdateFaq} className={btnPrimary}>
          <Plus className="h-4 w-4" />
          {editingFaq ? "Update FAQ" : "Add FAQ"}
        </button>
      </div>
    </div>

    <div className="space-y-3">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="bg-white rounded-lg border border-slate-200 p-4 flex items-start justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 break-words">{faq.q}</p>
            <p className="text-sm text-slate-600 mt-1 break-words">{faq.a}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setNewFaq(faq);
                setEditingFaq(faq.id);
              }}
              className={`${btnSmall} text-blue-600 hover:bg-blue-50`}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteFaq(faq.id)}
              className={`${btnSmall} text-rose-600 hover:bg-rose-50`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const TestimonialsSection = ({
  testimonials,
  newTestimonial,
  setNewTestimonial,
  addOrUpdateTestimonial,
  deleteTestimonial,
  editingTestimonial,
  setEditingTestimonial,
}: {
  testimonials: Testimonial[];
  newTestimonial: Partial<Testimonial>;
  setNewTestimonial: (t: Partial<Testimonial>) => void;
  addOrUpdateTestimonial: () => void;
  deleteTestimonial: (id: string) => void;
  editingTestimonial: string | null;
  setEditingTestimonial: (id: string | null) => void;
}) => (
  <section className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Testimonials</h2>
      <div className="space-y-4">
        <Field label="Quote">
          <textarea
            rows={4}
            className={inputCls}
            value={newTestimonial.quote || ""}
            onChange={(e) =>
              setNewTestimonial({ ...newTestimonial, quote: e.target.value })
            }
            placeholder="Enter testimonial quote"
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name">
            <input
              className={inputCls}
              value={newTestimonial.name || ""}
              onChange={(e) =>
                setNewTestimonial({ ...newTestimonial, name: e.target.value })
              }
              placeholder="Full name"
            />
          </Field>
          <Field label="Role">
            <input
              className={inputCls}
              value={newTestimonial.role || ""}
              onChange={(e) =>
                setNewTestimonial({ ...newTestimonial, role: e.target.value })
              }
              placeholder="e.g. Patient · Lagos"
            />
          </Field>
        </div>
        <button
          onClick={addOrUpdateTestimonial}
          className={btnPrimary}
        >
          <Plus className="h-4 w-4" />
          {editingTestimonial ? "Update Testimonial" : "Add Testimonial"}
        </button>
      </div>
    </div>

    <div className="grid gap-3">
      {testimonials.map((t) => (
        <div
          key={t.id}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="italic text-slate-600 mb-2">"{t.quote}"</p>
              <p className="font-semibold text-slate-900">{t.name}</p>
              <p className="text-xs text-slate-500">{t.role}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setNewTestimonial(t);
                  setEditingTestimonial(t.id);
                }}
                className={`${btnSmall} text-blue-600 hover:bg-blue-50`}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteTestimonial(t.id)}
                className={`${btnSmall} text-rose-600 hover:bg-rose-50`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const PartnersSection = ({
  partners,
  newPartner,
  setNewPartner,
  addPartner,
  deletePartner,
}: {
  partners: Partner[];
  newPartner: string;
  setNewPartner: (p: string) => void;
  addPartner: () => void;
  deletePartner: (id: string) => void;
}) => (
  <section className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Partners</h2>
      <div className="space-y-4">
        <Field label="Partner Name">
          <input
            className={inputCls}
            value={newPartner}
            onChange={(e) => setNewPartner(e.target.value)}
            placeholder="Enter partner name"
          />
        </Field>
        <button onClick={addPartner} className={btnPrimary}>
          <Plus className="h-4 w-4" />
          Add Partner
        </button>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-3">
      {partners.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between"
        >
          <p className="font-semibold text-slate-900">{p.name}</p>
          <button
            onClick={() => deletePartner(p.id)}
            className={`${btnSmall} text-rose-600 hover:bg-rose-50`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  </section>
);

const HowItWorksSection = ({
  steps,
  newStep,
  setNewStep,
  addOrUpdateStep,
  deleteStep,
  editingStep,
  setEditingStep,
}: {
  steps: HowItWorksStep[];
  newStep: Partial<HowItWorksStep>;
  setNewStep: (s: Partial<HowItWorksStep>) => void;
  addOrUpdateStep: () => void;
  deleteStep: (id: string) => void;
  editingStep: string | null;
  setEditingStep: (id: string | null) => void;
}) => (
  <section className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">How It Works</h2>
      <div className="space-y-4">
        <Field label="Step title">
          <input
            className={inputCls}
            value={newStep.title || ""}
            onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
            placeholder="Step title"
          />
        </Field>
        <Field label="Description">
          <textarea
            rows={3}
            className={inputCls}
            value={newStep.body || ""}
            onChange={(e) => setNewStep({ ...newStep, body: e.target.value })}
            placeholder="What happens in this step"
          />
        </Field>
        <button onClick={addOrUpdateStep} className={btnPrimary}>
          <Plus className="h-4 w-4" />
          {editingStep ? "Update Step" : "Add Step"}
        </button>
      </div>
    </div>

    <div className="space-y-3">
      {steps.map((st) => (
        <div key={st.id} className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{st.title}</p>
              <p className="text-sm text-slate-600 mt-1">{st.body}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setNewStep(st);
                  setEditingStep(st.id);
                }}
                className={`${btnSmall} text-blue-600 hover:bg-blue-50`}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteStep(st.id)}
                className={`${btnSmall} text-rose-600 hover:bg-rose-50`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default MediCareAdmin;
