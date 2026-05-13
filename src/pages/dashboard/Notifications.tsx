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
import type { LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { collection, lookupOptionFromApi, registrationFromApi } from "@/lib/backendAdapters";

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

const TYPE_META: Record<ApplicantType, { label: string; icon: LucideIcon; tone: string }> = {
  doctor: { label: "Doctor", icon: Stethoscope, tone: "bg-primary-soft text-primary" },
  organization: { label: "HMO / Organization", icon: Building2, tone: "bg-accent text-accent-foreground" },
  pharmacy: { label: "Pharmacy", icon: Pill, tone: "bg-secondary text-secondary-foreground" },
  "lab-diagnostics": { label: "Laboratory / Diagnostics", icon: FlaskConical, tone: "bg-accent text-accent-foreground" },
  patient: { label: "Patient", icon: HeartPulse, tone: "bg-primary-soft text-primary" },
};

const STATUS_META: Record<Status, { label: string; tone: string; icon: LucideIcon }> = {
  pending: { label: "Pending", tone: "bg-warning/15 text-warning border border-warning/30", icon: Clock },
  approved: { label: "Approved", tone: "bg-success/15 text-success border border-success/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", tone: "bg-destructive/15 text-destructive border border-destructive/30", icon: XCircle },
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "doctor", label: "Doctors" },
  { key: "organization", label: "HMO / Org" },
  { key: "pharmacy", label: "Pharmacy" },
  { key: "lab-diagnostics", label: "Lab / Diagnostics" },
  { key: "patient", label: "Patients" },
];

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "-";

type DetailRow = { key: string; value: string };

type LookupBucket = Record<string, string>;

type LookupLabels = {
  zones: LookupBucket;
  states: LookupBucket;
  cities: LookupBucket;
  specialties: LookupBucket;
  subSpecialties: LookupBucket;
  organizationTypes: LookupBucket;
  services: LookupBucket;
  postCategories: LookupBucket;
};

const emptyLookupLabels = (): LookupLabels => ({
  zones: {},
  states: {},
  cities: {},
  specialties: {},
  subSpecialties: {},
  organizationTypes: {},
  services: {},
  postCategories: {},
});

const idText = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value).trim();
};

const addLookup = (bucket: LookupBucket, item: unknown) => {
  const record = item && typeof item === "object" && !Array.isArray(item) ? item as Record<string, unknown> : {};
  const option = lookupOptionFromApi(item);
  const label = option.label;
  [
    option.id,
    option.slug,
    option.code,
    record.id,
    record.uuid,
    record.slug,
    record.code,
    record.name,
  ].forEach((value) => {
    const key = idText(value);
    if (key) bucket[key] = label;
  });
};

const lookupBucketForKey = (key: string, lookups: LookupLabels) => {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  if (normalized.includes("sub_specialty")) return lookups.subSpecialties;
  if (normalized.includes("specialty")) return lookups.specialties;
  if (normalized.includes("organization_type")) return lookups.organizationTypes;
  if (normalized.includes("state")) return lookups.states;
  if (normalized.includes("city")) return lookups.cities;
  if (normalized.includes("zone")) return lookups.zones;
  if (normalized.includes("service")) return lookups.services;
  if (normalized.includes("category")) return lookups.postCategories;
  return null;
};

const lookupLabel = (key: string, value: unknown, lookups: LookupLabels): string => {
  const bucket = lookupBucketForKey(key, lookups);
  if (!bucket) return "";

  if (Array.isArray(value)) {
    return value.map((item) => lookupLabel(key, item, lookups) || idText(item)).filter(Boolean).join(", ");
  }

  const raw = idText(value);
  return raw ? bucket[raw] || "" : "";
};

const displayValue = (key: string, value: unknown, lookups: LookupLabels): string => {
  const resolved = lookupLabel(key, value, lookups);
  if (resolved) return resolved;

  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value.trim() || "-";
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (Array.isArray(value)) return value.map((item) => displayValue(key, item, lookups)).filter(Boolean).join(", ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[Unserializable value]";
    }
  }
  return String(value);
};

const isHiddenDetailKey = (key: string) => {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  if (normalized.startsWith("backend_")) return true;
  return [
    "is_specialist",
    "ip",
    "ip_address",
    "user_agent",
    "reviewer",
    "review_logs",
  ].includes(normalized);
};

const flattenDetails = (input: unknown, lookups: LookupLabels, prefix = ""): DetailRow[] => {
  if (input === null || input === undefined) return [];

  if (Array.isArray(input)) {
    if (input.every((item) => !item || typeof item !== "object")) {
      return [{ key: prefix || "Value", value: displayValue(prefix, input, lookups) }];
    }

    return input.flatMap((item, index) => {
      const key = `${prefix} ${index + 1}`.trim();
      if (item && typeof item === "object") return flattenDetails(item, lookups, key);
      return [{ key, value: displayValue(key, item, lookups) }];
    });
  }

  if (typeof input === "object") {
    return Object.entries(input as Record<string, unknown>).flatMap(([k, v]) => {
      if (isHiddenDetailKey(k)) return [];
      const nextKey = prefix ? `${prefix} ${prettyKey(k)}` : prettyKey(k);
      if (Array.isArray(v) && v.every((item) => !item || typeof item !== "object")) {
        return [{ key: nextKey, value: displayValue(k, v, lookups) }];
      }
      if (v && typeof v === "object") return flattenDetails(v, lookups, nextKey);
      return [{ key: nextKey, value: displayValue(k, v, lookups) }];
    });
  }

  return [{ key: prefix || "Value", value: displayValue(prefix, input, lookups) }];
};

const NotificationsPageInner = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Registration | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lookupLabels, setLookupLabels] = useState<LookupLabels>(() => emptyLookupLabels());
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});
  const [docLoading, setDocLoading] = useState<Record<string, boolean>>({});
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadLookups = async () => {
      const next = emptyLookupLabels();
      const requests = [
        { key: "zones" as const, request: api.lookups.zones() },
        { key: "states" as const, request: api.lookups.states() },
        { key: "cities" as const, request: api.lookups.cities() },
        { key: "specialties" as const, request: api.lookups.specialties() },
        { key: "subSpecialties" as const, request: api.lookups.subSpecialties() },
        { key: "organizationTypes" as const, request: api.lookups.organizationTypes() },
        { key: "services" as const, request: api.lookups.services() },
        { key: "postCategories" as const, request: api.lookups.postCategories() },
      ];

      const results = await Promise.allSettled(requests.map((entry) => entry.request));
      results.forEach((result, index) => {
        if (result.status !== "fulfilled") return;
        const bucket = next[requests[index].key];
        collection(result.value.data).forEach((item) => addLookup(bucket, item));
      });

      if (!cancelled) setLookupLabels(next);
    };

    loadLookups();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadBackend = async () => {
      setLoading(true);
      try {
        const response = await api.admin.applications.list({ page: 1 });
        const mapped = collection(response.data).map(registrationFromApi);
        if (!cancelled) {
          setItems(mapped);
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch protected documents with the admin token, then expose browser-safe object URLs.
  useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];

    const run = async () => {
      setReviewerNotes(active?.reviewer_notes ?? "");
      if (!active || !active.documents?.length) {
        setDocUrls({});
        setDocLoading({});
        setDocErrors({});
        return;
      }

      setDocUrls({});
      setDocErrors({});
      setDocLoading(Object.fromEntries(active.documents.map((doc) => [doc.path, true])));

      const next: Record<string, string> = {};
      const errors: Record<string, string> = {};

      await Promise.all(active.documents.map(async (doc) => {
        const [, documentId] = doc.path.split(":");
        if (!documentId && doc.dataUrl) {
          next[doc.path] = doc.dataUrl;
          return;
        }

        try {
          const file = await api.admin.applications.downloadDocument(active.id, documentId || doc.field);
          const contentType =
            doc.type && doc.type !== "application/octet-stream"
              ? doc.type
              : file.contentType || "application/octet-stream";
          const blob = file.blob.type === contentType ? file.blob : new Blob([file.blob], { type: contentType });
          const objectUrl = URL.createObjectURL(blob);

          if (cancelled) {
            URL.revokeObjectURL(objectUrl);
            return;
          }

          objectUrls.push(objectUrl);
          next[doc.path] = objectUrl;
        } catch (error) {
          if (doc.dataUrl) {
            next[doc.path] = doc.dataUrl;
          }
          errors[doc.path] = error instanceof Error ? error.message : "Could not prepare this document.";
        }
      }));

      if (!cancelled) {
        setDocUrls(next);
        setDocErrors(errors);
        setDocLoading({});
      }
    };

    run();
    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [active]);

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: items.length,
      pending: 0,
      doctor: 0, organization: 0, pharmacy: 0, "lab-diagnostics": 0, patient: 0,
    };
    items.forEach((r) => {
      c[r.applicant_type]++;
      if (r.status === "pending") c.pending++;
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
    try {
      if (next === "approved") await api.admin.applications.approve(active.id, reviewerNotes || undefined);
      else await api.admin.applications.reject(active.id, reviewerNotes || "Application rejected by admin.");
      setItems((prev) =>
        prev.map((item) =>
          item.id === active.id
            ? { ...item, status: next, reviewer_notes: reviewerNotes || null, reviewed_at: new Date().toISOString() }
            : item
        )
      );
      toast({
        title: next === "approved" ? "Application approved" : "Application rejected",
        description: `${active.full_name || active.organization_name || active.email}`,
      });
      setActive(null);
      setDetailLoading(false);
    } catch (error) {
      toast({
        title: "Decision failed",
        description: error instanceof Error ? error.message : "Could not update the application.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const mergeRegistration = (summary: Registration, detail: Registration): Registration => ({
    ...summary,
    ...detail,
    full_name: detail.full_name || summary.full_name,
    organization_name: detail.organization_name || summary.organization_name,
    email: detail.email || summary.email,
    phone: detail.phone || summary.phone,
    city: detail.city || summary.city,
    state: detail.state || summary.state,
    zone: detail.zone || summary.zone,
    specialty: detail.specialty || summary.specialty,
    details: Object.keys(detail.details ?? {}).length ? detail.details : summary.details,
    documents: detail.documents?.length ? detail.documents : summary.documents,
    reviewer_notes: detail.reviewer_notes || summary.reviewer_notes,
    reviewed_at: detail.reviewed_at || summary.reviewed_at,
    created_at: detail.created_at || summary.created_at,
  });

  const openApplication = async (registration: Registration) => {
    setActive(registration);
    setDetailLoading(true);
    try {
      const response = await api.admin.applications.detail(registration.id);
      const mapped = mergeRegistration(registration, registrationFromApi(response.data) as Registration);
      setActive(mapped);
      setItems((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
    } catch (error) {
      toast({
        title: "Could not load full application",
        description: error instanceof Error ? error.message : "Showing the summary information we already have.",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const displayName = (r: Registration) =>
    r.full_name || r.organization_name || r.email;

  return (
    <DashboardLayout>
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-secondary" /> New Registrations
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Review every professional registration submitted from the website.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, city..." className="pl-9" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-5 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Total registrations</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1">{counts.all}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1 text-warning">{counts.pending}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1 text-destructive">{items.filter((r) => r.status === "rejected").length}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</p>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1 text-success">{items.filter((r) => r.status === "approved").length}</p>
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
                <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
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
                            {r.organization_name && r.full_name && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{r.organization_name}</span>}
                            <span className="inline-flex items-center gap-1 max-w-full truncate"><Mail className="h-3 w-3 flex-shrink-0" /><span className="truncate">{r.email}</span></span>
                            {r.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>}
                            {(r.city || r.state) && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{[r.city, r.state].filter(Boolean).join(", ")}</span>}
                            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(r.created_at)}</span>
                          </div>
                          <div className="mt-3 sm:hidden">
                            <Button size="sm" variant="outline" className="w-full" onClick={() => openApplication(r)}>
                              View full application <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="hidden sm:block ml-auto flex-shrink-0">
                          <Button size="sm" variant="outline" onClick={() => openApplication(r)}>
                            View full application <ExternalLink className="h-3.5 w-3.5" />
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

      <Dialog open={!!active} onOpenChange={(o) => {
        if (!o) {
          setActive(null);
          setDetailLoading(false);
        }
      }}>
        <DialogContent className="max-w-3xl w-[calc(100vw-1.5rem)] sm:w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          {active && (() => {
            const meta = TYPE_META[active.applicant_type];
            const Status = STATUS_META[active.status];
            const StatusIcon = Status.icon;
            const TypeIcon = meta.icon;
            const detailRows = flattenDetails(active.details, lookupLabels);
            const details = active.details ?? {};
            const city = active.city || lookupLabel("city_id", details.city_id ?? details.city, lookupLabels);
            const state = active.state || lookupLabel("state_id", details.state_id ?? details.state, lookupLabels);
            const zone = active.zone || lookupLabel("zone_id", details.zone_id ?? details.zone_ids ?? details.zone, lookupLabels);
            const specialty = active.specialty || lookupLabel("specialty_id", details.specialty_id ?? details.backend_specialty_id ?? details.specialty ?? details.backend_specialty, lookupLabels);
            const subSpecialty = lookupLabel("sub_specialty_id", details.sub_specialty_id ?? details.backend_sub_specialty_id ?? details.sub_specialty ?? details.backend_sub_specialty, lookupLabels);
            const organizationType = lookupLabel("organization_type_id", details.organization_type_id ?? details.organization_type, lookupLabels);
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
                    {active.reviewed_at && ` - Reviewed ${fmtDate(active.reviewed_at)}`}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-2">
                  {detailLoading && (
                    <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading full submitted information...
                    </div>
                  )}

                  {/* Contact / location */}
                  <section>
                    <h4 className="font-display font-semibold text-sm mb-3">Applicant information</h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <Field label="Applicant name" value={active.full_name || active.organization_name || displayName(active)} />
                      <Field label="Email" value={active.email} />
                      <Field label="Phone" value={active.phone} />
                      <Field label="Organization" value={active.organization_name} />
                      {organizationType && <Field label="Organization type" value={organizationType} />}
                      <Field label="City" value={city} />
                      <Field label="State" value={state} />
                      {zone && <Field label="Zone" value={zone} />}
                      {specialty && <Field label="Specialty" value={specialty} />}
                      {subSpecialty && <Field label="Sub-specialty" value={subSpecialty} />}
                    </div>
                  </section>

                  {/* Form details */}
                  {detailRows.length > 0 && (
                    <section>
                      <h4 className="font-display font-semibold text-sm mb-3">Application details</h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        {detailRows.map((row) => (
                          <Field key={`${row.key}:${row.value}`} label={row.key} value={row.value} />
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <h4 className="font-display font-semibold text-sm mb-3">Submission summary</h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <Field label="Application ID" value={active.id} />
                      <Field label="Applicant type" value={meta.label} />
                      <Field label="Current status" value={Status.label} />
                      <Field label="Submitted at" value={fmtDate(active.created_at)} />
                      <Field label="Reviewed at" value={active.reviewed_at ? fmtDate(active.reviewed_at) : "Pending review"} />
                      <Field label="Reviewer notes" value={active.reviewer_notes} />
                    </div>
                  </section>

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
                          const isPreparing = docLoading[doc.path];
                          const error = docErrors[doc.path];
                          const isImage = doc.type?.startsWith("image/");
                          const isPdf = doc.type === "application/pdf";
                          const sizeLabel = doc.size > 0 ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : "Size unavailable";
                          return (
                            <li key={doc.path} className="rounded-lg border border-border p-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <FileText className="h-4 w-4 text-secondary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{doc.label}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {doc.name} - {sizeLabel}
                                  </p>
                                </div>
                                {isPreparing ? (
                                  <Button size="sm" variant="outline" disabled>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing
                                  </Button>
                                ) : url ? (
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
                                ) : (
                                  <Button size="sm" variant="outline" disabled>
                                    Unavailable
                                  </Button>
                                )}
                              </div>
                              {error && !isPreparing && (
                                <p className="mt-2 text-xs text-destructive">{error}</p>
                              )}
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
                      placeholder="Optional internal notes about this decision..."
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
    <p className="text-sm mt-0.5">{value || "-"}</p>
  </div>
);

const prettyKey = (k: string) =>
  k.replace(/_ids$/i, "").replace(/_id$/i, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default NotificationsPageInner;
