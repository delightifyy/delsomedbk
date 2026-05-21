import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, ArrowRight, Stethoscope, ArrowLeft, Check } from "lucide-react";
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

/* Scoped tokens — sage + terracotta palette inspired by reference, MediCare semantics */
const tokenStyles = `
.medicare-services {
  --mc-bg: 0 0% 100%;
  --mc-cream: 210 20% 96%;
  --mc-fg: 205 30% 20%;
  --mc-muted: 205 12% 42%;
  --mc-border: 205 18% 88%;
  --mc-sage: 205 30% 33%;        /* #3b596d */
  --mc-sage-deep: 205 24% 37%;   /* #486475 */
  --mc-sage-soft: 205 25% 82%;
  --mc-blue: 204 92% 51%;        /* #0f9cf5 */
  --mc-ink: 205 30% 20%;
  background: hsl(var(--mc-bg));
  color: hsl(var(--mc-fg));
  font-family: 'Inter', system-ui, sans-serif;
}
.medicare-services h1, .medicare-services h2, .medicare-services h3, .medicare-services h4 {
  font-family: 'Poppins', system-ui, sans-serif;
  letter-spacing: -0.01em;
  font-weight: 600;
}
.ms-card { border-radius: 14px; overflow: hidden; }
.ms-card-sage { background: hsl(var(--mc-sage)); color: white; }
.ms-card-sage-soft { background: hsl(var(--mc-sage-soft)); color: hsl(var(--mc-ink)); }
.ms-card-terracotta { background: hsl(var(--mc-sage-deep)); color: white; }
.ms-card-terracotta-soft { background: hsl(var(--mc-blue) / .15); color: hsl(var(--mc-ink)); }
.ms-card-clay { background: hsl(var(--mc-blue)); color: white; }
.ms-card-cream { background: hsl(var(--mc-cream)); color: hsl(var(--mc-ink)); }
.ms-accent-sage { color: hsl(var(--mc-blue)); }
.ms-accent-terracotta { color: hsl(var(--mc-sage)); }
`;

/* Rotating palette for category blocks */
const CARD_PALETTE = [
  "ms-card-sage",
  "ms-card-terracotta-soft",
  "ms-card-sage",
  "ms-card-terracotta",
  "ms-card-clay",
  "ms-card-sage",
] as const;

const formatPrice = (s: Service) => {
  if (s.price_label) return s.price_label.replace(/£/g, "₦");
  if (s.price_amount == null) return "";
  return `₦${Number(s.price_amount).toLocaleString("en-NG")}`;
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
    const q = params.get("q");
    if (q) setQuery(q);
  }, []);

  const onQuery = (v: string) => {
    setQuery(v);
    const next = new URLSearchParams();
    if (v) next.set("q", v);
    setParams(next, { replace: true });
  };

  const q = query.trim().toLowerCase();
  const matchSvc = (s: Service) => {
    if (!q) return true;
    const hay = [s.title, s.summary, s.description, s.search_keywords, s.tags?.join(" ")]
      .filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  };

  /** group services by category for both bento + prices */
  const byCategory = useMemo(() => {
    return categories.map((c) => ({
      category: c,
      services: services
        .filter((s) => s.category_id === c.id && matchSvc(s))
        .sort((a, b) => a.sort_order - b.sort_order),
    })).filter((g) => g.services.length > 0);
  }, [categories, services, q]);

  /** build bento cells: category card, then image, alternating to match reference */
  const bentoCells = useMemo(() => {
    type Cell =
      | { kind: "cat"; cat: ServiceCategory; svcs: Service[]; tone: string }
      | { kind: "img"; src: string; alt: string };
    const cells: Cell[] = [];
    byCategory.forEach((g, i) => {
      cells.push({
        kind: "cat",
        cat: g.category,
        svcs: g.services,
        tone: CARD_PALETTE[i % CARD_PALETTE.length],
      });
      if (g.category.banner_image) {
        cells.push({ kind: "img", src: g.category.banner_image, alt: g.category.name });
      }
    });
    return cells;
  }, [byCategory]);

  const pageFaqs = useMemo(() => faqs.filter((f) => !f.service_id), [faqs]);
  const allFilteredServices = services.filter(matchSvc);

  return (
    <div className="medicare-services min-h-screen">
      <style>{tokenStyles}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[hsl(var(--mc-bg))]/90 backdrop-blur border-b border-[hsl(var(--mc-border))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/doctor-portal" className="flex items-center gap-2 font-bold text-[hsl(var(--mc-ink))]">
            <Stethoscope className="h-5 w-5 ms-accent-sage" />
            <span>{settings.siteName || "MediCare"}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[hsl(var(--mc-muted))]">
            <Link to="/doctor-portal" className="hover:text-[hsl(var(--mc-sage))]">Home</Link>
            <Link to="/doctor-portal#about" className="hover:text-[hsl(var(--mc-sage))]">About Us</Link>
            <Link to="/doctor-portal/services" className="ms-accent-sage">Services</Link>
            <Link to="/doctor-portal/blogs" className="hover:text-[hsl(var(--mc-sage))]">Blogs</Link>
            <Link to="/doctor-portal#contact" className="hover:text-[hsl(var(--mc-sage))]">Contact Us</Link>
          </nav>
          <a href="/doctor-portal#cta" className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--mc-sage))] text-white px-4 py-2 text-sm font-semibold hover:opacity-90">
            Book Appointment <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Title */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-10">
        <Link to="/doctor-portal" className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--mc-muted))] mb-5 hover:text-[hsl(var(--mc-sage))]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl">
          <span className="ms-accent-sage">Our Services&nbsp;</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[hsl(var(--mc-muted))] leading-relaxed">
          {page?.hero_description ||
            "A comprehensive range of private GP, cardiology, and diagnostic services, offering timely access to care with clear and upfront pricing."}
        </p>

        {/* Search */}
        <div className="mt-6 flex items-center gap-2 bg-white rounded-full border border-[hsl(var(--mc-border))] p-1.5 max-w-md">
          <div className="pl-3 text-[hsl(var(--mc-muted))]"><Search className="h-4 w-4" /></div>
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search services..."
            className="flex-1 bg-transparent outline-none px-2 py-1.5 text-sm"
          />
          {query && (
            <button onClick={() => onQuery("")} className="px-3 py-1.5 text-xs font-semibold text-[hsl(var(--mc-muted))] hover:text-[hsl(var(--mc-sage))]">Clear</button>
          )}
        </div>
      </section>

      {/* Bento grid — colored category cards + image cells */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        {loading ? (
          <div className="grid md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : bentoCells.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[hsl(var(--mc-border))] p-16 text-center bg-white">
            <p className="text-[hsl(var(--mc-muted))]">No services match your search.</p>
            <button onClick={() => onQuery("")} className="mt-3 text-sm font-semibold ms-accent-sage">Clear search</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[minmax(220px,auto)]">
            {bentoCells.map((cell, i) =>
              cell.kind === "cat" ? (
                <article key={`c-${cell.cat.id}`} className={`ms-card ${cell.tone} p-6 flex flex-col`}>
                  <h3 className="text-lg font-semibold mb-3 leading-tight">{cell.cat.name}</h3>
                  <ul className="space-y-1.5 text-sm/relaxed">
                    {cell.svcs.slice(0, 8).map((s) => (
                      <li key={s.id} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-current opacity-80 shrink-0" />
                        <span>{s.title}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ) : (
                <div key={`i-${i}`} className="ms-card bg-[hsl(var(--mc-cream))]">
                  <img src={cell.src} alt={cell.alt} loading="lazy" className="h-full w-full object-cover" />
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Corporate / intro band — uses page.cta_description as supporting copy */}
      {page?.cta_description && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12 text-center">
          <h2 className="text-3xl sm:text-4xl ms-accent-terracotta">{page.cta_title || "Corporate Healthcare Service"}</h2>
          <p className="mt-5 text-[hsl(var(--mc-muted))] leading-relaxed whitespace-pre-line">
            {page.cta_description}
          </p>
        </section>
      )}

      {/* Resources band — built from page.intro_stats labels as resource items */}
      {!!page?.intro_stats?.length && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
          <h2 className="text-center text-3xl sm:text-4xl ms-accent-terracotta mb-3">Resources</h2>
          <p className="text-center text-sm text-[hsl(var(--mc-muted))] max-w-2xl mx-auto mb-8">
            Quick tools and calculators to support awareness. For accurate interpretation, consult a clinician.
          </p>
          <div className="grid md:grid-cols-2 gap-5 items-stretch">
            <div className="ms-card overflow-hidden bg-[hsl(var(--mc-cream))] min-h-[220px]">
              {page.hero_image && (
                <img src={page.hero_image} alt="Resources" className="h-full w-full object-cover" loading="lazy" />
              )}
            </div>
            <div className="ms-card ms-card-sage p-8 flex flex-col justify-center">
              <ul className="space-y-3">
                {page.intro_stats.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{r.label}{r.value ? ` — ${r.value}` : ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Prices */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <h2 className="text-center text-3xl sm:text-4xl ms-accent-terracotta">Prices</h2>
        <p className="text-center text-sm text-[hsl(var(--mc-muted))] max-w-2xl mx-auto mt-3 mb-12">
          Our fees reflect private GP and specialist services delivered promptly and professionally.
          All prices are inclusive of consultation time and clinical assessment. Additional tests,
          prescriptions, referrals, or treatments are charged separately where applicable.
        </p>

        <div className="grid md:grid-cols-2 gap-x-14 gap-y-12">
          {byCategory.map((g) => (
            <div key={g.category.id}>
              <h3 className="text-xl ms-accent-terracotta border-b border-[hsl(var(--mc-border))] pb-2 mb-4">
                {g.category.name}
              </h3>
              <ul className="divide-y divide-[hsl(var(--mc-border))]">
                {g.services.map((s) => {
                  const price = formatPrice(s);
                  return (
                    <li key={s.id} className="py-3">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-semibold ms-accent-terracotta">{s.title}</span>
                        {price && <span className="font-semibold text-[hsl(var(--mc-ink))] shrink-0">{price}</span>}
                      </div>
                      {s.summary && (
                        <p className="text-sm text-[hsl(var(--mc-muted))] mt-1">{s.summary}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {allFilteredServices.length === 0 && !loading && (
          <p className="text-center text-sm text-[hsl(var(--mc-muted))] mt-8">No services to display.</p>
        )}
      </section>

      {/* Vision tagline */}
      {page?.cta_title && (
        <section className="text-center pb-16">
          <p className="ms-accent-terracotta font-semibold">
            Our Vision is simple: to help you feel well, stay well, and live well.
          </p>
        </section>
      )}

      {/* FAQs */}
      {pageFaqs.length > 0 && (
        <section className="bg-white border-y border-[hsl(var(--mc-border))]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
            <h2 className="text-center text-3xl ms-accent-terracotta mb-8">Diagnostics and Screening</h2>
            <Accordion type="single" collapsible className="divide-y divide-[hsl(var(--mc-border))]">
              {pageFaqs.map((f, i) => (
                <AccordionItem key={f.id} value={`f-${i}`} className="border-none">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">{f.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-[hsl(var(--mc-muted))] pb-5 leading-relaxed">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* Footer band */}
      <footer className="bg-[hsl(var(--mc-terracotta))] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid sm:grid-cols-2 gap-6 items-center">
          <div className="space-y-1 text-sm">
            <Link to="/doctor-portal" className="block hover:underline">Home</Link>
            <Link to="/doctor-portal/services" className="block hover:underline">Services</Link>
            <Link to="/doctor-portal#about" className="block hover:underline">About Us</Link>
            <Link to="/doctor-portal#contact" className="block hover:underline">Contact Us</Link>
          </div>
          <div className="sm:text-right">
            <div className="flex sm:justify-end items-center gap-2 font-bold text-lg">
              <Stethoscope className="h-5 w-5" /> {settings.siteName || "MediCare"}
            </div>
            <p className="text-sm text-white/85 mt-2">Supporting your path to wellness</p>
          </div>
        </div>
        <div className="bg-[hsl(var(--mc-ink))] text-white/70 text-xs py-4 text-center">
          © {new Date().getFullYear()} MediCare. All rights reserved In Partnership With Desolmedical Solution Limited.
        </div>
      </footer>
    </div>
  );
};

export default MediCareServices;
