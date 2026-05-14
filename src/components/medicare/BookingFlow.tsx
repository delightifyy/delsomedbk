import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, X, Search, Sparkles, Brain, Heart, Baby, Ear,
  Activity, Stethoscope, Clock, ShieldCheck, CreditCard, BadgeCheck, Briefcase,
  Calendar as CalendarIcon, Loader2, Video, Download, CalendarPlus, AlertTriangle,
  ChevronDown, MapPin, User as UserIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchBookingData, fetchSlotsFor, formatPrice,
  type ConcernCategory, type Concern, type ClinicianType, type ConcernClinicianMap,
  type TimeSlot, type IntakeField, type LegalAgreement, type PaymentMethod,
  type HmoProvider, type SubscriptionPlan, type BookingSettings,
} from "@/lib/bookingApi";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  Stethoscope, Sparkles, Brain, Heart, Baby, Ear, Activity,
  CreditCard, ShieldCheck, BadgeCheck, Briefcase,
};

const STEPS = [
  "Concern", "Clinician", "Date & Time", "Patient Info",
  "Verification", "Payment", "Confirmation",
] as const;

type Props = { open: boolean; onClose: () => void };

export default function BookingFlow({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [selectedConcern, setSelectedConcern] = useState<Concern | null>(null);
  const [selectedClinician, setSelectedClinician] = useState<ClinicianType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [patient, setPatient] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [paymentKey, setPaymentKey] = useState<string>("");
  const [paymentMeta, setPaymentMeta] = useState<Record<string, string>>({});
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const sym = settings?.currency_symbol || "₦";

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchBookingData().then((d) => {
      setCategories(d.categories);
      setConcerns(d.concerns);
      setClinicians(d.clinicians);
      setMap(d.map);
      setIntakeFields(d.intakeFields);
      setLegal(d.legal);
      setMethods(d.methods);
      setHmos(d.hmos);
      setPlans(d.plans);
      setSettings(d.settings);
      if (d.methods[0]) setPaymentKey(d.methods[0].key);
      setLoading(false);
    });
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(0); setSelectedConcern(null); setSelectedClinician(null);
        setSelectedDate(null); setSelectedSlot(null); setPatient({}); setAgreed({});
        setBookingRef(null); setSearch(""); setExpandedCat(null);
      }, 300);
    }
  }, [open]);

  // Load slots when clinician picked
  useEffect(() => {
    if (!selectedClinician) return;
    const today = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + 13 * 86400000).toISOString().slice(0, 10);
    fetchSlotsFor(selectedClinician.id, today, to).then(setSlots);
  }, [selectedClinician]);

  const filteredConcerns = useMemo(() => {
    if (!search.trim()) return concerns;
    const q = search.toLowerCase();
    return concerns.filter((c) =>
      c.name.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [concerns, search]);

  const recommendedClinicians = useMemo(() => {
    if (!selectedConcern) return [];
    const links = map.filter((m) => m.concern_id === selectedConcern.id);
    return links
      .map((l) => ({
        c: clinicians.find((c) => c.id === l.clinician_type_id)!,
        recommended: l.recommended,
        priority: l.priority,
      }))
      .filter((x) => x.c)
      .sort((a, b) => a.priority - b.priority);
  }, [selectedConcern, map, clinicians]);

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

  const canNext = (() => {
    switch (step) {
      case 0: return !!selectedConcern;
      case 1: return !!selectedClinician;
      case 2: return !!selectedSlot;
      case 3: return allRequiredFields && emailsMatch;
      case 4: return allRequiredAgreed;
      case 5: return !!paymentKey;
      default: return true;
    }
  })();

  const totalCents = (selectedClinician?.price_cents || 0) +
    Math.round((selectedClinician?.price_cents || 0) * (Number(settings?.tax_percent) || 0) / 100);

  async function submitBooking() {
    if (!selectedConcern || !selectedClinician || !selectedSlot) return;
    setSubmitting(true);
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
        patient_data: patient,
        agreements: Object.keys(agreed).filter((k) => agreed[k]),
        payment_method: paymentKey,
        payment_meta: paymentMeta,
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
    // best-effort capacity bump
    supabase.from("booking_time_slots").update({
      booked_count: selectedSlot.booked_count + 1,
    }).eq("id", selectedSlot.id).then(() => {});
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
                    categories={categories}
                    concerns={filteredConcerns}
                    search={search}
                    setSearch={setSearch}
                    expandedCat={expandedCat}
                    setExpandedCat={setExpandedCat}
                    selected={selectedConcern}
                    onSelect={(c) => { setSelectedConcern(c); setSelectedClinician(null); }}
                  />
                )}

                {step === 1 && (
                  <ClinicianStep
                    items={recommendedClinicians}
                    selected={selectedClinician}
                    onSelect={setSelectedClinician}
                    sym={sym}
                  />
                )}

                {step === 2 && (
                  <DateTimeStep
                    dates={availableDates}
                    slotsByDate={slotsByDate}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                    duration={selectedClinician?.duration_minutes || 20}
                  />
                )}

                {step === 3 && (
                  <IntakeStep
                    fields={intakeFields}
                    values={patient}
                    setValues={setPatient}
                    emailsMatch={emailsMatch}
                  />
                )}

                {step === 4 && (
                  <VerificationStep
                    legal={legal}
                    agreed={agreed}
                    setAgreed={setAgreed}
                    emergencyWarning={settings?.emergency_warning || ""}
                    notice={settings?.booking_notice || ""}
                  />
                )}

                {step === 5 && (
                  <PaymentStep
                    methods={methods}
                    hmos={hmos}
                    plans={plans}
                    paymentKey={paymentKey}
                    setPaymentKey={setPaymentKey}
                    meta={paymentMeta}
                    setMeta={setPaymentMeta}
                    summary={{
                      concern: selectedConcern,
                      clinician: selectedClinician,
                      slot: selectedSlot,
                      sym,
                      taxPct: Number(settings?.tax_percent) || 0,
                      total: totalCents,
                    }}
                  />
                )}

                {step === 6 && bookingRef && (
                  <ConfirmationStep
                    reference={bookingRef}
                    summary={{
                      concern: selectedConcern,
                      clinician: selectedClinician,
                      slot: selectedSlot,
                      patient,
                      sym,
                      total: totalCents,
                    }}
                    message={settings?.confirmation_message || ""}
                    onClose={onClose}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!loading && step < 6 && (
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
                  · {formatPrice(totalCents, sym)}
                </div>
              )}

              {step < 5 ? (
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
                  onClick={submitBooking}
                  disabled={!canNext || submitting}
                  className="inline-flex items-center gap-2 rounded-full mc-grad-primary text-white px-6 py-2.5 text-sm font-semibold mc-shadow-glow hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Pay {formatPrice(totalCents, sym)}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------- STEP 1: Concern ----------------- */
function ConcernStep({
  categories, concerns, search, setSearch, expandedCat, setExpandedCat, selected, onSelect,
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">What can we help with today?</h2>
        <p className="text-[hsl(var(--mc-muted))] mt-1">Pick a category and choose your concern. We'll match you with the right clinician.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--mc-muted))]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search concerns, e.g. anxiety, acne, fever..."
          className="w-full rounded-2xl bg-white border border-[hsl(var(--mc-border))] pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mc-primary))]"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map((cat: ConcernCategory) => {
          const Icon = ICON_MAP[cat.icon || ""] || Stethoscope;
          const items = concerns.filter((c: Concern) => c.category_id === cat.id);
          if (search.trim() && items.length === 0) return null;
          const expanded = expandedCat === cat.id || !!search.trim();
          return (
            <div key={cat.id} className="rounded-3xl bg-white border border-[hsl(var(--mc-border))] overflow-hidden hover:border-[hsl(var(--mc-primary))]/40 transition">
              <button
                type="button"
                onClick={() => setExpandedCat(expanded ? null : cat.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span className="grid place-items-center h-12 w-12 rounded-2xl mc-grad-primary text-white flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold">{cat.name}</p>
                  <p className="text-xs text-[hsl(var(--mc-muted))] truncate">{cat.description}</p>
                </div>
                <ChevronDown className={`h-5 w-5 text-[hsl(var(--mc-muted))] transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded && (
                <div className="px-4 pb-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {items.map((c: Concern) => {
                    const isSel = selected?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onSelect(c)}
                        className={`text-xs font-semibold px-3 py-2 rounded-full border transition ${
                          isSel
                            ? "mc-grad-primary text-white border-transparent mc-shadow-glow"
                            : "bg-[hsl(var(--mc-muted-soft))] border-transparent hover:border-[hsl(var(--mc-primary))]/40"
                        }`}
                      >
                        {isSel && <Check className="inline h-3 w-3 mr-1" />}
                        {c.name}
                      </button>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="text-xs text-[hsl(var(--mc-muted))]">No concerns yet.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------- STEP 2: Clinician ----------------- */
function ClinicianStep({ items, selected, onSelect, sym }: any) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">Recommended clinicians</h2>
        <p className="text-[hsl(var(--mc-muted))] mt-1">Based on your concern, here's who we recommend.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {items.map(({ c, recommended }: any) => {
          const isSel = selected?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c)}
              className={`relative text-left rounded-3xl border-2 bg-white p-5 transition hover:-translate-y-0.5 hover:mc-shadow-card ${
                isSel ? "border-[hsl(var(--mc-primary))] mc-shadow-glow" : "border-[hsl(var(--mc-border))]"
              }`}
            >
              {recommended && (
                <span className="absolute -top-2 left-5 inline-flex items-center gap-1 rounded-full mc-grad-primary text-white text-[10px] font-bold px-2.5 py-1 mc-shadow-glow">
                  <Sparkles className="h-3 w-3" /> Recommended
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-12 w-12 rounded-2xl bg-[hsl(var(--mc-muted-soft))] text-[hsl(var(--mc-primary))]">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="font-display font-bold">{c.title}</p>
                  {c.badge && <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--mc-accent))]">{c.badge}</p>}
                </div>
                {isSel && <Check className="h-5 w-5 text-[hsl(var(--mc-primary))]" />}
              </div>
              <p className="text-xs text-[hsl(var(--mc-muted))] mt-3 leading-relaxed">{c.description}</p>
              {c.treats && (
                <p className="text-[11px] mt-3 p-2.5 rounded-xl bg-[hsl(var(--mc-muted-soft))]">
                  <span className="font-semibold">Treats:</span> {c.treats}
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-[hsl(var(--mc-border))] flex items-center justify-between">
                <span className="font-display font-bold text-lg">{formatPrice(c.price_cents, sym)}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[hsl(var(--mc-muted))]">
                  <Clock className="h-3 w-3" /> ~{c.wait_time_minutes}m wait
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------- STEP 3: Date & Time ----------------- */
function DateTimeStep({ dates, slotsByDate, selectedDate, setSelectedDate, selectedSlot, setSelectedSlot, duration }: any) {
  const activeDate = selectedDate || dates[0];
  const slotsForDay = slotsByDate[activeDate] || [];
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">Choose date & time</h2>
        <p className="text-[hsl(var(--mc-muted))] mt-1">Each appointment is ~{duration} minutes.</p>
      </div>

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

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {slotsForDay.map((s: TimeSlot) => {
          const remaining = s.capacity - s.booked_count;
          const full = remaining <= 0;
          const almost = remaining === 1;
          const isSel = selectedSlot?.id === s.id;
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
              {s.slot_time.slice(0, 5)}
              {!full && almost && !isSel && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                  1 left
                </span>
              )}
            </button>
          );
        })}
        {slotsForDay.length === 0 && (
          <p className="col-span-full text-sm text-[hsl(var(--mc-muted))]">No slots for this day.</p>
        )}
      </div>
    </div>
  );
}

/* ----------------- STEP 4: Intake ----------------- */
function IntakeStep({ fields, values, setValues, emailsMatch }: any) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">Patient information</h2>
        <p className="text-[hsl(var(--mc-muted))] mt-1">Tell us about yourself so the clinician can prepare.</p>
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
                <p className="text-xs text-red-500 mt-1">Emails do not match</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------- STEP 5: Verification ----------------- */
function VerificationStep({ legal, agreed, setAgreed, emergencyWarning, notice }: any) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">Verification & consent</h2>
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

/* ----------------- STEP 6: Payment ----------------- */
function PaymentStep({ methods, hmos, plans, paymentKey, setPaymentKey, meta, setMeta, summary }: any) {
  const { concern, clinician, slot, sym, taxPct, total } = summary;
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
                onClick={() => setPaymentKey(m.key)}
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
                <label className="block text-xs font-semibold mb-1.5">HMO provider</label>
                <select
                  value={meta.hmo || ""}
                  onChange={(e) => setMeta({ ...meta, hmo: e.target.value })}
                  className="w-full rounded-xl bg-white border border-[hsl(var(--mc-border))] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mc-primary))]"
                >
                  <option value="">Select provider…</option>
                  {hmos.map((h: HmoProvider) => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              </div>
              <Field label="HMO ID / enrollee number" placeholder="HMO-1234567" value={meta.hmo_id || ""} onChange={(v) => setMeta({ ...meta, hmo_id: v })} />
            </>
          )}
          {paymentKey === "subscription" && (
            <div className="space-y-2">
              {plans.map((p: SubscriptionPlan) => {
                const isSel = meta.plan_id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setMeta({ ...meta, plan_id: p.id, plan_name: p.name })}
                    className={`w-full text-left p-3 rounded-xl border-2 transition ${
                      isSel ? "border-[hsl(var(--mc-primary))] bg-[hsl(var(--mc-primary))]/5" : "border-[hsl(var(--mc-border))]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="font-display font-bold">{formatPrice(p.price_cents, sym)}/{p.billing_period}</p>
                    </div>
                    <p className="text-xs text-[hsl(var(--mc-muted))] mt-1">{p.description}</p>
                  </button>
                );
              })}
            </div>
          )}
          {paymentKey === "insurance" && (
            <p className="text-sm text-[hsl(var(--mc-muted))]">Direct insurance billing is coming soon. Please choose another method.</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[hsl(var(--mc-muted))]">
          <ShieldCheck className="h-4 w-4 text-[hsl(var(--mc-accent))]" />
          256-bit encrypted · PCI-DSS standards · HIPAA-aligned handling
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
          <Row icon={Clock} label={`${slot?.slot_time?.slice(0,5) || "—"} · ${clinician?.duration_minutes}m`} />
          <Row icon={Video} label="Video consultation" />
        </ul>
        <div className="mt-4 pt-4 border-t border-[hsl(var(--mc-border))] space-y-1.5 text-sm">
          <div className="flex justify-between text-[hsl(var(--mc-muted))]"><span>Consultation</span><span>{formatPrice(clinician?.price_cents || 0, sym)}</span></div>
          {taxPct > 0 && (
            <div className="flex justify-between text-[hsl(var(--mc-muted))]"><span>Tax ({taxPct}%)</span><span>{formatPrice(Math.round((clinician?.price_cents || 0) * taxPct / 100), sym)}</span></div>
          )}
          <div className="flex justify-between font-display font-bold text-lg pt-2"><span>Total</span><span>{formatPrice(total, sym)}</span></div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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

/* ----------------- STEP 7: Confirmation ----------------- */
function ConfirmationStep({ reference, summary, message, onClose }: any) {
  const { concern, clinician, slot, patient, sym, total } = summary;
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
          <Row icon={Clock} label={`${slot?.slot_time?.slice(0,5) || "—"} · ${clinician?.duration_minutes}m`} />
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
