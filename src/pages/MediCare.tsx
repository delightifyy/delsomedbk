import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Stethoscope, Menu, X, Star, Video, ShieldCheck, Clock, CalendarCheck,
  Brain, Baby, Sparkles, HeartPulse, Pill, FileText, Headphones, FlaskConical,
  Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight,
  Search, Settings, Bone, Eye, Activity, Microscope, Syringe,
  Ambulance, MessageSquare, BellRing, Bot, Smartphone, Apple, Play, Quote,
  CheckCircle2, Award, Globe2, Languages, Building2, MonitorSmartphone, Users,
} from "lucide-react";
import {
  hexToHslString,
  useMediCareSettings,
} from "@/lib/medicareSettings";
import { Icon as McIcon } from "@/components/medicare-admin/icons";
import BookingFlow from "@/components/medicare/BookingFlow";
import { DOCTORS, type Doctor } from "@/data/doctors";
import aboutHospitalImg from "@/assets/about-hospital.jpg";

/* ---------- Scoped design tokens & styles ---------- */
const tokenStyles = `
.medicare-root {
  --mc-bg: 210 40% 99%;
  --mc-fg: 222 47% 11%;
  --mc-muted: 215 16% 47%;
  --mc-muted-soft: 210 30% 96%;
  --mc-border: 215 25% 91%;
  --mc-card: 0 0% 100%;
  --mc-primary: 212 88% 32%;        /* deep healthcare blue */
  --mc-primary-glow: 200 95% 48%;
  --mc-primary-fg: 0 0% 100%;
  --mc-accent: 174 72% 42%;         /* teal */
  --mc-accent-glow: 174 80% 55%;
  --mc-violet: 252 70% 60%;
  --mc-dark: 222 47% 9%;
  --mc-radius: 1.25rem;

  --mc-grad-primary: linear-gradient(135deg, hsl(var(--mc-primary)) 0%, hsl(var(--mc-primary-glow)) 60%, hsl(var(--mc-accent)) 100%);
  --mc-grad-text: linear-gradient(120deg, hsl(var(--mc-primary)) 0%, hsl(var(--mc-accent)) 100%);
  --mc-grad-soft: linear-gradient(180deg, hsl(210 100% 98%) 0%, hsl(174 50% 97%) 100%);
  --mc-grad-mesh:
     radial-gradient(at 18% 22%, hsl(var(--mc-primary)/.18) 0px, transparent 45%),
     radial-gradient(at 82% 28%, hsl(var(--mc-accent)/.16) 0px, transparent 45%),
     radial-gradient(at 50% 92%, hsl(var(--mc-violet)/.12) 0px, transparent 50%);
  --mc-grad-dark: linear-gradient(160deg, hsl(222 47% 9%) 0%, hsl(220 47% 14%) 60%, hsl(212 60% 18%) 100%);
  --mc-grad-cta-overlay: linear-gradient(120deg, hsl(212 88% 14% / .85) 0%, hsl(174 70% 18% / .55) 100%);

  --mc-shadow-card: 0 6px 24px -10px hsl(var(--mc-primary)/.18);
  --mc-shadow-elegant: 0 30px 60px -28px hsl(var(--mc-primary)/.4);
  --mc-shadow-glow: 0 0 40px -8px hsl(var(--mc-primary-glow)/.55);

  background: hsl(var(--mc-bg));
  color: hsl(var(--mc-fg));
  font-family: 'Inter', system-ui, sans-serif;
}
.medicare-root h1, .medicare-root h2, .medicare-root h3, .medicare-root h4 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  letter-spacing: -0.02em;
}
.mc-grad-primary { background: var(--mc-grad-primary); }
.mc-grad-soft    { background: var(--mc-grad-soft); }
.mc-grad-mesh    { background: var(--mc-grad-mesh); }
.mc-grad-dark    { background: var(--mc-grad-dark); }
.mc-grad-text    {
  background: var(--mc-grad-text);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.mc-shadow-card    { box-shadow: var(--mc-shadow-card); }
.mc-shadow-elegant { box-shadow: var(--mc-shadow-elegant); }
.mc-shadow-glow    { box-shadow: var(--mc-shadow-glow); }
.mc-glass {
  background: hsl(0 0% 100% / .72);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid hsl(0 0% 100% / .55);
}
.mc-glass-dark {
  background: hsl(222 47% 10% / .55);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid hsl(0 0% 100% / .12);
}
.mc-grid-pattern {
  background-image:
    linear-gradient(hsl(var(--mc-fg)/.05) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--mc-fg)/.05) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 50%, transparent 100%);
}
.mc-noise::after {
  content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .04;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>");
}
@keyframes mc-fade-up { from { opacity:0; transform:translateY(20px);} to {opacity:1; transform:none;} }
@keyframes mc-float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
@keyframes mc-pulse-glow { 0%,100%{box-shadow:0 0 0 0 hsl(var(--mc-accent)/.5);} 50%{box-shadow:0 0 0 16px hsl(var(--mc-accent)/0);} }
@keyframes mc-pulse-dot  { 0%,100%{opacity:1;} 50%{opacity:.4;} }
@keyframes mc-marquee    { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes mc-shine      { from { transform: translateX(-120%); } to { transform: translateX(220%); } }
.mc-anim-fade-up   { animation: mc-fade-up .8s cubic-bezier(.4,0,.2,1) both; }
.mc-anim-float     { animation: mc-float 6s ease-in-out infinite; }
.mc-anim-pulse-glow{ animation: mc-pulse-glow 2.2s ease-out infinite; }
.mc-anim-pulse-dot { animation: mc-pulse-dot 1.6s ease-in-out infinite; }
.mc-marquee        { animation: mc-marquee 28s linear infinite; }
.mc-shine::before  {
  content:""; position:absolute; inset:0; background: linear-gradient(110deg, transparent 30%, hsl(0 0% 100% / .35) 50%, transparent 70%);
  transform: translateX(-120%); animation: mc-shine 4s ease-in-out infinite;
}
.mc-card-hover { transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s ease; }
.mc-card-hover:hover { transform: translateY(-6px); box-shadow: var(--mc-shadow-elegant); }
`;

/* ---------- Data ---------- */
const HERO_VIDEO = "https://videos.pexels.com/video-files/4124426/4124426-uhd_2560_1440_25fps.mp4";
const CTA_VIDEO  = "https://videos.pexels.com/video-files/7088526/7088526-uhd_2560_1440_25fps.mp4";

const navLinks = [
  { href: "#top", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "/health-news", label: "Blogs" },
  { href: "/contact", label: "Contact Us" },
];

const quickAccess = [
  { icon: Ambulance,  title: "Emergency Care",     desc: "24/7 immediate medical support",      tone: "from-rose-500 to-orange-500" },
  { icon: Search,     title: "Find a Doctor",      desc: "Search verified specialists",         tone: "from-sky-500 to-cyan-500" },
  { icon: CalendarCheck, title: "Book Consultation", desc: "Same-day virtual appointments",     tone: "from-teal-500 to-emerald-500" },
  { icon: FlaskConical, title: "Laboratory Tests", desc: "Order labs & get results online",     tone: "from-violet-500 to-indigo-500" },
  { icon: FileText,   title: "Medical Records",    desc: "Access your secure health history",   tone: "from-blue-600 to-blue-400" },
  { icon: Pill,       title: "Online Pharmacy",    desc: "Prescriptions delivered to you",      tone: "from-amber-500 to-pink-500" },
];

const specialties = [
  { icon: HeartPulse, name: "Cardiology",        img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80" },
  { icon: Brain,      name: "Neurology",         img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop&q=80" },
  { icon: Bone,       name: "Orthopedics",       img: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80" },
  { icon: Baby,       name: "Pediatrics",        img: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&auto=format&fit=crop&q=80" },
  { icon: Sparkles,   name: "Dermatology",       img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop&q=80" },
  { icon: Microscope, name: "Oncology",          img: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&auto=format&fit=crop&q=80" },
  { icon: Syringe,    name: "Gynecology",        img: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&auto=format&fit=crop&q=80" },
  { icon: Stethoscope,name: "General Medicine",  img: "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=800&auto=format&fit=crop&q=80" },
];

// services / reasons content now comes from settings (admin-managed)

const reasons = [
  { icon: ShieldCheck, title: "Certified Specialists", desc: "Every doctor is board-licensed and verified." },
  { icon: Bot,         title: "Advanced Technology",   desc: "AI-assisted triage and modern clinical tools." },
  { icon: Clock,       title: "Fast Scheduling",       desc: "Book a doctor in under 60 seconds." },
  { icon: FileText,    title: "Digital Records",       desc: "Your full medical history, encrypted and accessible." },
  { icon: Headphones,  title: "24/7 Patient Support",  desc: "Real humans available day and night." },
  { icon: Globe2,      title: "International Standards", desc: "Care that meets global healthcare benchmarks." },
];

const stats = [
  { value: "150+",    label: "Specialists" },
  { value: "98%",     label: "Patient Satisfaction" },
  { value: "1M+",     label: "Consultations" },
  { value: "24/7",    label: "Live Care" },
];

const doctors = [
  {
    name: "Dr. Amara Okafor",
    specialty: "Cardiologist",
    years: 12,
    rating: 4.9,
    fee: 75,
    next: "Today, 2:30 PM",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Dr. Daniel Carter",
    specialty: "Neurologist",
    years: 15,
    rating: 4.8,
    fee: 90,
    next: "Tomorrow, 10:00 AM",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Dr. Priya Sharma",
    specialty: "Pediatrician",
    years: 9,
    rating: 5.0,
    fee: 60,
    next: "Today, 4:15 PM",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Dr. Tunde Bello",
    specialty: "General Practice",
    years: 11,
    rating: 4.9,
    fee: 55,
    next: "Today, 6:00 PM",
    img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80",
  },
];

const testimonials = [
  {
    quote: "I consulted a cardiologist from my living room within 12 minutes. Prescription delivered the same evening. Truly futuristic care.",
    name: "Emma Thompson",
    loc: "Patient · Seattle, WA",
    img: "/mental-health-support.jpg",
  },
  {
    quote: "As a busy parent, having a pediatrician available at 11 PM for my daughter changed how I think about healthcare.",
    name: "Michael Rodriguez",
    loc: "Patient · Austin, TX",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  },
  {
    quote: "The doctors actually listen. The follow-up is seamless and my full record is in one place. I won't go back.",
    name: "Adaeze Nwosu",
    loc: "Patient · Lagos, NG",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
  },
];

const partners = [
  "Hallmark", "Hygeia", "Bastion", "Ilera Eko", "Reliance HMO", "Avon", "AXA Mansard", "Total Health",
];

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const buildAppointmentDates = (doctor: Doctor) => {
  const byDay = new Map(doctor.availability.map((day) => [day.day, day.slots]));
  const dates: Array<{ value: string; label: string; day: string; slots: string[] }> = [];
  const today = new Date();

  for (let offset = 0; offset < 21; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dayName = date.toLocaleDateString(undefined, { weekday: "long" });
    const slots = byDay.get(dayName) ?? [];
    if (slots.length > 0) {
      dates.push({ value: formatDateValue(date), label: formatDateLabel(date), day: dayName, slots });
    }
  }

  return dates;
};

const inputClass =
  "w-full rounded-2xl border border-[hsl(var(--mc-border))] bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[hsl(var(--mc-primary))] focus:ring-4 focus:ring-[hsl(var(--mc-primary)/.12)]";

const AppointmentPopup = ({
  doctor,
  open,
  onClose,
  siteName,
}: {
  doctor: Doctor;
  open: boolean;
  onClose: () => void;
  siteName: string;
}) => {
  const appointmentDates = useMemo(() => buildAppointmentDates(doctor), [doctor]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [payment, setPayment] = useState<"pay-now" | "hmo" | "subscription">("pay-now");
  const [confirmed, setConfirmed] = useState(false);
  const [patient, setPatient] = useState({
    fullName: "",
    email: "",
    phone: "",
    reason: "",
  });

  const activeDate = appointmentDates.find((date) => date.value === selectedDate) ?? appointmentDates[0];
  const availableSlots = activeDate?.slots ?? [];

  useEffect(() => {
    if (!open) return;
    setSelectedDate((current) =>
      appointmentDates.some((date) => date.value === current) ? current : appointmentDates[0]?.value ?? "",
    );
  }, [appointmentDates, open]);

  useEffect(() => {
    if (!open) return;
    setSelectedSlot((current) => (availableSlots.includes(current) ? current : availableSlots[0] ?? ""));
  }, [availableSlots, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const submitAppointment = (event: FormEvent) => {
    event.preventDefault();
    setConfirmed(true);
  };

  const closePopup = () => {
    setConfirmed(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[hsl(222_47%_8%/.72)] px-3 py-4 backdrop-blur-xl sm:px-6">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Close appointment form" onClick={closePopup} />
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_90px_-28px_hsl(var(--mc-primary)/.55)] max-h-[92vh]">
        <div className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[0.9fr_1.25fr]">
          <aside className="relative min-h-[240px] overflow-hidden bg-[hsl(var(--mc-dark))] p-6 text-white sm:p-8">
            <div className="absolute inset-0 mc-grad-mesh opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--mc-primary)/.88)] via-[hsl(var(--mc-dark)/.9)] to-[hsl(var(--mc-accent)/.72)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <Link to={`/doctor-portal?doctor=${doctor.id}`} className="inline-flex items-center gap-2.5">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
                    <Stethoscope className="h-5 w-5" />
                  </span>
                  <span className="font-display text-xl font-bold">{siteName}</span>
                </Link>
                <button
                  type="button"
                  onClick={closePopup}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/20"
                  aria-label="Close appointment form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-12">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--mc-accent-glow))]" /> Verified practice
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight">{doctor.name}</h2>
                <p className="mt-2 text-white/75">{doctor.specialty} in {doctor.city}, {doctor.state}</p>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-white/60">Consultation</p>
                    <p className="mt-1 font-display text-2xl font-bold">N{doctor.consultationFee.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-white/60">Experience</p>
                    <p className="mt-1 font-display text-2xl font-bold">{doctor.yearsExperience}+ yrs</p>
                  </div>
                </div>

                <div className="mt-7 rounded-3xl bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Selected slot</p>
                  <p className="mt-2 text-sm text-white/85">{activeDate?.label ?? "Date"} at {selectedSlot || "Time"}</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="bg-[linear-gradient(180deg,hsl(210_100%_99%)_0%,white_100%)] p-5 sm:p-8">
            {confirmed ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[hsl(var(--mc-accent)/.14)] text-[hsl(var(--mc-accent))]">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h3 className="mt-5 font-display text-3xl font-bold">Appointment requested</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[hsl(var(--mc-muted))]">
                  {doctor.name}'s practice will confirm {patient.fullName || "your"} appointment for {activeDate?.label} at {selectedSlot}.
                </p>
                <button
                  type="button"
                  onClick={closePopup}
                  className="mt-8 inline-flex items-center justify-center rounded-full mc-grad-primary px-6 py-3 text-sm font-semibold text-white mc-shadow-glow"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitAppointment} className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--mc-primary))]">Book appointment</p>
                    <h3 className="mt-2 font-display text-3xl font-bold">Choose your visit</h3>
                  </div>
                  <button
                    type="button"
                    onClick={closePopup}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[hsl(var(--mc-border))] bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
                    aria-label="Close appointment form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Date</label>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {appointmentDates.slice(0, 4).map((date) => (
                      <button
                        key={date.value}
                        type="button"
                        onClick={() => setSelectedDate(date.value)}
                        className={`rounded-2xl border p-3 text-left transition ${
                          selectedDate === date.value
                            ? "border-[hsl(var(--mc-primary))] bg-[hsl(var(--mc-primary)/.08)] text-[hsl(var(--mc-primary))]"
                            : "border-[hsl(var(--mc-border))] bg-white hover:border-[hsl(var(--mc-primary)/.45)]"
                        }`}
                      >
                        <span className="block text-sm font-bold">{date.label}</span>
                        <span className="mt-1 block text-xs text-slate-500">{date.day}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Time</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          selectedSlot === slot
                            ? "border-[hsl(var(--mc-accent))] bg-[hsl(var(--mc-accent))] text-white"
                            : "border-[hsl(var(--mc-border))] bg-white text-slate-700 hover:border-[hsl(var(--mc-accent)/.55)]"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Full name</span>
                    <input
                      required
                      value={patient.fullName}
                      onChange={(event) => setPatient((current) => ({ ...current, fullName: event.target.value }))}
                      className={`${inputClass} mt-2`}
                      placeholder="Your name"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Phone</span>
                    <input
                      required
                      value={patient.phone}
                      onChange={(event) => setPatient((current) => ({ ...current, phone: event.target.value }))}
                      className={`${inputClass} mt-2`}
                      placeholder="+234..."
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Email</span>
                    <input
                      required
                      type="email"
                      value={patient.email}
                      onChange={(event) => setPatient((current) => ({ ...current, email: event.target.value }))}
                      className={`${inputClass} mt-2`}
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reason for visit</span>
                    <textarea
                      value={patient.reason}
                      onChange={(event) => setPatient((current) => ({ ...current, reason: event.target.value }))}
                      className={`${inputClass} mt-2 min-h-24 resize-none`}
                      placeholder="Briefly describe the concern"
                    />
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Payment</label>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {[
                      { value: "pay-now", label: "Pay now" },
                      { value: "hmo", label: "HMO" },
                      { value: "subscription", label: "Plan" },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPayment(method.value as typeof payment)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          payment === method.value
                            ? "border-[hsl(var(--mc-primary))] bg-[hsl(var(--mc-primary))] text-white"
                            : "border-[hsl(var(--mc-border))] bg-white text-slate-700 hover:border-[hsl(var(--mc-primary)/.45)]"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-3xl border border-[hsl(var(--mc-border))] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total</p>
                    <p className="font-display text-2xl font-bold">N{doctor.consultationFee.toLocaleString()}</p>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full mc-grad-primary px-6 py-3 text-sm font-semibold text-white mc-shadow-glow transition hover:opacity-95"
                  >
                    Confirm appointment
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */
const MediCare = () => {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const settings = useMediCareSettings();
  const selectedDoctorId = searchParams.get("doctor");
  const selectedDoctor = useMemo(
    () => DOCTORS.find((doctor) => doctor.id === selectedDoctorId) ?? DOCTORS[0],
    [selectedDoctorId],
  );

  const themeStyle = useMemo(
    () =>
      ({
        ["--mc-primary" as string]: hexToHslString(settings.primaryColor),
        ["--mc-accent" as string]: hexToHslString(settings.accentColor),
      }) as React.CSSProperties,
    [settings.primaryColor, settings.accentColor],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.title = settings.seo.pageTitle || `${settings.siteName} — Advanced Healthcare`;
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", settings.seo.metaDescription);

    const kw = document.querySelector('meta[name="keywords"]') || (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "keywords"); document.head.appendChild(m); return m;
    })();
    kw.setAttribute("content", settings.seo.keywords);

    if (settings.seo.favicon) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = settings.seo.favicon;
    }

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Hospital",
      name: settings.siteName,
      description: settings.seo.metaDescription,
      url: typeof window !== "undefined" ? window.location.href : "",
      telephone: settings.contact.phone,
      medicalSpecialty: ["Cardiology", "Neurology", "Pediatrics", "Dermatology", "Oncology"],
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "12480" },
    });
    document.head.appendChild(ld);
    return () => { document.head.removeChild(ld); };
  }, [settings.siteName, settings.contact.phone]);

  return (
    <div className="medicare-root min-h-screen relative overflow-x-hidden" style={themeStyle}>
      <style>{tokenStyles}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" />

      {/* ============ NAVBAR ============ */}
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled ? "mc-glass mc-shadow-card" : "bg-transparent"}`}>
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-2.5 shrink-0">
            <span className="grid place-items-center h-10 w-10 rounded-2xl mc-grad-primary mc-shadow-glow overflow-hidden">
              {settings.logoDataUrl ? (
                <img src={settings.logoDataUrl} alt={`${settings.siteName} logo`} className="h-full w-full object-cover" />
              ) : (
                <Stethoscope className="h-5 w-5 text-white" />
              )}
            </span>
            <span className="font-display font-bold text-xl tracking-tight">{settings.siteName}</span>
          </a>

          <ul className="hidden lg:flex items-center gap-1 text-sm font-semibold text-white">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="px-3 py-2 rounded-full inline-flex items-center gap-1 hover:text-[hsl(var(--mc-primary))] transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className="hidden lg:inline-flex items-center gap-2 rounded-full mc-grad-primary text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition mc-shadow-card"
          >
            Book Appointment <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden grid place-items-center h-10 w-10 rounded-full mc-glass"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div className="lg:hidden mx-4 mb-3 mc-glass mc-shadow-card rounded-3xl p-5 mc-anim-fade-up">
            <ul className="grid gap-1 text-base font-medium">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl hover:bg-[hsl(var(--mc-muted-soft))]">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* ============ HERO ============ */}
      <section id="top" className="relative -mt-16 sm:-mt-20 min-h-[100svh] flex items-center pt-28 pb-20 overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO}
          autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=1920&auto=format&fit=crop&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(212_88%_10%/.9)] via-[hsl(212_70%_18%/.75)] to-[hsl(174_60%_22%/.6)]" />
        <div className="absolute inset-0 mc-grid-pattern opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 text-white">
            <span className="inline-flex items-center gap-2 rounded-full mc-glass-dark px-4 py-1.5 text-xs sm:text-sm font-semibold mc-anim-fade-up">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--mc-accent-glow))] mc-anim-pulse-dot" />
              Live 24/7
            </span>

            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-balance mc-anim-fade-up">
              Advanced Healthcare<br />
              <span className="bg-gradient-to-r from-white via-[hsl(174_80%_75%)] to-[hsl(200_95%_75%)] bg-clip-text text-transparent">
                Designed Around You
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-white/80 mc-anim-fade-up">
              Book Appointments, Consult Certified Doctors, Receive World class Healthcare Digitally and physically.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 mc-anim-fade-up">
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="inline-flex justify-center items-center gap-2 rounded-full mc-grad-primary text-white px-7 py-3.5 text-sm font-semibold mc-shadow-glow hover:opacity-95 transition"
              >
                Book Appointment <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>

          {/* Floating dashboard cards */}
          <div className="hidden lg:block lg:col-span-5 relative h-[520px]">
            <div className="absolute top-4 right-0 w-72 mc-glass mc-shadow-elegant rounded-3xl p-5 mc-anim-float">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-11 w-11 rounded-2xl mc-grad-primary text-white">
                  <Video className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-[hsl(var(--mc-muted))]">In session</p>
                  <p className="text-sm font-bold">Dr. Amara Okafor</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-rose-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mc-anim-pulse-dot" /> LIVE
                </span>
              </div>
              <div className="mt-4 h-24 rounded-2xl overflow-hidden bg-[hsl(var(--mc-muted-soft))]">
                <img src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&auto=format&fit=crop&q=80" alt="Live telemedicine consultation" className="h-full w-full object-cover" />
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-xl bg-[hsl(var(--mc-muted-soft))] py-2 text-xs font-semibold">Mute</button>
                <button className="flex-1 rounded-xl mc-grad-primary text-white py-2 text-xs font-semibold">Join</button>
              </div>
            </div>

            <div className="absolute top-44 left-0 w-64 mc-glass mc-shadow-elegant rounded-3xl p-5 mc-anim-float" style={{ animationDelay: ".4s" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--mc-primary))]">Today's Schedule</p>
              {[
                { t: "09:30", n: "Cardiology check-in" },
                { t: "11:15", n: "Pediatric video call" },
                { t: "14:00", n: "Lab results review" },
              ].map((row) => (
                <div key={row.t} className="mt-3 flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs font-bold text-[hsl(var(--mc-primary))]">{row.t}</span>
                  <span className="flex-1 truncate">{row.n}</span>
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--mc-accent))]" />
                </div>
              ))}
            </div>

            <div className="absolute bottom-6 right-8 w-60 mc-glass mc-shadow-elegant rounded-3xl p-5 mc-anim-float" style={{ animationDelay: ".7s" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[hsl(var(--mc-muted))]">Heart rate</p>
                <HeartPulse className="h-4 w-4 text-rose-500" />
              </div>
              <p className="mt-1 font-display text-3xl font-bold">72<span className="text-sm font-medium text-[hsl(var(--mc-muted))] ml-1">bpm</span></p>
              <svg viewBox="0 0 200 40" className="mt-2 w-full h-10 text-[hsl(var(--mc-primary))]">
                <polyline fill="none" stroke="currentColor" strokeWidth="2" points="0,20 30,20 38,8 46,32 54,20 100,20 110,4 120,36 130,20 200,20" />
              </svg>
            </div>

            <div className="absolute bottom-32 left-10 w-56 mc-glass mc-shadow-elegant rounded-3xl p-4 mc-anim-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--mc-accent))]" />
                <p className="text-xs font-bold">98% Patient Satisfaction</p>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[hsl(var(--mc-muted-soft))] overflow-hidden">
                <div className="h-full w-[98%] mc-grad-primary rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Marquee partners */}
        <div className="absolute bottom-0 inset-x-0 py-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="overflow-hidden">
            <div className="mc-marquee flex gap-12 whitespace-nowrap text-white/60 text-xs sm:text-sm font-semibold tracking-widest uppercase w-max">
              {[...partners, ...partners].map((p, i) => (
                <span key={i} className="inline-flex items-center gap-3"><Award className="h-4 w-4" /> {p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="relative rounded-[2rem] overflow-hidden mc-shadow-elegant aspect-[4/5]">
              <img
                src={aboutHospitalImg}
                alt="Modern hospital facility"
                width={1000}
                height={1200}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-6 left-6 sm:left-10 bg-[hsl(var(--mc-card))] rounded-2xl px-6 py-4 mc-shadow-elegant border border-[hsl(var(--mc-border))] flex items-center gap-4">
              <span className="grid place-items-center h-12 w-12 rounded-xl bg-[hsl(var(--mc-primary)/.1)] text-[hsl(var(--mc-primary))]">
                <Users className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold leading-none">98%</p>
                <p className="text-xs text-[hsl(var(--mc-muted))] mt-1">Patient satisfaction</p>
              </div>
            </div>
          </div>

          {/* Content side */}
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">About MediCare</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold leading-[1.1]">
              {settings.about.title}
            </h2>
            <p className="mt-6 text-base sm:text-lg text-[hsl(var(--mc-muted))] leading-relaxed whitespace-pre-line">
              {settings.about.body}
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-lg font-bold">Our Mission</h3>
                <p className="mt-2 text-sm text-[hsl(var(--mc-muted))] leading-relaxed">
                  Provide accessible, world-class care that respects every patient as a person.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Our Vision</h3>
                <p className="mt-2 text-sm text-[hsl(var(--mc-muted))] leading-relaxed">
                  Be the most trusted healthcare brand on the continent — a benchmark for excellence.
                </p>
              </div>
            </div>

            <a href="#services" className="mt-10 inline-flex items-center gap-2 font-semibold text-[hsl(var(--mc-primary))] hover:gap-3 transition-all">
              Read our full story <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden mc-shadow-elegant aspect-[4/5] sm:aspect-[5/6]">
              <img src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1200&auto=format&fit=crop&q=80" alt="Doctor attending to a patient" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--mc-dark)/.7)] via-transparent to-transparent" />
            </div>
          </div>

          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">Why Choose Us</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">Care you can <span className="mc-grad-text">truly trust</span></h2>
            <p className="mt-4 text-[hsl(var(--mc-muted))] max-w-xl">Built on decades of clinical excellence and powered by modern technology, MediCare delivers a healthcare experience that feels human at every step.</p>

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {reasons.map((r, i) => (
                <div key={r.title} className="flex gap-4 mc-anim-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                  <span className="shrink-0 grid place-items-center h-12 w-12 rounded-2xl mc-grad-primary text-white mc-shadow-glow">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{r.title}</h3>
                    <p className="mt-1 text-sm text-[hsl(var(--mc-muted))]">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="services" className="py-20 sm:py-28 mc-grad-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">{settings.services.label}</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">{settings.services.title}</h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {settings.services.items.filter((x) => x.active).sort((a, b) => a.order - b.order).map((svc) => (
              <div key={svc.id} className="group bg-[hsl(var(--mc-card))] rounded-3xl overflow-hidden border border-[hsl(var(--mc-border))] mc-shadow-card mc-card-hover">
                {svc.image && (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={svc.image} alt={svc.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute bottom-3 left-3 grid place-items-center h-12 w-12 rounded-2xl mc-grad-primary text-white mc-shadow-glow">
                      <McIcon name={svc.icon} className="h-5 w-5" />
                    </span>
                  </div>
                )}
                <div className="p-7">
                  {!svc.image && (
                    <span className="inline-grid place-items-center h-12 w-12 rounded-2xl mc-grad-primary text-white mc-shadow-glow mb-4">
                      <McIcon name={svc.icon} className="h-5 w-5" />
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold">{svc.title}</h3>
                  <p className="mt-2 text-sm text-[hsl(var(--mc-muted))] leading-relaxed">{svc.description}</p>
                  {svc.ctaLabel && svc.ctaHref && (
                    <a href={svc.ctaHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--mc-primary))]">
                      {svc.ctaLabel} <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TELEMEDICINE ============ */}
      <section id="telemedicine" className="relative py-20 sm:py-28 mc-grad-dark text-white overflow-hidden mc-noise">
        <div className="absolute inset-0 mc-grid-pattern opacity-20" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[hsl(var(--mc-primary)/.4)] blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[hsl(var(--mc-accent)/.35)] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-2 rounded-full mc-glass-dark px-4 py-1.5 text-xs font-semibold">
              <Bot className="h-3.5 w-3.5 text-[hsl(var(--mc-accent-glow))]" /> AI-powered Telemedicine
            </span>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl font-bold leading-tight">
              Virtual Care Designed <br />
              <span className="bg-gradient-to-r from-[hsl(174_80%_75%)] to-[hsl(200_95%_75%)] bg-clip-text text-transparent">Around Your Schedule</span>
            </h2>
            <p className="mt-4 text-white/75 max-w-lg">Access smarter healthcare through crystal-clear virtual consultations, intelligent symptom guidance, secure prescriptions, and connected patient monitoring in one seamless experience.</p>

            <ul className="mt-8 space-y-3">
              {[
                "HD video & encrypted chat consultations",
                "Get Connected to Care Within 60 Seconds",
                "Real-time vitals monitoring",
                "Digital prescriptions & e-referrals",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm">
                  <span className="grid place-items-center h-7 w-7 rounded-full bg-[hsl(var(--mc-accent)/.18)] text-[hsl(var(--mc-accent-glow))]">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#cta" className="inline-flex items-center gap-2 rounded-full mc-grad-primary text-white px-6 py-3 text-sm font-semibold mc-shadow-glow hover:opacity-95 transition">
                Start consultation <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Phone mockup + dashboard */}
          <div className="lg:col-span-6 relative h-[560px]">
            {/* Dashboard panel */}
            <div className="absolute top-0 right-0 w-[88%] mc-glass-dark mc-shadow-elegant rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-10 w-10 rounded-xl mc-grad-primary"><MonitorSmartphone className="h-5 w-5" /></span>
                  <div>
                    <p className="text-sm font-bold">Care Dashboard</p>
                    <p className="text-[11px] text-white/60">Live overview · today</p>
                  </div>
                </div>
                <BellRing className="h-5 w-5 text-white/60" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { l: "Appts", v: "12", c: "from-sky-400 to-cyan-400" },
                  { l: "Patients", v: "284", c: "from-teal-400 to-emerald-400" },
                  { l: "Refills", v: "37", c: "from-violet-400 to-fuchsia-400" },
                ].map((k) => (
                  <div key={k.l} className="rounded-2xl bg-white/5 p-3 border border-white/10">
                    <p className={`font-display text-2xl font-bold bg-gradient-to-r ${k.c} bg-clip-text text-transparent`}>{k.v}</p>
                    <p className="text-[11px] text-white/60">{k.l}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-white/5 p-4 border border-white/10">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Patient activity</span><span>7 days</span>
                </div>
                <svg viewBox="0 0 240 80" className="mt-3 w-full h-20">
                  <defs>
                    <linearGradient id="ln" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--mc-accent-glow))" stopOpacity=".5" />
                      <stop offset="100%" stopColor="hsl(var(--mc-accent-glow))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 C30,40 50,50 70,30 C90,15 110,55 140,40 C170,25 190,55 240,20 L240,80 L0,80 Z" fill="url(#ln)" />
                  <path d="M0,60 C30,40 50,50 70,30 C90,15 110,55 140,40 C170,25 190,55 240,20" fill="none" stroke="hsl(var(--mc-accent-glow))" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Phone */}
            <div className="absolute bottom-0 left-0 w-56 sm:w-60 rounded-[2.5rem] bg-[hsl(222_47%_6%)] p-2 mc-shadow-elegant border border-white/10 mc-anim-float">
              <div className="rounded-[2rem] overflow-hidden bg-white aspect-[9/19]">
                <div className="relative h-full w-full">
                  <img src="/virtual-care-doctor.jpg" alt="Telemedicine app" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[hsl(212_88%_20%/.7)] via-transparent to-[hsl(212_88%_15%/.85)]" />
                  <div className="absolute inset-x-3 top-3 mc-glass-dark rounded-xl px-3 py-2 text-white text-[10px] font-semibold flex items-center justify-between">
                    <span>Dr. Carter</span><span className="text-rose-300">● LIVE</span>
                  </div>
                  <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2">
                    {[Video, MessageSquare, Phone].map((I, i) => (
                      <button key={i} className="grid place-items-center h-10 rounded-xl mc-glass-dark text-white"><I className="h-4 w-4" /></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">Patient Stories</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">Real people. <span className="mc-grad-text">Real outcomes.</span></h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <figure key={t.name} className={`relative bg-[hsl(var(--mc-card))] rounded-3xl p-7 border border-[hsl(var(--mc-border))] mc-shadow-card mc-card-hover ${i === 1 ? "md:translate-y-6" : ""}`}>
                <Quote className="absolute top-5 right-5 h-10 w-10 text-[hsl(var(--mc-primary)/.12)]" />
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-4 font-display text-lg leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-[hsl(var(--mc-border))]">
                  <img src={t.img} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-[hsl(var(--mc-muted))]">{t.loc}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>


      {/* ============ FINAL CTA ============ */}
      <section id="cta" className="relative py-24 sm:py-32 overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/healthcare-human.jpg"
          alt="Caring nurse with elderly patient"
        />
        <div className="absolute inset-0" style={{ background: "var(--mc-grad-cta-overlay)" }} />
        <div className="absolute inset-0 mc-grid-pattern opacity-20" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center text-white">
          <span className="inline-flex items-center gap-2 rounded-full mc-glass-dark px-4 py-1.5 text-xs font-semibold">
            <HeartPulse className="h-3.5 w-3.5 text-rose-400" /> Care that fits your life
          </span>
          <h2 className="mt-6 font-display text-4xl sm:text-6xl font-bold leading-tight">Healthcare that <br /><span className="bg-gradient-to-r from-white to-[hsl(174_80%_75%)] bg-clip-text text-transparent">feels human</span></h2>
          <p className="mt-5 max-w-xl mx-auto text-white/85">Experience trusted digital healthcare built around your comfort, dignity and safety.</p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#doctors" className="inline-flex justify-center items-center gap-2 rounded-full bg-white text-[hsl(var(--mc-primary))] px-7 py-3.5 text-sm font-bold hover:bg-white/95 transition">
              Get Started <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#telemedicine" className="inline-flex justify-center items-center gap-2 rounded-full mc-glass-dark text-white px-7 py-3.5 text-sm font-bold hover:bg-white/15 transition">
              <Video className="h-4 w-4" /> Talk to a Doctor
            </a>
          </div>
        </div>
      </section>



      {/* ============ FOOTER (premium dark) ============ */}
      <footer className="relative mc-grad-dark text-white pt-20">
        <div className="absolute inset-0 mc-grid-pattern opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          {/* Columns */}
          <div className="grid gap-10 md:grid-cols-5 pb-12">
            <div className="md:col-span-2">
              <a href="#top" className="flex items-center gap-2.5">
                <span className="grid place-items-center h-10 w-10 rounded-2xl mc-grad-primary mc-shadow-glow overflow-hidden">
                  {settings.logoDataUrl ? (
                    <img src={settings.logoDataUrl} alt={`${settings.siteName} logo`} className="h-full w-full object-cover" />
                  ) : (
                    <Stethoscope className="h-5 w-5 text-white" />
                  )}
                </span>
                <span className="font-display font-bold text-xl">{settings.siteName}</span>
              </a>
              <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-sm">{settings.footerTagline}</p>
              <div className="mt-5 flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((I, i) => (
                  <a key={i} href="#" aria-label="Social link" className="grid place-items-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition">
                    <I className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: "Quick Links", items: [
                { label: "Services", href: "#services" },
                { label: "About", href: "#about" },
                { label: "Blogs", href: "#blogs" },
                { label: "Contact Us", href: "#contact" },
                { label: "FAQ", href: "#faq" },
              ]},
              { title: "Support", items: [
                { label: "Privacy Policy", href: "#" },
                { label: "Terms", href: "#" },
              ]},
            ].map((c) => (
              <div key={c.title}>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider">{c.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-white/70">
                  {c.items.map((it) => (<li key={it.label}><a href={it.href} className="hover:text-white transition">{it.label}</a></li>))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10">
            <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
              <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
              <div className="flex items-center gap-3">
                
                <Link to="/doctor-portal/admin" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 hover:text-white hover:border-white/40 transition">
                  <Settings className="h-3.5 w-3.5" /> Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <BookingFlow
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
};

export default MediCare;
