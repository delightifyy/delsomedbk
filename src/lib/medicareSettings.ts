import { useEffect, useState } from "react";

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
