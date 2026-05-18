import { SiteLayout } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { HeartPulse, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { SectionLabel } from "@/components/site/SectionLabel";
import { FormStepper } from "@/components/site/FormStepper";
import { submitRegistration } from "@/lib/registrations";
import { ConsentCheckbox } from "@/components/site/ConsentCheckbox";
import { RegistrationSuccessDialog } from "@/components/site/RegistrationSuccessDialog";

const STEPS = ["Account", "Details", "Confirm"];

type PatientData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  source: string;
  gender: string;
  date_of_birth: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_relationship: string;
  review_notes: string;
};

const RegisterPatient = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [data, setData] = useState<PatientData>({
    first_name: "", last_name: "", email: "", password: "",
    phone: "", city: "", source: "",
    gender: "", date_of_birth: "",
    next_of_kin_name: "", next_of_kin_phone: "", next_of_kin_relationship: "",
    review_notes: "",
  });

  const update = (k: keyof PatientData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    if (!consent) {
      toast({ title: "Consent required", description: "Please confirm the consent statement to continue.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await submitRegistration({
        applicant_type: "patient",
        full_name: `${data.first_name} ${data.last_name}`.trim(),
        email: data.email,
        password: data.password,
        phone: data.phone,
        city: data.city,
        details: {
          first_name: data.first_name,
          last_name: data.last_name,
          source: data.source,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          next_of_kin: {
            name: data.next_of_kin_name,
            phone: data.next_of_kin_phone,
            relationship: data.next_of_kin_relationship,
          },
          review_notes: data.review_notes,
          consent_agreed: true,
          consent_agreed_at: new Date().toISOString(),
        },
        documents: [],
      });
      setData({
        first_name: "", last_name: "", email: "", password: "", phone: "", city: "", source: "",
        gender: "", date_of_birth: "",
        next_of_kin_name: "", next_of_kin_phone: "", next_of_kin_relationship: "",
        review_notes: "",
      });
      setStep(0);
      setConsent(false);
      setSuccessOpen(true);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <section className="border-b border-border bg-muted/30">
        <div className="container py-12 max-w-3xl">
          <SectionLabel number="" label="For Patients" />
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
            Create your free account.
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            One free account. Access verified doctors across Nigeria, on any device.
          </p>
        </div>
      </section>

      <section className="container py-12 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <FormStepper steps={STEPS} current={step} />
          </div>

          <form onSubmit={next} className="rounded-2xl border border-border bg-card p-8 space-y-6">
            {step === 0 && (
              <>
                <h2 className="font-display text-2xl font-bold">Account Details</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={data.first_name} onChange={update("first_name")} required maxLength={60} placeholder="Jane" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={data.last_name} onChange={update("last_name")} required maxLength={60} placeholder="Doe" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Email</Label>
                    <Input value={data.email} onChange={update("email")} type="email" required maxLength={255} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Password</Label>
                    <Input value={data.password} onChange={update("password")} type="password" required minLength={8} maxLength={64} placeholder="At least 8 characters" />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="font-display text-2xl font-bold">A Few More Details</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={data.phone} onChange={update("phone")} type="tel" maxLength={20} placeholder="+234..." />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={data.city} onChange={update("city")} maxLength={60} placeholder="e.g. Lagos" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <select
                      value={data.gender}
                      onChange={(e) => setData((d) => ({ ...d, gender: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select Gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer Not to Say</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input value={data.date_of_birth} onChange={update("date_of_birth")} type="date" max={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="space-y-2 sm:col-span-2 pt-2">
                    <p className="font-display font-semibold">Next of Kin</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={data.next_of_kin_name} onChange={update("next_of_kin_name")} maxLength={120} placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={data.next_of_kin_phone} onChange={update("next_of_kin_phone")} type="tel" maxLength={20} placeholder="+234..." />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Relationship</Label>
                    <Input value={data.next_of_kin_relationship} onChange={update("next_of_kin_relationship")} maxLength={60} placeholder="e.g. Spouse, Parent, Sibling" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>How Did You Hear About Us?</Label>
                    <Input value={data.source} onChange={update("source")} maxLength={150} placeholder="Optional" />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-display text-2xl font-bold">You're Almost Done</h2>
                <p className="text-muted-foreground">
                  Confirm to create your DesolMed account. You'll get an email with next steps.
                </p>
                <div className="rounded-xl bg-primary-soft p-5 space-y-2">
                  <p className="font-display font-semibold text-primary">What's Next</p>
                  <p className="text-sm text-muted-foreground">
                    Browse the directory, save doctors you like, and reach out directly when you need care.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review_notes">Notes for Our Review Team (Optional)</Label>
                  <Textarea
                    id="review_notes"
                    name="review_notes"
                    rows={4}
                    maxLength={1000}
                    value={data.review_notes}
                    onChange={(e) => setData((d) => ({ ...d, review_notes: e.target.value }))}
                    placeholder="Anything you'd like our team to know about your registration…"
                  />
                </div>
                <ConsentCheckbox checked={consent} onCheckedChange={setConsent} id="consent-patient" />
              </>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || submitting}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === STEPS.length - 1 ? "Create Account" : "Continue"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-32 rounded-2xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-secondary" />
              <h3 className="font-display font-semibold">What You Get</h3>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                "100% free patient account",
                "Browse only verified doctors",
                "Filter by specialty and location",
                "Mobile-friendly experience",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
      <RegistrationSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Patient registration successful"
        description="Your DesolMed patient account has been created. Please check your email for the verification message before signing in."
        primaryLabel="Go to login"
        primaryHref="/patient/login"
      />
    </SiteLayout>
  );
};

export default RegisterPatient;
