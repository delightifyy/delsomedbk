import { SiteLayout } from "@/components/site/SiteLayout";
import { Heart, HeartHandshake, Trophy, Lightbulb, Shield, Users, Target, Eye, MapPin, Phone, MessageCircle } from "lucide-react";
import { SectionLabel } from "@/components/site/SectionLabel";
import { DualCta } from "@/components/site/DualCta";

const values = [
  { icon: Heart, title: "Accessibility", desc: "We believe quality healthcare should be within reach for everyone, regardless of location or income." },
  { icon: HeartHandshake, title: "Compassion", desc: "We deliver care with empathy, respect, and a deep commitment to patient wellbeing." },
  { icon: Trophy, title: "Excellence", desc: "We uphold the highest standards in healthcare through continuous improvement and professional expertise." },
  { icon: Lightbulb, title: "Innovation", desc: "We leverage technology and forward-thinking solutions to improve healthcare delivery and outcomes." },
  { icon: Shield, title: "Integrity", desc: "We operate with transparency, accountability, and ethical responsibility in all we do." },
  { icon: Users, title: "Collaboration", desc: "We work with healthcare professionals, partners, and communities to achieve better health outcomes together." },
];

const milestones = [
  { year: "2023", title: "DesolMed founded", desc: "A small team in Lagos sets out to solve the trust gap in Nigerian telemedicine." },
  { year: "\n", title: "\n", desc: "\n" },
  { year: "2026", title: "National coverage", desc: "Verified doctors are active in all 36 states. The partner network expands." },
  { year: "\n", title: "\n", desc: "\n" },
];

const leaders = [
  { name: "Adaeze O.", role: "Co-founder, CEO", initials: "AO" },
  { name: "Tunde A.", role: "Co-founder, CTO", initials: "TA" },
  { name: "Halima S.", role: "Head of Clinical", initials: "HS" },
  { name: "Emeka N.", role: "Head of Partnerships", initials: "EN" },
];

const About = () => (
  <SiteLayout>
    {/* Hero */}
    <section className="border-b border-border bg-muted/30">
      <div className="container py-16 lg:py-24 max-w-4xl">
        <SectionLabel number="" label="About DesolMed" />
        <h1 className="mt-4 font-display text-5xl sm:text-6xl font-bold leading-[1.05] text-balance">
          Building a Healthier Africa, One <span className="text-secondary italic">Trusted Connection</span> at a Time.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          DesolMed is a telemedicine platform on a mission to make trusted medical care accessible to everyone — regardless of geography, income or background.
        </p>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="container py-20 grid md:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border">
      <div className="bg-card p-10">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary mb-4">
          <Target className="h-5 w-5" />
        </span>
        <h2 className="font-display text-2xl font-bold">Our Mission</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Our mission is to bridge gaps in healthcare access across the developing world by delivering affordable, high-quality personal health services. We combine the expertise of leading health professionals with the latest technology to make care more accessible, efficient, and patient-centered.
        </p>
      </div>
      <div className="bg-card p-10">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary/10 text-secondary mb-4">
          <Eye className="h-5 w-5" />
        </span>
        <h2 className="font-display text-2xl font-bold">Our Vision</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          To become a trusted leader in transforming healthcare access across the developing world, where affordable, high-quality care is available to every individual irrespective of location through innovation and expert delivery.
        </p>
      </div>
    </section>

    {/* Milestones */}
    <section className="border-y border-border bg-muted/30">
      <div className="container py-20 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-32 lg:self-start">
          <SectionLabel number="" label="Milestones" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
            How We Got Here.
          </h2>
        </div>
        <ol className="lg:col-span-8 relative border-l-2 border-border pl-8 space-y-10">
          {[...milestones].reverse().map((m, i) => (
            <li key={m.year} className="relative">
              {i !== 0 && (
                <span className="absolute -left-[2.4rem] top-1.5 grid h-6 w-6 place-items-center rounded-full bg-card">
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                </span>
              )}
              <p className="font-display text-secondary font-bold text-sm tracking-wider">{m.year}</p>
              <h3 className="font-display text-xl font-bold mt-1">{m.title}</h3>
              <p className="mt-1.5 text-muted-foreground leading-relaxed">{m.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* Values */}
    <section className="container py-20">
      <div className="max-w-2xl mb-12 space-y-3">
        <SectionLabel number="" label="Values" />
        <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
          What We Stand For.
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
        {values.map((v) => (
          <div key={v.title} className="bg-card p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl gradient-hero text-primary-foreground mb-4">
              <v.icon className="h-5 w-5" />
            </span>
            <h3 className="font-display text-lg font-semibold">{v.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Leadership */}
    <section className="container py-20 border-t border-border">
      <div className="max-w-2xl mb-12 space-y-3">
        <SectionLabel number="" label="Leadership" />
        <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
          The Team Behind DesolMed.
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {leaders.map((l) => (
          <div key={l.name} className="rounded-2xl border border-border bg-card p-6 text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary-soft text-primary font-display font-bold text-2xl">
              {l.initials}
            </span>
            <p className="mt-4 font-display text-lg font-semibold">{l.name}</p>
            <p className="text-sm text-secondary font-medium">{l.role}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Contact Information */}
    <section className="border-t border-border bg-muted/30">
      <div className="container py-20">
        <div className="max-w-2xl mb-12 space-y-3">
          <SectionLabel number="" label="Get in Touch" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
            Visit Us or Reach Out.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Addresses */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary mt-1 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-1">Ebute Metta</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    10, Abeokuta Street<br />
                    Ebute Metta, Yaba<br />
                    Lagos, Nigeria
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary/10 text-secondary mt-1 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-1">Abijo</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    12, Balogun Estate Rd<br />
                    Opp. Fara Park<br />
                    Abijo, Ibeju-Lekki<br />
                    Lagos, Nigeria
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary mt-1 flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-2">Phone Numbers</h3>
                  <div className="space-y-2">
                    <a href="tel:+2348186899594" className="text-muted-foreground hover:text-primary transition-colors">
                      +234 818 689 9594
                    </a>
                    <br />
                    <a href="tel:+2348165595677" className="text-muted-foreground hover:text-primary transition-colors">
                      +234 816 559 5677
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-green-500/10 text-green-600 mt-1 flex-shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-2">WhatsApp</h3>
                  <a href="https://wa.me/2348186899594" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 transition-colors font-medium">
                    +234 818 689 9594
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="container py-20">
      <DualCta />
    </section>
  </SiteLayout>
);

export default About;
