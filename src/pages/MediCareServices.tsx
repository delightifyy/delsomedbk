import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Clock, ArrowRight, CheckCircle2, Sparkles, Stethoscope, Star, ArrowLeft } from "lucide-react";
import { Icon as McIcon } from "@/components/medicare-admin/icons";
import type { LucideIconName } from "@/lib/medicareSettings";
import { useMediCareSettings } from "@/lib/medicareSettings";
import {
  fetchAll,
  type Service,
  type ServiceCategory,
  type ServiceFaq,
  type ServicesPage,
} from "@/lib/medicareServicesApi";

/* Reuse the same scoped tokens as MediCare landing */
const tokenStyles = `
.medicare-services {
  --mc-bg: 210 40% 99%;
  --mc-fg: 222 47% 11%;
  --mc-muted: 215 16% 47%;
  --mc-muted-soft: 210 30% 96%;
  --mc-border: 215 25% 91%;
  --mc-card: 0 0% 100%;
  --mc-primary: 212 88% 32%;
  --mc-primary-glow: 200 95% 48%;
  --mc-accent: 174 72% 42%;
  --mc-violet: 252 70% 60%;
  background: hsl(var(--mc-bg));
  color: hsl(var(--mc-fg));
  font-family: 'Inter', system-ui, sans-serif;
}
.medicare-services h1, .medicare-services h2, .medicare-services h3, .medicare-services h4 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  letter-spacing: -0.02em;
}
.ms-grad-primary { background: linear-gradient(135deg, hsl(var(--mc-primary)) 0%, hsl(var(--mc-primary-glow)) 60%, hsl(var(--mc-accent)) 100%); }
.ms-grad-soft    { background: linear-gradient(180deg, hsl(210 100% 98%) 0%, hsl(174 50% 97%) 100%); }
.ms-grad-mesh    {
   background:
     radial-gradient(at 18% 22%, hsl(var(--mc-primary)/.18) 0px, transparent 45%),
     radial-gradient(at 82% 28%, hsl(var(--mc-accent)/.16) 0px, transparent 45%),
     radial-gradient(at 50% 92%, hsl(var(--mc-violet)/.12) 0px, transparent 50%);
}
.ms-grad-text {
  background: linear-gradient(120deg, hsl(var(--mc-primary)) 0%, hsl(var(--mc-accent)) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.ms-shadow { box-shadow: 0 30px 60px -28px hsl(var(--mc-primary)/.35); }
.ms-card-hover { transition: transform .35s ease, box-shadow .35s ease, border-color .35s ease; }
.ms-card-hover:hover { transform: translateY(-4px); box-shadow: 0 24px 50px -20px hsl(var(--mc-primary)/.35); }
`;

const ALL = "__all__";

const formatPrice = (s: Service) => {
  if (s.price_label) return s.price_label;
  if (s.price_amount == null) return "";
  const currency = s.price_currency || "GBP";
  const symbol = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "NGN" ? "₦" : currency === "EUR" ? "€" : `${currency} `;
  return `From ${symbol}${Number(s.price_amount).toLocaleString()}`;
};

const MediCareServices = () => {
  const settings = useMediCareSettings();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [faqs, setFaqs] = useState<ServiceFaq[]>([]);
  const [page, setPage] = useState<ServicesPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>(ALL);

  useEffect(() => {
    document.title = page?.seo_title || "Services — MediCare";
    if (page?.seo_description) {
      const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (meta) meta.content = page.seo_description;
      else {
        const m = document.createElement("meta");
        m.name = "description"; m.content = page.seo_description;
        document.head.appendChild(m);
      }
    }
  }, [page]);

  useEffect(() => {
    let cancelled = false;
    fetchAll().then((r) => {
      if (cancelled) return;
      setCategories(r.categories.filter((c) => c.visible));
      setServices(r.services.filter((s) => s.visible));
      setFaqs(r.faqs.filter((f) => f.visible));
      setPage(r.page);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const c = params.get("category");
    if (c) setActiveCat(c);
    const q = params.get("q");
    if (q) setQuery(q);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      if (activeCat !== ALL && s.category_id !== activeCat) return false;
      if (!q) return true;
      const hay = [
        s.title, s.summary, s.description, s.search_keywords,
        s.tags?.join(" "), s.recommended_clinicians?.join(" "),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    }).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.sort_order - b.sort_order);
  }, [services, activeCat, query]);

  const featured = useMemo(
    () => services.filter((s) => s.featured).slice(0, 3),
    [services],
  );

  const pageFaqs = useMemo(() => faqs.filter((f) => !f.service_id), [faqs]);

  const updateFilter = (cat: string, q: string) => {
    const next = new URLSearchParams();
    if (cat !== ALL) next.set("category", cat);
    if (q) next.set("q", q);
    setParams(next, { replace: true });
  };

  const onCat = (id: string) => { setActiveCat(id); updateFilter(id, query); };
  const onQuery = (v: string) => { setQuery(v); updateFilter(activeCat, v); };

  return (
    <div className="medicare-services min-h-screen">
      <style>{tokenStyles}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-[hsl(var(--mc-border))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/doctor-portal" className="flex items-center gap-2 font-bold text-[hsl(var(--mc-primary))]">
            <Stethoscope className="h-5 w-5" />
            <span>{settings.siteName || "MediCare"}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[hsl(var(--mc-muted))]">
            <Link to="/doctor-portal" className="hover:text-[hsl(var(--mc-primary))]">Home</Link>
            <Link to="/doctor-portal/services" className="text-[hsl(var(--mc-primary))]">Services</Link>
            <Link to="/doctor-portal#about" className="hover:text-[hsl(var(--mc-primary))]">About</Link>
            <Link to="/doctor-portal#contact" className="hover:text-[hsl(var(--mc-primary))]">Contact</Link>
          </nav>
          <a href="/doctor-portal#cta" className="inline-flex items-center gap-2 rounded-full ms-grad-primary text-white px-4 py-2 text-sm font-semibold shadow-md hover:opacity-95">
            Book Appointment <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden ms-grad-soft">
        <div className="absolute inset-0 ms-grad-mesh opacity-80 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Link to="/doctor-portal" className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--mc-muted))] mb-5 hover:text-[hsl(var(--mc-primary))]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-[hsl(var(--mc-border))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--mc-primary))]">
              <Sparkles className="h-3.5 w-3.5" /> {page?.hero_eyebrow || "Our Services"}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
              <span className="ms-grad-text">{page?.hero_title || "Healthcare designed around you"}</span>
            </h1>
            <p className="mt-5 text-lg text-[hsl(var(--mc-muted))] max-w-xl leading-relaxed">
              {page?.hero_description}
            </p>

            {/* Search */}
            <div className="mt-8 flex items-center gap-2 bg-white rounded-2xl border border-[hsl(var(--mc-border))] ms-shadow p-2 max-w-lg">
              <div className="pl-3 text-[hsl(var(--mc-muted))]"><Search className="h-5 w-5" /></div>
              <input
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Search services, symptoms, treatments..."
                className="flex-1 bg-transparent outline-none px-2 py-2 text-sm"
              />
              {query && (
                <button onClick={() => onQuery("")} className="px-3 py-2 text-xs font-semibold text-[hsl(var(--mc-muted))] hover:text-[hsl(var(--mc-primary))]">Clear</button>
              )}
            </div>

            {!!page?.intro_stats?.length && (
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {page.intro_stats.map((st, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-[hsl(var(--mc-primary))]">{st.value}</div>
                    <div className="text-xs text-[hsl(var(--mc-muted))] mt-1">{st.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="aspect-[4/5] sm:aspect-[5/6] rounded-3xl overflow-hidden ms-shadow border border-white/60 bg-white">
              <img
                src={page?.hero_image || "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1200&auto=format&fit=crop&q=80"}
                alt="MediCare services"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            {/* Floating featured pill */}
            {featured[0] && (
              <div className="absolute -bottom-6 -left-4 sm:left-8 max-w-xs bg-white rounded-2xl border border-[hsl(var(--mc-border))] ms-shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl ms-grad-primary grid place-items-center text-white">
                    <McIcon name={(featured[0].icon as LucideIconName) || "Stethoscope"} className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[hsl(var(--mc-muted))] font-semibold">Featured</div>
                    <div className="font-semibold text-sm">{featured[0].title}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category rail */}
      <section className="border-y border-[hsl(var(--mc-border))] bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => onCat(ALL)}
            className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCat === ALL
                ? "ms-grad-primary text-white shadow-md"
                : "bg-white border border-[hsl(var(--mc-border))] text-[hsl(var(--mc-fg))] hover:border-[hsl(var(--mc-primary))]"
            }`}
          >
            All services <span className="text-xs opacity-80">({services.length})</span>
          </button>
          {categories.map((c) => {
            const count = services.filter((s) => s.category_id === c.id).length;
            const active = activeCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onCat(c.id)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "ms-grad-primary text-white shadow-md"
                    : "bg-white border border-[hsl(var(--mc-border))] text-[hsl(var(--mc-fg))] hover:border-[hsl(var(--mc-primary))]"
                }`}
              >
                <McIcon name={(c.icon as LucideIconName) || "Stethoscope"} className="h-4 w-4" />
                {c.name}
                <span className="text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured row */}
      {activeCat === ALL && !query && featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--mc-accent))]">Featured</div>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">Most booked this month</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featured.map((s) => (
              <ServiceCard key={s.id} s={s} categories={categories} variant="featured" />
            ))}
          </div>
        </section>
      )}

      {/* Service grid */}
      <section id="all" className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--mc-accent))]">
              {activeCat === ALL ? "All services" : categories.find((c) => c.id === activeCat)?.name}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1">
              {filtered.length} {filtered.length === 1 ? "service" : "services"}{query ? ` matching "${query}"` : ""}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-[hsl(var(--mc-muted-soft))] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[hsl(var(--mc-border))] p-16 text-center bg-white">
            <p className="text-[hsl(var(--mc-muted))]">No services match your search.</p>
            <button onClick={() => { onCat(ALL); onQuery(""); }} className="mt-3 text-sm font-semibold text-[hsl(var(--mc-primary))]">Clear filters</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => <ServiceCard key={s.id} s={s} categories={categories} />)}
          </div>
        )}
      </section>

      {/* FAQs */}
      {pageFaqs.length > 0 && (
        <section className="bg-[hsl(var(--mc-muted-soft))]/60 border-y border-[hsl(var(--mc-border))]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
            <div className="text-center mb-10">
              <div className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--mc-accent))]">FAQs</div>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">Questions, answered</h2>
            </div>
            <Accordion type="single" collapsible className="bg-white rounded-2xl border border-[hsl(var(--mc-border))] divide-y divide-[hsl(var(--mc-border))]">
              {pageFaqs.map((f, i) => (
                <AccordionItem key={f.id} value={`f-${i}`} className="border-none px-5">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">{f.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-[hsl(var(--mc-muted))] pb-5 leading-relaxed">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* CTA */}
      {page && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 ms-grad-primary" />
          {page.cta_image && (
            <div className="absolute inset-0 mix-blend-overlay opacity-30" style={{ backgroundImage: `url(${page.cta_image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          )}
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> {page.cta_badge}
            </span>
            <h2 className="mt-5 text-3xl sm:text-5xl font-bold">{page.cta_title}</h2>
            <p className="mt-4 text-white/85 max-w-2xl mx-auto">{page.cta_description}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={page.cta_primary_href} className="inline-flex items-center gap-2 rounded-full bg-white text-[hsl(var(--mc-primary))] px-6 py-3 font-semibold shadow-lg hover:scale-[1.02] transition">
                {page.cta_primary_label} <ArrowRight className="h-4 w-4" />
              </a>
              <a href={page.cta_secondary_href} className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 text-white px-6 py-3 font-semibold hover:bg-white/10">
                {page.cta_secondary_label}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[hsl(var(--mc-fg))] text-white/70 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4" /> {settings.siteName || "MediCare"}</div>
          <p>© {new Date().getFullYear()} In Partnership With Desolmedical Solution Limited.</p>
        </div>
      </footer>
    </div>
  );
};

/* ---------- Card ---------- */
const ServiceCard = ({
  s, categories, variant,
}: { s: Service; categories: ServiceCategory[]; variant?: "featured" }) => {
  const cat = categories.find((c) => c.id === s.category_id);
  const price = formatPrice(s);
  return (
    <article className={`group ms-card-hover rounded-2xl border border-[hsl(var(--mc-border))] bg-white overflow-hidden flex flex-col ${variant === "featured" ? "ms-shadow" : ""}`}>
      <div className="relative aspect-[16/10] bg-[hsl(var(--mc-muted-soft))] overflow-hidden">
        {s.hero_image ? (
          <img src={s.hero_image} alt={s.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="h-full w-full ms-grad-soft grid place-items-center">
            <McIcon name={(s.icon as LucideIconName) || "Stethoscope"} className="h-12 w-12 text-[hsl(var(--mc-primary))]/40" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {cat && (
            <span className="rounded-full bg-white/95 backdrop-blur px-3 py-1 text-[11px] font-semibold text-[hsl(var(--mc-primary))]">
              {cat.name}
            </span>
          )}
          {s.featured && (
            <span className="rounded-full ms-grad-primary text-white px-3 py-1 text-[11px] font-semibold inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" /> Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3">
          <div className="shrink-0 h-10 w-10 rounded-xl bg-[hsl(var(--mc-primary))]/8 text-[hsl(var(--mc-primary))] grid place-items-center">
            <McIcon name={(s.icon as LucideIconName) || "Stethoscope"} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-lg leading-tight">{s.title}</h3>
            {s.summary && <p className="text-sm text-[hsl(var(--mc-muted))] mt-1 line-clamp-2">{s.summary}</p>}
          </div>
        </div>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--mc-muted))]">
          {s.duration_minutes != null && (
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.duration_minutes} min</span>
          )}
          {price && (
            <span className="font-semibold text-[hsl(var(--mc-fg))]">{price}</span>
          )}
        </div>

        {/* Tags */}
        {s.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {s.tags.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full bg-[hsl(var(--mc-muted-soft))] px-2.5 py-0.5 text-[11px] font-medium text-[hsl(var(--mc-muted))]">{t}</span>
            ))}
          </div>
        )}

        {/* Whats included */}
        {s.whats_included?.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {s.whats_included.slice(0, 3).map((w, i) => (
              <li key={i} className="text-xs flex items-start gap-2 text-[hsl(var(--mc-muted))]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--mc-accent))] mt-0.5 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Recommended */}
        {s.recommended_clinicians?.length > 0 && (
          <p className="mt-4 text-[11px] uppercase tracking-wider text-[hsl(var(--mc-muted))]">
            With: <span className="text-[hsl(var(--mc-fg))] font-semibold normal-case tracking-normal">{s.recommended_clinicians.join(", ")}</span>
          </p>
        )}

        <div className="mt-5 pt-4 border-t border-[hsl(var(--mc-border))] flex items-center justify-between gap-3">
          <a
            href={s.cta_href || "/doctor-portal#cta"}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--mc-primary))] hover:gap-2.5 transition-all"
          >
            {s.cta_label || "Book consultation"} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
};

export default MediCareServices;
