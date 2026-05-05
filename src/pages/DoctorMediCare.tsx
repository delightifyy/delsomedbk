import { useParams, Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DOCTORS } from "@/data/doctors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionLabel } from "@/components/site/SectionLabel";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, ShieldCheck, Stethoscope, CalendarClock, Phone, Mail, 
  Globe, Star, Wallet, Clock, ArrowLeft, ArrowRight, CheckCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type BookingStep = 0 | 1 | 2 | 3;
type BookingMethod = "pay-now" | "hmo" | "subscription";

const BOOKING_STEPS = ["Select date", "Select time", "Enter patient details", "Choose payment method"];

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

const buildBookingDates = (availability: { day: string; slots: string[] }[]) => {
  const byDay = new Map(availability.map((day) => [day.day, day.slots]));
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

const DoctorMediCare = () => {
  const { toast } = useToast();
  const { doctorId } = useParams<{ doctorId: string }>();
  const { doctor, missingDoctor } = useMemo(() => {
    const found = DOCTORS.find((d) => d.id === doctorId);
    return { doctor: found ?? DOCTORS[0], missingDoctor: !found };
  }, [doctorId]);

  const [bookingStep, setBookingStep] = useState<BookingStep>(0);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingMethod, setBookingMethod] = useState<BookingMethod>("pay-now");
  const [patient, setPatient] = useState({
    fullName: "",
    email: "",
    phone: "",
    reason: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const bookingRef = useRef<HTMLDivElement | null>(null);

  const bookingDates = useMemo(() => (doctor ? buildBookingDates(doctor.availability) : []), [doctor]);
  const activeBookingDate = bookingDates.find((day) => day.value === bookingDate) ?? bookingDates[0];
  const availableSlots = useMemo(() => activeBookingDate?.slots ?? [], [activeBookingDate]);

  useEffect(() => {
    if (!bookingDates.length) return;
    setBookingDate((current) => (bookingDates.some((day) => day.value === current) ? current : bookingDates[0].value));
  }, [bookingDates]);

  useEffect(() => {
    if (!availableSlots.length) return;
    setBookingTime((current) => (availableSlots.includes(current) ? current : availableSlots[0]));
  }, [availableSlots]);

  useEffect(() => {
    if (doctor) document.title = `Book ${doctor.name} · MediCare`;
  }, [doctor]);


  const submitBooking = (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingDate || !bookingTime || !patient.fullName.trim() || !patient.phone.trim() || !patient.email.trim()) {
      toast({
        title: "Complete the booking",
        description: "Choose a date, time, patient details and a payment method.",
        variant: "destructive",
      });
      return;
    }

    setBookingSuccess(true);
    toast({
      title: "Appointment confirmed",
      description: `${patient.fullName} is booked for ${activeBookingDate?.label ?? bookingDate} at ${bookingTime}.`,
    });

    setTimeout(() => {
      setBookingStep(0);
      setPatient({ fullName: "", email: "", phone: "", reason: "" });
      setBookingSuccess(false);
    }, 3000);
  };

  return (
    <SiteLayout>
      {/* Back to MediCare */}
      <div className="container pt-6">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link to="/doctor-portal">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to MediCare
          </Link>
        </Button>
      </div>

      {/* {missingDoctor && (
        <div className="container py-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Doctor profile not found — showing an example profile.
          </div>
        </div>
      )} */}

      {/* Doctor Header */}
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
            <SectionLabel number="" label="Book Your Consultation" />
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold leading-tight">
              Dr. {doctor.name}
            </h1>
            <p className="mt-2 text-secondary text-lg font-medium">{doctor.specialty}</p>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
              {doctor.bio}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary-soft text-primary">
                <Stethoscope className="h-3.5 w-3.5 mr-1" />
                {doctor.specialty}
              </Badge>
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {doctor.city}, {doctor.state}
              </Badge>
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                <CalendarClock className="h-3.5 w-3.5 mr-1" />
                {doctor.yearsExperience}+ yrs
              </Badge>
              <Badge variant="secondary" className="bg-secondary/15 text-secondary">
                <Wallet className="h-3.5 w-3.5 mr-1" />₦{doctor.consultationFee.toLocaleString()} / consult
              </Badge>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="hero"
                onClick={() => bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section ref={bookingRef} className="container py-12 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Booking Form */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-8">
              {/* Steps */}
              <div className="flex items-center justify-between gap-2">
                {BOOKING_STEPS.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full font-semibold transition-all ${
                        idx === bookingStep
                          ? "bg-secondary text-secondary-foreground"
                          : idx < bookingStep
                            ? "bg-secondary/20 text-secondary"
                            : "bg-border text-muted-foreground"
                      }`}
                    >
                      {idx < bookingStep ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                    </div>
                    <p className="mt-2 text-xs text-center leading-tight text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={submitBooking} className="space-y-6">
                {/* Step 0: Date */}
                {bookingStep === 0 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">Select a date</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Pick a date with available slots.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {bookingDates.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            setBookingDate(day.value);
                            setBookingStep(1);
                          }}
                          className={`rounded-xl border p-4 text-left transition-all ${
                            day.value === bookingDate
                              ? "border-secondary bg-secondary/10"
                              : "border-border bg-background hover:border-secondary/50 hover:bg-secondary/5"
                          }`}
                        >
                          <p className="font-semibold">{day.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{day.day}</p>
                          <p className="mt-2 text-xs text-secondary font-medium">{day.slots.length} slots available</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Time */}
                {bookingStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">Select a time</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Available for {activeBookingDate?.label}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setBookingTime(slot);
                            setBookingStep(2);
                          }}
                          className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                            bookingTime === slot
                              ? "border-secondary bg-secondary text-secondary-foreground"
                              : "border-border bg-background hover:border-secondary hover:bg-secondary/10"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setBookingStep(0)}>Back</Button>
                      <Button type="button" variant="hero" className="flex-1">Continue</Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Patient Details */}
                {bookingStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">Your details</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Tell us about yourself.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full name</Label>
                        <Input
                          value={patient.fullName}
                          onChange={(e) => setPatient((p) => ({ ...p, fullName: e.target.value }))}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={patient.email}
                            onChange={(e) => setPatient((p) => ({ ...p, email: e.target.value }))}
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            type="tel"
                            value={patient.phone}
                            onChange={(e) => setPatient((p) => ({ ...p, phone: e.target.value }))}
                            placeholder="+234..."
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Reason for visit</Label>
                        <Textarea
                          value={patient.reason}
                          onChange={(e) => setPatient((p) => ({ ...p, reason: e.target.value }))}
                          placeholder="Briefly describe your symptoms or concern"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setBookingStep(1)}>Back</Button>
                      <Button type="button" variant="hero" className="flex-1" onClick={() => setBookingStep(3)}>Continue</Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {bookingStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">Payment method</h3>
                      <p className="mt-1 text-sm text-muted-foreground">How will you pay for this consultation?</p>
                    </div>
                    <div className="space-y-3">
                      {([
                        { value: "pay-now", title: "Pay Now", desc: "Card, transfer, or mobile wallet" },
                        { value: "hmo", title: "HMO Insurance", desc: "Use your health insurance plan" },
                        { value: "subscription", title: "Subscription", desc: "Use an active subscription plan" },
                      ] as const).map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setBookingMethod(method.value)}
                          className={`rounded-xl border p-4 text-left transition-all ${
                            bookingMethod === method.value
                              ? "border-secondary bg-secondary/10"
                              : "border-border bg-background hover:border-secondary/50"
                          }`}
                        >
                          <p className="font-semibold">{method.title}</p>
                          <p className="text-sm text-muted-foreground">{method.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                      <p className="font-semibold">Booking Summary</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• {patient.fullName || "Your name"}</p>
                        <p>• {activeBookingDate?.label ?? "Date TBD"} at {bookingTime || "Time TBD"}</p>
                        <p>• {bookingMethod.replace("-", " ")}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setBookingStep(2)}>Back</Button>
                      <Button type="submit" variant="hero" className="flex-1">
                        Confirm & Book
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {bookingSuccess ? (
              <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-6 text-center">
                <CheckCircle className="h-12 w-12 text-secondary mx-auto mb-3" />
                <p className="font-semibold text-secondary">Booking Confirmed!</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {patient.fullName}, your consultation is scheduled for {activeBookingDate?.label} at {bookingTime}.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">Confirmation sent to {patient.email}</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-display text-sm font-semibold tracking-wider">Consultation Fee</h3>
                  <p className="mt-3 text-3xl font-bold">₦{doctor.consultationFee.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-muted-foreground">One-time consultation</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-display text-sm font-semibold tracking-wider">What to expect</h3>
                  <ul className="mt-4 space-y-3">
                    <li className="flex gap-3">
                      <Clock className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">30-minute consultation</span>
                    </li>
                    <li className="flex gap-3">
                      <ShieldCheck className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Secure & private</span>
                    </li>
                    <li className="flex gap-3">
                      <Mail className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Prescription via email</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-display text-sm font-semibold tracking-wider">Doctor Info</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Experience</dt>
                      <dd className="font-medium">{doctor.yearsExperience} years</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Location</dt>
                      <dd className="font-medium">{doctor.city}, {doctor.state}</dd>
                    </div>
                  </dl>
                </div>
              </>
            )}
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
};

export default DoctorMediCare;
