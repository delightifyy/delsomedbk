import { Link, useParams } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DOCTORS } from "@/data/doctors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionLabel } from "@/components/site/SectionLabel";
import { DoctorCard } from "@/components/site/DoctorCard";
import {
  MapPin, ShieldCheck, ArrowLeft, Stethoscope, CalendarClock,
  Phone, Mail, Globe, Star, Wallet, Clock,
} from "lucide-react";
import { useEffect, useMemo } from "react";

const DoctorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { doctor, missingDoctor } = useMemo(() => {
    const found = DOCTORS.find((d) => d.id === id);
    return { doctor: found ?? DOCTORS[0], missingDoctor: !found };
  }, [id]);

  useEffect(() => {
    if (doctor) document.title = `${doctor.name} · DesolMed`;
  }, [doctor]);

  const related = DOCTORS.filter((d) => d.id !== doctor.id && d.specialty === doctor.specialty).slice(0, 3);

  return (
    <SiteLayout>
      {missingDoctor && (
        <div className="container py-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Requested doctor not found — showing an example profile so booking works.
          </div>
        </div>
      )}
      {/* Back link */}
      <div className="container pt-6">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link to="/doctors"><ArrowLeft className="h-4 w-4" /> All Doctors</Link>
        </Button>
      </div>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="container py-8 sm:py-12 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <div className="relative">
              <div className="grid place-items-center h-44 w-44 sm:h-56 sm:w-56 rounded-3xl bg-primary-soft text-primary font-display font-bold text-6xl sm:text-7xl shadow-card overflow-hidden">
                {doctor.photo ? (
                  <img
                    src={doctor.photo}
                    alt={`${doctor.name} portrait`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  doctor.initials
                )}
              </div>
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-secondary-foreground bg-secondary px-3 py-1.5 rounded-full shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Doctor
              </span>
            </div>
          </div>

          <div className="lg:col-span-8">
            <SectionLabel number="" label="Doctor Profile" />
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold leading-tight">
              {doctor.name}
            </h1>
            <p className="mt-2 text-secondary text-lg font-medium">{doctor.specialty}</p>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
              {doctor.bio}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary-soft text-primary">
                <Stethoscope className="h-3.5 w-3.5 mr-1" />{doctor.specialty}
              </Badge>
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1" />{doctor.city}, {doctor.state}
              </Badge>
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                {doctor.zone} Zone
              </Badge>
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                <CalendarClock className="h-3.5 w-3.5 mr-1" />{doctor.yearsExperience}+ yrs
              </Badge>
              <Badge variant="secondary" className="bg-secondary/15 text-secondary">
                <Wallet className="h-3.5 w-3.5 mr-1" />₦{doctor.consultationFee.toLocaleString()} / consult
              </Badge>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to={`/medicare/${doctor.id}`}>
                  <Globe className="h-4 w-4 mr-2" /> Visit Website
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Mail className="h-4 w-4" /> Message
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container py-10 sm:py-14 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold">About</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{doctor.bio}</p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {doctor.name} is a verified member of the DesolMed network, practising in {doctor.city}, {doctor.state}.
              Patients can connect through DesolMed for in-person consultations, follow-ups and second opinions.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold">Areas of Focus</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3">
              {[doctor.specialty, "Preventive care", "Chronic conditions", "Lifestyle counselling"].map((f) => (
                <li key={f} className="rounded-xl border border-border p-4 bg-card flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-display text-2xl font-bold">Available Time Slots</h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Times shown in WAT
              </span>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {doctor.availability.map((day) => (
                <div key={day.day} className="rounded-xl border border-border p-4 bg-card">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground">{day.day}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {day.slots.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-background hover:border-secondary hover:bg-secondary/10 hover:text-secondary transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold">Patient Reviews</h2>
            <div className="mt-4 space-y-3">
              {[
                { name: "M.A.", text: "Listened carefully and explained options clearly. Highly recommend." },
                { name: "T.O.", text: "Professional, kind and never rushed. Felt heard throughout the visit." },
              ].map((r) => (
                <div key={r.name} className="rounded-xl border border-border p-4 bg-card">
                  <div className="flex items-center gap-1 text-secondary">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">"{r.text}"</p>
                  <p className="mt-1 text-xs text-muted-foreground">— {r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-sm font-semibold tracking-wider">Practice</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Location</dt>
                  <dd className="font-medium">{doctor.city}, {doctor.state}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarClock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Experience</dt>
                  <dd className="font-medium">{doctor.yearsExperience} years</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Wallet className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Consultation Fee</dt>
                  <dd className="font-medium">₦{doctor.consultationFee.toLocaleString()}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Phone</dt>
                  <dd className="font-medium">Available after booking</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Website</dt>
                  <dd className="font-medium text-muted-foreground">desolmed.com/doctors/{doctor.id}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-primary-soft p-5">
            <h3 className="font-display text-base font-semibold">Schedule an Appointment</h3>
            <p className="mt-2 text-sm text-muted-foreground">Book a consultation with {doctor.name} on their booking page.</p>
            <Button variant="hero" className="w-full mt-4" asChild>
              <Link to={`/medicare/${doctor.id}`}>
                <Globe className="h-4 w-4 mr-2" /> Visit Website
              </Link>
            </Button>
          </div>
        </aside>
      </section>



      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="container py-12">
            <SectionLabel number="" label={`More ${doctor.specialty} Doctors`} />
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold">Similar Specialists</h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((d) => (
                <Link key={d.id} to={`/doctors/${d.id}`} className="block">
                  <DoctorCard doctor={d} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
};

export default DoctorProfile;
