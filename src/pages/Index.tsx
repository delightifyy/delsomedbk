import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Search, ArrowRight, UserPlus, HeartPulse, Sparkles,
} from "lucide-react";
import heroDoctor from "@/assets/hero-doctor-v5.jpg";
import { SPECIALTIES, type Doctor } from "@/data/doctors";
import { DoctorCard } from "@/components/site/DoctorCard";
import { SectionLabel } from "@/components/site/SectionLabel";
import { StatsStrip } from "@/components/site/StatsStrip";
import { SpecialtyRail } from "@/components/site/SpecialtyRail";
import { AudienceTabs } from "@/components/site/AudienceTabs";
import { LogoWall } from "@/components/site/LogoWall";
import { Testimonials } from "@/components/site/Testimonials";
import { FaqSection } from "@/components/site/FaqSection";
import { DualCta } from "@/components/site/DualCta";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { collection, doctorFromApi } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";

const TIMELINE = [
  { icon: UserPlus, title: "Create your account", desc: "Sign up as a patient, doctor or organization in under two minutes. No paperwork, no friction." },
  { icon: Search, title: "Find a trusted doctor", desc: "Filter our directory of manually verified doctors by specialty, state and city." },
  { icon: HeartPulse, title: "Get the care you need", desc: "Reach out directly. Connect with a doctor who fits your needs and your context." },
];

const REGISTRATION_SPECIALTIES = SPECIALTIES.filter((specialty) => specialty !== "Others");

const Index = () => {
  const [featured, setFeatured] = useState<Doctor[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [hero, setHero] = useState({ specialty: "", state: "" });
  const [specialties, setSpecialties] = useState<string[]>(REGISTRATION_SPECIALTIES);
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadFeaturedDoctors = async () => {
      setFeaturedLoading(true);
      try {
        const [response, stateResponse] = await Promise.all([
          api.doctors.list({ per_page: 4 }),
          api.lookups.states(),
        ]);
        const mapped = collection(response.data).map((entry, index) => doctorFromApi(entry, index)).slice(0, 4);
        if (!cancelled) {
          setFeatured(mapped);
          setSpecialties(REGISTRATION_SPECIALTIES);
          setStates(collection(stateResponse.data).map((entry: any) => String(entry?.name ?? entry?.title ?? "")).filter(Boolean));
        }
      } catch {
        if (!cancelled) {
          setFeatured([]);
          setSpecialties(REGISTRATION_SPECIALTIES);
          setStates([]);
        }
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    };
    loadFeaturedDoctors();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteLayout>
      {/* 01 / HERO — split asymmetric */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 gradient-soft" aria-hidden />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-secondary/10 blur-3xl" aria-hidden />
        <div className="container relative grid lg:grid-cols-12 gap-10 lg:gap-12 items-center py-12 sm:py-16 lg:py-24">
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 animate-fade-up">
            <SectionLabel number="" label="" />
            <h1 className="font-display text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-7xl font-bold sm:leading-[1.02] text-balance">
              Access <span className="text-primary">Trusted Doctors</span> Anytime, <span className="italic text-secondary">Anywhere</span>.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              DesolMed connects patients with verified, licensed doctors across and outside Nigeria to give healthcare professionals a beautiful place to grow their practice online.
            </p>

            {/* Inline search */}
            <form
              onSubmit={(e) => { e.preventDefault(); window.location.href = "/doctors"; }}
              className="rounded-2xl bg-card border border-border shadow-card p-2 flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              <Select value={hero.specialty} onValueChange={(v) => setHero((p) => ({ ...p, specialty: v }))}>
                <SelectTrigger className="border-0 sm:border-r border-border rounded-xl sm:rounded-r-none focus:ring-0 h-12 flex-1">
                  <SelectValue placeholder="Any specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={hero.state} onValueChange={(v) => setHero((p) => ({ ...p, state: v }))}>
                <SelectTrigger className="border-0 sm:border-r border-border rounded-xl sm:rounded-none focus:ring-0 h-12 flex-1">
                  <SelectValue placeholder="Any state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="submit" variant="hero" size="lg" className="h-12">
                <Search className="h-4 w-4" /> Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary" /> Verified Doctors Only</span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-secondary" /> Free for Patients</span> 
              <span className="text-border">·</span>
              <span>Doctors · 36 States</span>
            </div>
          </div>

          {/* Right: portrait collage */}
          <div className="lg:col-span-5 relative animate-fade-in">
            <div className="absolute -inset-6 gradient-hero rounded-[50%] opacity-10 blur-3xl" aria-hidden />
            <div className="relative aspect-[4/5] max-w-[320px] sm:max-w-[400px] lg:max-w-[460px] mx-auto">
              <div className="absolute inset-0 bg-white rounded-[50%] shadow-card overflow-hidden">
                <img
                  src={heroDoctor}
                  alt="Verified DesolMed doctor"
                  width={1024}
                  height={1280}
                  className="absolute inset-0 w-full h-full object-cover object-top scale-105"
                />
              </div>
            </div>
            {/* Floating: online status */}
            <div className="hidden md:flex absolute -left-6 bottom-12 bg-card rounded-xl shadow-elegant border border-border p-3 gap-2.5 items-center">
              <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary font-display font-bold text-xs">
                CE
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-card animate-pulse" />
              </span>
              <div>
                <p className="text-xs font-semibold leading-tight">Dr. Chiamaka Eze</p>
                <p className="text-[10px] text-secondary leading-tight">● Online now</p>
              </div>
            </div>
            <div className="hidden md:flex absolute -right-4 top-12 bg-card rounded-xl shadow-elegant border border-border p-3 gap-2.5 items-center">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary/10 text-secondary">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold leading-tight">License Verified</p>
                <p className="text-[10px] text-muted-foreground leading-tight">By DesolMed Medical Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP — full bleed */}
      <StatsStrip />

      {/* 02 / SPECIALTIES */}
      <section className="container py-14 sm:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div className="space-y-3">
            <SectionLabel number="" label="" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight max-w-xl">
              Care for every chapter of life.
            </h2>
          </div>
        </div>
        <SpecialtyRail />
      </section>

      {/* {(featuredLoading || featured.length > 0) && (
        <section className="container py-14 sm:py-20 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div className="space-y-3">
              <SectionLabel number="" label="Verified doctors" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight max-w-xl">
                Start from trusted profiles.
              </h2>
            </div>
            <Link to="/doctors" className="text-sm font-semibold text-primary hover:text-secondary inline-flex items-center gap-1">
              Browse Directory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredLoading ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="mt-5 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
              </div>
            )) : featured.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </section>
      )} */}

      {/* 03 / HOW IT WORKS — vertical timeline */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-14 sm:py-20 lg:py-24 grid lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16">
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-32 lg:self-start">
            <SectionLabel number="" label="" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              Trusted care, in three deliberate steps.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              No friction. No confusion. Just a clear path from "I need a doctor" to "I found the right one."
            </p>
          </div>

          <ol className="lg:col-span-8 relative space-y-8 sm:space-y-10 before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
            {TIMELINE.map((s, i) => (
              <li key={s.title} className="relative pl-16 sm:pl-20">
                <span className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-full bg-card border-2 border-secondary text-secondary shadow-card">
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="flex items-center gap-3 mb-2 pt-2">
                  <span className="font-display text-xs font-bold text-secondary tracking-wider">
                    STEP {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px w-8 bg-border" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug">{s.title}</h3>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>


      {/* 06 / TRUSTED BY */}
      <section className="container py-14 sm:py-20 border-t border-border">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <SectionLabel number="" label="Trusted by" className="justify-center" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Leading HMOs and Partners.
          </h2>
        </div>
        <LogoWall />
      </section>

      {/* 07 / TESTIMONIALS */}
      <section className="container py-14 sm:py-20 border-t border-border">
        <div className="max-w-2xl mb-10 sm:mb-12 space-y-3">
          <SectionLabel number="" label="From the network" />
          <h2 className="font-display text-2xl sm:text-4xl font-bold leading-tight">
            Patients, Pharmacists, Doctors, Laboratories / Diagnostics and HMOs , and other Organizations.
          </h2>
        </div>
        <Testimonials />
      </section>

      {/* 08 / FAQ */}
      <section className="container py-14 sm:py-20 border-t border-border">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-32 lg:self-start">
            <SectionLabel number="" label="FAQ" />
            <h2 className="font-display text-2xl sm:text-4xl font-bold leading-tight">
              Questions, Answered.
            </h2>
            <p className="text-muted-foreground">
              Can't find what you're looking for?{" "}
              <Link to="/contact" className="text-primary font-semibold hover:text-secondary">Talk to our team</Link>.
            </p>
          </div>
          <div className="lg:col-span-8">
            <FaqSection />
          </div>
        </div>
      </section>

      {/* 09 / DUAL CTA */}
      <section className="container py-14 sm:py-20">
        <DualCta />
      </section>
    </SiteLayout>
  );
};

export default Index;
