import { useEffect, useState } from "react";

export type Faq = { id: string; q: string; a: string };
export type Testimonial = { id: string; quote: string; name: string; role: string };
export type Partner = { id: string; name: string };
export type DoctorEntry = {
  id: string;
  name: string;
  specialty?: string;
  bio?: string;
  photoDataUrl?: string | null;
};

export type HowItWorksStep = { id: string; title: string; body: string };

const makeDoctorPortrait = (name: string, accent: string, fill: string) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "DR";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Portrait of ${name}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${fill}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="72" fill="url(#bg)" />
      <circle cx="256" cy="188" r="92" fill="rgba(255,255,255,0.84)" />
      <path d="M120 416c18-74 72-112 136-112s118 38 136 112" fill="rgba(255,255,255,0.84)" />
      <rect x="172" y="282" width="168" height="18" rx="9" fill="rgba(255,255,255,0.55)" />
      <rect x="198" y="316" width="116" height="18" rx="9" fill="rgba(255,255,255,0.38)" />
      <text x="50%" y="270" text-anchor="middle" font-family="Arial, sans-serif" font-size="76" font-weight="700" fill="${accent}">${initials}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export type MediCareSettings = {
  siteName: string;
  logoDataUrl: string | null;
  primaryColor: string; // hex
  accentColor: string; // hex
  hero: {
    eyebrow: string;
    titleLead: string;
    titleHighlight: string;
    subtitle: string;
    ctaLabel: string;
  };
  about: {
    title: string;
    body: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  footerTagline: string;
  faqs: Faq[];
  testimonials: Testimonial[];
  partners: Partner[];
  doctors: DoctorEntry[];
  howItWorks: HowItWorksStep[];
};

const KEY = "medicare:settings:v1";

export const defaultSettings: MediCareSettings = {
  siteName: "MediCare",
  logoDataUrl: null,
  primaryColor: "#1F8FFF",
  accentColor: "#22C58B",
  hero: {
    eyebrow: "240+ doctors online now",
    titleLead: "See a Doctor",
    titleHighlight: "Anytime, Anywhere",
    subtitle:
      "Connect with licensed doctors via video or chat in minutes. Skip the waiting room — quality care delivered to wherever you are.",
    ctaLabel: "Book Appointment",
  },
  about: {
    title: "About MediCare",
    body: "MediCare is a modern telemedicine platform connecting patients with licensed physicians for fast, secure and affordable virtual care.",
  },
  contact: {
    email: "hello@medicare.app",
    phone: "+1 (800) 633-4227",
    address: "Available worldwide",
  },
  footerTagline: "Modern telemedicine for everyday people. Trusted, secure, available 24/7.",
  faqs: [
    {
      id: "faq-1",
      q: "What is MediCare?",
      a: "MediCare is a modern telemedicine platform connecting patients with licensed doctors for fast, secure and affordable virtual care.",
    },
  ],
  testimonials: [
    {
      id: "t-1",
      quote: "MediCare makes it easy to connect with verified healthcare professionals.",
      name: "John Doe",
      role: "Patient · Lagos",
    },
  ],
  partners: [{ id: "p-1", name: "Hallmark" }],
  doctors: [
    {
      id: "d-1",
      name: "Dr. Amina Yusuf",
      specialty: "Family Medicine",
      bio: "Warm, practical primary care for adults and children.",
      photoDataUrl: makeDoctorPortrait("Dr. Amina Yusuf", "#22c55e", "#0f766e"),
    },
    {
      id: "d-2",
      name: "Dr. Tunde Akinwale",
      specialty: "Internal Medicine",
      bio: "Experienced GP offering teleconsultations and follow-up care.",
      photoDataUrl: makeDoctorPortrait("Dr. Tunde Akinwale", "#38bdf8", "#2563eb"),
    },
    {
      id: "d-3",
      name: "Dr. Zainab Bello",
      specialty: "Pediatrics",
      bio: "Calm, reassuring pediatric care for growing families.",
      photoDataUrl: makeDoctorPortrait("Dr. Zainab Bello", "#f59e0b", "#db2777"),
    },
  ],
  howItWorks: [
    { id: "h-1", title: "Find a Doctor", body: "Search and filter by specialty and location." },
    { id: "h-2", title: "Book a Consultation", body: "Choose a time and connect via video or chat." },
    { id: "h-3", title: "Receive Care", body: "Get prescriptions, advice, and follow-ups." },
  ],
};

export function loadSettings(): MediCareSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      ...defaultSettings,
      ...parsed,
      hero: { ...defaultSettings.hero, ...(parsed.hero || {}) },
      about: { ...defaultSettings.about, ...(parsed.about || {}) },
      contact: { ...defaultSettings.contact, ...(parsed.contact || {}) },
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: MediCareSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("medicare:settings"));
}

export function resetSettings() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("medicare:settings"));
}

export function useMediCareSettings(): MediCareSettings {
  const [s, setS] = useState<MediCareSettings>(() =>
    typeof window === "undefined" ? defaultSettings : loadSettings(),
  );
  useEffect(() => {
    const update = () => setS(loadSettings());
    window.addEventListener("medicare:settings", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("medicare:settings", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return s;
}

/* ---------- color helpers ---------- */
export function hexToHslString(hex: string): string {
  const m = hex.replace("#", "");
  const bigint = parseInt(
    m.length === 3
      ? m.split("").map((c) => c + c).join("")
      : m,
    16,
  );
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
