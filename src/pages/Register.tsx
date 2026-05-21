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
import { api } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";

type TabKey = "doctor" | "organization" | "pharmacy" | "lab-diagnostics";

const TABS: { value: TabKey; label: string; icon: typeof Stethoscope; blurb: string }[] = [
  { value: "doctor", label: "Doctor", icon: Stethoscope, blurb: "Verified clinicians joining the network." },
  { value: "organization", label: "HMO / Organization", icon: Building2, blurb: "HMOs, hospitals, NGOs and corporates." },
  { value: "pharmacy", label: "Pharmacy", icon: Pill, blurb: "Community and chain pharmacies." },
  { value: "lab-diagnostics", label: "Laboratory / Diagnostics", icon: FlaskConical, blurb: "Medical labs and diagnostic centres." }, 
]; 

type LookupItem = {
  id: string;
  label: string;
  code?: string;
  slug?: string;
  zoneId?: string;
  specialtyId?: string;
  subSpecialties?: LookupItem[];
};

type RegistrationLookups = {
  zones: LookupItem[];
  states: LookupItem[];
  specialties: LookupItem[];
  subSpecialties: LookupItem[];
  organizationTypes: LookupItem[];
  loading: boolean;
};

const asLookupText = (value: unknown) => String(value ?? "").trim();

const lookupItemFromApi = (entry: any, fallbackId: string): LookupItem => {
  const id = asLookupText(entry?.id ?? entry?.uuid ?? entry?.slug ?? entry?.code ?? fallbackId);
  const label = asLookupText(entry?.name ?? entry?.title ?? entry?.label ?? entry?.code ?? entry?.slug ?? id);
  const subSpecialties = collection(entry?.sub_specialties ?? entry?.subSpecialties).map((item, index) =>
    lookupItemFromApi(item, `${id}-sub-${index}`),
  );

  return {
    id,
    label,
    code: asLookupText(entry?.code) || undefined,
    slug: asLookupText(entry?.slug) || undefined,
    zoneId: asLookupText(entry?.zone_id ?? entry?.zone?.id) || undefined,
    specialtyId: asLookupText(entry?.specialty_id ?? entry?.specialty?.id) || undefined,
    subSpecialties,
  };
};

const fallbackZones: LookupItem[] = ZONES.map((label) => ({ id: label, label }));
const fallbackStates: LookupItem[] = NIGERIA_STATES.map((label) => ({ id: label, label }));
const fallbackSpecialties: LookupItem[] = SPECIALTIES.map((label) => ({
  id: label,
  label,
  subSpecialties: (SPECIALTY_MAP[label] ?? []).map((sub) => ({ id: sub, label: sub })),
}));
const fallbackOrganizationTypes: LookupItem[] = [
  { id: "hmo", label: "HMO" },
  { id: "corporate", label: "Corporate" },
  { id: "other", label: "Other" },
];

const fallbackLookups: RegistrationLookups = {
  zones: fallbackZones,
  states: fallbackStates,
  specialties: fallbackSpecialties,
  subSpecialties: [],
  organizationTypes: fallbackOrganizationTypes,
  loading: true,
};

const fulfilledData = <T,>(result: PromiseSettledResult<any>, fallback: T[]) =>
  result.status === "fulfilled" ? collection<T>(result.value.data) : fallback;

const useRegistrationLookups = () => {
  const [lookups, setLookups] = useState<RegistrationLookups>(fallbackLookups);

  useEffect(() => {
    let cancelled = false;

    const loadLookups = async () => {
      const [zonesResult, statesResult, specialtiesResult, subSpecialtiesResult, organizationTypesResult] =
        await Promise.allSettled([
          api.lookups.zones(),
          api.lookups.states(),
          api.lookups.specialties({ include: "sub_specialties" }),
          api.lookups.subSpecialties(),
          api.lookups.organizationTypes(),
        ]);

      if (cancelled) return;

      const zones = fulfilledData(zonesResult, []).map((entry, index) => lookupItemFromApi(entry, `zone-${index}`));
      const states = fulfilledData(statesResult, []).map((entry, index) => lookupItemFromApi(entry, `state-${index}`));
      const subSpecialties = fulfilledData(subSpecialtiesResult, []).map((entry, index) =>
        lookupItemFromApi(entry, `sub-specialty-${index}`),
      );
      const specialties = fulfilledData(specialtiesResult, [])
        .map((entry, index) => lookupItemFromApi(entry, `specialty-${index}`))
        .map((specialty) => ({
          ...specialty,
          subSpecialties:
            specialty.subSpecialties?.length
              ? specialty.subSpecialties
              : subSpecialties.filter((subSpecialty) => subSpecialty.specialtyId === specialty.id),
        }));
      const organizationTypes = fulfilledData(organizationTypesResult, []).map((entry, index) =>
        lookupItemFromApi(entry, `organization-type-${index}`),
      );

      setLookups({
        zones: zones.length ? zones : fallbackZones,
        states: states.length ? states : fallbackStates,
        specialties: specialties.length ? specialties : fallbackSpecialties,
        subSpecialties,
        organizationTypes: organizationTypes.length ? organizationTypes : fallbackOrganizationTypes,
        loading: false,
      });
    };

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  return lookups;
};

const statesForZone = (states: LookupItem[], zoneId: string) => {
  const filtered = zoneId ? states.filter((state) => !state.zoneId || state.zoneId === zoneId) : states;
  return filtered.length ? filtered : states;
};

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
  const lookups = useRegistrationLookups();

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
            <TabsContent value="doctor"><DoctorForm lookups={lookups} /></TabsContent>
            <TabsContent value="organization"><OrganizationForm lookups={lookups} /></TabsContent>
            <TabsContent value="pharmacy"><PartnerForm lookups={lookups} kind="Pharmacy" type="pharmacy" placeholderName="e.g. HealthPlus Pharmacy" /></TabsContent>
            <TabsContent value="lab-diagnostics"><PartnerForm lookups={lookups} kind="Laboratory / Diagnostics" type="lab-diagnostics" placeholderName="e.g. SafeCare Medical Lab" /></TabsContent>
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
const ACCEPTED_EXTENSIONS = new Set(ACCEPTED.split(","));
const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const isAcceptedDocumentFile = (file: File) => {
  const lowerName = file.name.toLowerCase();
  const extension = lowerName.includes(".") ? `.${lowerName.split(".").pop()}` : "";
  return ACCEPTED_EXTENSIONS.has(extension) && (!file.type || ACCEPTED_MIME_TYPES.has(file.type));
};

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
    const wrongType = list.filter((file) => !isAcceptedDocumentFile(file));
    const tooLarge = list.filter((file) => isAcceptedDocumentFile(file) && file.size > maxBytes);
    const accepted = list.filter((file) => isAcceptedDocumentFile(file) && file.size <= maxBytes);

    if (wrongType.length > 0) {
      toast({
        title: "Unsupported file type",
        description: "Please upload only PDF, JPG, PNG or WEBP documents.",
        variant: "destructive",
      });
    }

    if (tooLarge.length > 0) {
      toast({
        title: "File too large",
        description: `${tooLarge.map((file) => file.name).join(", ")} ${tooLarge.length > 1 ? "are" : "is"} over the ${maxSizeMb}MB limit.`,
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
    .join(" - ");

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
  other: File[];
};

type DocumentProfile = "doctor" | "organization" | "pharmacy" | "lab-diagnostics";

const emptyDocs = (): DocsState => ({
  licence: [],
  govid: [],
  certs: [],
  indemnity: [],
  hospital_licence: [],
  org_proof: [],
  other: [],
});

const DocumentsSection = ({
  licenceLabel = "Medical licence",
  profile = "organization",
  onChange,
}: {
  licenceLabel?: string;
  profile?: DocumentProfile;
  onChange: (docs: DocsState) => void;
}) => {
  const [docs, setDocs] = useState<DocsState>(emptyDocs());
  const update = (patch: Partial<DocsState>) => {
    const next = { ...docs, ...patch };
    setDocs(next);
    onChange(next);
  };

  const isDoctor = profile === "doctor";
  const isPharmacy = profile === "pharmacy";
  const isLab = profile === "lab-diagnostics";

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
        {isDoctor && (
          <>
            <FileField
              id="doc-hospital-licence"
              label="Hospital License"
              hint="Upload the hospital or clinic operating licence."
              required
              minFiles={1}
              maxFiles={1}
              onChange={(f) => update({ hospital_licence: f })}
            />
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="hospital-licence-expiry">
                Hospital License Expiry Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hospital-licence-expiry"
                name="hospital_licence_expiry"
                type="date"
                required
              />
            </div>
          </>
        )}

        <FileField
          id="doc-licence"
          label={licenceLabel}
          hint="Upload a clear scan or photo of the current licence."
          required
          onChange={(f) => update({ licence: f })}
          minFiles={1}
          maxFiles={1}
        />
        <FileField
          id="doc-govid"
          label="Government ID"
          hint="National ID, driver's licence, international passport or voter's card."
          required
          onChange={(f) => update({ govid: f })}
          minFiles={1}
          maxFiles={1}
        />
        {(isDoctor || isLab) && (
          <FileField
            id="doc-org-proof"
            label="Proof of Address"
            hint="Utility bill, tenancy document, facility address proof or official letter."
            required={isDoctor}
            minFiles={isDoctor ? 1 : 0}
            maxFiles={1}
            onChange={(f) => update({ org_proof: f })}
          />
        )}
        {(isDoctor || isPharmacy || isLab) && (
          <FileField
            id="doc-indemnity"
            label="Indemnity of Organization"
            hint="Upload the organization indemnity or insurance document."
            required={isDoctor}
            minFiles={isDoctor ? 1 : 0}
            maxFiles={1}
            onChange={(f) => update({ indemnity: f })}
          />
        )}
        {isLab && (
          <FileField
            id="doc-certs"
            label="Certifications"
            hint="Upload relevant diagnostic, laboratory or accreditation certificates."
            multiple
            minFiles={0}
            maxFiles={5}
            onChange={(f) => update({ certs: f })}
          />
        )}
        {(profile === "organization" || isPharmacy) && (
          <FileField
            id="doc-certs"
            label={isPharmacy ? "Business Registration / Certifications (Optional)" : "Certifications (Optional)"}
            hint={isPharmacy ? "Business registration, PCN support documents or other pharmacy certificates." : "Accreditations, regulatory documents or supporting certificates."}
            multiple
            minFiles={0}
            maxFiles={5}
            onChange={(f) => update({ certs: f })}
          />
        )}
        <FileField
          id="doc-other"
          label="Other Documents"
          hint="Upload any other supporting documents."
          multiple
          minFiles={0}
          maxFiles={5}
          onChange={(f) => update({ other: f })}
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
  { field: "doc-org-proof", label: "Proof of Address", files: docs.org_proof },
  { field: "doc-certs", label: "Certifications", files: docs.certs },
  { field: "doc-other", label: "Other Documents", files: docs.other },
];

/* ---------- Doctor form ---------- */
const DoctorForm = ({ lookups }: { lookups: RegistrationLookups }) => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [zoneId, setZoneId] = useState<string>("");
  const [stateId, setStateId] = useState<string>("");
  const [specialty, setSpecialty] = useState<string>("");
  const [subSpecialty, setSubSpecialty] = useState<string>("");
  const [otherSpecialty, setOtherSpecialty] = useState<string>("");
  const [docs, setDocs] = useState<DocsState>(emptyDocs());
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const selectedZone = lookups.zones.find((item) => item.id === zoneId);
  const stateOptions = statesForZone(lookups.states, zoneId);
  const selectedState = stateOptions.find((item) => item.id === stateId) ?? lookups.states.find((item) => item.id === stateId);
  const selectedSpecialty = lookups.specialties.find((item) => item.id === specialty);
  const isOtherSpecialty = selectedSpecialty?.label === "Others";
  const subSpecialtyOptions =
    selectedSpecialty?.subSpecialties?.length
      ? selectedSpecialty.subSpecialties
      : selectedSpecialty
        ? (SPECIALTY_MAP[selectedSpecialty.label as keyof typeof SPECIALTY_MAP] ?? []).map((sub) => ({ id: sub, label: sub }))
        : [];
  const selectedSubSpecialty = subSpecialtyOptions.find((item) => item.id === subSpecialty);

  const handleZoneChange = (value: string) => {
    setZoneId(value);
    setStateId("");
  };

  const handleSpecialtyChange = (value: string) => {
    setSpecialty(value);
    setSubSpecialty(""); // Reset sub-specialty when specialty changes
    setOtherSpecialty("");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!docs.hospital_licence.length || !docs.licence.length || !docs.govid.length || !docs.org_proof.length || !docs.indemnity.length) {
      toast({
        title: "Documents required",
        description: "Please upload the hospital license, doctor practicing licence, government ID, proof of address and indemnity document.",
        variant: "destructive",
      });
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
        state: selectedState?.label ?? stateId,
        zone: selectedZone?.label ?? zoneId,
        specialty: selectedSpecialty?.label ?? specialty,
        details: {
          zone_id: zoneId,
          zone_name: selectedZone?.label,
          state_id: stateId,
          state_name: selectedState?.label,
          specialty_id: specialty,
          specialty: selectedSpecialty?.label,
          sub_specialty: isOtherSpecialty ? otherSpecialty : selectedSubSpecialty?.label ?? subSpecialty,
          sub_specialty_id: isOtherSpecialty ? undefined : subSpecialty,
          years_experience: get("years_experience"),
          website: get("website"),
          organization_name: get("organization_name"),
          role: get("role"),
          address: get("address"),
          services: get("services") || get("bio"),
          review_note: get("review_note"),
          notes: get("review_note"),
          bio: get("review_note"),
          hospital_licence_expiry: get("hospital_licence_expiry"),
          consent_agreed: true,
          consent_agreed_at: new Date().toISOString(),
        },
        documents: buildDocSlots(docs, "Doctor Practicing Licence"),
      });
      setSuccessOpen(true);
      formRef.current?.reset();
      setDocs(emptyDocs());
      setConsent(false);
      setZoneId("");
      setStateId("");
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
          <Label>Name of Organization</Label>
          <Input name="organization_name" required maxLength={150} placeholder="e.g. St. Mary's Hospital" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Name of Responsible Officer</Label>
          <Input name="full_name" required maxLength={100} placeholder="Dr. Jane Doe" />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input name="role" required maxLength={100} placeholder="e.g. Medical Director" />
        </div>
        <div className="space-y-2">
          <Label>Specialization</Label>
          <Select value={specialty} onValueChange={handleSpecialtyChange} required>
            <SelectTrigger><SelectValue placeholder="Select Specialty" /></SelectTrigger>
            <SelectContent>
              {lookups.specialties.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {specialty && (
          <div className="space-y-2">
            {isOtherSpecialty ? (
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
                <Select value={subSpecialty} onValueChange={setSubSpecialty} disabled={subSpecialtyOptions.length === 0}>
                  <SelectTrigger><SelectValue placeholder={subSpecialtyOptions.length ? "Select Sub-Specialty" : "No sub-specialties available"} /></SelectTrigger>
                  <SelectContent>
                    {subSpecialtyOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label>Years of Experience</Label>
          <Input name="years_experience" type="number" min={0} max={80} required placeholder="e.g. 8" />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input name="phone" type="tel" required maxLength={20} placeholder="+234..." />
        </div>
        <div className="space-y-2">
          <Label>Organization Email</Label>
          <Input name="email" type="email" required maxLength={255} placeholder="admin@hospital.com" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Address</Label>
          <Input name="address" required maxLength={200} placeholder="Street address" />
        </div>
        <div className="space-y-2">
          <Label>Zone</Label>
          <Select name="zone_id" value={zoneId} onValueChange={handleZoneChange} required>
            <SelectTrigger><SelectValue placeholder="Zone" /></SelectTrigger>
            <SelectContent>
              {lookups.zones.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select name="state_id" value={stateId} onValueChange={setStateId} required>
            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {stateOptions.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input name="city" required maxLength={60} placeholder="e.g. Ikeja" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Website</Label>
          <Input name="website" type="url" maxLength={255} placeholder="https://your-website.com" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Services Offered</Label>
          <Textarea name="services" maxLength={1000} rows={4} placeholder="Briefly describe the services rendered by your organization..." />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Review Note</Label>
          <Textarea name="review_note" maxLength={1000} rows={4} placeholder="Any note for the verification team..." />
        </div>
      </div>
      <DocumentsSection
        profile="doctor"
        licenceLabel="Doctor Practicing Licence"
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
const OrganizationForm = ({ lookups }: { lookups: RegistrationLookups }) => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [zoneId, setZoneId] = useState<string>("");
  const [stateId, setStateId] = useState<string>("");
  const [organizationTypeId, setOrganizationTypeId] = useState<string>("");
  const [docs, setDocs] = useState<DocsState>(emptyDocs());
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const selectedZone = lookups.zones.find((item) => item.id === zoneId);
  const stateOptions = statesForZone(lookups.states, zoneId);
  const selectedState = stateOptions.find((item) => item.id === stateId) ?? lookups.states.find((item) => item.id === stateId);
  const selectedOrganizationType = lookups.organizationTypes.find((item) => item.id === organizationTypeId);

  const handleZoneChange = (value: string) => {
    setZoneId(value);
    setStateId("");
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
        state: selectedState?.label ?? stateId,
        zone: selectedZone?.label ?? zoneId,
        details: {
          zone_id: zoneId,
          zone_name: selectedZone?.label,
          state_id: stateId,
          state_name: selectedState?.label,
          org_type: selectedOrganizationType?.label ?? organizationTypeId,
          organization_type_id: organizationTypeId,
          members: get("members"),
          role: get("role"),
          address: get("address"),
          notes: get("notes"),
          organization_provider: get("organization_provider"),
          consent_agreed: true,
          consent_agreed_at: new Date().toISOString(),
        },
        documents: buildDocSlots(docs, "Organization registration / operating licence"),
      });
      setSuccessOpen(true);
      formRef.current?.reset();
      setDocs(emptyDocs());
      setConsent(false);
      setZoneId("");
      setStateId("");
      setOrganizationTypeId("");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <h2 className="font-display text-2xl font-bold">HMO Registration</h2>
      
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Name of HMO</Label>
          <Input name="organization_name" required maxLength={150} placeholder="e.g. Leadway HMO" />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select name="organization_type_id" value={organizationTypeId} onValueChange={setOrganizationTypeId} required>
            <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
            <SelectContent>
              {lookups.organizationTypes.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
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
          <Label>Zone</Label>
          <Select name="zone_id" value={zoneId} onValueChange={handleZoneChange} required>
            <SelectTrigger><SelectValue placeholder="Zone" /></SelectTrigger>
            <SelectContent>
              {lookups.zones.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select name="state_id" value={stateId} onValueChange={setStateId} required>
            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {stateOptions.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
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
          <Label>Organization Provider</Label>
          <Textarea name="organization_provider" rows={4} maxLength={1000} placeholder="Provide details about the organization provider..." />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>What are you hoping DesolMed can help with?</Label>
          <Textarea name="notes" rows={5} maxLength={1000} placeholder="A few sentences are enough…" />
        </div>
      </div>
      <DocumentsSection licenceLabel="HMO Registration / Operating Licence" onChange={setDocs} />
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
        description="Thank you for registering your HMO. Our verification team will review the details, and you will receive an email once the application has been verified."
        primaryLabel="Back to home"
        primaryHref="/"
      />
    </>
  );
};

/* ---------- Generic partner form for Pharmacy / Diagnostics / Laboratory ---------- */
const PartnerForm = ({
  lookups,
  kind,
  type,
  placeholderName,
}: {
  lookups: RegistrationLookups;
  kind: string;
  type: ApplicantType;
  placeholderName: string;
}) => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [zoneId, setZoneId] = useState<string>("");
  const [stateId, setStateId] = useState<string>("");
  const [docs, setDocs] = useState<DocsState>(emptyDocs());
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const selectedZone = lookups.zones.find((item) => item.id === zoneId);
  const stateOptions = statesForZone(lookups.states, zoneId);
  const selectedState = stateOptions.find((item) => item.id === stateId) ?? lookups.states.find((item) => item.id === stateId);

  const handleZoneChange = (value: string) => {
    setZoneId(value);
    setStateId("");
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
        state: selectedState?.label ?? stateId,
        zone: selectedZone?.label ?? zoneId,
        details: {
          kind,
          zone_id: zoneId,
          zone_name: selectedZone?.label,
          state_id: stateId,
          state_name: selectedState?.label,
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
      setDocs(emptyDocs());
      setConsent(false);
      setZoneId("");
      setStateId("");
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
          <Label>Name of {kind}</Label>
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
          <Select name="zone_id" value={zoneId} onValueChange={handleZoneChange} required>
            <SelectTrigger><SelectValue placeholder="Zone" /></SelectTrigger>
            <SelectContent>
              {lookups.zones.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select name="state_id" value={stateId} onValueChange={setStateId} required>
            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {stateOptions.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
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
      <DocumentsSection
        profile={type === "lab-diagnostics" ? "lab-diagnostics" : "pharmacy"}
        licenceLabel={`${kind} Operating Licence`}
        onChange={setDocs}
      />
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
