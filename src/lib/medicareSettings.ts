import { useEffect, useState } from "react";
import { api, resolveApiAssetUrl } from "@/lib/api";

/* =========================================================
   MediCare Landing-Page CMS — full settings schema
   Stored in localStorage (key: "medicare:settings:v2").
   Backwards-compatible read: legacy v1 keys are merged into
   the v2 defaults so saved branding/about/etc. is preserved.
========================================================= */

export type LucideIconName =
  | "Stethoscope" | "ShieldCheck" | "Bot" | "Clock" | "FileText" | "Headphones"
  | "Globe2" | "Award" | "HeartPulse" | "Brain" | "Pill" | "Eye" | "Activity"
  | "FlaskConical" | "Video" | "MessageSquare" | "Phone" | "Mail" | "MapPin"
  | "Users" | "Building2" | "CheckCircle2" | "Star" | "Sparkles" | "Smartphone"
  | "Baby" | "Bone" | "Microscope" | "Syringe" | "Ambulance" | "Search"
  | "CalendarCheck" | "MonitorSmartphone" | "BellRing" | "Languages" | "ArrowRight";

export type SocialPlatform = "facebook" | "twitter" | "x" | "instagram" | "linkedin" | "youtube" | "tiktok" | "whatsapp" | "telegram";

export type NavItem = { id: string; label: string; href: string; enabled: boolean; order: number };
export type Partner = { id: string; name: string; logoDataUrl?: string | null };
export type Feature = { id: string; icon: LucideIconName; title: string; description: string; order: number; active: boolean };
export type Service = {
  id: string; image?: string | null; icon: LucideIconName;
  title: string; description: string;
  ctaLabel?: string; ctaHref?: string;
  price_amount?: number | null;
  price_label?: string | null;
  delivery_mode?: string | null;
  order: number; active: boolean;
};
export type TestimonialItem = {
  id: string; quote: string; name: string; location: string;
  imageDataUrl?: string | null; rating: number; order: number;
};
export type SocialLink = { id: string; platform: SocialPlatform; href: string };
export type FooterLink = { id: string; label: string; href: string };
export type MediaItem = { id: string; name: string; type: "image" | "video"; dataUrl: string; uploadedAt: number };
export type HospitalLocation = {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  active: boolean;
  order: number;
};

export type Faq = { id: string; q: string; a: string };
export type Testimonial = { id: string; quote: string; name: string; role: string };
export type HowItWorksStep = { id: string; title: string; body: string };
export type DoctorEntry = {
  id: string; name: string; specialty?: string; bio?: string; photoDataUrl?: string | null;
};

export type MediCareSettings = {
  miniSite?: {
    slug?: string;
    publicUrl?: string;
    adminUrl?: string;
    doctorUuid?: string;
    doctorName?: string;
    brandName?: string;
  };

  /* Branding (kept for back-compat) */
  siteName: string;
  logoDataUrl: string | null;
  primaryColor: string;
  accentColor: string;

  /* Navbar */
  nav: {
    items: NavItem[];
    cta: { enabled: boolean; label: string; href: string };
  };

  /* Hero */
  hero: {
    eyebrow: string;
    titleLead: string;
    titleHighlight: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    bgVideo: string;
    bgImage: string;
    overlayOpacity: number; // 0..1
    doctorCard: { name: string; role: string; imageUrl: string };
    checklistCard: { title: string; items: { time: string; label: string }[] };
    vitalsCard: { label: string; value: string; unit: string };
    satisfactionCard: { value: string; label: string };
  };

  /* Partners */
  partners: Partner[];

  /* About */
  about: {
    label: string;
    title: string;
    body: string;
    mission: { title: string; body: string };
    vision: { title: string; body: string };
    image: string;
    ctaLabel: string;
    ctaHref: string;
    satisfaction: { value: string; label: string };
  };

  /* Why Choose Us */
  whyChoose: {
    label: string;
    title: string;
    description: string;
    image: string;
    features: Feature[];
  };

  /* Services */
  services: {
    label: string;
    title: string;
    items: Service[];
  };

  /* Virtual Care */
  virtualCare: {
    badge: string;
    title: string;
    description: string;
    checklist: string[];
    ctaLabel: string;
    ctaHref: string;
    mockupImage: string;
    dashboard: { title: string; subtitle: string; stats: { label: string; value: string }[] };
  };

  /* Testimonials */
  testimonials: {
    label: string;
    title: string;
    items: TestimonialItem[];
  };

  /* CTA Banner */
  ctaBanner: {
    bgVideo: string;
    bgImage: string;
    overlayOpacity: number;
    badge: string;
    title: string;
    description: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };

  /* Footer */
  footer: {
    description: string;
    socials: SocialLink[];
    specialistLinks: FooterLink[];
    quickLinks: FooterLink[];
    supportLinks: FooterLink[];
    copyright: string;
    availabilityText: string;
    bgColor: string; // hex
  };

  /* Media Library */
  media: MediaItem[];

  /* SEO */
  seo: {
    pageTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
    favicon: string;
  };

  /* Contact (still used by booking modal) */
  contact: { email: string; phone: string; address: string };

  /* Hospital Locations */
  hospitalLocations: HospitalLocation[];

  /* Legacy slots still consumed elsewhere */
  footerTagline: string;
  faqs: Faq[];
  partnersLegacy?: Testimonial[]; // unused
  doctors: DoctorEntry[];
  howItWorks: HowItWorksStep[];
};

const KEY_V2 = "medicare:settings:v2";
const KEY_V1 = "medicare:settings:v1";

/* ---------- Default content (mirrors current landing page) ---------- */

const uid = (p = "id") => `${p}-${Math.random().toString(36).slice(2, 9)}`;

const makeDoctorPortrait = (name: string, accent: string, fill: string) => {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "").join("") || "DR";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${fill}"/><stop offset="100%" stop-color="${accent}"/></linearGradient></defs><rect width="512" height="512" rx="72" fill="url(#g)"/><circle cx="256" cy="188" r="92" fill="rgba(255,255,255,.84)"/><path d="M120 416c18-74 72-112 136-112s118 38 136 112" fill="rgba(255,255,255,.84)"/><text x="50%" y="270" text-anchor="middle" font-family="Arial" font-size="76" font-weight="700" fill="${accent}">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const defaultSettings: MediCareSettings = {
  siteName: "MediCare",
  logoDataUrl: null,
  primaryColor: "#1F8FFF",
  accentColor: "#22C58B",

  nav: {
    items: [
      { id: uid("nav"), label: "Home", href: "/doctor-portal", enabled: true, order: 0 },
      { id: uid("nav"), label: "About Us", href: "/doctor-portal#about", enabled: true, order: 1 },
      { id: uid("nav"), label: "Services", href: "/doctor-portal/services", enabled: true, order: 2 },
      { id: uid("nav"), label: "Blogs", href: "/doctor-portal/blogs", enabled: true, order: 3 },
      { id: uid("nav"), label: "Contact Us", href: "/doctor-portal/contact", enabled: true, order: 4 },
    ],
    cta: { enabled: false, label: "Book Appointment", href: "/doctor-portal?book=1" },
  },

  hero: {
    eyebrow: "Live 24/7",
    titleLead: "Advanced Healthcare",
    titleHighlight: "Designed Around You",
    subtitle:
      "Book Appointments, Consult Certified Doctors, Receive World class Healthcare Digitally and physically.",
    ctaLabel: "Book Appointment",
    ctaHref: "#cta",
    bgVideo: "https://videos.pexels.com/video-files/4124426/4124426-uhd_2560_1440_25fps.mp4",
    bgImage: "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=1920&auto=format&fit=crop&q=80",
    overlayOpacity: 0.85,
    doctorCard: {
      name: "Dr. Amara Okafor",
      role: "In session",
      imageUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&auto=format&fit=crop&q=80",
    },
    checklistCard: {
      title: "Today's Schedule",
      items: [
        { time: "09:30", label: "Cardiology check-in" },
        { time: "11:15", label: "Pediatric video call" },
        { time: "14:00", label: "Lab results review" },
      ],
    },
    vitalsCard: { label: "Heart rate", value: "72", unit: "bpm" },
    satisfactionCard: { value: "98%", label: "Patient Satisfaction" },
  },

  partners: [
    "Hallmark", "Hygeia", "Bastion", "Ilera Eko", "Reliance HMO", "Avon", "AXA Mansard", "Total Health",
  ].map((name) => ({ id: uid("p"), name, logoDataUrl: null })),

  about: {
    label: "About MediCare",
    title: "About MediCare",
    body:
      "MediCare is a modern telemedicine platform connecting patients with licensed physicians for fast, secure and affordable virtual care.",
    mission: {
      title: "Our Mission",
      body: "Provide accessible, world-class care that respects every patient as a person.",
    },
    vision: {
      title: "Our Vision",
      body: "Be the most trusted healthcare brand on the continent — a benchmark for excellence.",
    },
    image: "",
    ctaLabel: "Read our full story",
    ctaHref: "#services",
    satisfaction: { value: "98%", label: "Patient satisfaction" },
  },

  whyChoose: {
    label: "Why Choose Us",
    title: "Care you can truly trust",
    description:
      "Built on decades of clinical excellence and powered by modern technology, MediCare delivers a healthcare experience that feels human at every step.",
    image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1200&auto=format&fit=crop&q=80",
    features: [
      { id: uid("f"), icon: "ShieldCheck", title: "Certified Specialists", description: "Every doctor is board-licensed and verified.", order: 0, active: true },
      { id: uid("f"), icon: "Bot",         title: "Advanced Technology",   description: "AI-assisted triage and modern clinical tools.", order: 1, active: true },
      { id: uid("f"), icon: "Clock",       title: "Fast Scheduling",       description: "Book a doctor in under 60 seconds.", order: 2, active: true },
      { id: uid("f"), icon: "FileText",    title: "Digital Records",       description: "Your full medical history, encrypted and accessible.", order: 3, active: true },
      { id: uid("f"), icon: "Headphones",  title: "24/7 Patient Support",  description: "Real humans available day and night.", order: 4, active: true },
      { id: uid("f"), icon: "Globe2",      title: "International Standards", description: "Care that meets global healthcare benchmarks.", order: 5, active: true },
    ],
  },

  services: {
    label: "Services",
    title: "Everything you need, one platform",
    items: [
      { id: uid("s"), icon: "Stethoscope",  title: "General Consultation",   description: "Everyday illnesses, checkups, and concerns from licensed GPs.", image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&auto=format&fit=crop&q=80", order: 0, active: true, ctaLabel: "", ctaHref: "" },
      { id: uid("s"), icon: "Brain",        title: "Mental Health Support",  description: "Therapy and counseling from accredited professionals.",        image: "/mental-health-support.jpg", order: 1, active: true, ctaLabel: "", ctaHref: "" },
      { id: uid("s"), icon: "Pill",         title: "Prescription & Refills", description: "Digital prescriptions sent to your local pharmacy.",          image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80", order: 2, active: true, ctaLabel: "", ctaHref: "" },
      { id: uid("s"), icon: "FlaskConical", title: "Lab Tests & Referrals",  description: "Order labs and access specialist referrals fast.",            image: "/lab-tests-referrals.jpg", order: 3, active: true, ctaLabel: "", ctaHref: "" },
      { id: uid("s"), icon: "Eye",          title: "Vision & Optical",       description: "Eye exams and optical care from board-certified doctors.",    image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&auto=format&fit=crop&q=80", order: 4, active: true, ctaLabel: "", ctaHref: "" },
      { id: uid("s"), icon: "Activity",     title: "Chronic Care",           description: "Continuous monitoring for diabetes, BP and more.",            image: "/pregnancy-test.webp", order: 5, active: true, ctaLabel: "", ctaHref: "" },
    ],
  },

  virtualCare: {
    badge: "AI-powered Telemedicine",
    title: "Virtual Care Designed Around Your Schedule",
    description:
      "Access smarter healthcare through crystal-clear virtual consultations, intelligent symptom guidance, secure prescriptions, and connected patient monitoring in one seamless experience.",
    checklist: [
      "HD video & encrypted chat consultations",
      "Get Connected to Care Within 60 Seconds",
      "Real-time vitals monitoring",
      "Digital prescriptions & e-referrals",
    ],
    ctaLabel: "Start consultation",
    ctaHref: "#cta",
    mockupImage: "/virtual-care-doctor.jpg",
    dashboard: {
      title: "Care Dashboard",
      subtitle: "Live overview · today",
      stats: [
        { label: "Appts", value: "12" },
        { label: "Patients", value: "284" },
        { label: "Refills", value: "37" },
      ],
    },
  },

  testimonials: {
    label: "Patient Stories",
    title: "Real people. Real outcomes.",
    items: [
      { id: uid("t"), quote: "I consulted a cardiologist from my living room within 12 minutes. Prescription delivered the same evening. Truly futuristic care.", name: "Emma Thompson",      location: "Patient · Seattle, WA", imageDataUrl: "/mental-health-support.jpg", rating: 5, order: 0 },
      { id: uid("t"), quote: "As a busy parent, having a pediatrician available at 11 PM for my daughter changed how I think about healthcare.",              name: "Michael Rodriguez",   location: "Patient · Austin, TX",  imageDataUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80", rating: 5, order: 1 },
      { id: uid("t"), quote: "The doctors actually listen. The follow-up is seamless and my full record is in one place. I won't go back.",                  name: "Adaeze Nwosu",        location: "Patient · Lagos, NG",   imageDataUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80", rating: 5, order: 2 },
    ],
  },

  ctaBanner: {
    bgVideo: "https://videos.pexels.com/video-files/7088526/7088526-uhd_2560_1440_25fps.mp4",
    bgImage: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=1920&auto=format&fit=crop&q=80",
    overlayOpacity: 0.8,
    badge: "Care that fits your life",
    title: "Healthcare that feels human",
    description: "Experience trusted digital healthcare built around your comfort, dignity and safety.",
    primary: { label: "Get Started", href: "#doctors" },
    secondary: { label: "Talk to a Doctor", href: "#telemedicine" },
  },

  footer: {
    description: "Modern telemedicine for everyday people. Trusted, secure, available 24/7.",
    socials: [
      { id: uid("so"), platform: "facebook",  href: "#" },
      { id: uid("so"), platform: "twitter",   href: "#" },
      { id: uid("so"), platform: "instagram", href: "#" },
      { id: uid("so"), platform: "linkedin",  href: "#" },
    ],
    specialistLinks: [
      { id: uid("l"), label: "Cardiology",       href: "#specialties" },
      { id: uid("l"), label: "Neurology",        href: "#specialties" },
      { id: uid("l"), label: "Orthopedics",      href: "#specialties" },
      { id: uid("l"), label: "Pediatrics",       href: "#specialties" },
      { id: uid("l"), label: "Oncology",         href: "#specialties" },
    ],
    quickLinks: [
      { id: uid("l"), label: "Home",     href: "/doctor-portal" },
      { id: uid("l"), label: "Services", href: "/doctor-portal/services" },
      { id: uid("l"), label: "Blogs",    href: "/doctor-portal/blogs" },
      { id: uid("l"), label: "About",    href: "/doctor-portal#about" },
    ],
    supportLinks: [
      { id: uid("l"), label: "Contact",        href: "/doctor-portal/contact" },
      { id: uid("l"), label: "Privacy Policy", href: "#" },
      { id: uid("l"), label: "Terms",          href: "#" },
    ],
    copyright: "© {year} {site}. All rights reserved.",
    availabilityText: "JCI Accredited",
    bgColor: "#0b1220",
  },

  media: [],

  seo: {
    pageTitle: "MediCare — Advanced Healthcare Designed Around You",
    metaDescription:
      "Book appointments, consult certified doctors, access medical records and receive world-class healthcare digitally and physically with MediCare.",
    keywords: "telemedicine, healthcare, doctors, appointments, virtual care",
    ogImage: "",
    favicon: "",
  },

  contact: {
    email: "enquiry@desolmed.com",
    phone: "+234 818 689 9594",
    address: "10, Abeokuta Street, Ebute Metta, Yaba, Lagos, Nigeria",
  },

  hospitalLocations: [],

  footerTagline: "Modern telemedicine for everyday people. Trusted, secure, available 24/7.",
  faqs: [
    { id: "faq-1", q: "What is MediCare?", a: "MediCare is a modern telemedicine platform connecting patients with licensed doctors for fast, secure and affordable virtual care." },
  ],
  doctors: [
    { id: "d-1", name: "Dr. Amina Yusuf",   specialty: "Family Medicine",   bio: "Warm, practical primary care for adults and children.",    photoDataUrl: makeDoctorPortrait("Dr. Amina Yusuf",    "#22c55e", "#0f766e") },
    { id: "d-2", name: "Dr. Tunde Akinwale", specialty: "Internal Medicine", bio: "Experienced GP offering teleconsultations and follow-up.", photoDataUrl: makeDoctorPortrait("Dr. Tunde Akinwale", "#38bdf8", "#2563eb") },
    { id: "d-3", name: "Dr. Zainab Bello",  specialty: "Pediatrics",        bio: "Calm, reassuring pediatric care for growing families.",   photoDataUrl: makeDoctorPortrait("Dr. Zainab Bello",   "#f59e0b", "#db2777") },
  ],
  howItWorks: [
    { id: "h-1", title: "Find a Doctor",       body: "Search and filter by specialty and location." },
    { id: "h-2", title: "Book a Consultation", body: "Choose a time and connect via video or chat." },
    { id: "h-3", title: "Receive Care",        body: "Get prescriptions, advice, and follow-ups." },
  ],
};

/* ---------- Mini-site API normalization ---------- */

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const unwrapData = (value: unknown): unknown => {
  const record = asRecord(value);
  return Object.prototype.hasOwnProperty.call(record, "data") ? record.data : value;
};

const getPath = (record: Record<string, any>, path: string) =>
  path.split(".").reduce<unknown>((current, key) => asRecord(current)[key], record);

const firstText = (record: Record<string, any>, paths: string[]) => {
  for (const path of paths) {
    const value = getPath(record, path);
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return undefined;
};

const firstNumber = (record: Record<string, any>, paths: string[]) => {
  for (const path of paths) {
    const value = getPath(record, path);
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return undefined;
};

const hasField = (record: Record<string, any>, path: string) => getPath(record, path) !== undefined;

const normalizeIcon = (value: unknown): LucideIconName => {
  const raw = String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const aliases: Record<string, LucideIconName> = {
    activity: "Activity",
    ambulance: "Ambulance",
    baby: "Baby",
    bell: "BellRing",
    bellring: "BellRing",
    bot: "Bot",
    brain: "Brain",
    calendar: "CalendarCheck",
    calendarcheck: "CalendarCheck",
    check: "CheckCircle2",
    checkcircle: "CheckCircle2",
    checkcircle2: "CheckCircle2",
    clock: "Clock",
    file: "FileText",
    filetext: "FileText",
    flask: "FlaskConical",
    flaskconical: "FlaskConical",
    globe: "Globe2",
    globe2: "Globe2",
    heart: "HeartPulse",
    heartpulse: "HeartPulse",
    lab: "FlaskConical",
    mail: "Mail",
    mappin: "MapPin",
    message: "MessageSquare",
    messagesquare: "MessageSquare",
    phone: "Phone",
    pill: "Pill",
    search: "Search",
    shield: "ShieldCheck",
    shieldcheck: "ShieldCheck",
    smartphone: "Smartphone",
    stethoscope: "Stethoscope",
    video: "Video",
    users: "Users",
  };
  return aliases[raw] ?? "Stethoscope";
};

const normalizePriceAmount = (record: Record<string, any>) => {
  const amount = firstNumber(record, ["price_amount"]);
  if (amount !== undefined) return amount;
  const naira = firstNumber(record, ["price_naira"]);
  if (naira !== undefined) return naira;
  const kobo = firstNumber(record, ["price_kobo"]);
  if (kobo !== undefined) return kobo / 100;
  return null;
};

const genericMiniSiteNames = new Set(["medicare", "mini-site", "minisite", "doctor portal"]);

export const pickMiniSiteDisplayName = (source: unknown, fallback = "Mini-site") => {
  const root = asRecord(unwrapData(source));
  const doctorName = firstText(root, [
    "doctor_name",
    "doctor.name",
    "doctor.full_name",
    "doctor.display_name",
    "user.name",
    "user.full_name",
    "profile.name",
    "profile.full_name",
  ]);
  const brandName = firstText(root, [
    "mini_site.brand_name",
    "miniSite.brandName",
    "brand_name",
    "site_name",
    "siteName",
    "name",
  ]);

  if (doctorName) return doctorName;
  if (brandName && !genericMiniSiteNames.has(brandName.trim().toLowerCase())) return brandName;
  return fallback;
};

const splitFooterLinks = (items: unknown[], group: "specialist" | "quick" | "support") =>
  items
    .map((item, index) => {
      const record = asRecord(item);
      return {
        group: String(record.group ?? record.type ?? "").toLowerCase(),
        link: {
          id: String(record.id ?? record.uuid ?? `${group}-${index}`),
          label: firstText(record, ["label", "title", "name"]) ?? "",
          href: firstText(record, ["url", "href", "link"]) ?? "#",
        },
      };
    })
    .filter((item) => !item.group || item.group === group)
    .map((item) => item.link);

export function mergeRemoteMiniSiteSettings(current: MediCareSettings, remoteValue: unknown): MediCareSettings {
  const remote = asRecord(unwrapData(remoteValue));
  const miniSite = asRecord(remote.mini_site ?? remote.miniSite);
  const hero = asRecord(remote.hero);
  const about = asRecord(remote.about);
  const servicesRoot = asRecord(remote.services);
  const servicesBlock = asRecord(servicesRoot.block ?? servicesRoot);
  const contact = asRecord(remote.contact);
  const footerRoot = asRecord(remote.footer);
  const footerBlock = asRecord(footerRoot.block ?? footerRoot);
  const footerLinks = asArray(footerRoot.links ?? remote.footerLinks);

  const serviceCards =
    asArray(remote.servicesCards).length ? asArray(remote.servicesCards) :
    asArray(servicesRoot.cards).length ? asArray(servicesRoot.cards) :
    asArray(remote.service_cards);

  const footerSocialLinks =
    asArray(remote.footerSocialLinks).length ? asArray(remote.footerSocialLinks) :
    asArray(footerRoot.social_links).length ? asArray(footerRoot.social_links) :
    asArray(footerRoot.socialLinks);

  const footerSpecialistLinks = asArray(remote.footerSpecialistLinks).length
    ? asArray(remote.footerSpecialistLinks).map((item, index) => {
        const record = asRecord(item);
        return {
          id: String(record.id ?? record.uuid ?? `specialist-${index}`),
          label: firstText(record, ["label", "title", "name"]) ?? "",
          href: firstText(record, ["url", "href", "link"]) ?? "#",
        };
      })
    : splitFooterLinks(footerLinks, "specialist");
  const footerQuickLinks = asArray(remote.footerQuickLinks).length
    ? asArray(remote.footerQuickLinks).map((item, index) => {
        const record = asRecord(item);
        return {
          id: String(record.id ?? record.uuid ?? `quick-${index}`),
          label: firstText(record, ["label", "title", "name"]) ?? "",
          href: firstText(record, ["url", "href", "link"]) ?? "#",
        };
      })
    : splitFooterLinks(footerLinks, "quick");
  const footerSupportLinks = asArray(remote.footerSupportLinks).length
    ? asArray(remote.footerSupportLinks).map((item, index) => {
        const record = asRecord(item);
        return {
          id: String(record.id ?? record.uuid ?? `support-${index}`),
          label: firstText(record, ["label", "title", "name"]) ?? "",
          href: firstText(record, ["url", "href", "link"]) ?? "#",
        };
      })
    : splitFooterLinks(footerLinks, "support");

  const displayName = pickMiniSiteDisplayName(remote, current.siteName || "Mini-site");
  const brandName = firstText(remote, ["mini_site.brand_name", "brand_name", "site_name", "siteName"]);
  const doctorName = firstText(remote, ["doctor_name", "doctor.name", "doctor.full_name", "user.name", "user.full_name"]);

  return {
    ...current,
    miniSite: {
      slug: firstText(remote, ["mini_site.slug", "slug"]) ?? current.miniSite?.slug,
      publicUrl: firstText(remote, ["mini_site.public_url", "public_url"]) ?? current.miniSite?.publicUrl,
      adminUrl: firstText(remote, ["mini_site.admin_url", "admin_url"]) ?? current.miniSite?.adminUrl,
      doctorUuid: firstText(remote, ["doctor_uuid", "doctor.uuid", "doctor.id", "user.uuid", "user.id"]) ?? current.miniSite?.doctorUuid,
      doctorName: doctorName ?? current.miniSite?.doctorName,
      brandName: brandName ?? current.miniSite?.brandName,
    },
    siteName: displayName,
    hero: {
      ...current.hero,
      titleLead: firstText(hero, ["headline", "titleLead"]) ?? current.hero.titleLead,
      titleHighlight: firstText(hero, ["highlighted_headline", "titleHighlight"]) ?? current.hero.titleHighlight,
      subtitle: firstText(hero, ["body", "subtitle"]) ?? current.hero.subtitle,
      ctaLabel: firstText(hero, ["button_text", "ctaLabel"]) ?? current.hero.ctaLabel,
      ctaHref: firstText(hero, ["button_link", "ctaHref"]) ?? current.hero.ctaHref,
      bgImage: firstText(hero, ["image_url", "background_image_url", "bgImage"]) ?? current.hero.bgImage,
    },
    about: {
      ...current.about,
      label: firstText(about, ["section_label", "label"]) ?? current.about.label,
      title: firstText(about, ["title"]) ?? current.about.title,
      body: firstText(about, ["description", "body"]) ?? current.about.body,
      image: resolveApiAssetUrl(firstText(about, ["image_url", "image"])) || current.about.image,
      mission: {
        ...current.about.mission,
        title: firstText(about, ["mission_title"]) ?? current.about.mission.title,
        body: firstText(about, ["mission_text"]) ?? current.about.mission.body,
      },
      vision: {
        ...current.about.vision,
        title: firstText(about, ["vision_title"]) ?? current.about.vision.title,
        body: firstText(about, ["vision_text"]) ?? current.about.vision.body,
      },
      ctaLabel: firstText(about, ["cta_label"]) ?? current.about.ctaLabel,
      ctaHref: firstText(about, ["cta_link"]) ?? current.about.ctaHref,
      satisfaction: {
        ...current.about.satisfaction,
        value: firstText(about, ["satisfaction_value"]) ?? current.about.satisfaction.value,
        label: firstText(about, ["satisfaction_label"]) ?? current.about.satisfaction.label,
      },
    },
    services: {
      ...current.services,
      label: firstText(servicesBlock, ["section_label", "label"]) ?? current.services.label,
      title: firstText(servicesBlock, ["section_title", "title"]) ?? current.services.title,
      items: serviceCards.length
        ? serviceCards.map((item, index) => {
            const record = asRecord(item);
            return {
              id: String(record.id ?? record.uuid ?? index),
              image: resolveApiAssetUrl(firstText(record, ["image_url", "image"])) || null,
              icon: normalizeIcon(record.icon),
              title: firstText(record, ["title", "name"]) ?? "",
              description: firstText(record, ["description", "body", "summary"]) ?? "",
              ctaLabel: firstText(record, ["button_label", "cta_label", "ctaLabel"]) ?? "",
              ctaHref: firstText(record, ["button_link", "cta_link", "ctaHref"]) ?? "",
              price_amount: normalizePriceAmount(record),
              price_label: firstText(record, ["price_label"]) ?? "",
              delivery_mode: firstText(record, ["delivery_mode"]) ?? "in_clinic",
              order: Number(record.sort_order ?? record.order ?? index),
              active: hasField(record, "is_visible") ? record.is_visible !== false : record.visible !== false,
            };
          })
        : current.services.items,
    },
    contact: {
      ...current.contact,
      email: firstText(contact, ["email"]) ?? current.contact.email,
      phone: firstText(contact, ["phone"]) ?? current.contact.phone,
      address: firstText(contact, ["address"]) ?? current.contact.address,
    },
    footer: {
      ...current.footer,
      description: firstText(footerBlock, ["description"]) ?? current.footer.description,
      copyright: firstText(footerBlock, ["copyright"]) ?? current.footer.copyright,
      availabilityText: firstText(footerBlock, ["availability_text", "availabilityText"]) ?? current.footer.availabilityText,
      bgColor: firstText(footerBlock, ["background_color", "bgColor"]) ?? current.footer.bgColor,
      socials: footerSocialLinks.length
        ? footerSocialLinks.map((item, index) => {
            const record = asRecord(item);
            return {
              id: String(record.id ?? record.uuid ?? index),
              platform: String(record.platform ?? "facebook").toLowerCase() as SocialPlatform,
              href: firstText(record, ["url", "href", "link"]) ?? "",
            };
          })
        : current.footer.socials,
      specialistLinks: footerSpecialistLinks.length ? footerSpecialistLinks : current.footer.specialistLinks,
      quickLinks: footerQuickLinks.length ? footerQuickLinks : current.footer.quickLinks,
      supportLinks: footerSupportLinks.length ? footerSupportLinks : current.footer.supportLinks,
    },
  };
}

/* ---------- Deep merge helper ---------- */

function deepMerge<T>(base: T, patch: any): T {
  if (patch == null) return base;
  if (Array.isArray(base)) {
    return (Array.isArray(patch) ? patch : base) as any;
  }
  if (typeof base === "object") {
    const out: any = { ...(base as any) };
    for (const k of Object.keys(patch)) {
      out[k] = deepMerge((base as any)[k], patch[k]);
    }
    return out;
  }
  return (patch ?? base) as T;
}

export function loadSettings(): MediCareSettings {
  try {
    const raw = localStorage.getItem(KEY_V2);
    if (raw) return deepMerge(defaultSettings, JSON.parse(raw));
    // Fallback: read legacy v1 to preserve branding/about/etc.
    const legacy = localStorage.getItem(KEY_V1);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      return deepMerge(defaultSettings, parsed);
    }
    return defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: MediCareSettings) {
  try {
    localStorage.setItem(KEY_V2, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("medicare:settings"));
  } catch (e) {
    console.error("Failed to save MediCare settings:", e);
    throw e;
  }
}

export function resetSettings() {
  localStorage.removeItem(KEY_V2);
  window.dispatchEvent(new CustomEvent("medicare:settings"));
}

export function useMediCareSettings(doctorSlug?: string): MediCareSettings {
  const [s, setS] = useState<MediCareSettings>(() =>
    typeof window === "undefined" ? defaultSettings : doctorSlug ? defaultSettings : loadSettings(),
  );
  useEffect(() => {
    let active = true;
    const hydrateRemote = async () => {
      if (!doctorSlug) return;
      try {
        const response = await api.medicare.public.bundle(doctorSlug);
        if (active) setS(mergeRemoteMiniSiteSettings(defaultSettings, response.data));
      } catch {
        if (active) setS(defaultSettings);
      }
    };

    const update = () => {
      if (doctorSlug) void hydrateRemote();
      else setS(loadSettings());
    };

    update();
    window.addEventListener("medicare:settings", update);
    window.addEventListener("storage", update);
    return () => {
      active = false;
      window.removeEventListener("medicare:settings", update);
      window.removeEventListener("storage", update);
    };
  }, [doctorSlug]);
  return s;
}

/* ---------- Color helpers ---------- */
export function hexToHslString(hex: string): string {
  const m = hex.replace("#", "");
  const bigint = parseInt(
    m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16,
  );
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
