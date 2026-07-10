import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Send,
  Settings,
  Stethoscope,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import {
  hexToHslString,
  type MediCareSettings,
  type NavItem,
  type SocialPlatform,
} from "@/lib/medicareSettings";

const fallbackNavItems: NavItem[] = [
  { id: "nav-home", label: "Home", href: "/doctor-portal", enabled: true, order: 0 },
  { id: "nav-about", label: "About Us", href: "/doctor-portal#about", enabled: true, order: 1 },
  { id: "nav-services", label: "Services", href: "/doctor-portal/services", enabled: true, order: 2 },
  { id: "nav-blogs", label: "Blogs", href: "/doctor-portal/blogs", enabled: true, order: 3 },
  { id: "nav-contact", label: "Contact Us", href: "/doctor-portal/contact", enabled: true, order: 4 },
];

const socialIcons: Record<SocialPlatform, LucideIcon> = {
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music2,
  whatsapp: MessageCircle,
  telegram: Send,
};

export const medicareThemeStyle = (settings: MediCareSettings): CSSProperties => ({
  ["--mc-primary" as string]: hexToHslString(settings.primaryColor),
  ["--mc-accent" as string]: hexToHslString(settings.accentColor),
});

const normalizeBasePath = (basePath = "/doctor-portal") => {
  const trimmed = basePath.trim().replace(/\/+$/, "");
  return trimmed === "/" ? "" : trimmed;
};

export const normalizeMedicareHref = (href: string, basePath = "/doctor-portal") => {
  const raw = href.trim();
  const base = normalizeBasePath(basePath);
  if (!raw) return "#";
  if (/^(https?:|mailto:|tel:|sms:)/i.test(raw)) return raw;
  if (raw === "#top") return base || "/";
  if (raw === "#contact" || raw === "/contact") return `${base}/contact` || "/contact";
  if (raw.startsWith("#")) return `${base}${raw}`;
  if (raw === "/doctor-portal") return base || "/";
  if (raw.startsWith("/doctor-portal?")) return `${base || "/"}${raw.slice("/doctor-portal".length)}`;
  if (raw.startsWith("/doctor-portal/")) return `${base}${raw.slice("/doctor-portal".length)}` || "/";
  return raw;
};

export const getMedicareNavItems = (settings: MediCareSettings, basePath = "/doctor-portal") => {
  const source = settings.nav.items?.length ? settings.nav.items : fallbackNavItems;
  return source
    .filter((item) => item.enabled)
    .sort((a, b) => a.order - b.order)
    .map((item) => ({ ...item, href: normalizeMedicareHref(item.href, basePath) }));
};

const SmartLink = ({
  href,
  className,
  children,
  basePath,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  basePath?: string;
}) => {
  const to = normalizeMedicareHref(href, basePath);
  const external = /^(https?:|mailto:|tel:|sms:)/i.test(to);
  return external ? (
    <a href={to} className={className} target={to.startsWith("http") ? "_blank" : undefined} rel={to.startsWith("http") ? "noreferrer" : undefined}>
      {children}
    </a>
  ) : (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
};

export const MedicareLogo = ({ settings, className = "", basePath = "/doctor-portal" }: { settings: MediCareSettings; className?: string; basePath?: string }) => (
  <Link
    to={normalizeBasePath(basePath) || "/"}
    className={`flex items-center gap-2 font-bold text-[hsl(var(--mc-primary))] transition-colors hover:text-[hsl(var(--mc-accent))] ${className}`}
  >
    <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-[hsl(var(--mc-primary))] text-white shadow-[0_12px_28px_-18px_hsl(var(--mc-primary))]">
      {settings.logoDataUrl ? (
        <img src={settings.logoDataUrl} alt={`${settings.siteName} logo`} className="h-full w-full object-cover" />
      ) : (
        <Stethoscope className="h-5 w-5" />
      )}
    </span>
    <span>{settings.siteName || "MediCare"}</span>
  </Link>
);

export const MedicareSimpleHeader = ({
  settings,
  activeHref,
  basePath = "/doctor-portal",
}: {
  settings: MediCareSettings;
  activeHref?: string;
  basePath?: string;
}) => {
  const navItems = getMedicareNavItems(settings, basePath);
  const bookingHref = `${normalizeBasePath(basePath) || "/"}?book=1`;
  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))]/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <MedicareLogo settings={settings} basePath={basePath} />
        <nav className="hidden items-center gap-7 text-sm font-medium text-[hsl(var(--mc-muted))] md:flex">
          {navItems.map((item) => {
            const active = activeHref && normalizeMedicareHref(item.href) === activeHref;
            return (
              <SmartLink
                key={item.id}
                href={item.href}
                basePath={basePath}
                className={active ? "text-[hsl(var(--mc-primary))]" : "hover:text-[hsl(var(--mc-primary))]"}
              >
                {item.label}
              </SmartLink>
            );
          })}
        </nav>
        <Link
          to={bookingHref}
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--mc-primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Book Appointment <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
};

const footerColumn = (title: string, items: { id: string; label: string; href: string }[], basePath?: string) => {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-wider">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm text-white/70">
        {items.map((item) => (
          <li key={item.id}>
            <SmartLink href={item.href} basePath={basePath} className="transition hover:text-white">
              {item.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const MedicareFooter = ({
  settings,
  showAdminLink = false,
  adminHref = "/doctor-portal/admin",
  basePath = "/doctor-portal",
}: {
  settings: MediCareSettings;
  showAdminLink?: boolean;
  adminHref?: string;
  basePath?: string;
}) => {
  const year = new Date().getFullYear();
  const copyright = (settings.footer.copyright || "{year} {site}. All rights reserved.")
    .replace("{year}", String(year))
    .replace("{site}", settings.siteName || "MediCare");
  const footerStyle: CSSProperties = settings.footer.bgColor ? { backgroundColor: settings.footer.bgColor } : {};

  return (
    <footer className="relative pt-16 text-white" style={footerStyle}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--mc-accent)/.18),transparent_30%),radial-gradient(circle_at_80%_0%,hsl(var(--mc-primary)/.22),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 pb-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link to={normalizeBasePath(basePath) || "/"} className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-[hsl(var(--mc-primary))] text-white">
                {settings.logoDataUrl ? (
                  <img src={settings.logoDataUrl} alt={`${settings.siteName} logo`} className="h-full w-full object-cover" />
                ) : (
                  <Stethoscope className="h-5 w-5" />
                )}
              </span>
              <span className="font-display text-xl font-bold">{settings.siteName || "MediCare"}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {settings.footer.description || settings.footerTagline}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {settings.footer.socials.map((social) => {
                const Icon = socialIcons[social.platform] || Facebook;
                return (
                  <SmartLink
                    key={social.id}
                    href={social.href}
                    basePath={basePath}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                  >
                    <Icon className="h-4 w-4" />
                  </SmartLink>
                );
              })}
            </div>
          </div>

          {footerColumn("Quick Links", settings.footer.quickLinks, basePath)}
          {footerColumn("Specialists", settings.footer.specialistLinks, basePath)}
          {footerColumn("Support", settings.footer.supportLinks, basePath)}
        </div>

        <div className="border-t border-white/10">
          <div className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row">
            <p>{copyright} In Partnership With Desolmedical Solution Limited.</p>
            <div className="flex items-center gap-3">
              {showAdminLink && (
                <Link to={adminHref} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 transition hover:border-white/40 hover:text-white">
                  <Settings className="h-3.5 w-3.5" /> Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
