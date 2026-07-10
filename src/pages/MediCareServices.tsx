import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Icon as McIcon } from "@/components/medicare-admin/icons";
import { useMediCareSettings } from "@/lib/medicareSettings";
import { MedicareFooter, MedicareSimpleHeader, medicareThemeStyle } from "@/components/medicare/MediCareChrome";
import { fetchAll, type Service } from "@/lib/medicareServicesApi";

/* Scoped tokens — sage + terracotta palette inspired by reference, MediCare semantics */
const tokenStyles = `
.medicare-services {
  --mc-primary: 212 88% 32%;
  --mc-accent: 174 72% 42%;
  --mc-bg: 0 0% 100%;
  --mc-cream: 210 20% 96%;
  --mc-fg: 205 30% 20%;
  --mc-muted: 205 12% 42%;
  --mc-border: 205 18% 88%;
  --mc-sage: var(--mc-primary);
  --mc-sage-deep: var(--mc-primary);
  --mc-sage-soft: 205 25% 82%;
  --mc-blue: var(--mc-accent);
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

const MediCareServices = ({ doctorSlug }: { doctorSlug?: string } = {}) => {
  const settings = useMediCareSettings(doctorSlug);
  const basePath = doctorSlug ? "" : "/doctor-portal";
  const activeHref = `${basePath}/services` || "/services";
  const [priceServices, setPriceServices] = useState<Service[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);
  const services = useMemo(
    () => settings.services.items.filter((item) => item.active).sort((a, b) => a.order - b.order),
    [settings.services.items],
  );

  useEffect(() => {
    let cancelled = false;
    fetchAll()
      .then((result) => {
        if (cancelled) return;
        setPriceServices(result.services.filter((service) => service.visible));
      })
      .finally(() => {
        if (!cancelled) setPricesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.title = `${settings.services.title || "Services"} — MediCare`;

    const description = `${settings.services.title || "Services"} available through MediCare.`;
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (meta) meta.content = description;
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = description;
      document.head.appendChild(m);
    }
  }, [settings.services.title]);

  const themeStyle = medicareThemeStyle(settings);

  const priceByTitle = useMemo(() => {
    const map = new Map<string, string>();
    const format = (service: Service) => {
      if (service.price_label) return service.price_label;
      if (service.price_amount == null) return "";
      return `${service.price_currency || "GBP"} ${Number(service.price_amount).toLocaleString("en-US")}`;
    };

    priceServices.forEach((service) => {
      const price = format(service);
      if (!price) return;
      map.set(service.title.trim().toLowerCase(), price);
    });

    return map;
  }, [priceServices]);

  return (
    <div className="medicare-services min-h-screen" style={themeStyle}>
      <style>{tokenStyles}</style>

      <MedicareSimpleHeader settings={settings} activeHref={activeHref} basePath={basePath} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[hsl(var(--mc-ink))]">
          {settings.services.title || "Our Services"}
        </h1>
        <p className="mt-4 max-w-2xl text-[hsl(var(--mc-muted))] leading-relaxed">
          All our services are designed to provide you with the best healthcare experience. Browse through our offerings and find the right care for you.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[hsl(var(--mc-border))] p-16 text-center bg-white">
            <p className="text-[hsl(var(--mc-muted))]">No services are available yet.</p>
          </div>
        ) : (
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => (
              <article
                key={svc.id}
                className="group bg-[hsl(var(--mc-card))] rounded-3xl overflow-hidden border border-[hsl(var(--mc-border))] mc-shadow-card mc-card-hover p-7"
              >
                <span className="inline-grid place-items-center h-12 w-12 rounded-2xl mc-grad-primary text-white mc-shadow-glow mb-4">
                  <McIcon name={svc.icon} className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold">{svc.title}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--mc-muted))] leading-relaxed">
                  {svc.description}
                </p>
                <p className="mt-4 text-sm font-semibold text-[hsl(var(--mc-ink))]">
                  {pricesLoading
                    ? "Loading..."
                    : priceByTitle.get(svc.title.trim().toLowerCase()) || "Contact us"}
                </p>
                {svc.ctaLabel && svc.ctaHref && (
                  <a href={svc.ctaHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--mc-primary))]">
                    {svc.ctaLabel} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <MedicareFooter settings={settings} basePath={basePath} />
    </div>
  );
};

export default MediCareServices;
