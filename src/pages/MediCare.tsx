import { useEffect, useState } from "react";
import {
  Stethoscope, Menu, X, Star, Video, ShieldCheck, Clock, CalendarCheck,
  Brain, Baby, Sparkles, HeartPulse, Pill, FileText, Smartphone, Headphones,
  Mail, Phone, Facebook, Twitter, Instagram, Linkedin, ArrowRight, Check,
} from "lucide-react";
import heroImg from "@/assets/medicare-hero.jpg";
import doc1 from "@/assets/medicare-doc1.jpg";
import doc2 from "@/assets/medicare-doc2.jpg";
import doc3 from "@/assets/medicare-doc3.jpg";

/* ---------- Local design tokens (scoped to this page) ---------- */
const tokenStyles = `
.medicare-root {
  --mc-bg: 220 30% 99%;
  --mc-fg: 230 40% 10%;
  --mc-muted: 230 15% 45%;
  --mc-muted-soft: 230 20% 96%;
  --mc-border: 230 25% 92%;
  --mc-card: 0 0% 100%;
  --mc-primary: 210 90% 50%;
  --mc-primary-glow: 205 95% 65%;
  --mc-primary-fg: 0 0% 100%;
  --mc-accent: 160 65% 45%;
  --mc-accent-glow: 160 70% 60%;
  --mc-radius: 1rem;

  --mc-grad-primary: linear-gradient(135deg, hsl(var(--mc-primary)), hsl(var(--mc-primary-glow)));
  --mc-grad-hero: linear-gradient(140deg, hsl(210 100% 97%) 0%, hsl(160 60% 96%) 60%, hsl(220 30% 99%) 100%);
  --mc-grad-mesh:
     radial-gradient(at 20% 20%, hsl(var(--mc-primary)/.18) 0px, transparent 45%),
     radial-gradient(at 85% 30%, hsl(var(--mc-accent)/.15) 0px, transparent 45%),
     radial-gradient(at 50% 90%, hsl(var(--mc-primary-glow)/.18) 0px, transparent 50%);
  --mc-grad-accent: linear-gradient(135deg, hsl(var(--mc-accent)), hsl(var(--mc-accent-glow)));

  --mc-shadow-card: 0 4px 20px -8px hsl(var(--mc-primary)/.18);
  --mc-shadow-elegant: 0 30px 60px -30px hsl(var(--mc-primary)/.35);
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
.mc-grad-hero    { background: var(--mc-grad-hero); }
.mc-grad-mesh    { background: var(--mc-grad-mesh); }
.mc-grad-accent  { background: var(--mc-grad-accent); }
.mc-grad-text    {
  background: var(--mc-grad-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.mc-shadow-card    { box-shadow: var(--mc-shadow-card); }
.mc-shadow-elegant { box-shadow: var(--mc-shadow-elegant); }
.mc-shadow-glow    { box-shadow: var(--mc-shadow-glow); }
.mc-glass {
  background: hsl(0 0% 100% / .65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid hsl(0 0% 100% / .6);
}
.mc-grid-pattern {
  background-image:
    linear-gradient(hsl(var(--mc-fg)/.04) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--mc-fg)/.04) 1px, transparent 1px);
  background-size: 36px 36px;
}
@keyframes mc-fade-up { from { opacity:0; transform:translateY(16px);} to {opacity:1; transform:none;} }
@keyframes mc-float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
@keyframes mc-pulse-glow { 0%,100%{box-shadow:0 0 0 0 hsl(var(--mc-accent)/.55);} 50%{box-shadow:0 0 0 14px hsl(var(--mc-accent)/0);} }
@keyframes mc-heart  { 0%,100%{transform:scale(1);} 25%{transform:scale(1.15);} 50%{transform:scale(.95);} 75%{transform:scale(1.1);} }
@keyframes mc-orbit  { from{transform:rotate(0) translateX(60px) rotate(0);} to{transform:rotate(360deg) translateX(60px) rotate(-360deg);} }
.mc-anim-fade-up   { animation: mc-fade-up .7s cubic-bezier(.4,0,.2,1) both; }
.mc-anim-float     { animation: mc-float 6s ease-in-out infinite; }
.mc-anim-pulse-glow{ animation: mc-pulse-glow 2s ease-out infinite; }
.mc-anim-heart     { animation: mc-heart 1.4s ease-in-out infinite; }
`;

/* ---------- Data ---------- */
const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#services", label: "Services" },
  { href: "#doctors", label: "Doctors" },
  { href: "#reviews", label: "Reviews" },
];

const services = [
  { icon: Stethoscope, title: "General Practice", desc: "Everyday care, checkups and common conditions from licensed GPs." },
  { icon: Brain, title: "Mental Health", desc: "Confidential therapy and psychiatry sessions, on your schedule." },
  { icon: Baby, title: "Pediatrics", desc: "Trusted children's care with experienced pediatricians on demand." },
  { icon: Sparkles, title: "Dermatology", desc: "Skin, hair and acne consultations with board-certified specialists." },
  { icon: HeartPulse, title: "Chronic Care", desc: "Ongoing management for diabetes, hypertension and heart health." },
  { icon: Pill, title: "Prescriptions", desc: "Renew medications and get e-prescriptions sent to your pharmacy." },
];

const features = [
  { icon: Video, title: "Secure HD Video Visits", desc: "End-to-end encrypted video consultations from any device." },
  { icon: FileText, title: "E-Prescriptions", desc: "Doctors send prescriptions directly to your nearest pharmacy." },
  { icon: ShieldCheck, title: "Medical Records Vault", desc: "All your visits, notes and labs in one HIPAA-secure place." },
  { icon: Headphones, title: "24/7 Access", desc: "Talk to a doctor any time, day or night — no appointment required." },
];

const stats = [
  { value: "500K+", label: "Patients served" },
  { value: "240+",  label: "Licensed doctors" },
  { value: "4.9★",  label: "Average rating" },
  { value: "<15m",  label: "Avg. wait time" },
];

const doctors = [
  { img: doc1, name: "Dr. James Carter", specialty: "General Practitioner", rating: 4.9 },
  { img: doc2, name: "Dr. Maya Patel",   specialty: "Dermatologist",        rating: 4.8 },
  { img: doc3, name: "Dr. Sofia Reyes",  specialty: "Pediatrician",         rating: 5.0 },
];

const reviews = [
  { name: "Emily R.",   rating: 5, quote: "Booked a video visit at 9pm and spoke to a doctor in 8 minutes. Absolutely game-changing." },
  { name: "Marcus T.",  rating: 5, quote: "The doctor was kind, thorough, and my prescription was at the pharmacy before I got there." },
  { name: "Priya S.",   rating: 5, quote: "Finally a healthcare app that feels modern. The interface is so easy for my whole family." },
];

/* ---------- Page ---------- */
const MediCare = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = "MediCare — See a Doctor Anytime, Anywhere";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", "MediCare connects you with licensed doctors via secure video or chat in minutes. 24/7 telemedicine, e-prescriptions and trusted care.");

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      name: "MediCare",
      description: "On-demand telemedicine consultations with licensed doctors.",
      url: typeof window !== "undefined" ? window.location.href : "",
      telephone: "+1-800-MEDICARE",
      medicalSpecialty: ["GeneralPractice", "Dermatology", "Pediatrics", "Psychiatry"],
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "12480" },
    });
    document.head.appendChild(ld);
    return () => { document.head.removeChild(ld); };
  }, []);

  return (
    <div className="medicare-root min-h-screen relative overflow-x-hidden">
      <style>{tokenStyles}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" />

      {/* NAVBAR */}
      <header className="fixed top-3 sm:top-5 inset-x-0 z-50 px-3 sm:px-6">
        <nav className="mx-auto max-w-6xl mc-glass mc-shadow-card rounded-full px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid place-items-center h-9 w-9 rounded-xl mc-grad-primary mc-shadow-glow">
              <Stethoscope className="h-5 w-5 text-white" />
            </span>
            <span className="font-display font-bold text-lg tracking-tight">MediCare</span>
          </a>

          <ul className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-[hsl(var(--mc-primary))] transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <a href="#cta" className="inline-flex items-center gap-2 rounded-full mc-grad-primary text-white px-5 py-2.5 text-sm font-semibold mc-shadow-glow hover:opacity-95 transition">
              Book now <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="md:hidden grid place-items-center h-10 w-10 rounded-full hover:bg-[hsl(var(--mc-muted-soft))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--mc-primary))]"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden mx-auto max-w-6xl mt-2 mc-glass mc-shadow-card rounded-3xl p-5 mc-anim-fade-up">
            <ul className="grid gap-3 text-base font-medium">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-2">{l.label}</a>
                </li>
              ))}
              <li>
                <a href="#cta" onClick={() => setOpen(false)} className="mt-2 inline-flex w-full justify-center items-center gap-2 rounded-full mc-grad-primary text-white px-5 py-3 text-sm font-semibold">
                  Book now
                </a>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="relative pt-28 sm:pt-36 pb-20 sm:pb-28">
        <div className="absolute inset-0 mc-grad-hero" />
        <div className="absolute inset-0 mc-grad-mesh opacity-90" />
        <div className="absolute inset-0 mc-grid-pattern opacity-40" />
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full mc-grad-primary opacity-20 blur-3xl" />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full mc-grad-accent opacity-20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          <div className="mc-anim-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full mc-glass px-3.5 py-1.5 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--mc-accent))] mc-anim-pulse-glow" />
              240+ doctors online now
              <span className="mx-1 opacity-30">·</span>
              <Star className="h-3.5 w-3.5 fill-[hsl(45_100%_55%)] text-[hsl(45_100%_55%)]" /> 4.9
            </span>

            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-balance">
              See a Doctor <span className="mc-grad-text">Anytime, Anywhere</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[hsl(var(--mc-muted))] max-w-xl">
              Connect with licensed doctors via secure video or chat in minutes. Get diagnoses, prescriptions and trusted advice — without leaving home.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#cta" className="inline-flex items-center gap-2 rounded-full mc-grad-primary text-white px-7 py-3.5 text-sm font-semibold mc-shadow-glow hover:opacity-95 transition">
                Book Appointment <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#how" className="inline-flex items-center gap-2 rounded-full mc-glass px-6 py-3.5 text-sm font-semibold hover:bg-white transition">
                How it works
              </a>
            </div>

            <div className="mt-8 text-xs sm:text-sm text-[hsl(var(--mc-muted))]">
              Trusted by patients in <span className="text-base">🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇩🇪</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mc-anim-fade-up" style={{ animationDelay: ".15s" }}>
            <div className="relative rounded-[2.5rem] overflow-hidden mc-shadow-elegant mc-glass p-2">
              <img
                src={heroImg}
                alt="Doctor smiling while holding a smartphone for a video consultation"
                width={1024}
                height={1024}
                className="w-full h-auto rounded-[2rem] object-cover"
              />
              {/* live join strip */}
              <div className="absolute left-4 right-4 bottom-4 mc-glass rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="relative">
                  <img src={doc2} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[hsl(var(--mc-accent))] ring-2 ring-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Dr. Maya Patel is calling</p>
                  <p className="text-xs text-[hsl(var(--mc-muted))]">Dermatology · Live now</p>
                </div>
                <button className="rounded-full mc-grad-accent text-white text-xs font-semibold px-4 py-2 mc-anim-pulse-glow">
                  Join call
                </button>
              </div>
            </div>

            {/* Floating cards */}
            <div className="hidden sm:flex absolute -left-6 top-10 mc-glass mc-shadow-card rounded-2xl p-3 pr-4 items-center gap-3 mc-anim-float" style={{ animationDelay: ".2s" }}>
              <span className="grid place-items-center h-9 w-9 rounded-xl mc-grad-primary text-white"><Video className="h-4 w-4" /></span>
              <div>
                <p className="text-xs text-[hsl(var(--mc-muted))]">Format</p>
                <p className="text-sm font-semibold">Video visits</p>
              </div>
            </div>

            <div className="hidden sm:flex absolute -left-4 bottom-28 mc-glass mc-shadow-card rounded-2xl p-3 pr-4 items-center gap-3 mc-anim-float" style={{ animationDelay: ".6s" }}>
              <span className="grid place-items-center h-9 w-9 rounded-xl mc-grad-accent text-white"><ShieldCheck className="h-4 w-4" /></span>
              <div>
                <p className="text-xs text-[hsl(var(--mc-muted))]">Privacy</p>
                <p className="text-sm font-semibold">HIPAA Secure</p>
              </div>
            </div>

            <div className="hidden sm:block absolute -right-4 top-16 w-56 mc-glass mc-shadow-card rounded-2xl p-4 mc-anim-float" style={{ animationDelay: ".4s" }}>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[hsl(var(--mc-primary))]" />
                <p className="text-sm font-semibold">Avg. wait time</p>
              </div>
              <p className="mt-1 text-2xl font-display font-bold">12 min</p>
              <div className="mt-2 h-1.5 rounded-full bg-[hsl(var(--mc-muted-soft))] overflow-hidden">
                <div className="h-full w-3/4 mc-grad-primary rounded-full" />
              </div>
            </div>

            <div className="hidden sm:flex absolute -right-2 bottom-24 mc-glass mc-shadow-card rounded-2xl p-3 pr-4 items-center gap-3 mc-anim-float" style={{ animationDelay: ".8s" }}>
              <span className="grid place-items-center h-9 w-9 rounded-xl bg-[hsl(var(--mc-primary))/0.1] text-[hsl(var(--mc-primary))]"><CalendarCheck className="h-4 w-4" /></span>
              <div>
                <p className="text-xs text-[hsl(var(--mc-muted))]">Next slot</p>
                <p className="text-sm font-semibold">Today · 2:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">How it works</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold">See a doctor in three simple steps</h2>
            <p className="mt-3 text-[hsl(var(--mc-muted))]">From specialty to consultation in under 15 minutes — no waiting rooms, no paperwork.</p>
          </div>

          <div className="relative mt-14 grid md:grid-cols-3 gap-6">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[hsl(var(--mc-primary))/0.4] to-transparent" />
            {[
              { icon: Stethoscope, title: "Choose specialty", desc: "Pick from 20+ medical specialties tailored to your needs." },
              { icon: CalendarCheck, title: "Book appointment", desc: "Pick a slot that fits — instant or scheduled, your choice." },
              { icon: Video, title: "Start consultation", desc: "Join a secure video call and get personalized care." },
            ].map((s, i) => (
              <div key={s.title} className="relative mc-glass mc-shadow-card rounded-3xl p-6 text-center mc-anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mx-auto h-12 w-12 grid place-items-center rounded-2xl mc-grad-primary text-white mc-shadow-glow">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-semibold tracking-widest text-[hsl(var(--mc-muted))]">STEP {i + 1}</p>
                <h3 className="mt-1 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--mc-muted))] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 sm:py-28 bg-[hsl(var(--mc-muted-soft))]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">Services</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold">Care for every moment of life</h2>
            <p className="mt-3 text-[hsl(var(--mc-muted))]">Whatever your concern, our network of verified specialists is here for you.</p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <div key={s.title} className="group bg-[hsl(var(--mc-card))] rounded-3xl p-6 border border-[hsl(var(--mc-border))] mc-shadow-card hover:-translate-y-1 hover:mc-shadow-elegant transition-all duration-300">
                <span className="grid place-items-center h-12 w-12 rounded-2xl mc-grad-primary text-white mc-shadow-glow">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--mc-muted))] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-6 mc-grad-primary opacity-15 blur-3xl rounded-[3rem]" />
            <div className="relative mc-glass mc-shadow-elegant rounded-[2.5rem] p-6">
              <div className="rounded-3xl bg-[hsl(var(--mc-card))] border border-[hsl(var(--mc-border))] p-5">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-[hsl(var(--mc-primary))]" />
                  <p className="text-sm font-semibold">MediCare App</p>
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    "Encrypted video & chat",
                    "Auto-saved medical history",
                    "Pharmacy delivery in 1 hour",
                    "Family accounts & dependents",
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--mc-muted-soft))] px-4 py-3">
                      <span className="grid place-items-center h-7 w-7 rounded-full mc-grad-accent text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm font-medium">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">Platform</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold">Everything you need for modern healthcare</h2>
            <p className="mt-3 text-[hsl(var(--mc-muted))]">Built for patients and doctors with privacy, speed and reliability at the core.</p>

            <div className="mt-8 grid sm:grid-cols-2 gap-5">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="shrink-0 grid place-items-center h-11 w-11 rounded-2xl mc-grad-primary text-white mc-shadow-glow">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold">{f.title}</h3>
                    <p className="mt-1 text-sm text-[hsl(var(--mc-muted))] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl mc-grad-primary text-white p-8 sm:p-10 mc-shadow-elegant grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs sm:text-sm text-white/80 tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section id="doctors" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">Our Doctors</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold">Meet a few of the specialists ready to help</h2>
            <p className="mt-3 text-[hsl(var(--mc-muted))]">Every doctor on MediCare is licensed, verified and committed to patient-first care.</p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((d) => (
              <article key={d.name} className="bg-[hsl(var(--mc-card))] rounded-3xl border border-[hsl(var(--mc-border))] mc-shadow-card overflow-hidden hover:-translate-y-1 hover:mc-shadow-elegant transition-all duration-300">
                <div className="aspect-[4/3] overflow-hidden bg-[hsl(var(--mc-muted-soft))]">
                  <img src={d.img} alt={`Portrait of ${d.name}`} loading="lazy" width={512} height={512} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold">{d.name}</h3>
                  <p className="text-sm text-[hsl(var(--mc-muted))]">{d.specialty}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <Star className="h-4 w-4 fill-[hsl(45_100%_55%)] text-[hsl(45_100%_55%)]" />
                      {d.rating.toFixed(1)}
                    </span>
                    <button className="rounded-full mc-grad-primary text-white px-4 py-2 text-xs font-semibold mc-shadow-glow">
                      Book
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-20 sm:py-28 bg-[hsl(var(--mc-muted-soft))]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">Reviews</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold">Loved by patients everywhere</h2>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <figure key={r.name} className="bg-[hsl(var(--mc-card))] rounded-3xl p-6 border border-[hsl(var(--mc-border))] mc-shadow-card">
                <div className="flex items-center gap-1 text-[hsl(45_100%_55%)]">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed">"{r.quote}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid place-items-center h-10 w-10 rounded-full mc-grad-primary text-white text-sm font-bold">
                    {r.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <p className="text-sm font-semibold">{r.name}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="cta" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] mc-grad-primary text-white p-10 sm:p-16 text-center mc-shadow-elegant">
            <div className="absolute inset-0 opacity-30 mc-grid-pattern" />
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold">
                <HeartPulse className="h-3.5 w-3.5 mc-anim-heart" /> Care that fits your life
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold">Start your consultation today</h2>
              <p className="mt-4 text-white/85 max-w-xl mx-auto">Join over 500,000 patients who trust MediCare for fast, reliable, on-demand healthcare.</p>
              <a href="#top" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-[hsl(var(--mc-primary))] px-7 py-3.5 text-sm font-bold hover:bg-white/95 transition">
                Get Started <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-card))]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-4">
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <span className="grid place-items-center h-9 w-9 rounded-xl mc-grad-primary mc-shadow-glow">
                <Stethoscope className="h-5 w-5 text-white" />
              </span>
              <span className="font-display font-bold text-lg">MediCare</span>
            </a>
            <p className="mt-4 text-sm text-[hsl(var(--mc-muted))] leading-relaxed">Modern telemedicine for everyday people. Trusted, secure, available 24/7.</p>
            <div className="mt-5 flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((I, i) => (
                <a key={i} href="#" aria-label="Social link" className="grid place-items-center h-9 w-9 rounded-full bg-[hsl(var(--mc-muted-soft))] hover:mc-grad-primary hover:text-white transition">
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "About",    items: ["Our story", "Careers", "Press", "Partners"] },
            { title: "Services", items: ["General Care", "Mental Health", "Pediatrics", "Dermatology"] },
          ].map((c) => (
            <div key={c.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider">{c.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[hsl(var(--mc-muted))]">
                {c.items.map((it) => (<li key={it}><a href="#" className="hover:text-[hsl(var(--mc-primary))] transition">{it}</a></li>))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[hsl(var(--mc-muted))]">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@medicare.app</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (800) 633-4227</li>
              <li><a href="#" className="hover:text-[hsl(var(--mc-primary))] transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[hsl(var(--mc-primary))] transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[hsl(var(--mc-border))]">
          <p className="mx-auto max-w-6xl px-4 sm:px-6 py-5 text-xs text-[hsl(var(--mc-muted))] text-center">
            © {new Date().getFullYear()} MediCare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MediCare;
