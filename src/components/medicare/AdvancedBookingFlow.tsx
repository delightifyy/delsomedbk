import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X, ArrowLeft, ArrowRight, Check, Loader2, MapPin, Video, Building2,
  Stethoscope, ShieldCheck, BadgeCheck, CreditCard, Clock, Upload, FileText,
  CalendarDays, AlertTriangle, LockKeyhole, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { signInPatientWithPassword } from "@/lib/localStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fmtNGN = (n: number) => `₦${n.toLocaleString("en-NG")}`;


export type AccessMethod = "card" | "subscription" | "hmo" | "organization";

type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number; // NGN
  available?: boolean;
};

const SERVICES: Service[] = [
  { id: "f2f", name: "Face-to-Face GP consultation", description: "In-clinic GP visit", duration: "15 min", price: 90 },
  { id: "tel", name: "Telephone GP consultation", description: "Phone-based GP advice", duration: "15 min", price: 49 },
  { id: "vid", name: "Video GP consultation", description: "Secure video appointment", duration: "15 min", price: 79 },
  { id: "ext", name: "Extended GP consultation", description: "Longer in-depth visit", duration: "30 min", price: 130 },
  { id: "comp", name: "Comprehensive GP consultation", description: "Full health review", duration: "45 min", price: 185 },
  { id: "fol", name: "GP follow up consultation", description: "Follow-up appointment", duration: "15 min", price: 60 },
  { id: "btr", name: "Blood Test Results Review", description: "Review your latest results", duration: "15 min", price: 40 },
  { id: "home", name: "GP Home Visit", description: "Doctor visits your home", duration: "60 min", price: 250 },
  { id: "homeooh", name: "GP Home Visit (Out-of-hours: 5pm–8pm)", description: "After-hours home visit", duration: "60 min", price: 350 },
  { id: "npp", name: "Nationwide Pathology Phlebotomy Service", description: "Blood draw service", duration: "15 min", price: 0 },
  { id: "nppm", name: "NP Phlebotomy with Blood Pressure & Measurements", description: "Phlebotomy plus vitals", duration: "15 min", price: 0 },
  { id: "army", name: "Army Entry Medical Examination", description: "Medical exam for army entry", duration: "60 min", price: 250 },
];

const HOSPITAL_LOCATIONS = [
  { id: "lagos-vi", name: "DesolMed Victoria Island", address: "12 Adeola Odeku St, Lagos" },
  { id: "abuja-cbd", name: "DesolMed Abuja CBD", address: "Plot 22, Aguiyi Ironsi St, Abuja" },
  { id: "ph-gra", name: "DesolMed Port Harcourt GRA", address: "5 Aba Road, GRA Phase 2" },
];

const HMO_PROVIDERS = [
  { id: "axa", name: "AXA Mansard", covered: ["f2f", "tel", "vid", "fol", "btr"] },
  { id: "bupa", name: "Bupa", covered: ["f2f", "vid", "ext", "comp", "fol"] },
  { id: "allianz", name: "Allianz", covered: ["f2f", "tel", "vid"] },
  { id: "aviva", name: "Aviva", covered: ["f2f", "tel", "vid", "btr"] },
  { id: "nhs", name: "NHS-linked Provider", covered: ["f2f", "tel", "vid", "fol", "btr", "npp"] },
  { id: "hygeia", name: "Hygeia HMO", covered: ["f2f", "tel", "vid", "fol"] },
];

const CONSENTS = [
  { key: "treatment", label: "I consent to receive medical treatment from the assigned clinician." },
  { key: "privacy", label: "I have read and accept the Privacy Policy." },
  { key: "terms", label: "I agree to the Terms & Conditions of service." },
  { key: "disclaimer", label: "I understand this service is not for medical emergencies." },
];

type Props = {
  open: boolean;
  onClose: () => void;
  method: AccessMethod | null;
};

type SubMode = "physical" | "online" | null;

const generateDates = () => {
  const arr: { value: string; label: string }[] = [];
  for (let i = 1; i <= 10; i++) {
    const d = new Date(Date.now() + i * 86400000);
    arr.push({
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    });
  }
  return arr;
};
const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"];

export default function AdvancedBookingFlow({ open, onClose, method }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // shared
  const [step, setStep] = useState(0);
  const [subMode, setSubMode] = useState<SubMode>(null);
  const [location, setLocation] = useState<string>("");
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // subscription
  const [enrolleeId, setEnrolleeId] = useState("");
  const [subVerified, setSubVerified] = useState<null | { ok: boolean; reason?: string }>(null);
  const [subChecking, setSubChecking] = useState(false);

  // HMO
  const [hmoProvider, setHmoProvider] = useState<string>("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [memberDetails, setMemberDetails] = useState("");
  const [hmoStatus, setHmoStatus] = useState<"idle" | "pending" | "approved" | "rejected">("idle");
  const [hmoReason, setHmoReason] = useState("");

  // Organization
  const [orgId, setOrgId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [authFile, setAuthFile] = useState<File | null>(null);
  const [orgStatus, setOrgStatus] = useState<"idle" | "pending" | "approved" | "rejected">("idle");

  // payment (card)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(0); setSubMode(null); setLocation(""); setService(null); setDate(""); setTime("");
        setAgreed({}); setBookingRef(null); setEmail(""); setPassword("");
        setEnrolleeId(""); setSubVerified(null);
        setHmoProvider(""); setPolicyNumber(""); setMemberDetails(""); setHmoStatus("idle"); setHmoReason("");
        setOrgId(""); setEmployeeId(""); setAuthFile(null); setOrgStatus("idle");
        setCardNumber(""); setCardExp(""); setCardCvc("");
      }, 300);
    }
  }, [open]);

  const availableServices = useMemo(() => {
    if (method === "hmo") {
      if (!hmoProvider) return [];
      const p = HMO_PROVIDERS.find((x) => x.id === hmoProvider);
      if (!p) return [];
      return SERVICES.filter((s) => p.covered.includes(s.id));
    }
    return SERVICES;
  }, [method, hmoProvider]);

  // Build dynamic step list per method
  const steps = useMemo(() => {
    const base = ["Service", "Schedule", "Mode", "Login", "Consent", "Payment"];
    if (method === "card") return ["Service", "Schedule", "Mode", "Login", "Consent", "Payment"];
    if (method === "subscription") return ["Service", "Schedule", "Subscription", "Login", "Consent"];
    if (method === "hmo") return ["Service", "Schedule", "Verify", "Login", "Consent"];
    if (method === "organization") return ["Service", "Schedule", "Details", "Login", "Consent"];
    return base;
  }, [method]);

  const close = () => onClose();

  if (!open || !method) return null;

  // ---- Validation per current step ----
  const canNext = (() => {
    const label = steps[step];
    switch (label) {
      case "Mode": return !!subMode && (subMode === "online" || !!location);
      case "Service": return method === "hmo" ? !!hmoProvider && !!service && service.available !== false : !!service && service.available !== false;
      case "Subscription": return subVerified?.ok === true;
      case "Verify": return hmoStatus === "approved";
      case "Details": return !!orgId && !!employeeId && !!authFile && orgStatus === "approved";
      case "Schedule": return !!date && !!time;
      case "Login": return !!user;
      case "Consent": return CONSENTS.every((c) => agreed[c.key]);
      case "Payment": return cardNumber.length >= 12 && cardExp.length >= 4 && cardCvc.length >= 3;
      default: return true;
    }
  })();

  const isLastStep = step === steps.length - 1;

  async function handleLogin() {
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }
    setAuthBusy(true);
    try {
      await signInPatientWithPassword({ email, password });
      toast.success("Logged in");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setAuthBusy(false);
    }
  }

  async function verifySubscription() {
    if (!enrolleeId.trim()) return;
    setSubChecking(true);
    setSubVerified(null);
    await new Promise((r) => setTimeout(r, 900));
    // Demo logic: IDs starting with DSM- are active
    if (/^DSM-/i.test(enrolleeId.trim())) {
      setSubVerified({ ok: true });
      toast.success("Subscription verified successfully");
    } else if (/EXP/i.test(enrolleeId)) {
      setSubVerified({ ok: false, reason: "Subscription expired" });
    } else if (/INACT/i.test(enrolleeId)) {
      setSubVerified({ ok: false, reason: "Subscription inactive" });
    } else {
      setSubVerified({ ok: false, reason: "Invalid Subscription ID" });
    }
    setSubChecking(false);
  }

  async function verifyHmo() {
    if (!policyNumber.trim()) return;
    setHmoStatus("pending");
    setHmoReason("");
    await new Promise((r) => setTimeout(r, 1200));
    if (/^POL-/i.test(policyNumber.trim())) {
      setHmoStatus("approved");
      toast.success("HMO policy approved");
    } else {
      setHmoStatus("rejected");
      setHmoReason("Invalid policy number");
    }
  }

  async function verifyOrg() {
    if (!orgId || !employeeId || !authFile) return;
    setOrgStatus("pending");
    await new Promise((r) => setTimeout(r, 1200));
    setOrgStatus("approved");
    toast.success("Organization request approved");
  }

  async function submitBooking() {
    if (!service) return;
    setSubmitting(true);
    const payload = {
      concern_name: service.name,
      category_name: subMode === "physical" ? "Physical" : subMode === "online" ? "Online" : method,
      slot_date: date,
      slot_time: time,
      amount_cents: Math.round(service.price * 100),
      currency: "NGN",
      payment_method: method,
      patient_data: {
        user_id: user?.id,
        email: user?.email || email,
        mode: subMode,
        location,
      },
      agreements: Object.keys(agreed).filter((k) => agreed[k]),
      payment_meta: {
        method,
        enrolleeId: enrolleeId || undefined,
        hmoProvider: hmoProvider || undefined,
        policyNumber: policyNumber || undefined,
        orgId: orgId || undefined,
        employeeId: employeeId || undefined,
      },
      status: method === "card" ? "confirmed" : method === "subscription" ? "confirmed" : "pending",
    };
    const { data, error } = await supabase.from("bookings").insert(payload).select("reference").single();
    setSubmitting(false);
    if (error || !data) {
      toast.error("Could not create booking");
      return;
    }
    setBookingRef(data.reference);
    toast.success("Appointment booked");
  }

  function handleNext() {
    if (isLastStep) {
      submitBooking();
      return;
    }
    setStep((s) => s + 1);
  }

  // success view
  if (bookingRef) {
    return (
      <Shell onClose={close} title="Appointment Confirmed" step={steps.length} total={steps.length}>
        <div className="text-center py-10 px-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 grid place-items-center text-emerald-600 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-display text-2xl font-bold">Booking #{bookingRef}</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Your appointment is confirmed. A confirmation email and notification have been sent. You can track it in your patient portal.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => { close(); navigate("/patient"); }}>Go to Patient Portal</Button>
            <Button variant="outline" onClick={close}>Close</Button>
          </div>
        </div>
      </Shell>
    );
  }

  const currentLabel = steps[step];

  return (
    <Shell onClose={close} title={currentLabel} step={step + 1} total={steps.length}>
      {/* Step body */}
      <div className="px-1 sm:px-2 py-2">
        {currentLabel === "Mode" && (
          <div className="space-y-4">
            <h3 className="font-display text-xl font-semibold">Choose appointment type</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { k: "physical" as const, title: "Physical Appointment", icon: MapPin, desc: "Visit a DesolMed clinic" },
                { k: "online" as const, title: "Online Appointment", icon: Video, desc: "Video / phone consultation" },
              ].map((o) => {
                const Icon = o.icon;
                const active = subMode === o.k;
                return (
                  <button
                    key={o.k}
                    type="button"
                    onClick={() => setSubMode(o.k)}
                    className={`text-left rounded-xl border-2 p-5 transition ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  >
                    <Icon className="h-6 w-6 text-primary mb-2" />
                    <div className="font-semibold">{o.title}</div>
                    <div className="text-sm text-muted-foreground">{o.desc}</div>
                  </button>
                );
              })}
            </div>

            {subMode === "physical" && (
              <div className="space-y-2 pt-2">
                <Label>Select hospital location</Label>
                <div className="grid gap-2">
                  {HOSPITAL_LOCATIONS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLocation(l.id)}
                      className={`text-left rounded-lg border p-3 transition ${location === l.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    >
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{l.address}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentLabel === "Service" && (
          <div className="space-y-3">
            <h3 className="font-display text-xl font-semibold">Choose a service</h3>
            {method === "hmo" && (
              <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className="space-y-2">
                  <Label htmlFor="hmo-provider">Card Provider</Label>
                  <select
                    id="hmo-provider"
                    value={hmoProvider}
                    onChange={(e) => {
                      setHmoProvider(e.target.value);
                      setService(null);
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Choose your Card provider</option>
                    {HMO_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {hmoProvider && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      {HMO_PROVIDERS.find((p) => p.id === hmoProvider)?.name.replace("HMO", "Card")} selected
                    </p>
                  )}
                </div>
                {!hmoProvider && (
                  <p className="text-sm text-muted-foreground">Choose your Card provider first so we can show the covered services.</p>
                )}
              </div>
            )}
            {method !== "hmo" || hmoProvider ? (
              <div className="grid sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                {availableServices.map((s) => {
                  const active = service?.id === s.id;
                  const disabled = s.available === false;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setService(s)}
                      className={`text-left rounded-xl border-2 p-4 transition ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold leading-tight">{s.name}</div>
                        {method === "card" && <div className="font-display font-bold text-primary whitespace-nowrap">{fmtNGN(s.price)}</div>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{s.description}</div>
                      {disabled && (
                        <div className="text-xs text-rose-600 font-medium mt-2">
                          Appointment not available
                        </div>
                      )}
                      <div className="mt-3">
                        <span className={`inline-flex text-xs font-semibold px-2 py-1 rounded ${active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                          {active ? "Selected" : "Select"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}

        {currentLabel === "Subscription" && (
          <div className="space-y-3 max-w-md">
            <h3 className="font-display text-xl font-semibold">Enter your Subscription ID</h3>
            <div className="space-y-2">
              <Label>Subscription ID</Label>
              <Input value={enrolleeId} onChange={(e) => setEnrolleeId(e.target.value)} placeholder="e.g. DSM-123456" />
              <p className="text-xs text-muted-foreground">
                Don't have a subscription?{" "}
                <Link to="/subscription" className="text-primary font-medium hover:underline" onClick={close}>Click here to subscribe</Link>.
              </p>
            </div>
            <Button onClick={verifySubscription} disabled={!enrolleeId || subChecking}>
              {subChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
            </Button>
            {subVerified?.ok && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-700 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Subscription verified successfully.
              </div>
            )}
            {subVerified && !subVerified.ok && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> {subVerified.reason}
              </div>
            )}
          </div>
        )}

        {currentLabel === "Verify" && (
          <div className="space-y-3 max-w-md">
            <h3 className="font-display text-xl font-semibold">Verify your Card policy</h3>
            <div className="space-y-2">
              <Label>Policy Number</Label>
              <Input
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                onBlur={() => { if (policyNumber.trim() && hmoStatus !== "approved") verifyHmo(); }}
                placeholder="e.g. POL-998877"
              />
            </div>
            <div className="space-y-2">
              <Label>Member details (optional)</Label>
              <Input value={memberDetails} onChange={(e) => setMemberDetails(e.target.value)} placeholder="Full name / DOB" />
            </div>
          </div>
        )}

        {currentLabel === "Details" && (
          <div className="space-y-3 max-w-md">
            <h3 className="font-display text-xl font-semibold">Organization details</h3>
            <div className="space-y-2">
              <Label>Organization Subscription ID</Label>
              <Input value={orgId} onChange={(e) => setOrgId(e.target.value)} placeholder="e.g. ORG-12345" />
            </div>
            <div className="space-y-2">
              <Label>Employee / Member Number</Label>
              <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. EMP-9988" />
            </div>
            <div className="space-y-2">
              <Label>Letter of Authorization</Label>
              <label className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3 cursor-pointer hover:bg-muted/30">
                <Upload className="h-4 w-4 text-primary" />
                <span className="text-sm">{authFile ? authFile.name : "Upload PDF, DOC or image (max 5MB)"}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  className="hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 5 * 1024 * 1024) {
                      toast.error("File too large (max 5MB)");
                      return;
                    }
                    setAuthFile(f);
                  }}
                />
              </label>
              {authFile && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" /> {authFile.name} ({(authFile.size / 1024).toFixed(0)} KB)
                </div>
              )}
            </div>
            <Button onClick={verifyOrg} disabled={!orgId || !employeeId || !authFile || orgStatus === "pending"}>
              {orgStatus === "pending" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for verification"}
            </Button>
            {orgStatus === "pending" && <p className="text-sm text-amber-700">Pending review…</p>}
            {orgStatus === "approved" && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-700 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Approved. Continue to scheduling.
              </div>
            )}
          </div>
        )}

        {currentLabel === "Schedule" && (
          <div className="space-y-4">
            <h3 className="font-display text-xl font-semibold">Pick a date & time</h3>
            <div>
              <Label className="mb-2 block">Available dates</Label>
              <div className="flex flex-wrap gap-2">
                {generateDates().map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDate(d.value)}
                    className={`px-3 py-2 rounded-lg border text-sm transition ${date === d.value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
                  >
                    <CalendarDays className="h-3 w-3 inline mr-1" />
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            {date && (
              <div>
                <Label className="mb-2 block">Available times</Label>
                <div className="flex flex-wrap gap-2">
                  {TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t)}
                      className={`px-3 py-2 rounded-lg border text-sm transition ${time === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
                    >
                      <Clock className="h-3 w-3 inline mr-1" />
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {date && time && (
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2 font-display font-bold">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Booking Summary
                </div>
                <div className="grid sm:grid-cols-2 gap-y-1 gap-x-4 text-sm">
                  {service && (
                    <>
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium sm:text-right">{service.name}</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium sm:text-right">
                    {new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium sm:text-right">{time}</span>
                  {subMode && (
                    <>
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-medium sm:text-right capitalize">{subMode}</span>
                    </>
                  )}
                  {location && (
                    <>
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium sm:text-right">
                        {HOSPITAL_LOCATIONS.find((l) => l.id === location)?.name}
                      </span>
                    </>
                  )}
                  {hmoProvider && (
                    <>
                      <span className="text-muted-foreground">Card</span>
                      <span className="font-medium sm:text-right">
                        {HMO_PROVIDERS.find((p) => p.id === hmoProvider)?.name.replace("HMO", "Card")}
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground">Access</span>
                  <span className="font-medium sm:text-right capitalize">{method}</span>
                  {service && method === "card" && (
                    <>
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-display font-bold text-primary sm:text-right">{fmtNGN(service.price)}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}


        {currentLabel === "Login" && (
          <div className="space-y-3 max-w-md">
            {user ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Logged in as {user.email}. You can continue.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <LockKeyhole className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold">Login to continue</h3>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button onClick={handleLogin} disabled={authBusy} className="w-full">
                  {authBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Don't have an account?{" "}
                  <Link to="/register/patient" className="text-primary font-medium hover:underline" onClick={close}>Register here</Link>
                </p>
              </>
            )}
          </div>
        )}

        {currentLabel === "Consent" && (
          <div className="space-y-3">
            <h3 className="font-display text-xl font-semibold">Consent & agreements</h3>
            <div className="space-y-2">
              {CONSENTS.map((c) => (
                <label key={c.key} className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/30">
                  <Checkbox
                    checked={!!agreed[c.key]}
                    onCheckedChange={(v) => setAgreed((a) => ({ ...a, [c.key]: v === true }))}
                  />
                  <span className="text-sm">{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentLabel === "Payment" && service && (
          <div className="space-y-4 max-w-md">
            <h3 className="font-display text-xl font-semibold">Secure payment</h3>
            <div className="rounded-lg border border-border p-3 bg-muted/30">
              <div className="flex justify-between text-sm">
                <span>{service.name}</span>
                <span className="font-semibold">{fmtNGN(service.price)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Card number</Label>
              <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, ""))} placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input value={cardExp} onChange={(e) => setCardExp(e.target.value)} placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label>CVC</Label>
                <Input value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} placeholder="123" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Encrypted payment processing
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="border-t border-border bg-background sticky bottom-0 px-4 py-3 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => (step === 0 ? close() : setStep((s) => s - 1))} disabled={submitting}>
          <ArrowLeft className="h-4 w-4" /> {step === 0 ? "Cancel" : "Back"}
        </Button>
        <div className="text-xs text-muted-foreground hidden sm:block">
          Step {step + 1} of {steps.length}
        </div>
        <Button onClick={handleNext} disabled={!canNext || submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isLastStep ? "Confirm booking" : <>Next <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </div>
    </Shell>
  );
}

function Shell({
  onClose, title, step, total, children,
}: { onClose: () => void; title: string; step: number; total: number; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="min-h-screen flex items-stretch lg:items-start justify-center lg:py-8 lg:px-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-full lg:max-w-3xl bg-background lg:rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-screen lg:min-h-0">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-5 py-4 flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Step {step} of {total}
              </p>
              <p className="font-display font-bold text-base sm:text-lg truncate">{title}</p>
            </div>
            <button type="button" onClick={onClose} className="grid place-items-center h-9 w-9 rounded-full hover:bg-muted" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-5 pt-3">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${(step / total) * 100}%` }} />
            </div>
          </div>
          <div className="flex-1 px-4 sm:px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
