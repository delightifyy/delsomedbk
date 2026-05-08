import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DOCTORS } from "@/data/doctors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Video, ArrowLeft, ArrowRight } from "lucide-react";

type Step = 0 | 1 | 2 | 3;
const LABELS = ["Doctor", "Date & Time", "Your details", "Confirm"];

const formatDate = (d: Date) => d.toISOString().slice(0, 10);
const labelDate = (d: Date) => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

const buildDates = (availability: { day: string; slots: string[] }[]) => {
  const map = new Map(availability.map((a) => [a.day, a.slots]));
  const out: Array<{ value: string; label: string; slots: string[] }> = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.toLocaleDateString(undefined, { weekday: "long" });
    const slots = map.get(day) ?? [];
    if (slots.length) out.push({ value: formatDate(d), label: labelDate(d), slots });
  }
  return out;
};

const BookConsultation = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(0);
  const [doctorId, setDoctorId] = useState(params.get("doctor") ?? DOCTORS[0].id);
  const doctor = useMemo(() => DOCTORS.find((d) => d.id === doctorId) ?? DOCTORS[0], [doctorId]);

  const dates = useMemo(() => buildDates(doctor.availability), [doctor]);
  const [date, setDate] = useState(dates[0]?.value ?? "");
  const activeDate = dates.find((d) => d.value === date) ?? dates[0];
  const [time, setTime] = useState(activeDate?.slots[0] ?? "");

  useEffect(() => {
    if (dates.length && !dates.some((d) => d.value === date)) setDate(dates[0].value);
  }, [dates, date]);
  useEffect(() => {
    if (activeDate && !activeDate.slots.includes(time)) setTime(activeDate.slots[0]);
  }, [activeDate, time]);

  const [patient, setPatient] = useState({ name: "", email: "", phone: "", reason: "" });

  useEffect(() => { document.title = "Book a video consultation - DesolMed Hospital"; }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!patient.name || !patient.email || !patient.phone) {
      toast({ title: "Fill in your details", variant: "destructive" });
      return;
    }
    const room = `desolmed-${doctor.id}-${Date.now().toString(36)}`;
    toast({ title: "Appointment confirmed", description: `${activeDate?.label} at ${time}` });
    navigate(`/consult/${room}?doctor=${doctor.id}&name=${encodeURIComponent(patient.name)}&time=${encodeURIComponent(time)}&date=${encodeURIComponent(activeDate?.label ?? "")}`);
  };

  return (
    <SiteLayout>
      <section className="container py-10 sm:py-14">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to home
        </Link>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Book a video consultation</h1>
            <p className="text-muted-foreground mt-2">Secure HD video call with a verified doctor.</p>

            {/* Stepper */}
            <div className="flex items-center justify-between gap-2 mt-8">
              {LABELS.map((l, i) => (
                <div key={l} className="flex-1 flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full grid place-items-center font-semibold transition-colors ${
                    i === step ? "bg-primary text-primary-foreground"
                      : i < step ? "bg-secondary/20 text-secondary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  <p className="text-xs text-center mt-2 text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-6">
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-semibold">Choose a doctor</h2>
                  <Select value={doctorId} onValueChange={setDoctorId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOCTORS.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="rounded-xl bg-muted/40 p-4 flex gap-4 items-center">
                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary font-display font-bold">
                      {doctor.initials}
                    </div>
                    <div>
                      <p className="font-semibold">{doctor.name}</p>
                      <p className="text-sm text-secondary">{doctor.specialty}</p>
                      <p className="text-xs text-muted-foreground">{doctor.city}, {doctor.state} · ₦{doctor.consultationFee.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setStep(1)}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="font-display text-xl font-semibold">Select date & time</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {dates.map((d) => (
                      <button key={d.value} type="button" onClick={() => setDate(d.value)}
                        className={`text-left rounded-xl border p-4 transition-all ${
                          d.value === date ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        }`}>
                        <p className="font-semibold">{d.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{d.slots.length} slots</p>
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Available times</p>
                    <div className="flex flex-wrap gap-2">
                      {activeDate?.slots.map((s) => (
                        <button key={s} type="button" onClick={() => setTime(s)}
                          className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                            time === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(0)}>Back</Button>
                    <Button type="button" onClick={() => setStep(2)}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-semibold">Your details</h2>
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input value={patient.name} onChange={(e) => setPatient((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={patient.email} onChange={(e) => setPatient((p) => ({ ...p, email: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input type="tel" value={patient.phone} onChange={(e) => setPatient((p) => ({ ...p, phone: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for visit (optional)</Label>
                    <Textarea rows={3} value={patient.reason} onChange={(e) => setPatient((p) => ({ ...p, reason: e.target.value }))} />
                  </div>
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button type="button" onClick={() => setStep(3)}>Review <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="font-display text-xl font-semibold">Confirm your appointment</h2>
                  <div className="rounded-xl bg-muted/40 p-5 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Patient:</span> <strong>{patient.name}</strong></p>
                    <p><span className="text-muted-foreground">Doctor:</span> <strong>{doctor.name}</strong> — {doctor.specialty}</p>
                    <p><span className="text-muted-foreground">When:</span> <strong>{activeDate?.label}</strong> at <strong>{time}</strong></p>
                    <p><span className="text-muted-foreground">Fee:</span> <strong>₦{doctor.consultationFee.toLocaleString()}</strong></p>
                  </div>
                  <Badge className="bg-secondary/15 text-secondary border-0"><Video className="h-3.5 w-3.5 mr-1" /> Video link generated after confirmation</Badge>
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button type="submit" size="lg"><Video className="mr-2 h-4 w-4" /> Confirm & start video call</Button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold">Consultation</h3>
              <p className="text-3xl font-bold mt-2">₦{doctor.consultationFee.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">30-minute video session</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card text-sm space-y-3">
              <p className="font-semibold">What's included</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-secondary mt-0.5" /> HD video consultation</li>
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-secondary mt-0.5" /> Digital prescription via email</li>
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-secondary mt-0.5" /> Follow-up support</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
};

export default BookConsultation;
