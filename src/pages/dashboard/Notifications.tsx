import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Bell, Search, Stethoscope, Building2, Pill, FlaskConical, HeartPulse,
  CheckCircle2, XCircle, Clock, Mail, Phone, MapPin, FileText, Download, ExternalLink, Calendar, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listRegistrations, subscribeStore, updateRegistration, ensureDemoRegistrations, type LocalRegistration } from "@/lib/localStore";

type ApplicantType = "doctor" | "organization" | "pharmacy" | "lab-diagnostics" | "patient";
type Status = "pending" | "approved" | "rejected";

type DocEntry = {
  label: string;
  field: string;
  path: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
};

type Registration = {
  id: string;
  applicant_type: ApplicantType;
  status: Status;
  full_name: string | null;
  organization_name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  zone: string | null;
  specialty: string | null;
  details: Record<string, unknown>;
  documents: DocEntry[];
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type TabKey = "all" | "pending" | ApplicantType;

const TYPE_META: Record<ApplicantType, { label: string; icon: any; tone: string }> = {
  doctor: { label: "Doctor", icon: Stethoscope, tone: "bg-primary-soft text-primary" },
  organization: { label: "HMO / Organization", icon: Building2, tone: "bg-accent text-accent-foreground" },
  pharmacy: { label: "Pharmacy", icon: Pill, tone: "bg-secondary text-secondary-foreground" },
  "lab-diagnostics": { label: "Laboratory / Diagnostics", icon: FlaskConical, tone: "bg-accent text-accent-foreground" },
  patient: { label: "Patient", icon: HeartPulse, tone: "bg-primary-soft text-primary" },
};

const STATUS_META: Record<Status, { label: string; tone: string; icon: any }> = {
  pending: { label: "Pending", tone: "bg-warning/15 text-warning border border-warning/30", icon: Clock },
  approved: { label: "Approved", tone: "bg-success/15 text-success border border-success/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", tone: "bg-destructive/15 text-destructive border border-destructive/30", icon: XCircle },
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "doctor", label: "Doctors" },
  { key: "organization", label: "HMO / Org" },
  { key: "pharmacy", label: "Pharmacy" },
  { key: "lab-diagnostics", label: "Lab / Diagnostics" },
  { key: "patient", label: "Patients" },
];

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

const NotificationsPageInner = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Registration | null>(null);
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    setItems(listRegistrations() as LocalRegistration[]);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = subscribeStore(() => {
      load();
    });
    return unsubscribe;
  }, []);

  // Ensure demo registrations exist so the list shows entries by default
  useEffect(() => {
    ensureDemoRegistrations();
  }, []);

  // Generate signed URLs whenever a registration is opened
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!active || !active.documents?.length) {
        setDocUrls({});
        return;
      }
      const next: Record<string, string> = {};
      for (const doc of active.documents) {
        next[doc.path] = doc.dataUrl;
      }
      if (!cancelled) setDocUrls(next);
    };
    setReviewerNotes(active?.reviewer_notes ?? "");
    run();
    return () => { cancelled = true; };
  }, [active]);

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: items.length,
      pending: 0,
      doctor: 0, organization: 0, pharmacy: 0, "lab-diagnostics": 0, patient: 0,
    };
    items.forEach((r) => {
      if (r.status === "pending") c.pending++;
      c[r.applicant_type]++;
    });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (tab === "pending") list = items.filter((r) => r.status === "pending");
    else if (tab !== "all") list = items.filter((r) => r.applicant_type === tab);
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((r) =>
      [r.full_name, r.organization_name, r.email, r.phone, r.city, r.state, r.specialty]
        .some((v) => v?.toLowerCase().includes(needle))
    );
  }, [items, tab, q]);

  const decide = async (next: Status) => {
    if (!active) return;
    setBusy(true);
    await updateRegistration(active.id, {
      status: next,
      reviewer_notes: reviewerNotes || null,
      reviewed_at: new Date().toISOString(),
    });
    setBusy(false);
    toast({
      title: next === "approved" ? "Application approved" : "Application rejected",
      description: `${active.full_name || active.organization_name || active.email}`,
    });
    setActive(null);
  };

  const displayName = (r: Registration) =>
    r.organization_name || r.full_name || r.email;

  return (
    <DashboardLayout>
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-secondary" /> Notifications
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Review every new registration submitted from the website.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, city…" className="pl-9" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-5 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1">{counts.all}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1 text-warning">{counts.pending}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Stethoscope className="h-3 w-3" /> Doctors</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1">{counts.doctor}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><HeartPulse className="h-3 w-3" /> Patients</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1">{counts.patient}</p>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mt-5 sm:mt-6">
        <div className="-mx-4 sm:mx-0 overflow-x-auto scrollbar-none">
          <TabsList className="inline-flex w-max sm:w-full sm:flex-wrap h-auto px-4 sm:px-1">
            {TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key} className="gap-1.5 whitespace-nowrap text-xs sm:text-sm">
                {t.label}
                <span className="text-[10px] sm:text-xs text-muted-foreground">({counts[t.key]})</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS.map((t) => (
          <TabsContent key={t.key} value={t.key} className="mt-4">
            <Card className="overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {q ? "No registrations match your search." : "No registrations yet."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map((r) => {
                    const meta = TYPE_META[r.applicant_type];
                    const Status = STATUS_META[r.status];
                    const StatusIcon = Status.icon;
                    const TypeIcon = meta.icon;
                    return (
                      <li key={r.id} className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4 hover:bg-muted/30 transition-colors">
                        <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.tone}`}>
                          <TypeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium text-sm sm:text-base truncate max-w-full">{displayName(r)}</p>
                            <Badge variant="secondary" className={`${meta.tone} text-[10px] sm:text-xs`}>{meta.label}</Badge>
                            <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${Status.tone}`}>
                              <StatusIcon className="h-3 w-3" /> {Status.label}
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1 max-w-full truncate"><Mail className="h-3 w-3 flex-shrink-0" /><span className="truncate">{r.email}</span></span>
                            {r.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>}
                            {(r.city || r.state) && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />{[r.city, r.state].filter(Boolean).join(", ")}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{r.documents?.length ?? 0} docs</span>
                            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(r.created_at)}</span>
                          </div>
                          <div className="mt-3 sm:hidden">
                            <Button size="sm" variant="outline" className="w-full" onClick={() => setActive(r)}>
                              View application <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="hidden sm:block ml-auto flex-shrink-0">
                          <Button size="sm" variant="outline" onClick={() => setActive(r)}>
                            View application <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl w-[calc(100vw-1.5rem)] sm:w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          {active && (() => {
            const meta = TYPE_META[active.applicant_type];
            const Status = STATUS_META[active.status];
            const StatusIcon = Status.icon;
            const TypeIcon = meta.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 flex-wrap text-base sm:text-lg">
                    <TypeIcon className="h-5 w-5 text-secondary flex-shrink-0" />
                    <span className="truncate">{displayName(active)}</span>
                    <Badge variant="secondary" className={`${meta.tone} text-[10px] sm:text-xs`}>{meta.label}</Badge>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${Status.tone}`}>
                      <StatusIcon className="h-3 w-3" /> {Status.label}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    Submitted {fmtDate(active.created_at)}
                    {active.reviewed_at && ` · Reviewed ${fmtDate(active.reviewed_at)}`}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-2">
                  {/* Contact / location */}
                  <section>
                    <h4 className="font-display font-semibold text-sm mb-3">Contact</h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <Field label="Email" value={active.email} />
                      <Field label="Phone" value={active.phone} />
                      <Field label="Full name" value={active.full_name} />
                      <Field label="Organization" value={active.organization_name} />
                      <Field label="City" value={active.city} />
                      <Field label="State" value={active.state} />
                      {active.zone && <Field label="Zone" value={active.zone} />}
                      {active.specialty && <Field label="Specialty" value={active.specialty} />}
                    </div>
                  </section>

                  {/* Form details */}
                  {active.details && Object.keys(active.details).length > 0 && (
                    <section>
                      <h4 className="font-display font-semibold text-sm mb-3">Application details</h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        {Object.entries(active.details).map(([k, v]) => (
                          <Field key={k} label={prettyKey(k)} value={String(v ?? "") || "—"} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Documents */}
                  <section>
                    <h4 className="font-display font-semibold text-sm mb-3">
                      Verification documents ({active.documents?.length ?? 0})
                    </h4>
                    {(!active.documents || active.documents.length === 0) ? (
                      <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                    ) : (
                      <ul className="space-y-2">
                        {active.documents.map((doc) => {
                          const url = docUrls[doc.path];
                          const isImage = doc.type?.startsWith("image/");
                          const isPdf = doc.type === "application/pdf";
                          return (
                            <li key={doc.path} className="rounded-lg border border-border p-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <FileText className="h-4 w-4 text-secondary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{doc.label}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {doc.name} · {(doc.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                {url && (
                                  <>
                                    <Button asChild size="sm" variant="outline">
                                      <a href={url} target="_blank" rel="noreferrer">
                                        <ExternalLink className="h-3.5 w-3.5" /> Open
                                      </a>
                                    </Button>
                                    <Button asChild size="sm" variant="ghost">
                                      <a href={url} download={doc.name}>
                                        <Download className="h-3.5 w-3.5" /> Download
                                      </a>
                                    </Button>
                                  </>
                                )}
                              </div>
                              {url && isImage && (
                                <img src={url} alt={doc.label} className="mt-3 max-h-72 w-auto rounded-md border border-border" />
                              )}
                              {url && isPdf && (
                                <iframe src={url} title={doc.label} className="mt-3 w-full h-72 rounded-md border border-border" />
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>

                  {/* Reviewer notes */}
                  <section>
                    <h4 className="font-display font-semibold text-sm mb-2">Reviewer notes</h4>
                    <Textarea
                      rows={3}
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      placeholder="Optional internal notes about this decision…"
                    />
                  </section>
                </div>

                <DialogFooter className="gap-2 flex-col-reverse sm:flex-row sm:flex-wrap">
                  <Button variant="ghost" onClick={() => setActive(null)} disabled={busy} className="w-full sm:w-auto">Close</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto"
                        disabled={busy || active.status === "rejected"}
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject this application?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject this application? The applicant will be notified of this decision.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => decide("rejected")}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="hero"
                        disabled={busy || active.status === "approved"}
                        className="w-full sm:w-auto"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve this application?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve this application? The applicant will be granted access.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No</AlertDialogCancel>
                        <AlertDialogAction onClick={() => decide("approved")}>
                          Yes, approve
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm mt-0.5">{value || "—"}</p>
  </div>
);

const prettyKey = (k: string) =>
  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default NotificationsPageInner;
