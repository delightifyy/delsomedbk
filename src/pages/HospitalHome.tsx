import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DOCTORS } from "@/data/doctors";
import hospitalHero from "@/assets/hospital-hero.jpg";
import {
  Video, CalendarCheck, Stethoscope, ShieldCheck, Clock, HeartPulse,
  Baby, Brain, Activity, Bone, Eye, Pill, ArrowRight, PhoneCall,
} from "lucide-react";

const DEPARTMENTS = [
  { icon: HeartPulse, name: "Cardiology", desc: "Heart & vascular care" },
  { icon: Baby, name: "Paediatrics", desc: "Care for children & newborns" },
  { icon: Brain, name: "Neurology", desc: "Brain & nervous system" },
  { icon: Activity, name: "Internal Medicine", desc: "Adult chronic conditions" },
  { icon: Bone, name: "Orthopaedics", desc: "Bones, joints & spine" },
  { icon: Eye, name: "Ophthalmology", desc: "Eye health & vision" },
  { icon: Stethoscope, name: "General Practice", desc: "Everyday primary care" },
  { icon: Pill, name: "Pharmacy", desc: "Prescriptions delivered" },
];

const STEPS = [
  { n: "01", title: "Choose a doctor", desc: "Browse verified specialists across every department." },
  { n: "02", title: "Pick a time slot", desc: "Real-time availability for same-day or future bookings." },
  { n: "03", title: "Join the video call", desc: "Secure HD video consultation right from your browser." },
];

const HospitalHome = () => {
  const featured = DOCTORS.slice(0, 4);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 gradient-soft" aria-hidden />
        <div className="container relative grid lg:grid-cols-12 gap-10 items-center py-14 sm:py-20">
          <div className="lg:col-span-6 space-y-6 animate-fade-up">
            <Badge className="bg-secondary/15 text-secondary border-0 hover:bg-secondary/20">
              <Video className="h-3.5 w-3.5 mr-1.5" /> Online Video Consultations
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-balance">
              Your hospital, <span className="text-primary">online</span> — care
              from <span className="italic text-secondary">anywhere</span>.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              DesolMed Hospital brings world-class specialists to your screen.
              Book a consultation in minutes and join a secure video call with a
              licensed doctor — no app downloads, no waiting rooms.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/book"><CalendarCheck className="mr-2 h-5 w-5" /> Book a consultation</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <a href="#departments">Explore departments <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-secondary" /> Verified doctors</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-secondary" /> 24/7 availability</span>
              <span className="flex items-center gap-1.5"><Video className="h-4 w-4 text-secondary" /> HD secure video</span>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elegant">
              <img src={hospitalHero} alt="DesolMed Hospital building" className="w-full h-[440px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-4 shadow-card max-w-[230px] hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary/15 text-secondary">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Live now</p>
                  <p className="text-xs text-muted-foreground">12 doctors online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold tracking-[0.2em] text-secondary uppercase">How it works</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3">From booking to consultation in 3 steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elegant transition-all">
              <p className="font-display text-4xl font-bold text-primary/20">{s.n}</p>
              <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section id="departments" className="bg-muted/40 border-y border-border py-16 sm:py-20">
        <div className="container">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-secondary uppercase">Departments</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">Specialist care, all under one roof</h2>
            </div>
            <Button asChild variant="ghost"><Link to="/book">Book any specialty <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DEPARTMENTS.map((d) => (
              <Link key={d.name} to="/book" className="group rounded-2xl border border-border bg-card p-5 hover:border-primary hover:-translate-y-1 transition-all shadow-card">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <d.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold">{d.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{d.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED DOCTORS */}
      <section className="container py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold tracking-[0.2em] text-secondary uppercase">Our doctors</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3">Meet a few of our specialists</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elegant transition-all">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary font-display font-bold text-xl">
                {d.initials}
              </div>
              <h3 className="mt-4 font-display font-semibold">{d.name}</h3>
              <p className="text-sm text-secondary">{d.specialty}</p>
              <p className="text-xs text-muted-foreground mt-1">{d.city}, {d.state}</p>
              <Button asChild size="sm" className="mt-4 w-full rounded-full">
                <Link to={`/book?doctor=${d.id}`}><Video className="mr-2 h-4 w-4" /> Book video call</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 sm:p-12 text-center shadow-elegant">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Need urgent care?</h2>
          <p className="mt-3 max-w-xl mx-auto opacity-90">
            Our 24/7 helpline connects you to a doctor in minutes — or jump
            straight into a video consultation now.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <Link to="/book"><Video className="mr-2 h-5 w-5" /> Start a video call</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <a href="tel:+2348000000000"><PhoneCall className="mr-2 h-5 w-5" /> Call helpline</a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default HospitalHome;
