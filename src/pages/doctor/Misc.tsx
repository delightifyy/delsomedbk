import { useEffect, useMemo, useState } from "react";
import { Activity, Download, FileText, FlaskConical, Loader2, Pill, Save, Search, Send, Settings, Upload, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  doctorPortalApi,
  formatNGN,
  normalizeAppointment,
  type DoctorPortalAppointment,
  type DoctorPortalPatient,
  type DoctorPortalSettings,
} from "@/lib/doctorPortalApi";
import { doctorNav } from "./nav";

type AnyRecord = Record<string, any>;

const asRecord = (value: unknown): AnyRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? value as AnyRecord : {};

const textFrom = (record: AnyRecord, keys: string[], fallback = "N/A") => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return fallback;
};

const numberFrom = (record: AnyRecord, keys: string[], fallback = 0) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
};

const dateFrom = (value?: string) => {
  if (!value || value === "N/A") return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toDateString();
};

const listFrom = (value: unknown): AnyRecord[] => {
  if (Array.isArray(value)) return value.map(asRecord);
  const record = asRecord(value);
  if (Array.isArray(record.data)) return record.data.map(asRecord);
  if (Array.isArray(record.items)) return record.items.map(asRecord);
  return [];
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const StatusBadge = ({ status }: { status?: string }) => (
  <Badge variant="outline" className="capitalize">
    {(status || "pending").replace(/_/g, " ")}
  </Badge>
);

const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
  <div className="flex justify-between gap-4 border-b border-border/40 py-2 text-sm last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium">{value || "N/A"}</span>
  </div>
);

export const DoctorClinical = () => {
  const [appointments, setAppointments] = useState<DoctorPortalAppointment[]>([]);
  const [selected, setSelected] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClinicalNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorPortalApi.appointments({ status: "completed", per_page: 50 });
      setAppointments(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load clinical notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinicalNotes();
  }, []);

  const openConsultation = async (appointment: DoctorPortalAppointment) => {
    setSelected(appointment.raw);
    if (!appointment.consultationUuid) return;
    setDetailLoading(true);
    try {
      const response = await api.doctorPortal.consultations.detail(appointment.consultationUuid);
      setSelected(asRecord(response.data ?? response));
    } catch {
      setSelected(appointment.raw);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title="Clinical Notes"
        description="Completed consultations and saved clinical notes."
      />

      <SectionCard>
        {loading ? (
          <div className="grid min-h-[260px] place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={FileText} title="Could not load clinical notes" description={error} action={<Button onClick={loadClinicalNotes}>Try again</Button>} />
        ) : appointments.length === 0 ? (
          <EmptyState icon={FileText} title="No completed consultations" description="Completed consultations from the API will appear here." />
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.patientName}</TableCell>
                  <TableCell>{dateFrom(appointment.date)}</TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell><StatusBadge status={appointment.status} /></TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => openConsultation(appointment)}>
                      <FileText className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clinical Note Details</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="grid min-h-[180px] place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : selected ? (
            <div className="space-y-4">
              <DetailRow label="Type" value={textFrom(selected, ["type", "notes_mode"])} />
              <DetailRow label="Diagnosis" value={textFrom(selected, ["diagnosis"])} />
              <DetailRow label="Presenting complaint" value={textFrom(selected, ["presenting_complaint", "reason_for_visit"])} />
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinical notes</p>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm whitespace-pre-wrap">
                  {textFrom(selected, ["clinical_notes", "summary", "treatment", "notes"], "No notes available.")}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export const DoctorPrescriptions = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<DoctorPortalPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorPortalApi.patients({ per_page: 50 });
      const detailed = await Promise.all(
        response.items.slice(0, 20).map(async (patient) => {
          try {
            return await doctorPortalApi.patientDetail(patient.uuid);
          } catch {
            return patient;
          }
        }),
      );
      setPatients(detailed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const prescriptions = patients.flatMap((patient) =>
    patient.prescriptions.map((prescription) => ({ patient, prescription })),
  );

  const downloadPrescription = async (prescription: AnyRecord) => {
    const uuid = textFrom(prescription, ["uuid", "prescription_doc_uuid", "id"], "");
    if (!uuid) {
      toast({ title: "PDF unavailable", description: "This prescription does not include a document ID.", variant: "destructive" });
      return;
    }
    try {
      const file = await api.doctorPortal.requisitions.prescriptionPdf(uuid);
      downloadBlob(file.blob, file.filename ?? `prescription-${uuid}.pdf`);
    } catch (err) {
      toast({ title: "Download failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    }
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title="Prescriptions"
        description="Prescription documents found in your patient records."
      />
      <SectionCard>
        {loading ? (
          <div className="grid min-h-[260px] place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={Pill} title="Could not load prescriptions" description={error} action={<Button onClick={loadPrescriptions}>Try again</Button>} />
        ) : prescriptions.length === 0 ? (
          <EmptyState icon={Pill} title="No prescriptions found" description="Create prescriptions from a consultation room." />
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map(({ patient, prescription }, index) => (
                <TableRow key={`${patient.uuid}-${textFrom(prescription, ["uuid", "id"], String(index))}`}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{textFrom(prescription, ["drug_name", "medication", "name", "title"])}</TableCell>
                  <TableCell>{dateFrom(textFrom(prescription, ["prescribed_on", "date", "created_at"], ""))}</TableCell>
                  <TableCell><StatusBadge status={textFrom(prescription, ["status"], "active")} /></TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => downloadPrescription(prescription)}>
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </PortalLayout>
  );
};

export const DoctorInvestigations = () => {
  const { toast } = useToast();
  const [kind, setKind] = useState("lab");
  const [status, setStatus] = useState("requested");
  const [investigations, setInvestigations] = useState<AnyRecord[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvestigations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.doctorPortal.investigations.list({
        kind,
        status: status === "all" ? undefined : status,
      });
      setInvestigations(listFrom(response.data ?? response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load investigations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestigations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, status]);

  const openInvestigation = async (investigation: AnyRecord) => {
    setSelectedInvestigation(investigation);
    const uuid = textFrom(investigation, ["uuid", "lab_uuid", "imaging_uuid", "id"], "");
    if (!uuid) return;
    setDetailLoading(true);
    try {
      const detail = kind === "lab"
        ? await api.doctorPortal.investigations.lab(uuid)
        : await api.doctorPortal.investigations.imaging(uuid);
      setSelectedInvestigation(asRecord(detail.data ?? detail));
    } catch {
      setSelectedInvestigation(investigation);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (nextStatus: string) => {
    if (!selectedInvestigation) return;
    const uuid = textFrom(selectedInvestigation, ["uuid", "lab_uuid", "imaging_uuid", "id"], "");
    if (!uuid) return;
    setActionBusy(true);
    try {
      if (kind === "lab") await api.doctorPortal.investigations.updateLabStatus(uuid, nextStatus);
      else await api.doctorPortal.investigations.updateImagingStatus(uuid, nextStatus);
      toast({ title: "Investigation updated", description: `Status changed to ${nextStatus}.` });
      await loadInvestigations();
      setSelectedInvestigation(null);
    } catch (err) {
      toast({ title: "Update failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setActionBusy(false);
    }
  };

  const downloadPdf = async () => {
    if (!selectedInvestigation) return;
    const uuid = textFrom(selectedInvestigation, ["uuid", "lab_uuid", "imaging_uuid", "id"], "");
    if (!uuid) return;
    try {
      const file = kind === "lab"
        ? await api.doctorPortal.requisitions.labPdf(uuid)
        : await api.doctorPortal.requisitions.diagnosticPdf(uuid);
      downloadBlob(file.blob, file.filename ?? `${kind}-investigation-${uuid}.pdf`);
    } catch (err) {
      toast({ title: "Download failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    }
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title="Investigations"
        description="Lab requisitions and diagnostic imaging requests."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="h-9 w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lab">Lab</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <SectionCard>
        {loading ? (
          <div className="grid min-h-[260px] place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={FlaskConical} title="Could not load investigations" description={error} action={<Button onClick={loadInvestigations}>Try again</Button>} />
        ) : investigations.length === 0 ? (
          <EmptyState icon={FlaskConical} title="No investigations found" description="Requests created in consultation rooms will appear here." />
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>{kind === "lab" ? "Laboratory" : "Diagnostic centre"}</TableHead>
                <TableHead>Request</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investigations.map((investigation, index) => (
                <TableRow key={textFrom(investigation, ["uuid", "id"], String(index))}>
                  <TableCell>
                    <div className="font-medium">{textFrom(investigation, ["patient_name", "patient"])}</div>
                    <div className="text-xs text-muted-foreground">{textFrom(investigation, ["patient_uuid", "patient_user_uuid"], "")}</div>
                  </TableCell>
                  <TableCell>{textFrom(investigation, ["laboratory_name", "diagnostic_lab_name", "facility_name", "lab_name"])}</TableCell>
                  <TableCell>{textFrom(investigation, ["test_name", "procedure_name", "title", "request_type"])}</TableCell>
                  <TableCell>{dateFrom(textFrom(investigation, ["requested_on", "date", "created_at"], ""))}</TableCell>
                  <TableCell><StatusBadge status={textFrom(investigation, ["status"], "requested")} /></TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => openInvestigation(investigation)}>
                      <FlaskConical className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog open={!!selectedInvestigation} onOpenChange={(open) => !open && setSelectedInvestigation(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Investigation Details</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="grid min-h-[180px] place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : selectedInvestigation ? (
            <div className="space-y-4">
              <DetailRow label="Patient" value={textFrom(selectedInvestigation, ["patient_name", "patient"])} />
              <DetailRow label="Facility" value={textFrom(selectedInvestigation, ["laboratory_name", "diagnostic_lab_name", "facility_name", "lab_name"])} />
              <DetailRow label="Request" value={textFrom(selectedInvestigation, ["test_name", "procedure_name", "title", "request_type"])} />
              <DetailRow label="Status" value={textFrom(selectedInvestigation, ["status"], "requested")} />
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinical notes</p>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm">
                  {textFrom(selectedInvestigation, ["clinical_notes", "notes", "instructions"], "No notes available.")}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={downloadPdf}>
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button variant="outline" disabled={actionBusy} onClick={() => updateStatus("completed")}>
                  {actionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Mark completed
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export const DoctorReferrals = () => {
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorPortalApi.payments.referrals({ per_page: 50 });
      setReferrals(response.items.map((item) => item.raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load referrals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const downloadReferral = async (referral: AnyRecord) => {
    const uuid = textFrom(referral, ["referral_uuid", "uuid", "id"], "");
    if (!uuid) {
      toast({ title: "PDF unavailable", description: "This referral does not include a referral ID.", variant: "destructive" });
      return;
    }
    try {
      const file = await api.doctorPortal.requisitions.referralPdf(uuid);
      downloadBlob(file.blob, file.filename ?? `referral-${uuid}.pdf`);
    } catch (err) {
      toast({ title: "Download failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    }
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title="Referrals"
        description="Referral activity and referral PDF access."
      />
      <SectionCard>
        {loading ? (
          <div className="grid min-h-[260px] place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState icon={Send} title="Could not load referrals" description={error} action={<Button onClick={loadReferrals}>Try again</Button>} />
        ) : referrals.length === 0 ? (
          <EmptyState icon={Send} title="No referrals found" description="Create referrals from a consultation room." />
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Referred to</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead className="text-center">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral, index) => (
                <TableRow key={textFrom(referral, ["uuid", "id"], String(index))}>
                  <TableCell>{textFrom(referral, ["patient_name", "patient"])}</TableCell>
                  <TableCell>{textFrom(referral, ["specialist_name", "doctor_name", "referred_doctor_name", "facility_name"])}</TableCell>
                  <TableCell>{dateFrom(textFrom(referral, ["referred_on", "date", "created_at"], ""))}</TableCell>
                  <TableCell>{formatNGN(numberFrom(referral, ["commission", "amount"], numberFrom(referral, ["commission_kobo", "amount_kobo"]) / 100))}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => downloadReferral(referral)}>
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </PortalLayout>
  );
};

const emptySettings: DoctorPortalSettings = {
  fullName: "",
  title: "",
  specialty: "",
  license: "",
  yearsExperience: "",
  hospital: "",
  email: "",
  phone: "",
  address: "",
  bio: "",
  languages: "",
  consultationFee: "",
  preferences: {
    emailNotif: true,
    smsNotif: false,
    autoAccept: false,
  },
  raw: {},
};

export const DoctorSettings = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorPortalApi.settings();
      setProfile(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const update = (key: keyof Omit<DoctorPortalSettings, "preferences" | "raw">, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const updatePreference = (key: keyof DoctorPortalSettings["preferences"], value: boolean) => {
    setProfile((current) => ({
      ...current,
      preferences: { ...current.preferences, [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorPortalApi.updateSettings(profile, profile.preferences);
      toast({ title: "Profile updated", description: "Your doctor settings have been saved." });
      await loadSettings();
    } catch (err) {
      toast({ title: "Could not save settings", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const uploadSignature = async (file?: File | null) => {
    if (!file) return;
    const form = new FormData();
    form.append("signature", file);
    setSignatureUploading(true);
    try {
      await api.doctorPortal.settings.uploadSignature(form);
      toast({ title: "Signature uploaded", description: "Your signature has been saved." });
      await loadSettings();
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setSignatureUploading(false);
    }
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title="Settings"
        description="Manage your doctor profile, credentials, signature, and preferences."
      />

      {loading ? (
        <div className="grid min-h-[320px] place-items-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <EmptyState icon={Settings} title="Could not load settings" description={error} action={<Button onClick={loadSettings}>Try again</Button>} />
      ) : (
        <>
          <SectionCard title="Doctor Profile" description="Personal information shown to patients and staff.">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                {(profile.fullName || profile.email || "DR").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold">{profile.fullName || "Doctor"}</p>
                <p className="text-sm text-muted-foreground">{profile.title || "Medical Practitioner"}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {profile.specialty && <Badge variant="secondary">{profile.specialty}</Badge>}
                  {profile.yearsExperience && <Badge variant="outline">{profile.yearsExperience} yrs exp</Badge>}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name"><Input value={profile.fullName} onChange={(event) => update("fullName", event.target.value)} /></Field>
              <Field label="Title"><Input value={profile.title} onChange={(event) => update("title", event.target.value)} /></Field>
              <Field label="Specialty"><Input value={profile.specialty} onChange={(event) => update("specialty", event.target.value)} /></Field>
              <Field label="Medical License No."><Input value={profile.license} onChange={(event) => update("license", event.target.value)} /></Field>
              <Field label="Years of Experience"><Input type="number" value={profile.yearsExperience} onChange={(event) => update("yearsExperience", event.target.value)} /></Field>
              <Field label="Hospital / Clinic"><Input value={profile.hospital} onChange={(event) => update("hospital", event.target.value)} /></Field>
              <Field label="Consultation Fee"><Input type="number" value={profile.consultationFee} onChange={(event) => update("consultationFee", event.target.value)} /></Field>
              <Field label="Languages"><Input value={profile.languages} onChange={(event) => update("languages", event.target.value)} /></Field>
            </div>
          </SectionCard>

          <SectionCard title="Contact Information" description="How patients and the clinic can reach you.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email"><Input type="email" value={profile.email} onChange={(event) => update("email", event.target.value)} /></Field>
              <Field label="Phone"><Input value={profile.phone} onChange={(event) => update("phone", event.target.value)} /></Field>
              <Field label="Address" className="md:col-span-2"><Input value={profile.address} onChange={(event) => update("address", event.target.value)} /></Field>
              <Field label="Professional Bio" className="md:col-span-2">
                <Textarea rows={4} value={profile.bio} onChange={(event) => update("bio", event.target.value)} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Signature" description="Upload the signature used on requisitions and referrals.">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                className="max-w-sm"
                disabled={signatureUploading}
                onChange={(event) => uploadSignature(event.target.files?.[0])}
              />
              {signatureUploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          </SectionCard>

          <SectionCard title="Preferences" description="Notification and consultation preferences.">
            <div className="grid gap-3">
              <Preference label="Email notifications for new appointments" checked={profile.preferences.emailNotif} onChange={(value) => updatePreference("emailNotif", value)} />
              <Preference label="SMS notifications for urgent updates" checked={profile.preferences.smsNotif} onChange={(value) => updatePreference("smsNotif", value)} />
              <Preference label="Auto-accept appointments from existing patients" checked={profile.preferences.autoAccept} onChange={(value) => updatePreference("autoAccept", value)} />
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </SectionCard>
        </>
      )}
    </PortalLayout>
  );
};

const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={`grid gap-2 ${className}`}>
    <label className="text-sm font-medium">{label}</label>
    {children}
  </div>
);

const Preference = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) => (
  <label className="flex items-center justify-between rounded-lg border p-3">
    <span className="text-sm">{label}</span>
    <input type="checkbox" className="h-4 w-4" checked={checked} onChange={(event) => onChange(event.target.checked)} />
  </label>
);
