import { SiteLayout } from "@/components/site/SiteLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Stethoscope, Building2, Pill, FlaskConical, ShieldCheck, CheckCircle2, Upload, FileCheck2, Loader2,
} from "lucide-react";
import { SectionLabel } from "@/components/site/SectionLabel";
import { SPECIALTIES, ZONES, SPECIALTY_MAP } from "@/data/doctors";
import { NIGERIA_STATES } from "@/data/nigeriaStates";
import { submitRegistration, ApplicantType, DocumentSlot } from "@/lib/registrations";
import { ConsentCheckbox } from "@/components/site/ConsentCheckbox";
import { RegistrationSuccessDialog } from "@/components/site/RegistrationSuccessDialog";

type TabKey = "doctor" | "organization" | "pharmacy" | "lab-diagnostics";

const TABS: { value: TabKey; label: string; icon: typeof Stethoscope; blurb: string }[] = [
  { value: "doctor", label: "Doctor", icon: Stethoscope, blurb: "Verified clinicians joining the network." },
  { value: "organization", label: "HMO / Organization", icon: Building2, blurb: "HMOs, hospitals, NGOs and corporates." },
  { value: "pharmacy", label: "Pharmacy", icon: Pill, blurb: "Community and chain pharmacies." },
  { value: "lab-diagnostics", label: "Laboratory / Diagnostics", icon: FlaskConical, blurb: "Medical labs and diagnostic centres." },
];

const isTab = (v: string | null): v is TabKey =>
  !!v && TABS.some((t) => t.value === v);

const Register = () => {
  const [params, setParams] = useSearchParams();
  const initial = isTab(params.get("type")) ? (params.get("type") as TabKey) : "doctor";
  const [tab, setTab] = useState<TabKey>(initial);

  useEffect(() => {
    const p = params.get("type");
    if (isTab(p) && p !== tab) setTab(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onTabChange = (v: string) => {
    if (isTab(v)) {
      setTab(v);
      setParams({ type: v }, { replace: true });
    }
  };

  const active = TABS.find((t) => t.value === tab)!;
  const ActiveIcon = active.icon;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-muted/30">
        <div className="container py-12 max-w-3xl">
          <SectionLabel number="" label="Join DesolMed" />
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
            Registration
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Select your category below and complete the matching form. Every application is reviewed by our team.
          </p>
        </div>
      </section>

      <section className="container py-10 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-2">
            <Label htmlFor="reg-category" className="text-base font-semibold">Category</Label>
            <p className="text-sm text-muted-foreground">Choose the type of applicant — the form below will update.</p>
            <Select value={tab} onValueChange={onTabChange}>
              <SelectTrigger id="reg-category" className="mt-2">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {TABS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={tab} onValueChange={onTabChange} className="space-y-6">
            <TabsContent value="doctor"><DoctorForm /></TabsContent>
            <TabsContent value="organization"><OrganizationForm /></TabsContent>
            <TabsContent value="pharmacy"><PartnerForm kind="Pharmacy" type="pharmacy" placeholderName="e.g. HealthPlus Pharmacy" /></TabsContent>
            <TabsContent value="lab-diagnostics"><PartnerForm kind="Laboratory / Diagnostics" type="lab-diagnostics" placeholderName="e.g. SafeCare Medical Lab" /></TabsContent>
          </Tabs>
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-32 rounded-2xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <ActiveIcon className="h-5 w-5 text-secondary" />
              <h3 className="font-display font-semibold">{active.label}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{active.blurb}</p>
            <ul className="space-y-3 text-sm">
              {[
                "Submit your details in a few minutes",
                "Our team reviews within 48 hours",
                "Get notified by email once approved",
                "Your verified profile goes live",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-xl bg-primary-soft p-4">
              <p className="text-xs font-semibold text-primary inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Reviewed by our team
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Most applications get a response within 2 business days.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
};

/* ---------- Shared verification documents uploader ---------- */
const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp";
const MAX_MB = 10;

type FileFieldProps = {
  id: string;
  label: string;
  hint: string;
  required?: boolean;
  multiple?: boolean;
  minFiles?: number;
  maxFiles?: number;
  maxSizeMb?: number;
  onChange: (files: File[]) => void;
};

const FileField = ({
  id,
  label,
  hint,
  required,
  multiple,
  minFiles,
  maxFiles,
  maxSizeMb = MAX_MB,
  onChange,
}: FileFieldProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    const maxBytes = maxSizeMb * 1024 * 1024;
    const accepted = list.filter((file) => file.size <= maxBytes);
    const rejected = list.filter((file) => file.size > maxBytes);

    if (rejected.length > 0) {
      toast({
        title: "File too large",
        description: `${rejected.map((file) => file.name).join(", ")} ${rejected.length > 1 ? "are" : "is"} over the ${maxSizeMb}MB limit.`,
        variant: "destructive",
      });
    }

    if (maxFiles && accepted.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can upload at most ${maxFiles} file${maxFiles > 1 ? "s" : ""} here.`,
        variant: "destructive",
      });
    }

    const next = maxFiles ? accepted.slice(0, maxFiles) : accepted;
    setFiles(next);
    onChange(next);
  };

  const minLabel = minFiles ?? (required ? 1 : 0);
  const maxLabel = maxFiles ?? (multiple ? undefined : 1);
  const limitText = [
    minLabel ? `minimum ${minLabel} file${minLabel > 1 ? "s" : ""}` : "optional",
    maxLabel ? `maximum ${maxLabel} file${maxLabel > 1 ? "s" : ""}` : undefined,
    `up to ${maxSizeMb}MB each`,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <Upload className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">
          {files.length > 0
            ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
            : "Click to upload or drag & drop"}
        </span>
        <span className="text-xs text-muted-foreground">{hint}</span>
        <span className="text-[11px] text-muted-foreground">{ACCEPTED.replace(/,/g, ", ").toUpperCase()} - {limitText}</span>
        <Input
          id={id}
          type="file"
          accept={ACCEPTED}
          required={required}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </label>
      {files.length > 0 && (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {files.map((f) => (
            <li key={f.name} className="flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-secondary" />
              <span className="truncate">{f.name}</span>
              <span className="opacity-60">({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

type DocsState = {
  licence: File[];
  govid: File[];
  certs: File[];
  indemnity: File[];
  hospital_licence: File[];
  org_proof: File[];
};

const DocumentsSection = ({
  licenceLabel = "Medical licence",
  showAffiliation = false,
  onAffiliationChange,
  onChange,
}: {
  licenceLabel?: string;
  showAffiliation?: boolean;
  onAffiliationChange?: (data: { organization_name: string; hospital_licence_expiry: string }) => void;
  onChange: (docs: DocsState) => void;
}) => {
  const [docs, setDocs] = useState<DocsState>({
    licence: [], govid: [], certs: [], indemnity: [], hospital_licence: [], org_proof: [],
  });
  const [affiliation, setAffiliation] = useState({ organization_name: "", hospital_licence_expiry: "" });
  const update = (patch: Partial<DocsState>) => {
    const next = { ...docs, ...patch };
    setDocs(next);
    onChange(next);
  };
  const updateAff = (patch: Partial<typeof affiliation>) => {
    const next = { ...affiliation, ...patch };
    setAffiliation(next);
    onAffiliationChange?.(next);
  };
  return (
    <div className="space-y-5 rounded-xl border border-border bg-muted/20 p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-secondary" />
        <h3 className="font-display font-semibold">Verification documents</h3>
      </div>
      <p className="text-sm text-muted-foreground -mt-2">
        PDF, JPG, PNG or WEBP. Max {MAX_MB}MB per file.
      </p>
      <div className="grid gap-5">
        <FileField
          id="doc-licence"
          label={licenceLabel}
          hint="Upload a clear scan or photo of your current practising licence."
          required
          onChange={(f) => update({ licence: f })}
          minFiles={1}
          maxFiles={1}
        />
        <FileField
          id="doc-govid"
          label="Government-Issued ID"
          hint="National ID, driver's licence, international passport or voter's card."
          required
          onChange={(f) => update({ govid: f })}
          minFiles={1}
          maxFiles={1}
        />
        {showAffiliation && (
          <>
            <FileField
              id="doc-indemnity"
              label="Indemnity of Organization"
              hint="Upload your professional indemnity insurance certificate, if available."
              onChange={(f) => update({ indemnity: f })}
              minFiles={0}
              maxFiles={1}
            />
            <div className="space-y-4 sm:col-span-2 rounded-lg border border-border bg-background/60 p-4">
              <div>
                <h4 className="text-sm font-semibold"></h4>
                <p className="text-xs text-muted-foreground mt-1">
                  If you practice at a hospital or clinic, share the organization details and licence.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="affil-org-name">Name of Organization</Label>
                  <Input
                    id="affil-org-name"
                    value={affiliation.organization_name}
                    onChange={(e) => updateAff({ organization_name: e.target.value })}
                    maxLength={150}
                    placeholder="e.g. St. Mary's Hospital"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affil-expiry">Hospital Licence Expiry Date</Label>
                  <Input
                    id="affil-expiry"
                    type="date"
                    value={affiliation.hospital_licence_expiry}
                    onChange={(e) => updateAff({ hospital_licence_expiry: e.target.value })}
                  />
                </div>
              </div>
              <FileField
                id="doc-hospital-licence"
                label="Hospital Licence"
                hint="Upload the hospital or clinic operating licence."
                minFiles={0}
                maxFiles={1}
                onChange={(f) => update({ hospital_licence: f })}
              />
              <FileField
                id="doc-org-proof"
                label="Proof of Address"
                hint="Employment letter, ID badge or any document showing your link to the organization."
                minFiles={0}
                maxFiles={1}
                onChange={(f) => update({ org_proof: f })}
              />
            </div>
          </>
        )}
        <FileField
          id="doc-certs"
          label="Certifications (Optional)"
          hint="Specialty certificates, fellowship awards or accreditations. You can add several."
          multiple
          minFiles={0}
          maxFiles={5}
          onChange={(f) => update({ certs: f })}
        />
      </div>
    </div>
  );
};

const buildDocSlots = (docs: DocsState, licenceLabel: string): DocumentSlot[] => [
  { field: "doc-licence", label: licenceLabel, files: docs.licence },
  { field: "doc-govid", label: "Government-Issued ID", files: docs.govid },
  { field: "doc-indemnity", label: "Indemnity insurance", files: docs.indemnity },
  { field: "doc-hospital-licence", label: "Hospital Licence", files: docs.hospital_licence },
  { field: "doc-org-proof", label: "Proof of Affiliation", files: docs.org_proof },
  { field: "doc-certs", label: "Certifications", files: docs.certs },
];

/* ---------- Doctor form ---------- */
const DoctorForm = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [specialty, setSpecialty] = useState<string>("");
  const [subSpecialty, setSubSpecialty] = useState<string>("");
  const [otherSpecialty, setOtherSpecialty] = useState<string>("");
  const [docs, setDocs] = useState<DocsState>({ licence: [], govid: [], certs: [], indemnity: [], hospital_licence: [], org_proof: [] });
  const [affiliation, setAffiliation] = useState({ organization_name: "", hospital_licence_expiry: "" });
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSpecialtyChange = (value: string) => {
    setSpecialty(value);
    setSubSpecialty(""); // Reset sub-specialty when specialty changes
    setOtherSpecialty("");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!docs.licence.length || !docs.govid.length) {
      toast({ title: "Documents required", description: "Please upload your licence and government ID.", variant: "destructive" });
      return;
    }
    if (!consent) {
      toast({ title: "Consent required", description: "Please confirm the consent statement to continue.", variant: "destructive" });
      return;
    }
    if (docs.certs.length > 5) {
      toast({
        title: "Too many certifications",
        description: "Please upload at most 5 certification files.",
        variant: "destructive",
      });
      return;
    }
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string) || "";
    setSubmitting(true);
    try {
      await submitRegistration({
        applicant_type: "doctor",
        full_name: get("full_name"),
        email: get("email"),
        phone: get("phone"),
        city: get("city"),
        state: get("state"),
        zone: get("zone"),
        specialty: specialty,
        details: {
          sub_specialty: specialty === "Others" ? otherSpecialty : subSpecialty,
          years_experience: get("years_experience"),
          bio: get("bio"),
          website: get("website"),
          affiliated_organization_name: affiliation.organization_name,
          hospital_licence_expiry: affiliation.hospital_licence_expiry,
          consent_agreed: true,
          consent_agreed_at: new Date().toISOString(),
        },
        documents: buildDocSlots(docs, "Medical Practising Licence"),
      });
      setSuccessOpen(true);
      formRef.current?.reset();
      setDocs({ licence: [], govid: [], certs: [], indemnity: [], hospital_licence: [], org_proof: [] });
      setAffiliation({ organization_name: "", hospital_licence_expiry: "" });
      setConsent(false);
      setSpecialty("");
      setSubSpecialty("");
      setOtherSpecialty("");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <h2 className="font-display text-2xl font-bold">Doctor Registration</h2>
        <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Name of Responsible Officer / Doctor</Label>
          <Input name="full_name" required maxLength={100} placeholder="Dr. Jane Doe" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input name="email" type="email" required maxLength={255} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input name="phone" type="tel" required maxLength={20} placeholder="+234..." />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Specialization</Label>
          <Select value={specialty} onValueChange={handleSpecialtyChange} required>
            <SelectTrigger><SelectValue placeholder="Select Specialty" /></SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {specialty && (
          <div className="space-y-2 sm:col-span-2">
            {specialty === "Others" ? (
              <>
                <Label>Specify Specialty or Profession</Label>
                <Input
                  name="other_specialty"
                  required
                  maxLength={120}
                  value={otherSpecialty}
                  onChange={(e) => setOtherSpecialty(e.target.value)}
                  placeholder="e.g. Dentistry, Physiotherapy, Dietician"
                />
              </>
            ) : (
              <>
                <Label>Sub-Specialty</Label>
                <Select value={subSpecialty} onValueChange={setSubSpecialty} required>
                  <SelectTrigger><SelectValue placeholder="Select Sub-Specialty" /></SelectTrigger>
                  <SelectContent>
                    {SPECIALTY_MAP[specialty as keyof typeof SPECIALTY_MAP]?.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label>Years of Experience</Label>
          <Input name="years_experience" type="number" min={0} max={60} placeholder="e.g. 8" />
        </div>
        <div className="space-y-2">
          <Label>Zone</Label>
          <Select name="zone" required>
            <SelectTrigger><SelectValue placeholder="Zone" /></SelectTrigger>
            <SelectContent>
              {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select name="state" required>
            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {NIGERIA_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input name="city" required maxLength={60} placeholder="e.g. Ikeja" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Website (Optional)</Label>
          <Input name="website" type="url" maxLength={255} placeholder="https://your-website.com" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Short Bio</Label>
          <Textarea name="bio" maxLength={500} rows={4} placeholder="Tell patients about your practice…" />
        </div>
      </div>
      <DocumentsSection
        licenceLabel="Medical Practising Licence"
        showAffiliation
        onAffiliationChange={setAffiliation}
        onChange={setDocs}
      />
      <ConsentCheckbox checked={consent} onCheckedChange={setConsent} id="consent-doctor" />
      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" variant="hero" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit Application
        </Button>
      </div>
      </form>
      <RegistrationSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Application submitted successfully"
        description="Thank you for registering as a doctor. Our verification team will review your documents, and you will receive an email once your application has been verified."
        primaryLabel="Back to home"
        primaryHref="/"
      />
    </>
  );
};

/* ---------- Organization form ---------- */
const OrganizationForm = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [docs, setDocs] = useState<DocsState>({ licence: [], govid: [], certs: [], indemnity: [], hospital_licence: [], org_proof: [] });
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!docs.licence.length || !docs.govid.length) {
      toast({ title: "Documents required", description: "Please upload your licence and government ID.", variant: "destructive" });
      return;
    }
    if (!consent) {
      toast({ title: "Consent required", description: "Please confirm the consent statement to continue.", variant: "destructive" });
      return;
    }
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string) || "";
    setSubmitting(true);
    try {
      await submitRegistration({
        applicant_type: "organization",
        organization_name: get("organization_name"),
        full_name: get("contact_name"),
        email: get("email"),
        phone: get("phone"),
        city: get("city"),
        state: get("state"),
        details: {
          org_type: get("org_type"),
          members: get("members"),
          role: get("role"),
          notes: get("notes"),
          consent_agreed: true,
          consent_agreed_at: new Date().toISOString(),
        },
        documents: buildDocSlots(docs, "Organization registration / operating licence"),
      });
      setSuccessOpen(true);
      formRef.current?.reset();
      setDocs({ licence: [], govid: [], certs: [], indemnity: [], hospital_licence: [], org_proof: [] });
      setConsent(false);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <h2 className="font-display text-2xl font-bold">Organization Registration</h2>
      
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Organization Name</Label>
          <Input name="organization_name" required maxLength={150} placeholder="e.g. Leadway Insurance " />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select name="org_type" required>
            <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hmo">HMO</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estimated Members</Label>
          <Input name="members" type="number" min={1} placeholder="e.g. 500" />
        </div>
        <div className="space-y-2">
          <Label>Name of Responsible Officer</Label>
          <Input name="contact_name" required maxLength={100} placeholder="Full Name" />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input name="role" required maxLength={100} placeholder="e.g. Operation Manager" />
        </div>
        <div className="space-y-2">
          <Label>Work Email</Label>
          <Input name="email" type="email" required maxLength={255} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input name="phone" type="tel" required maxLength={20} />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select name="state" required>
            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {NIGERIA_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input name="city" required maxLength={60} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>What are you hoping DesolMed can help with?</Label>
          <Textarea name="notes" rows={5} maxLength={1000} placeholder="A few sentences are enough…" />
        </div>
      </div>
      <DocumentsSection licenceLabel="Organization Registration / Operating Licence" onChange={setDocs} />
      <ConsentCheckbox checked={consent} onCheckedChange={setConsent} id="consent-org" />
      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" variant="hero" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit for Review
        </Button>
      </div>
      </form>
      <RegistrationSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Application submitted successfully"
        description="Thank you for registering your organization. Our verification team will review the details, and you will receive an email once the application has been verified."
        primaryLabel="Back to home"
        primaryHref="/"
      />
    </>
  );
};

/* ---------- Generic partner form for Pharmacy / Diagnostics / Laboratory ---------- */
const PartnerForm = ({
  kind,
  type,
  placeholderName,
}: {
  kind: string;
  type: ApplicantType;
  placeholderName: string;
}) => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [docs, setDocs] = useState<DocsState>({ licence: [], govid: [], certs: [], indemnity: [], hospital_licence: [], org_proof: [] });
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!docs.licence.length || !docs.govid.length) {
      toast({ title: "Documents required", description: "Please upload your licence and government ID.", variant: "destructive" });
      return;
    }
    if (!consent) {
      toast({ title: "Consent required", description: "Please confirm the consent statement to continue.", variant: "destructive" });
      return;
    }
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string) || "";
    setSubmitting(true);
    try {
      await submitRegistration({
        applicant_type: type,
        organization_name: get("organization_name"),
        full_name: get("contact_name"),
        email: get("email"),
        phone: get("phone"),
        city: get("city"),
        state: get("state"),
        zone: get("zone"),
        details: {
          kind,
          license_number: get("license_number"),
          year_established: get("year_established"),
          role: get("role"),
          address: get("address"),
          services: get("services"),
          consent_agreed: true,
          consent_agreed_at: new Date().toISOString(),
        },
        documents: buildDocSlots(docs, `${kind} operating licence`),
      });
      setSuccessOpen(true);
      formRef.current?.reset();
      setDocs({ licence: [], govid: [], certs: [], indemnity: [], hospital_licence: [], org_proof: [] });
      setConsent(false);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <h2 className="font-display text-2xl font-bold">{kind} Registration</h2>
        <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>{kind} Name</Label>
          <Input name="organization_name" required maxLength={150} placeholder={placeholderName} />
        </div>
        <div className="space-y-2">
          <Label>License / Registration Number</Label>
          <Input name="license_number" required maxLength={60} placeholder="e.g. PCN-12345" />
        </div>
        <div className="space-y-2">
          <Label>Year Established</Label>
          <Input name="year_established" type="number" min={1900} max={2026} placeholder="e.g. 2015" />
        </div>
        <div className="space-y-2">
          <Label>Name of Responsible Officer</Label>
          <Input name="contact_name" required maxLength={100} placeholder="Full Name" />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input name="role" required maxLength={100} placeholder="e.g. Branch Manager" />
        </div>
        <div className="space-y-2">
          <Label>Work Email</Label>
          <Input name="email" type="email" required maxLength={255} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input name="phone" type="tel" required maxLength={20} placeholder="+234..." />
        </div>
        <div className="space-y-2">
          <Label>Zone</Label>
          <Select name="zone" required>
            <SelectTrigger><SelectValue placeholder="Zone" /></SelectTrigger>
            <SelectContent>
              {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select name="state" required>
            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {NIGERIA_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input name="city" required maxLength={60} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Address</Label>
          <Input name="address" required maxLength={200} placeholder="Street address" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Services Offered</Label>
          <Textarea name="services" rows={4} maxLength={1000} placeholder="Briefly describe your main services…" />
        </div>
      </div>
      <DocumentsSection licenceLabel={`${kind} Operating Licence`} onChange={setDocs} />
      <ConsentCheckbox checked={consent} onCheckedChange={setConsent} id={`consent-${type}`} />
      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" variant="hero" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit for Review
        </Button>
      </div>
      </form>
      <RegistrationSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Application submitted successfully"
        description={`Thank you for registering your ${kind.toLowerCase()}. Our verification team will review the details, and you will receive an email once the application has been verified.`}
        primaryLabel="Back to home"
        primaryHref="/"
      />
    </>
  );
};

export default Register;
