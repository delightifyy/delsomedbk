import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Music2,
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
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music2,
};

export const medicareThemeStyle = (settings: MediCareSettings): CSSProperties => ({
  ["--mc-primary" as string]: hexToHslString(settings.primaryColor),
  ["--mc-accent" as string]: hexToHslString(settings.accentColor),
});

export const normalizeMedicareHref = (href: string) => {
  const raw = href.trim();
  if (!raw) return "#";
  if (raw === "#top") return "/doctor-portal";
  if (raw === "#contact" || raw === "/contact") return "/doctor-portal/contact";
  if (raw.startsWith("#")) return `/doctor-portal${raw}`;
  return raw;
};

export const getMedicareNavItems = (settings: MediCareSettings) => {
  const source = settings.nav.items?.length ? settings.nav.items : fallbackNavItems;
  return source
    .filter((item) => item.enabled)
    .sort((a, b) => a.order - b.order)
    .map((item) => ({ ...item, href: normalizeMedicareHref(item.href) }));
};

const SmartLink = ({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) => {
  const to = normalizeMedicareHref(href);
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

export const MedicareLogo = ({ settings, className = "" }: { settings: MediCareSettings; className?: string }) => (
  <Link to="/doctor-portal" className={`flex items-center gap-2 font-bold text-[hsl(var(--mc-ink))] ${className}`}>
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
}: {
  settings: MediCareSettings;
  activeHref?: string;
}) => {
  const navItems = getMedicareNavItems(settings);
  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))]/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <MedicareLogo settings={settings} />
        <nav className="hidden items-center gap-7 text-sm font-medium text-[hsl(var(--mc-muted))] md:flex">
          {navItems.map((item) => {
            const active = activeHref && normalizeMedicareHref(item.href) === activeHref;
            return (
              <SmartLink
                key={item.id}
                href={item.href}
                className={active ? "text-[hsl(var(--mc-primary))]" : "hover:text-[hsl(var(--mc-primary))]"}
              >
                {item.label}
              </SmartLink>
            );
          })}
        </nav>
        <Link
          to="/doctor-portal?book=1"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--mc-primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Book Appointment <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
};

const footerColumn = (title: string, items: { id: string; label: string; href: string }[]) => {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-wider">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm text-white/70">
        {items.map((item) => (
          <li key={item.id}>
            <SmartLink href={item.href} className="transition hover:text-white">
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
}: {
  settings: MediCareSettings;
  showAdminLink?: boolean;
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
            <Link to="/doctor-portal" className="flex items-center gap-2.5">
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
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                  >
                    <Icon className="h-4 w-4" />
                  </SmartLink>
                );
              })}
            </div>
          </div>

          {footerColumn("Quick Links", settings.footer.quickLinks)}
          {footerColumn("Specialists", settings.footer.specialistLinks)}
          {footerColumn("Support", settings.footer.supportLinks)}
        </div>

        <div className="border-t border-white/10">
          <div className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row">
            <p>{copyright} In Partnership With Desolmedical Solution Limited.</p>
            <div className="flex items-center gap-3">
              {showAdminLink && (
                <Link to="/doctor-portal/admin" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 transition hover:border-white/40 hover:text-white">
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
