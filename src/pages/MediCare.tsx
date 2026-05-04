import { useEffect, useState } from "react";
import {
  Stethoscope, Menu, X, Star, Video, ShieldCheck, Clock, CalendarCheck,
  Brain, Baby, Sparkles, HeartPulse, Pill, FileText, Headphones, FlaskConical,
  Mail, Phone, Facebook, Twitter, Instagram, Linkedin, ArrowRight, DollarSign,
  Globe, Zap, Lock,
} from "lucide-react";
import heroImg from "@/assets/medicare-hero-illu.jpg";
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
  --mc-primary-glow: 188 90% 55%;
  --mc-primary-fg: 0 0% 100%;
  --mc-accent: 160 65% 45%;
  --mc-accent-glow: 160 70% 60%;
  --mc-radius: 1rem;

  --mc-grad-primary: linear-gradient(135deg, hsl(var(--mc-primary)), hsl(var(--mc-primary-glow)));
  --mc-grad-text: linear-gradient(120deg, hsl(var(--mc-primary)) 0%, hsl(var(--mc-primary-glow)) 50%, hsl(var(--mc-accent)) 100%);
  --mc-grad-hero: linear-gradient(160deg, hsl(210 100% 97%) 0%, hsl(195 80% 96%) 40%, hsl(160 60% 96%) 100%);
  --mc-grad-mesh:
     radial-gradient(at 20% 20%, hsl(var(--mc-primary)/.15) 0px, transparent 45%),
     radial-gradient(at 85% 30%, hsl(var(--mc-accent)/.13) 0px, transparent 45%),
     radial-gradient(at 50% 90%, hsl(var(--mc-primary-glow)/.15) 0px, transparent 50%);
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
  background: var(--mc-grad-text);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.mc-shadow-card    { box-shadow: var(--mc-shadow-card); }
.mc-shadow-elegant { box-shadow: var(--mc-shadow-elegant); }
.mc-shadow-glow    { box-shadow: var(--mc-shadow-glow); }
.mc-glass {
  background: hsl(0 0% 100% / .7);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid hsl(0 0% 100% / .7);
}
.mc-grid-pattern {
  background-image:
    linear-gradient(hsl(var(--mc-fg)/.04) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--mc-fg)/.04) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 50%, transparent 100%);
}
@keyframes mc-fade-up { from { opacity:0; transform:translateY(16px);} to {opacity:1; transform:none;} }
@keyframes mc-float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
@keyframes mc-pulse-glow { 0%,100%{box-shadow:0 0 0 0 hsl(var(--mc-accent)/.55);} 50%{box-shadow:0 0 0 14px hsl(var(--mc-accent)/0);} }
@keyframes mc-pulse-dot  { 0%,100%{opacity:1;} 50%{opacity:.4;} }
.mc-anim-fade-up   { animation: mc-fade-up .7s cubic-bezier(.4,0,.2,1) both; }
.mc-anim-float     { animation: mc-float 6s ease-in-out infinite; }
.mc-anim-pulse-glow{ animation: mc-pulse-glow 2s ease-out infinite; }
.mc-anim-pulse-dot { animation: mc-pulse-dot 1.6s ease-in-out infinite; }
`;

/* ---------- Data ---------- */
const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#services", label: "Services" },
  { href: "#doctors", label: "Doctors" },
  { href: "#reviews", label: "Reviews" },
];

const steps = [
  { n: "01", icon: CalendarCheck, title: "Book Appointment", desc: "Choose your doctor and a time that fits your schedule. Same-day slots available." },
  { n: "02", icon: Video, title: "Virtual Consultation", desc: "Connect via secure video or chat. Discuss your symptoms with a licensed physician." },
  { n: "03", icon: FileText, title: "Get Treatment", desc: "Receive a prescription, expert advice, or a referral — sent directly to your phone." },
];

const services = [
  { icon: Stethoscope, title: "General Consultation", desc: "Everyday illnesses, checkups, and health concerns." },
  { icon: Brain,       title: "Mental Health Support", desc: "Therapy and counseling from licensed professionals." },
  { icon: Pill,        title: "Prescription & Refills", desc: "Get prescriptions sent to your local pharmacy." },
  { icon: FlaskConical,title: "Lab Tests & Referrals", desc: "Order labs and get specialist referrals fast." },
  { icon: Baby,        title: "Pediatric Care",        desc: "Trusted care for your children, anytime." },
  { icon: Sparkles,    title: "Dermatology",           desc: "Skin, hair and acne consultations with specialists." },
];

const reasons = [
  { icon: Headphones,  title: "24/7 Access to Doctors", desc: "Day or night, weekday or weekend — care is always one tap away." },
  { icon: Zap,         title: "Fast Response Time",     desc: "Connect with a doctor in under 15 minutes on average." },
  { icon: Lock,        title: "Secure & Private",       desc: "HIPAA-compliant, end-to-end encrypted consultations." },
  { icon: DollarSign,  title: "Affordable Care",        desc: "Transparent pricing — no surprise bills, insurance accepted." },
  { icon: Globe,       title: "Access from Anywhere",   desc: "Home, work, or traveling — quality care follows you." },
];

const stats = [
  { value: "100+",    label: "Licensed Doctors" },
  { value: "10,000+", label: "Patients Served" },
  { value: "24/7",    label: "Availability" },
  { value: "<30 min", label: "Avg. Wait Time" },
];

const doctors = [
  { img: doc1, name: "Dr. James Reyes",  specialty: "Internal Medicine", rating: 4.8 },
  { img: doc2, name: "Dr. Sarah Chen",   specialty: "Family Medicine",   rating: 4.9 },
  { img: doc3, name: "Dr. Mei Tanaka",   specialty: "Pediatrics",        rating: 5.0 },
];

const reviews = [
  { initials: "ET", name: "Emma Thompson",     loc: "Patient · Seattle, WA", quote: "I got connected with a doctor in 10 minutes from my couch. Got my prescription sent to the pharmacy down the street. Unreal." },
  { initials: "MR", name: "Michael Rodriguez", loc: "Patient · Austin, TX",  quote: "As a busy parent, being able to consult a pediatrician at 11pm without leaving the house has been a complete game changer for our family." },
  { initials: "PS", name: "Priya Sharma",      loc: "Patient · Boston, MA",  quote: "The doctors actually listen. The video quality is great, and the follow-up was seamless. I won't go back to the old way." },
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

      {/* HERO — centered, with floating side cards */}
      <section id="top" className="relative pt-28 sm:pt-32 pb-16 sm:pb-24">
        <div className="absolute inset-0 mc-grad-hero" />
        <div className="absolute inset-0 mc-grad-mesh opacity-90" />
        <div className="absolute inset-0 mc-grid-pattern opacity-60" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          {/* Eyebrow */}
          <div className="flex justify-center mc-anim-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full mc-glass px-4 py-1.5 text-xs sm:text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--mc-accent))] mc-anim-pulse-dot" />
              240+ doctors online now
              <span className="opacity-30">·</span>
              <Star className="h-3.5 w-3.5 fill-[hsl(45_100%_55%)] text-[hsl(45_100%_55%)]" /> 4.9
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-center font-display text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-balance mc-anim-fade-up">
            See a Doctor{" "}
            <span className="mc-grad-text whitespace-nowrap">Anytime,</span>{" "}
            <span className="mc-grad-text whitespace-nowrap">Anywhere</span>
          </h1>

          <p className="mt-5 sm:mt-6 mx-auto max-w-xl text-center text-base sm:text-lg leading-relaxed text-[hsl(var(--mc-muted))] mc-anim-fade-up">
            Connect with licensed doctors via video or chat in minutes. Skip the waiting room — quality care delivered to wherever you are.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center mc-anim-fade-up">
            <a href="#cta" className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full mc-grad-primary text-white px-7 py-3.5 text-sm font-semibold mc-shadow-glow hover:opacity-95 transition">
              Book Appointment <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#how" className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full mc-glass px-7 py-3.5 text-sm font-semibold hover:bg-white transition">
              How it works
            </a>
          </div>

          {/* Hero visual + floating cards */}
          <div className="relative mt-14 sm:mt-20 mx-auto max-w-5xl">
            {/* Center illustration */}
            <div className="relative mx-auto max-w-[22rem] sm:max-w-md">
              <div className="absolute inset-0 -m-10 mc-grad-primary opacity-15 blur-3xl rounded-full" />
              <div className="relative aspect-square rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white mc-shadow-elegant ring-1 ring-white">
                <img
                  src={heroImg}
                  alt="Smiling doctor providing virtual consultation via smartphone"
                  width={1024}
                  height={1024}
                  className="w-full h-full object-cover"
                />
                {/* Live now strip */}
                <div className="absolute left-3 top-3 sm:left-4 sm:top-4 mc-glass rounded-full px-3 py-1.5 flex items-center gap-2 text-[11px] sm:text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[hsl(0_85%_60%)] mc-anim-pulse-dot" />
                  Live · Dr. Sarah Chen
                </div>
                <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                  <button className="rounded-full mc-grad-accent text-white text-[11px] sm:text-xs font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 mc-anim-pulse-glow">
                    Join call
                  </button>
                </div>
              </div>
            </div>

            {/* Floating cards — desktop */}
            <div className="hidden lg:block absolute left-0 top-6 w-60 mc-glass mc-shadow-card rounded-2xl p-4 mc-anim-float" style={{ animationDelay: ".1s" }}>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-[hsl(var(--mc-accent))/0.12] text-[hsl(var(--mc-accent))]">
                  <Video className="h-5 w-5" />
                </span>
                <p className="font-semibold text-sm">Video visits</p>
              </div>
              <p className="mt-3 text-xs text-[hsl(var(--mc-muted))] leading-relaxed">HD secure consultations from any device.</p>
            </div>

            <div className="hidden lg:block absolute left-4 bottom-6 w-60 mc-glass mc-shadow-card rounded-2xl p-4 mc-anim-float" style={{ animationDelay: ".4s" }}>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-[hsl(var(--mc-primary))/0.12] text-[hsl(var(--mc-primary))]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <p className="font-semibold text-sm">HIPAA Secure</p>
              </div>
              <p className="mt-3 text-xs text-[hsl(var(--mc-muted))] leading-relaxed">End-to-end encrypted records.</p>
            </div>

            <div className="hidden lg:block absolute right-0 top-6 w-60 mc-glass mc-shadow-card rounded-2xl p-4 mc-anim-float" style={{ animationDelay: ".25s" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[hsl(var(--mc-muted))]">Avg. wait time</p>
                <Clock className="h-4 w-4 text-[hsl(var(--mc-primary))]" />
              </div>
              <p className="mt-1 font-display text-3xl font-bold">12<span className="text-sm font-medium text-[hsl(var(--mc-accent))] ml-1">min</span></p>
              <div className="mt-3 h-1.5 rounded-full bg-[hsl(var(--mc-muted-soft))] overflow-hidden">
                <div className="h-full w-3/4 mc-grad-primary rounded-full" />
              </div>
            </div>

            <div className="hidden lg:block absolute right-4 bottom-6 w-60 mc-glass mc-shadow-card rounded-2xl p-4 mc-anim-float" style={{ animationDelay: ".55s" }}>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-[hsl(var(--mc-primary))/0.12] text-[hsl(var(--mc-primary))]">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-[hsl(var(--mc-muted))]">Next slot</p>
                  <p className="text-sm font-semibold">Today, 2:30 PM</p>
                </div>
              </div>
            </div>

            {/* Mobile/tablet stacked cards */}
            <div className="lg:hidden mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="mc-glass mc-shadow-card rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-10 w-10 rounded-xl bg-[hsl(var(--mc-accent))/0.12] text-[hsl(var(--mc-accent))]"><Video className="h-5 w-5" /></span>
                  <p className="font-semibold text-sm">Video visits</p>
                </div>
                <p className="mt-3 text-xs text-[hsl(var(--mc-muted))]">HD secure consultations from your phone or laptop.</p>
              </div>
              <div className="mc-glass mc-shadow-card rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-10 w-10 rounded-xl bg-[hsl(var(--mc-primary))/0.12] text-[hsl(var(--mc-primary))]"><ShieldCheck className="h-5 w-5" /></span>
                  <p className="font-semibold text-sm">HIPAA Secure</p>
                </div>
                <p className="mt-3 text-xs text-[hsl(var(--mc-muted))]">End-to-end encrypted records and conversations.</p>
              </div>
              <div className="mc-glass mc-shadow-card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[hsl(var(--mc-muted))]">Avg. wait time</p>
                  <Clock className="h-4 w-4 text-[hsl(var(--mc-primary))]" />
                </div>
                <p className="mt-1 font-display text-3xl font-bold">12<span className="text-sm font-medium text-[hsl(var(--mc-accent))] ml-1">min</span></p>
              </div>
              <div className="mc-glass mc-shadow-card rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-10 w-10 rounded-xl bg-[hsl(var(--mc-primary))/0.12] text-[hsl(var(--mc-primary))]"><CalendarCheck className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs text-[hsl(var(--mc-muted))]">Next slot</p>
                    <p className="text-sm font-semibold">Today, 2:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-14 text-center text-sm text-[hsl(var(--mc-muted))]">
            Trusted by patients in <span className="text-base ml-1">🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇩🇪</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">How it works</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">Quality care in three simple steps</h2>
          </div>

          <div className="relative mt-14 grid md:grid-cols-3 gap-6">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[hsl(var(--mc-primary))/0.4] to-transparent" />
            {steps.map((s, i) => (
              <div key={s.n} className="relative mc-glass mc-shadow-card rounded-3xl p-7 mc-anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between">
                  <span className="grid place-items-center h-12 w-12 rounded-2xl mc-grad-primary text-white mc-shadow-glow">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-4xl font-bold mc-grad-text">{s.n}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
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
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">Our services</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">Comprehensive care at your fingertips</h2>
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

      {/* WHY CHOOSE US */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">Why choose us</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">Healthcare designed around you</h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reasons.map((r) => (
              <div key={r.title} className="bg-[hsl(var(--mc-card))] rounded-3xl p-6 border border-[hsl(var(--mc-border))] mc-shadow-card">
                <span className="grid place-items-center h-12 w-12 rounded-2xl bg-[hsl(var(--mc-primary))/0.1] text-[hsl(var(--mc-primary))]">
                  <r.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{r.title}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--mc-muted))] leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 rounded-3xl mc-grad-primary text-white p-8 sm:p-10 mc-shadow-elegant grid grid-cols-2 md:grid-cols-4 gap-6">
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
      <section id="doctors" className="py-20 sm:py-28 bg-[hsl(var(--mc-muted-soft))]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">Meet our doctors</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">Trusted physicians, ready when you are</h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((d) => (
              <article key={d.name} className="bg-[hsl(var(--mc-card))] rounded-3xl border border-[hsl(var(--mc-border))] mc-shadow-card overflow-hidden hover:-translate-y-1 hover:mc-shadow-elegant transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-[hsl(var(--mc-muted-soft))]">
                  <img src={d.img} alt={`Portrait of ${d.name}`} loading="lazy" width={512} height={512} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold">
                    <span className="h-2 w-2 rounded-full bg-[hsl(var(--mc-accent))] mc-anim-pulse-dot" />
                    Available Now
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold">{d.name}</h3>
                      <p className="text-sm text-[hsl(var(--mc-muted))]">{d.specialty}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap">
                      <Star className="h-4 w-4 fill-[hsl(45_100%_55%)] text-[hsl(45_100%_55%)]" />
                      {d.rating.toFixed(1)}
                    </span>
                  </div>
                  <button className="mt-4 w-full rounded-full mc-grad-primary text-white py-2.5 text-sm font-semibold mc-shadow-glow hover:opacity-95 transition">
                    Book consultation
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[hsl(var(--mc-primary))] uppercase">Patient stories</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">Loved by thousands of patients</h2>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <figure key={r.name} className="bg-[hsl(var(--mc-card))] rounded-3xl p-6 border border-[hsl(var(--mc-border))] mc-shadow-card">
                <div className="flex items-center gap-1 text-[hsl(45_100%_55%)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed">"{r.quote}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid place-items-center h-10 w-10 rounded-full mc-grad-primary text-white text-sm font-bold">
                    {r.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-[hsl(var(--mc-muted))]">{r.loc}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="cta" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] mc-grad-primary text-white p-10 sm:p-16 text-center mc-shadow-elegant">
            <div className="absolute inset-0 opacity-30 mc-grid-pattern" />
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold">
                <HeartPulse className="h-3.5 w-3.5" /> Care that fits your life
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold">Start your consultation today</h2>
              <p className="mt-4 text-white/85 max-w-xl mx-auto">Join thousands of patients getting trusted medical care without the wait.</p>
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
