import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, Check, X, Search, Sparkles, Brain, Heart, Baby, Ear,
  Activity, Stethoscope, Clock, ShieldCheck, CreditCard, BadgeCheck, Briefcase,
  Calendar as CalendarIcon, Loader2, Video, Download, CalendarPlus, AlertTriangle,
  User as UserIcon, Building2, Hospital,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchBookingData, fetchSlotsFor, formatPrice,
  type ConcernCategory, type Concern, type ClinicianType, type ConcernClinicianMap,
  type TimeSlot, type IntakeField, type LegalAgreement, type PaymentMethod,
  type HmoProvider, type SubscriptionPlan, type BookingSettings,
} from "@/lib/bookingApi";
import { useAuth } from "@/hooks/useAuth";
import { signInPatientWithPassword, signUpPatient } from "@/lib/localStore";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  Stethoscope, Sparkles, Brain, Heart, Baby, Ear, Activity,
  CreditCard, ShieldCheck, BadgeCheck, Briefcase, Building2, Hospital,
};

const STEPS = [
  "Concern", "Date & Time", "Patient Info",
  "Verification", "Payment", "Confirmation",
] as const;

const CONSULTATION_DURATIONS = [
  { minutes: 30, label: "30 minutes", priceCents: 200000, durationText: "30 min" },
  { minutes: 60, label: "1 hour", priceCents: 400000, durationText: "1 hour" },
] as const;

// Sample topics with prices (starting from 2000 Naira = 200000 cents)
const SAMPLE_TOPICS = [
  { id: "1", name: "General Consultation", priceCents: 200000, description: "General health discussion and advice", tags: ["general", "health"] },
  { id: "2", name: "Mental Health", priceCents: 250000, description: "Anxiety, depression, stress management", tags: ["anxiety", "depression", "stress"] },
  { id: "3", name: "Skin Care", priceCents: 300000, description: "Acne, rashes, skin conditions", tags: ["acne", "rash", "dermatology"] },
  { id: "4", name: "Child Health", priceCents: 220000, description: "Pediatric care and development", tags: ["baby", "child", "pediatric"] },
  { id: "5", name: "Women's Health", priceCents: 280000, description: "Reproductive health, pregnancy concerns", tags: ["women", "pregnancy", "reproductive"] },
  { id: "6", name: "Men's Health", priceCents: 280000, description: "Male health issues and concerns", tags: ["men", "male health"] },
];

// Sample organizations for organization payment
const SAMPLE_ORGANIZATIONS = [
  { id: "1", name: "Shell Petroleum Development Company", code: "SHELL" },
  { id: "2", name: "ExxonMobil", code: "EXXON" },
  { id: "3", name: "Chevron", code: "CHEVRON" },
  { id: "4", name: "NNPC Limited", code: "NNPC" },
  { id: "5", name: "First Bank of Nigeria", code: "FIRSTBANK" },
  { id: "6", name: "Zenith Bank", code: "ZENITH" },
  { id: "7", name: "GTBank", code: "GTB" },
  { id: "8", name: "MTN Nigeria", code: "MTN" },
];

function normalizeCurrencySymbol(symbol?: string | null) {
  return symbol && symbol.length <= 2 ? symbol : "N";
}

type Props = { open: boolean; onClose: () => void; initialPaymentMethod?: "card" | "subscription" | "hmo" | "organization" };

export default function BookingFlow({ open, onClose, initialPaymentMethod }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingFlowUser, setBookingFlowUser] = useState<any | null>(null);

  // Data
  const [categories, setCategories] = useState<ConcernCategory[]>([]);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [clinicians, setClinicians] = useState<ClinicianType[]>([]);
  const [map, setMap] = useState<ConcernClinicianMap[]>([]);
  const [intakeFields, setIntakeFields] = useState<IntakeField[]>([]);
  const [legal, setLegal] = useState<LegalAgreement[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [hmos, setHmos] = useState<HmoProvider[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  // Selections
  const [search, setSearch] = useState("");
  const [selectedConcern, setSelectedConcern] = useState<any | null>(null);
  const [selectedClinician, setSelectedClinician] = useState<ClinicianType | null>(null);
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<(typeof CONSULTATION_DURATIONS)[number]["minutes"]>(30);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [patient, setPatient] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [paymentKey, setPaymentKey] = useState<string>("");
  const [paymentMeta, setPaymentMeta] = useState<Record<string, string>>({});
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const displayCurrencySymbol = normalizeCurrencySymbol(settings?.currency_symbol);
  const selectedDuration = CONSULTATION_DURATIONS.find((item) => item.minutes === selectedDurationMinutes) ?? CONSULTATION_DURATIONS[0];

  // Get price for selected concern (if custom price exists, otherwise use base)
  const selectedConcernPrice = selectedConcern?.priceCents || 200000;
  const consultationCents = selectedConcernPrice;
  const totalCents = consultationCents +
    Math.round(consultationCents * (Number(settings?.tax_percent) || 0) / 100);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchBookingData().then((d) => {
      setCategories(d.categories);
      setConcerns(SAMPLE_TOPICS as any);
      setClinicians(d.clinicians);
      setMap(d.map);
      const filteredFields = d.intakeFields.filter(f => f.field_key !== "portal_code" && f.field_key !== "postal_code");
      const updatedFields = filteredFields.map(f => {
        if (f.field_key === "phone") {
          return { ...f, label: "Phone Number" };
        }
        if (f.field_key === "confirm_email") {
          return { ...f, label: "Confirm Email" };
        }
        // Add gender field with Male/Female options only
        if (f.field_key === "gender") {
          return { ...f, options: ["Male", "Female"] };
        }
        return f;
      });
      setIntakeFields(updatedFields);
      setLegal(d.legal);
      setMethods(d.methods);
      setHmos(d.hmos);
      setPlans(d.plans);
      setSettings(d.settings);
      if (initialPaymentMethod) setPaymentKey(initialPaymentMethod);
      else if (d.methods[0]) setPaymentKey(d.methods[0].key);
      setLoading(false);
    });
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(0); setSelectedConcern(null); setSelectedClinician(null);
        setSelectedDurationMinutes(30); setSelectedDate(null); setSelectedSlot(null); setPatient({}); setAgreed({});
        setBookingRef(null); setSearch(""); setPaymentMeta({}); setShowConfirmModal(false);
        setBookingFlowUser(null);
      }, 300);
    }
  }, [open]);

  // Load slots when clinician picked
  useEffect(() => {
    if (!selectedClinician) return;
    const today = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + 13 * 86400000).toISOString().slice(0, 10);
    fetchSlotsFor(selectedClinician.id, today, to).then((rawSlots) => {
      const transformedSlots = rawSlots.flatMap((slot) => {
        const baseTime = slot.slot_time;
        const [hours, minutes] = baseTime.split(":").map(Number);
        
        if (selectedDurationMinutes === 30) {
          return [{
            ...slot,
            slot_time: baseTime,
            slot_end_time: `${String(hours).padStart(2, '0')}:${String(minutes + 30).padStart(2, '0')}`,
          }];
        } else {
          if (minutes === 0) {
            return [{
              ...slot,
              slot_time: baseTime,
              slot_end_time: `${String(hours + 1).padStart(2, '0')}:00`,
            }];
          }
          return [];
        }
      });
      setSlots(transformedSlots);
    });
  }, [selectedClinician, selectedDurationMinutes]);

  useEffect(() => {
    if (!open || !bookingFlowUser) return;
    const nameParts = (bookingFlowUser.full_name || "").trim().split(/\s+/).filter(Boolean);
    setPatient((current) => ({
      ...current,
      first_name: current.first_name || nameParts[0] || "",
      last_name: current.last_name || nameParts.slice(1).join(" "),
      email: current.email || bookingFlowUser.email || "",
      confirm_email: current.confirm_email || bookingFlowUser.email || "",
    }));
  }, [open, bookingFlowUser]);

  const filteredConcerns = useMemo(() => {
    if (!search.trim()) return concerns;
    const q = search.toLowerCase();
    return concerns.filter((c: any) =>
      c.name.toLowerCase().includes(q) || c.tags.some((t: string) => t.toLowerCase().includes(q))
    );
  }, [concerns, search]);

  const getClinicianForConcern = (concern: any) => {
    return clinicians[0] ?? null;
  };

  const slotsByDate = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = {};
    slots.forEach((s) => {
      (groups[s.slot_date] ||= []).push(s);
    });
    return groups;
  }, [slots]);

  const availableDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);

  const allRequiredAgreed = legal.filter((l) => l.required).every((l) => agreed[l.key]);
  const allRequiredFields = intakeFields
    .filter((f) => f.required)
    .every((f) => (patient[f.field_key] || "").trim().length > 0);
  const emailsMatch = !patient.email || !patient.confirm_email || patient.email === patient.confirm_email;

  // Updated canNext - Card Provider and Organization no longer require verification
  const canNext = (() => {
    switch (step) {
      case 0: return !!selectedConcern && !!selectedClinician;
      case 1: return !!selectedSlot;
      case 2: return !!bookingFlowUser && allRequiredFields && emailsMatch;
      case 3: return allRequiredAgreed;
      case 4:
        if (!paymentKey) return false;
        if (paymentKey === "subscription") return paymentMeta.subscription_status === "active";
        // For Card Provider and Organization, we just need the basic details filled
        if (paymentKey === "hmo") {
          return !!(paymentMeta.hmo && paymentMeta.hmo_id);
        }
        if (paymentKey === "organization") {
          return !!(paymentMeta.organization && paymentMeta.employee_id);
        }
        return true;
      default: return true;
    }
  })();

  function handleConfirmBooking() {
    setShowConfirmModal(true);
  }

  async function submitBooking() {
    if (!selectedConcern || !selectedClinician || !selectedSlot) return;
    
    setShowConfirmModal(false);
    setSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cat = categories.find((c) => c.id === selectedConcern.category_id);
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        concern_id: selectedConcern.id,
        concern_name: selectedConcern.name,
        category_name: cat?.name,
        clinician_type_id: selectedClinician.id,
        clinician_type_name: selectedClinician.title,
        slot_id: selectedSlot.id,
        slot_date: selectedSlot.slot_date,
        slot_time: selectedSlot.slot_time,
        patient_data: {
          ...patient,
          user_id: bookingFlowUser?.id,
          consultation_duration_minutes: selectedDuration.minutes,
        },
        agreements: Object.keys(agreed).filter((k) => agreed[k]),
        payment_method: paymentKey,
        payment_meta: {
          ...paymentMeta,
          consultation_duration_minutes: String(selectedDuration.minutes),
          consultation_price_cents: String(consultationCents),
        },
        amount_cents: totalCents,
        currency: settings?.currency || "NGN",
        status: "confirmed",
      })
      .select("reference")
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast.error("Could not create booking. Please try again.");
      return;
    }
    supabase.rpc("increment_booking_slot", { _slot_id: selectedSlot.id }).then(() => {});
    setBookingRef(data.reference);
    setStep(6);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[hsl(var(--mc-dark))/0.6] backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="min-h-screen lg:py-8 lg:px-4 flex items-stretch lg:items-start justify-center"
      >
        <div className="w-full lg:max-w-6xl bg-[hsl(var(--mc-bg))] lg:rounded-3xl mc-shadow-elegant overflow-hidden flex flex-col min-h-screen lg:min-h-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[hsl(var(--mc-bg))]/95 backdrop-blur border-b border-[hsl(var(--mc-border))] px-4 sm:px-6 py-4 flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-xl mc-grad-primary text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--mc-muted))]">
                Step {Math.min(step + 1, STEPS.length)} of {STEPS.length}
              </p>
              <p className="font-display font-bold text-base sm:text-lg truncate">{STEPS[step]}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid place-items-center h-10 w-10 rounded-full bg-[hsl(var(--mc-muted-soft))] hover:bg-[hsl(var(--mc-border))] transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-4 sm:px-6 pt-4">
            <div className="h-1.5 w-full rounded-full bg-[hsl(var(--mc-muted-soft))] overflow-hidden">
              <div
                className="h-full mc-grad-primary transition-all duration-500"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 px-4 sm:px-6 py-6">
            {loading ? (
              <div className="grid place-items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--mc-primary))]" />
              </div>
            ) : (
              <>
                {step === 0 && (
                  <ConcernStep
                    concerns={filteredConcerns}
                    search={search}
                    setSearch={setSearch}
                    selected={selectedConcern}
                    onSelect={(c) => {
                      const clinician = getClinicianForConcern(c);
                      setSelectedConcern(c);
                      setSelectedClinician(clinician);
                      setSelectedDate(null);
                      setSelectedSlot(null);
                    }}
                    sym={displayCurrencySymbol}
                  />
                )}

                {step === 1 && (
                  <DateTimeStep
                    dates={availableDates}
                    slotsByDate={slotsByDate}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                    durationMinutes={selectedDurationMinutes}
                    setDurationMinutes={setSelectedDurationMinutes}
                    sym={displayCurrencySymbol}
                  />
                )}

                {step === 2 && (
                  <IntakeStep
                    fields={intakeFields}
                    values={patient}
                    setValues={setPatient}
                    emailsMatch={emailsMatch}
                    user={bookingFlowUser}
                    setUser={setBookingFlowUser}
                    authLoading={authLoading}
                  />
                )}

                {step === 3 && (
                  <VerificationStep
                    legal={legal}
                    agreed={agreed}
                    setAgreed={setAgreed}
                    emergencyWarning={settings?.emergency_warning || ""}
                    notice={settings?.booking_notice || ""}
                  />
                )}

                {step === 4 && (
                  <PaymentStep
                    methods={methods}
                    hmos={hmos}
                    organizations={SAMPLE_ORGANIZATIONS}
                    plans={plans}
                    paymentKey={paymentKey}
                    setPaymentKey={setPaymentKey}
                    meta={paymentMeta}
                    setMeta={setPaymentMeta}
                    currentUserId={bookingFlowUser?.id || ""}
                    summary={{
                      concern: selectedConcern,
                      clinician: selectedClinician,
                      slot: selectedSlot,
                      sym: displayCurrencySymbol,
                      taxPct: Number(settings?.tax_percent) || 0,
                      total: totalCents,
                      consultation: consultationCents,
                      duration: selectedDuration,
                    }}
                  />
                )}

                {step === 5 && bookingRef && (
                  <ConfirmationStep
                    reference={bookingRef}
                    summary={{
                      concern: selectedConcern,
                      clinician: selectedClinician,
                      slot: selectedSlot,
                      patient,
                      sym: displayCurrencySymbol,
                      total: totalCents,
                      duration: selectedDuration,
                    }}
                    message={settings?.confirmation_message || ""}
                    onClose={onClose}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!loading && step < STEPS.length - 1 && (
            <div className="sticky bottom-0 bg-[hsl(var(--mc-bg))]/95 backdrop-blur border-t border-[hsl(var(--mc-border))] px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-[hsl(var(--mc-border))] bg-white hover:bg-[hsl(var(--mc-muted-soft))] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {selectedClinician && step >= 1 && (
                <div className="hidden sm:flex flex-1 mx-4 text-xs text-[hsl(var(--mc-muted))] truncate">
                  <span className="font-semibold text-[hsl(var(--mc-fg))] mr-1">
                    {selectedClinician.title}
                  </span>
                  / {selectedDuration.label} / {formatPrice(totalCents, displayCurrencySymbol)}
                </div>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  disabled={!canNext}
                  className="inline-flex items-center gap-2 rounded-full mc-grad-primary text-white px-6 py-2.5 text-sm font-semibold mc-shadow-glow hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={!canNext || submitting}
                  className="inline-flex items-center gap-2 rounded-full mc-grad-primary text-white px-6 py-2.5 text-sm font-semibold mc-shadow-glow hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Confirm Booking
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Booking Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}>
          <div
            className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {!submitting ? (
              <>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <ShieldCheck className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                    Confirm Your Booking
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We will verify your HMO and get back to you via email.
                  </p>
                  {/* <div className="bg-gray-50 rounded-xl p-4 w-full mb-6">
                    <p className="text-sm text-gray-500">
                      A confirmation email will be sent to <span className="font-medium">{patient.email || bookingFlowUser?.email}</span>
                    </p>
                  </div> */}
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submitBooking}
                      className="flex-1 rounded-xl mc-grad-primary text-white px-4 py-2.5 text-sm font-semibold mc-shadow-glow hover:opacity-95 transition"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                    Processing Your Booking
                  </h3>
                  <p className="text-gray-600">
                    Please wait while we confirm your appointment...
                  </p>
                  <div className="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: "60%" }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- STEP 1: Concern ----------------- */
function ConcernStep({
  concerns, search, setSearch, selected, onSelect, sym,
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">What would you like to discuss?</h2>
        <p className="text-[hsl(var(--mc-muted))] mt-1">Choose a topic for your consultation. Prices vary by topic.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--mc-muted))]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics, e.g., anxiety, skin care, child health..."
          className="w-full rounded-2xl bg-white border border-[hsl(var(--mc-border))] pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mc-primary))]"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {concerns.length === 0 && !search.trim() && (
          <div className="col-span-full text-center py-12 text-[hsl(var(--mc-muted))]">
            Loading topics...
          </div>
        )}
        
        {concerns.map((c: any) => {
          const isSel = selected?.id === c.id;
          const priceInNaira = c.priceCents / 100;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition ${
                isSel
                  ? "border-[hsl(var(--mc-primary))] bg-[hsl(var(--mc-primary))]/5 mc-shadow-card"
                  : "border-[hsl(var(--mc-border))] bg-white hover:border-[hsl(var(--mc-primary))]/40"
              }`}
            >
              <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${
                isSel ? "mc-grad-primary text-white" : "bg-[hsl(var(--mc-muted-soft))] text-[hsl(var(--mc-primary))]"
              }`}>
                <Stethoscope className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <span className="block font-display font-bold text-base">{c.name}</span>
                {c.description && (
                  <span className="mt-0.5 block text-xs text-[hsl(var(--mc-muted))] line-clamp-2">{c.description}</span>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <span className="block font-display font-bold text-base">{formatPrice(c.priceCents, sym)}</span>
                <span className="text-[10px] text-[hsl(var(--mc-muted))]">from ₦{priceInNaira.toLocaleString()}</span>
              </div>
              {isSel && <Check className="h-5 w-5 text-[hsl(var(--mc-primary))] flex-shrink-0" />}
            </button>
          );
        })}
        
        {concerns.length === 0 && search.trim() && (
          <p className="col-span-full rounded-2xl bg-white border border-[hsl(var(--mc-border))] p-4 text-sm text-[hsl(var(--mc-muted))] text-center">
            No topics found matching "{search}"
          </p>
        )}
      </div>
    </div>
  );
}

/* ----------------- STEP 2: Date & Time ----------------- */
function DateTimeStep({ dates, slotsByDate, selectedDate, setSelectedDate, selectedSlot, setSelectedSlot, durationMinutes, setDurationMinutes, sym }: any) {
  const activeDate = selectedDate || dates[0];
  const slotsForDay = slotsByDate[activeDate] || [];
  
  const formatSlotDisplay = (slot: TimeSlot) => {
    const start = slot.slot_time.slice(0, 5);
    const end = slot.slot_end_time?.slice(0, 5) || 
      (() => {
        const [hours, minutes] = slot.slot_time.split(":").map(Number);
        const duration = durationMinutes === 30 ? 30 : 60;
        const newMinutes = minutes + duration;
        const newHours = hours + Math.floor(newMinutes / 60);
        return `${String(newHours).padStart(2, '0')}:${String(newMinutes % 60).padStart(2, '0')}`;
      })();
    return `${start} - ${end}`;
  };
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">Choose Date & Time</h2>
        <p className="text-[hsl(var(--mc-muted))] mt-1">Select your preferred consultation duration and schedule.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CONSULTATION_DURATIONS.map((option) => {
          const isSel = durationMinutes === option.minutes;
          return (
            <button
              key={option.minutes}
              type="button"
              onClick={() => setDurationMinutes(option.minutes)}
              className={`flex items-center justify-between rounded-2xl border-2 p-4 text-left transition ${
                isSel
                  ? "border-[hsl(var(--mc-primary))] bg-[hsl(var(--mc-primary))]/5 mc-shadow-card"
                  : "border-[hsl(var(--mc-border))] bg-white hover:border-[hsl(var(--mc-primary))]/40"
              }`}
            >
              <span>
                <span className="block font-display text-lg font-bold">{option.label}</span>
                <span className="mt-1 block text-xs text-[hsl(var(--mc-muted))]">Video consultation</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="font-display text-lg font-bold">{formatPrice(option.priceCents, sym)}</span>
                {isSel && <Check className="h-5 w-5 text-[hsl(var(--mc-primary))]" />}
              </span>
            </button>
          );
        })}
      </div>

      {dates.length > 0 && (
        <>
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <div className="flex gap-2 min-w-max">
              {dates.map((d: string) => {
                const dt = new Date(d + "T00:00:00");
                const isSel = activeDate === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                    className={`flex flex-col items-center justify-center min-w-[72px] py-3 px-2 rounded-2xl border-2 transition ${
                      isSel ? "mc-grad-primary text-white border-transparent mc-shadow-glow" : "bg-white border-[hsl(var(--mc-border))] hover:border-[hsl(var(--mc-primary))]/40"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {dt.toLocaleDateString("en", { weekday: "short" })}
                    </span>
                    <span className="text-xl font-display font-bold leading-tight mt-0.5">{dt.getDate()}</span>
                    <span className="text-[10px] opacity-80">{dt.toLocaleDateString("en", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {slotsForDay.map((s: TimeSlot) => {
              const remaining = s.capacity - s.booked_count;
              const full = remaining <= 0;
              const almost = remaining === 1;
              const isSel = selectedSlot?.id === s.id;
              const displayTime = formatSlotDisplay(s);
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={full}
                  onClick={() => setSelectedSlot(s)}
                  className={`relative py-3 px-2 rounded-xl text-sm font-semibold border-2 transition ${
                    full
                      ? "bg-[hsl(var(--mc-muted-soft))] border-transparent text-[hsl(var(--mc-muted))] cursor-not-allowed line-through"
                      : isSel
                      ? "mc-grad-primary text-white border-transparent mc-shadow-glow"
                      : "bg-white border-[hsl(var(--mc-border))] hover:border-[hsl(var(--mc-primary))]"
                  }`}
                >
                  {displayTime}
                  {!full && almost && !isSel && (
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                      1 left
                    </span>
                  )}
                </button>
              );
            })}
            {slotsForDay.length === 0 && (
              <p className="col-span-full text-sm text-[hsl(var(--mc-muted))] text-center py-8">
                No available slots for this day.
              </p>
            )}
          </div>
        </>
      )}
      
      {dates.length === 0 && (
        <div className="text-center py-12 text-[hsl(var(--mc-muted))]">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading available dates...</p>
        </div>
      )}
    </div>
  );
}

/* ----------------- STEP 3: Intake (Patient Info) ----------------- */
function IntakeStep({ fields, values, setValues, emailsMatch, user, setUser, authLoading }: any) {
  if (authLoading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--mc-primary))]" />
      </div>
    );
  }

  if (!user) {
    return <PatientAuthGate onLoginSuccess={setUser} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">Patient Information</h2>
        <p className="text-[hsl(var(--mc-muted))] mt-1">Signed in as {user.email}. Complete the details so the clinician can prepare.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map((f: IntakeField) => {
          const v = values[f.field_key] || "";
          const set = (val: string) => setValues({ ...values, [f.field_key]: val });
          const colSpan = ["address", "reason", "medical_notes"].includes(f.field_key) ? "sm:col-span-2" : "";
          return (
            <div key={f.id} className={colSpan}>
              <label className="block text-xs font-semibold mb-1.5">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              {f.field_type === "textarea" ? (
                <textarea
                  value={v}
                  onChange={(e) => set(e.target.value)}
                  placeholder={f.placeholder || ""}
                  rows={3}
                  className="w-full rounded-xl bg-white border border-[hsl(var(--mc-border))] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mc-primary))]"
                />
              ) : f.field_type === "select" ? (
                <select
                  value={v}
                  onChange={(e) => set(e.target.value)}
                  className="w-full rounded-xl bg-white border border-[hsl(var(--mc-border))] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mc-primary))]"
                >
                  <option value="">Select…</option>
                  {(Array.isArray(f.options) ? f.options : []).map((o: string) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.field_type}
                  value={v}
                  onChange={(e) => set(e.target.value)}
                  placeholder={f.placeholder || ""}
                  className="w-full rounded-xl bg-white border border-[hsl(var(--mc-border))] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mc-primary))]"
                />
              )}
              {f.field_key === "confirm_email" && !emailsMatch && (
                <p className="text-xs text-red-500 mt-1">Emails do not match.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PatientAuthGate({ onLoginSuccess }: { onLoginSuccess?: (user: any) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        if (email && password) {
          const userData = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email: email,
            full_name: fullName || email.split('@')[0],
          };
          localStorage.setItem('booking_user', JSON.stringify(userData));
          toast.success(`Welcome back, ${userData.full_name}! You can now complete your booking.`);
          onLoginSuccess?.(userData);
        } else {
          toast.error("Please enter both your email and password.");
        }
      } else {
        if (email && password && fullName) {
          const userData = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email: email,
            full_name: fullName,
          };
          localStorage.setItem('booking_user', JSON.stringify(userData));
          toast.success(`Account created! Welcome, ${fullName}. You can now complete your booking.`);
          onLoginSuccess?.(userData);
        } else {
          toast.error("Please fill in all fields.");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to continue. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">Sign in to continue</h2>
        <p className="text-[hsl(var(--mc-muted))] mt-1">Your appointment choice is saved here while you access your patient account.</p>
      </div>

      <div className="rounded-3xl bg-white border border-[hsl(var(--mc-border))] p-5 mc-shadow-card">
        <div className="grid grid-cols-2 rounded-2xl bg-[hsl(var(--mc-muted-soft))] p-1 text-sm font-semibold">
          {(["login", "register"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-xl px-3 py-2 transition ${
                mode === item ? "bg-white text-[hsl(var(--mc-primary))] mc-shadow-card" : "text-[hsl(var(--mc-muted))]"
              }`}
            >
              {item === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {mode === "register" && (
            <Field label="Full Name" placeholder="Jane Doe" value={fullName} onChange={setFullName} required />
          )}
          <Field label="Email" placeholder="you@example.com" value={email} onChange={setEmail} type="email" required />
          <Field label="Password" placeholder="Your password" value={password} onChange={setPassword} type="password" required />
          <button
            type="submit"
            disabled={busy || !email || !password || (mode === "register" && !fullName)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full mc-grad-primary text-white px-6 py-3 text-sm font-semibold mc-shadow-glow hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Login and continue" : "Create account and continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ----------------- STEP 4: Verification ----------------- */
function VerificationStep({ legal, agreed, setAgreed, emergencyWarning, notice }: any) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">Verification & Consent</h2>
        <p className="text-[hsl(var(--mc-muted))] mt-1">Please review and agree before continuing.</p>
      </div>

      {emergencyWarning && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-900 leading-relaxed">{emergencyWarning}</p>
        </div>
      )}

      {notice && (
        <div className="rounded-2xl border border-[hsl(var(--mc-border))] bg-white p-4 flex gap-3">
          <ShieldCheck className="h-5 w-5 text-[hsl(var(--mc-accent))] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[hsl(var(--mc-muted))] leading-relaxed">{notice}</p>
        </div>
      )}

      <div className="space-y-3">
        {legal.map((l: LegalAgreement) => (
          <label
            key={l.id}
            className={`flex gap-3 items-start rounded-2xl border-2 p-4 cursor-pointer transition ${
              agreed[l.key] ? "border-[hsl(var(--mc-primary))] bg-[hsl(var(--mc-primary))]/5" : "border-[hsl(var(--mc-border))] bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={!!agreed[l.key]}
              onChange={(e) => setAgreed({ ...agreed, [l.key]: e.target.checked })}
              className="mt-1 h-5 w-5 rounded accent-[hsl(var(--mc-primary))]"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{l.title} {l.required && <span className="text-red-500">*</span>}</p>
              <p className="text-xs text-[hsl(var(--mc-muted))] mt-0.5 leading-relaxed">{l.body}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function checkSubscriptionStatus(userId: string) {
  return userId && userId.trim().length > 0 ? "active" : "inactive";
}

/* ----------------- STEP 5: Payment ----------------- */
function PaymentStep({ 
  methods, hmos, organizations, plans, paymentKey, setPaymentKey, 
  meta, setMeta, currentUserId,
  summary 
}: any) {
  const { concern, clinician, slot, sym, taxPct, total, consultation, duration } = summary;
  const subscriptionStatus = meta.subscription_status as "active" | "inactive" | undefined;
  
  return (
    <div className="grid lg:grid-cols-[1fr,360px] gap-6 animate-in fade-in duration-300">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Payment</h2>
          <p className="text-[hsl(var(--mc-muted))] mt-1">Secure checkout. No charge will be made — this is a demo flow.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          {methods.map((m: PaymentMethod) => {
            const Icon = ICON_MAP[m.icon || ""] || CreditCard;
            const isSel = paymentKey === m.key;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setPaymentKey(m.key);
                  setMeta({});
                }}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${
                  isSel ? "border-[hsl(var(--mc-primary))] bg-[hsl(var(--mc-primary))]/5" : "border-[hsl(var(--mc-border))] bg-white hover:border-[hsl(var(--mc-primary))]/40"
                }`}
              >
                <span className="grid place-items-center h-10 w-10 rounded-xl mc-grad-primary text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{m.label}</p>
                  <p className="text-xs text-[hsl(var(--mc-muted))] truncate">{m.description}</p>
                </div>
                {isSel && <Check className="h-5 w-5 text-[hsl(var(--mc-primary))]" />}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-white border border-[hsl(var(--mc-border))] p-5 space-y-4">
          {paymentKey === "card" && (
            <>
              <Field label="Card number" placeholder="4242 4242 4242 4242" value={meta.card_number || ""} onChange={(v) => setMeta({ ...meta, card_number: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry" placeholder="MM/YY" value={meta.expiry || ""} onChange={(v) => setMeta({ ...meta, expiry: v })} />
                <Field label="CVC" placeholder="123" value={meta.cvc || ""} onChange={(v) => setMeta({ ...meta, cvc: v })} />
              </div>
              <Field label="Name on card" placeholder="Jane Doe" value={meta.card_name || ""} onChange={(v) => setMeta({ ...meta, card_name: v })} />
            </>
          )}
          
          {paymentKey === "hmo" && (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Card Provider</label>
                <select
                  value={meta.hmo || ""}
                  onChange={(e) => {
                    setMeta({ ...meta, hmo: e.target.value });
                  }}
                  className="w-full rounded-xl bg-white border border-[hsl(var(--mc-border))] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mc-primary))]"
                >
                  <option value="">Select a provider...</option>
                  {hmos.map((h: HmoProvider) => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              </div>
              <Field 
                label="Enrollee Number" 
                placeholder="CARD-1234567" 
                value={meta.hmo_id || ""} 
                onChange={(v) => setMeta({ ...meta, hmo_id: v })} 
              />
              
              {/* {meta.hmo && meta.hmo_id && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <p className="font-semibold text-emerald-900">Ready to proceed!</p>
                  </div>
                  <p className="text-sm text-emerald-700 mt-2">
                    Your HMO details have been entered. Click Confirm Booking below to continue.
                  </p>
                </div>
              )} */}
            </>
          )}
          
          {paymentKey === "organization" && (
            <>
              <Field
                label="Name of Organisation"
                placeholder="e.g., Acme Corporation"
                value={meta.organization || ""}
                onChange={(v) => setMeta({ ...meta, organization: v })}
              />

              <Field
                label="Organisation ID/Enrollee Number"
                placeholder="e.g., ORG-1234567"
                value={meta.employee_id || ""}
                onChange={(v) => setMeta({ ...meta, employee_id: v })}
              />

              {/* {meta.organization && meta.employee_id && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <p className="font-semibold text-emerald-900">Organization details entered!</p>
                  </div>
                  <p className="text-sm text-emerald-700 mt-2">
                    Your organization details have been entered. Click Confirm Booking below to continue.
                  </p>
                </div>
              )} */}
            </>
          )}
          
          {paymentKey === "subscription" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[hsl(var(--mc-muted-soft))] p-4">
                <p className="text-sm font-semibold">Check subscription by user ID</p>
                <p className="mt-1 text-xs text-[hsl(var(--mc-muted))]">Current user ID: {currentUserId || "not available"}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={meta.subscription_user_id || ""}
                  onChange={(e) => setMeta({ ...meta, subscription_user_id: e.target.value, subscription_status: "" })}
                  placeholder="Enter subscription ID"
                  className="min-w-0 flex-1 rounded-xl bg-white border border-[hsl(var(--mc-border))] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mc-primary))]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const status = checkSubscriptionStatus(meta.subscription_user_id || "");
                    setMeta({ ...meta, subscription_status: status });
                  }}
                  className="rounded-xl mc-grad-primary px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Check
                </button>
              </div>

              {subscriptionStatus === "active" && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <p className="font-semibold">Active subscription found</p>
                  </div>
                  <p>Your subscription ID: <span className="font-mono font-bold">{meta.subscription_user_id}</span></p>
                  <p className="text-xs text-emerald-700 mt-2">You can proceed with this booking at any time.</p>
                </div>
              )}

              {subscriptionStatus === "inactive" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-950">No active subscription found. Choose a plan below to get started:</p>
                </div>
              )}

              {!subscriptionStatus && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[hsl(var(--mc-fg))]">Choose Your Plan</p>
                  {plans.map((p: SubscriptionPlan) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setMeta({ ...meta, selected_plan_id: meta.selected_plan_id === p.id ? "" : p.id })}
                      className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                        meta.selected_plan_id === p.id
                          ? "border-[hsl(var(--mc-primary))] bg-[hsl(var(--mc-primary))]/5"
                          : "border-[hsl(var(--mc-border))] bg-white hover:border-[hsl(var(--mc-primary))]/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{p.name}</p>
                          <p className="text-xs text-[hsl(var(--mc-muted))] mt-1 line-clamp-2">{p.description}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-[hsl(var(--mc-muted))]">
                              <span className="font-semibold">{formatPrice(p.price_cents, sym)}</span> / {p.billing_period}
                            </p>
                          </div>
                        </div>
                        {meta.selected_plan_id === p.id && (
                          <Check className="h-5 w-5 text-[hsl(var(--mc-primary))] flex-shrink-0 mt-1" />
                        )}
                      </div>
                      {meta.selected_plan_id === p.id && (
                        <div className="mt-3 pt-3 border-t border-[hsl(var(--mc-border))] text-xs text-[hsl(var(--mc-muted))]">
                          <p className="font-semibold text-[hsl(var(--mc-fg))] mb-2">Plan Details:</p>
                          <ul className="space-y-1.5">
                            <li className="flex items-start gap-2">
                              <span className="text-[hsl(var(--mc-primary))] font-bold mt-0.5">•</span>
                              <span><span className="font-semibold">Billing Period:</span> {p.billing_period}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[hsl(var(--mc-primary))] font-bold mt-0.5">•</span>
                              <span><span className="font-semibold">Price:</span> {formatPrice(p.price_cents, sym)} per {p.billing_period}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[hsl(var(--mc-primary))] font-bold mt-0.5">•</span>
                              <span><span className="font-semibold">Description:</span> {p.description}</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[hsl(var(--mc-muted))]">
          <ShieldCheck className="h-4 w-4 text-[hsl(var(--mc-accent))]" />
          256-bit encrypted · PCI-DSS standards · NDPR-aligned handling
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 self-start rounded-3xl bg-white border border-[hsl(var(--mc-border))] p-5 mc-shadow-card">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--mc-muted))]">Appointment summary</p>
        <div className="mt-3 flex items-center gap-3 pb-4 border-b border-[hsl(var(--mc-border))]">
          <span className="grid place-items-center h-12 w-12 rounded-2xl mc-grad-primary text-white">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm">{clinician?.title}</p>
            <p className="text-xs text-[hsl(var(--mc-muted))]">For: {concern?.name}</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          <Row icon={CalendarIcon} label={slot ? new Date(slot.slot_date + "T00:00").toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" }) : "—"} />
          <Row icon={Clock} label={`${slot?.slot_time?.slice(0,5) || "Time"} - ${slot?.slot_end_time?.slice(0,5) || ""} / ${duration.label}`} />
          <Row icon={Video} label="Video consultation" />
        </ul>
        <div className="mt-4 pt-4 border-t border-[hsl(var(--mc-border))] space-y-1.5 text-sm">
          <div className="flex justify-between text-[hsl(var(--mc-muted))]"><span>Consultation</span><span>{formatPrice(consultation, sym)}</span></div>
          {taxPct > 0 && (
            <div className="flex justify-between text-[hsl(var(--mc-muted))]"><span>Tax ({taxPct}%)</span><span>{formatPrice(Math.round(consultation * taxPct / 100), sym)}</span></div>
          )}
          <div className="flex justify-between font-display font-bold text-lg pt-2"><span>Total</span><span>{formatPrice(total, sym)}</span></div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text", required = false }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl bg-white border border-[hsl(var(--mc-border))] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mc-primary))]"
      />
    </div>
  );
}

function Row({ icon: Icon, label }: any) {
  return (
    <li className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-[hsl(var(--mc-primary))]" />
      <span>{label}</span>
    </li>
  );
}

/* ----------------- STEP 6: Confirmation ----------------- */
function ConfirmationStep({ reference, summary, message, onClose }: any) {
  const { concern, clinician, slot, patient, sym, total, duration } = summary;
  return (
    <div className="space-y-6 text-center max-w-xl mx-auto py-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="grid place-items-center">
        <span className="grid place-items-center h-20 w-20 rounded-full mc-grad-primary text-white mc-shadow-glow">
          <Check className="h-10 w-10" strokeWidth={3} />
        </span>
      </div>
      <div>
        <h2 className="font-display text-3xl font-bold">You're all set!</h2>
        <p className="text-[hsl(var(--mc-muted))] mt-2">{message}</p>
      </div>
      <div className="text-left rounded-3xl bg-white border border-[hsl(var(--mc-border))] p-5 mc-shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--mc-border))]">
          <p className="text-xs text-[hsl(var(--mc-muted))]">Booking reference</p>
          <p className="font-mono font-bold text-sm">{reference}</p>
        </div>
        <ul className="mt-4 space-y-2.5 text-sm">
          <Row icon={Stethoscope} label={`${clinician?.title} · ${concern?.name}`} />
          <Row icon={CalendarIcon} label={slot ? new Date(slot.slot_date + "T00:00").toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" }) : "—"} />
          <Row icon={Clock} label={`${slot?.slot_time?.slice(0,5) || "Time"} - ${slot?.slot_end_time?.slice(0,5) || ""} / ${duration.label}`} />
          <Row icon={UserIcon} label={`${patient.first_name || ""} ${patient.last_name || ""}`.trim()} />
          <Row icon={CreditCard} label={`Paid ${formatPrice(total, sym)}`} />
        </ul>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <button type="button" className="inline-flex items-center gap-2 rounded-full mc-grad-primary text-white px-5 py-2.5 text-sm font-semibold">
          <Video className="h-4 w-4" /> Join consultation
        </button>
        <button type="button" className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--mc-border))] bg-white px-5 py-2.5 text-sm font-semibold">
          <CalendarPlus className="h-4 w-4" /> Add to calendar
        </button>
        <button type="button" className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--mc-border))] bg-white px-5 py-2.5 text-sm font-semibold">
          <Download className="h-4 w-4" /> Receipt
        </button>
      </div>
      <button type="button" onClick={onClose} className="text-sm text-[hsl(var(--mc-muted))] hover:text-[hsl(var(--mc-fg))]">
        Close
      </button>
    </div>
  );
  
}