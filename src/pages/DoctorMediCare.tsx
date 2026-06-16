import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { DOCTORS, type Doctor } from "@/data/doctors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { doctorFromApi } from "@/lib/backendAdapters";
import {
  addDays,
  buildFallbackPublicAvailability,
  formatDateValue,
  normalizePublicAvailability,
  type PublicAvailabilityDate,
} from "@/lib/miniSiteAvailability";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Wallet,
} from "lucide-react";

type BookingStep = 0 | 1 | 2 | 3;
type BookingMethod = "pay-now" | "hmo" | "subscription";

const BOOKING_STEPS = ["Select date", "Select time", "Patient details", "Payment"];

// Add this interface for the prop
interface DoctorMediCareProps {
  doctorIdParam?: string;  // For when called from subdomain
}

const extractMiniSiteSlug = (profileUrl?: string | null) => {
  if (!profileUrl) return "";
  try {
    const url = new URL(profileUrl);
    const [firstHostPart] = url.hostname.split(".");
    if (firstHostPart && !["www", "delsomed", "desolmed"].includes(firstHostPart.toLowerCase())) {
      return firstHostPart;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] === "mini-sites" ? parts[1] ?? "" : "";
  } catch {
    return "";
  }
};

// Modified to accept the prop
const DoctorMediCare = ({ doctorIdParam }: DoctorMediCareProps = {}) => {
  const { toast } = useToast();
  // Get doctorId from either the prop (subdomain mode) or URL param (regular mode)
  const { doctorId: paramDoctorId } = useParams<{ doctorId: string }>();
  const doctorId = doctorIdParam || paramDoctorId;
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDoctor = async () => {
      setLoadingDoctor(true);
      try {
        if (!doctorId) {
          if (!cancelled) setDoctor(DOCTORS[0] ?? null);
          return;
        }

        const response = await api.doctors.detail(doctorId);
        const mapped = doctorFromApi(response.data);
        if (!cancelled) setDoctor(mapped);
      } catch {
        if (!cancelled) {
          setDoctor(DOCTORS.find((entry) => entry.id === doctorId) ?? DOCTORS[0] ?? null);
        }
      } finally {
        if (!cancelled) setLoadingDoctor(false);
      }
    };

    void loadDoctor();
    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  const selectedDoctor = doctor ?? DOCTORS.find((entry) => entry.id === doctorId) ?? DOCTORS[0];
  const missingDoctor = Boolean(doctorId && !doctor && !loadingDoctor);
  const routeParamLooksLikeSlug = Boolean(missingDoctor && doctorId && selectedDoctor.id !== doctorId);
  const miniSiteSlug = useMemo(
    () => extractMiniSiteSlug(selectedDoctor.profile_url) || (routeParamLooksLikeSlug ? doctorId ?? "" : ""),
    [doctorId, routeParamLooksLikeSlug, selectedDoctor.profile_url],
  );

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
  const [bookingDates, setBookingDates] = useState<PublicAvailabilityDate[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const bookingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (loadingDoctor) return;
    let cancelled = false;

    const loadAvailability = async () => {
      setLoadingAvailability(true);
      setAvailabilityError(null);
      const today = new Date();
      const query = {
        from: formatDateValue(today),
        to: formatDateValue(addDays(today, 20)),
      };

      try {
        const response = miniSiteSlug
          ? await api.medicare.public.availability(miniSiteSlug, query)
          : doctorId
            ? await api.doctors.availability(doctorId, query)
            : null;

        if (!response) throw new Error("Doctor identifier is missing.");
        const normalized = normalizePublicAvailability(response.data);
        if (!cancelled) setBookingDates(normalized.dates);
      } catch {
        if (!cancelled) {
          setAvailabilityError("Live availability is temporarily unavailable. Showing sample slots.");
          setBookingDates(buildFallbackPublicAvailability(selectedDoctor.availability));
        }
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    };

    void loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [doctorId, loadingDoctor, miniSiteSlug, selectedDoctor.availability]);

  const firstBookableDate = bookingDates.find((day) => day.slots.length > 0);
  const activeBookingDate = bookingDates.find((day) => day.value === bookingDate) ?? firstBookableDate ?? bookingDates[0];
  const availableSlots = activeBookingDate?.slots ?? [];
  const hasBookableDates = bookingDates.some((day) => day.slots.length > 0);

  useEffect(() => {
    if (!bookingDates.length) {
      setBookingDate("");
      return;
    }
    setBookingDate((current) => {
      const currentDate = bookingDates.find((day) => day.value === current && day.slots.length > 0);
      return currentDate?.value ?? bookingDates.find((day) => day.slots.length > 0)?.value ?? "";
    });
  }, [bookingDates]);

  useEffect(() => {
    if (!availableSlots.length) {
      setBookingTime("");
      return;
    }
    setBookingTime((current) => (availableSlots.includes(current) ? current : availableSlots[0]));
  }, [availableSlots]);

  useEffect(() => {
    document.title = selectedDoctor ? `${selectedDoctor.name}` : "Doctor Website";
  }, [selectedDoctor]);

  const submitBooking = (event: FormEvent) => {
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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link
            to={`/doctor-portal?doctor=${selectedDoctor.id}`}
            className="flex items-center gap-2 font-display text-lg font-bold text-blue-700"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            {selectedDoctor?.name ?? "Doctor Website"}
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to={`/doctor-portal?doctor=${selectedDoctor.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Doctor Website
            </Link>
          </Button>
        </div>
      </header>

      {missingDoctor && (
        <div className="container pt-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Doctor profile not found. Showing an example doctor website booking page.
          </div>
        </div>
      )}

      <section className="border-b border-slate-200 bg-white">
        <div className="container grid gap-8 py-8 sm:py-12 lg:grid-cols-12 lg:items-center">
          <div className="flex justify-center lg:col-span-4 lg:justify-start">
            <div className="relative">
              <div className="grid h-44 w-44 place-items-center overflow-hidden rounded-3xl bg-blue-50 font-display text-6xl font-bold text-blue-700 shadow-xl shadow-blue-900/10 sm:h-56 sm:w-56 sm:text-7xl">
                {selectedDoctor.photo ? (
                  <img
                    src={selectedDoctor.photo}
                    alt={`${selectedDoctor.name} portrait`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  selectedDoctor.initials
                )}
              </div>
              <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-teal-500 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-white shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Doctor
              </span>
            </div>
          </div>

          <div className="lg:col-span-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              {selectedDoctor?.name ?? "Doctor Website"}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">{selectedDoctor.name}</h1>
            <p className="mt-2 text-lg font-medium text-teal-600">{selectedDoctor.specialty}</p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {selectedDoctor.bio} Appointment booking is handled here on the doctor's own website.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                <Stethoscope className="h-3.5 w-3.5 mr-1" />
                {selectedDoctor.specialty}
              </Badge>
              <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {selectedDoctor.city}, {selectedDoctor.state}
              </Badge>
              <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                <CalendarClock className="h-3.5 w-3.5 mr-1" />
                {selectedDoctor.yearsExperience}+ yrs
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Wallet className="h-3.5 w-3.5 mr-1" />N{selectedDoctor.consultationFee.toLocaleString()} / consult
              </Badge>
            </div>

            <Button
              type="button"
              className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              onClick={() => bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              Book Appointment
            </Button>
          </div>
        </div>
      </section>

      <section ref={bookingRef} className="container py-12 sm:py-16">
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
              <div className="flex items-center justify-between gap-2">
                {BOOKING_STEPS.map((step, idx) => (
                  <div key={step} className="flex flex-1 flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
                        idx === bookingStep
                          ? "bg-blue-600 text-white"
                          : idx < bookingStep
                            ? "bg-teal-50 text-teal-700"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {idx < bookingStep ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                    </div>
                    <p className="mt-2 text-center text-xs leading-tight text-slate-500">{step}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={submitBooking} className="space-y-6">
                {bookingStep === 0 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">Select a date</h3>
                      <p className="mt-1 text-sm text-slate-500">Pick a date with available slots.</p>
                    </div>
                    {loadingAvailability ? (
                      <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading available dates
                        </span>
                      </div>
                    ) : (
                      <>
                        {availabilityError && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            {availabilityError}
                          </div>
                        )}
                        {!bookingDates.length || !hasBookableDates ? (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                            <p className="font-semibold text-slate-700">No available slots yet</p>
                            <p className="mt-2 text-sm text-slate-500">Please check back later or contact the practice directly.</p>
                          </div>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {bookingDates.map((day) => {
                              const disabled = day.slots.length === 0;
                              return (
                                <button
                                  key={day.value}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => {
                                    setBookingDate(day.value);
                                    setBookingStep(1);
                                  }}
                                  className={`rounded-xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                                    day.value === bookingDate
                                      ? "border-blue-600 bg-blue-50"
                                      : disabled
                                        ? "border-slate-200 bg-slate-50"
                                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                                  }`}
                                >
                                  <p className="font-semibold">{day.label}</p>
                                  <p className="mt-1 text-xs text-slate-500">{day.day}</p>
                                  <p className={`mt-2 text-xs font-medium ${disabled ? "text-slate-400" : "text-blue-700"}`}>
                                    {disabled ? "No slots" : `${day.slots.length} slots available`}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {bookingStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">Select a time</h3>
                      <p className="mt-1 text-sm text-slate-500">Available for {activeBookingDate?.label}</p>
                    </div>
                    {availableSlots.length ? (
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
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                        No slots are available for this date.
                      </div>
                    )}
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setBookingStep(0)}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        disabled={!bookingTime}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => setBookingStep(2)}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {bookingStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">Your details</h3>
                      <p className="mt-1 text-sm text-slate-500">Tell the doctor's practice who the visit is for.</p>
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
                      <div className="grid gap-4 sm:grid-cols-2">
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
                      <Button type="button" variant="outline" onClick={() => setBookingStep(1)}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => setBookingStep(3)}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {bookingStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">Payment method</h3>
                      <p className="mt-1 text-sm text-slate-500">How will you pay for this consultation?</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { value: "pay-now", title: "Pay Now", desc: "Card, transfer, or mobile wallet" },
                        { value: "hmo", title: "HMO Organization", desc: "Use your health organization plan" },
                        { value: "subscription", title: "Subscription", desc: "Use an active subscription plan" },
                      ].map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setBookingMethod(method.value as BookingMethod)}
                          className={`w-full rounded-xl border p-4 text-left transition-all ${
                            bookingMethod === method.value
                              ? "border-blue-600 bg-blue-50"
                              : "border-slate-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <p className="font-semibold">{method.title}</p>
                          <p className="text-sm text-slate-500">{method.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold">Booking Summary</p>
                      <div className="space-y-1 text-sm text-slate-500">
                        <p>{patient.fullName || "Your name"}</p>
                        <p>{activeBookingDate?.label ?? "Date TBD"} at {bookingTime || "Time TBD"}</p>
                        <p>{bookingMethod.replace("-", " ")}</p>
                        <p>{selectedDoctor.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setBookingStep(2)}>
                        Back
                      </Button>
                      <Button type="submit" className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                        Confirm & Book
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            {bookingSuccess ? (
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center">
                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-teal-600" />
                <p className="font-semibold text-teal-700">Booking Confirmed!</p>
                <p className="mt-2 text-sm text-slate-600">
                  {patient.fullName}, your consultation is scheduled for {activeBookingDate?.label} at {bookingTime}.
                </p>
                <p className="mt-3 text-xs text-slate-500">Confirmation sent to {patient.email}</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-display text-sm font-semibold tracking-wider">Consultation Fee</h3>
                  <p className="mt-3 text-3xl font-bold">N{selectedDoctor.consultationFee.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-slate-500">One-time consultation</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-display text-sm font-semibold tracking-wider">What to expect</h3>
                  <ul className="mt-4 space-y-3">
                    <li className="flex gap-3">
                      <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                      <span className="text-sm text-slate-600">30-minute consultation</span>
                    </li>
                    <li className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                      <span className="text-sm text-slate-600">Secure and private</span>
                    </li>
                    <li className="flex gap-3">
                      <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                      <span className="text-sm text-slate-600">Prescription via email</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-display text-sm font-semibold tracking-wider">Doctor Info</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Experience</dt>
                      <dd className="font-medium">{selectedDoctor.yearsExperience} years</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Location</dt>
                      <dd className="font-medium">{selectedDoctor.city}, {selectedDoctor.state}</dd>
                    </div>
                  </dl>
                </div>
              </>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
};

export default DoctorMediCare;