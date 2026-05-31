import { Link, useParams } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { type Doctor } from "@/data/doctors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionLabel } from "@/components/site/SectionLabel";
import { DoctorCard } from "@/components/site/DoctorCard";
import {
  MapPin, ShieldCheck, ArrowLeft, Stethoscope, CalendarClock,
  Phone, Mail, Globe, Star, Wallet, Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { collection, doctorFromApi } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";

const DoctorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [related, setRelated] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadDoctor = async () => {
      if (!id) return;
      try {
        const response = await api.doctors.detail(id);
        const mapped = doctorFromApi(response.data);
        if (!cancelled) {
          setDoctor(mapped);
          const listResponse = await api.doctors.list({ per_page: 8 });
          const nextRelated = collection(listResponse.data)
            .map((entry, index) => doctorFromApi(entry, index))
            .filter((entry) => entry.id !== mapped.id && entry.specialty === mapped.specialty)
            .slice(0, 3);
          if (!cancelled) setRelated(nextRelated);
        }
      } catch {
        if (!cancelled) {
          setDoctor(null);
          setRelated([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDoctor();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (doctor) document.title = `${doctor.name} · DesolMed`;
  }, [doctor]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="container py-8 sm:py-12 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <Skeleton className="h-44 w-44 sm:h-56 sm:w-56 rounded-3xl" />
          </div>
          <div className="lg:col-span-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-12 w-3/4" />
            <Skeleton className="mt-3 h-6 w-44" />
            <Skeleton className="mt-5 h-5 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-5 w-5/6 max-w-xl" />
            <div className="mt-5 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-7 w-28 rounded-full" />
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Skeleton className="h-11 w-40 rounded-md" />
              <Skeleton className="h-11 w-28 rounded-md" />
            </div>
          </div>
        </div>
        <section className="container py-10 sm:py-14 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-7 w-40" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-3 h-4 w-11/12" />
              </div>
            ))}
          </div>
          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </aside>
        </section>
      </SiteLayout>
    );
  }

  if (!doctor) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center space-y-4">
          <h1 className="font-display text-3xl font-bold">Doctor not found</h1>
          <p className="text-muted-foreground">This profile is not available from the backend.</p>
          <Button asChild variant="outline">
            <Link to="/doctors"><ArrowLeft className="h-4 w-4" /> All Doctors</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }
  const missingDoctor = false;

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
              {doctor.profile_url ? (
                <Button variant="hero" size="lg" asChild>
                  <a href={doctor.profile_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" /> Doctor Website
                  </a>
                </Button>
              ) : (
                <Button variant="hero" size="lg" disabled>
                  <Globe className="h-4 w-4 mr-2" /> Doctor Website not available
                </Button>
              )}
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
              DesolMed helps patients discover and verify this profile; appointment booking continues on the doctor's own website.
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
              <h2 className="font-display text-2xl font-bold">Availability Preview</h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Final booking happens on the doctor website
              </span>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {doctor.availability.map((day) => (
                <div key={day.day} className="rounded-xl border border-border p-4 bg-card">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground">{day.day}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {day.slots.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-background text-muted-foreground"
                      >
                        {s}
                      </span>
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
                  <dd className="font-medium">Managed on doctor website</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Website</dt>
                  <dd className="font-medium text-muted-foreground">Doctor Medicare website</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-primary-soft p-5">
            <h3 className="font-display text-base font-semibold">Doctor Website</h3>
            <p className="mt-2 text-sm text-muted-foreground">DesolMed verifies and lists {doctor.name}. Open the doctor's Medicare website, then book the appointment there.</p>
            <Button variant="hero" className="w-full mt-4" asChild>
              <Link to={`/doctor-portal?doctor=${doctor.id}`}>
                <Globe className="h-4 w-4 mr-2" /> Doctor Website
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
