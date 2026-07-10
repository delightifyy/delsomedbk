import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/portal/PortalUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { collection, userProfileFromApi } from "@/lib/backendAdapters";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Save,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
  XCircle,
} from "lucide-react";

type AnyRecord = Record<string, any>;

type RateForm = {
  card_commission_percent: string;
  subscription_consultation_fee: string;
  organization_consultation_fee: string;
  referral_default_lab: string;
  referral_default_diagnostic: string;
  referral_default_pharmacy: string;
  referral_default_doctor: string;
};

type HmoRateEdit = {
  amount: string;
  is_active: boolean;
};

type DoctorOption = {
  uuid: string;
  name: string;
  email: string;
  specialty: string;
};

type PayoutForm = {
  amount: string;
  paid_on: string;
  period_start: string;
  period_end: string;
  notes: string;
};

type PartnerRateForm = {
  type: "pharmacy" | "diagnostic" | "doctor";
  userUuid: string;
  amount: string;
};

const emptyRateForm: RateForm = {
  card_commission_percent: "",
  subscription_consultation_fee: "",
  organization_consultation_fee: "",
  referral_default_lab: "",
  referral_default_diagnostic: "",
  referral_default_pharmacy: "",
  referral_default_doctor: "",
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const monthStartIso = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
};

const asRecord = (value: unknown): AnyRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as AnyRecord) : {};

const unwrapData = (value: unknown) => {
  const root = asRecord(value);
  return root.data ?? value;
};

const listFrom = (value: unknown, keys: string[] = []) => {
  if (Array.isArray(value)) return value;

  const direct = collection(value);
  if (direct.length) return direct;

  const source = asRecord(value);
  for (const key of keys) {
    const candidate = source[key];
    if (Array.isArray(candidate)) return candidate;
    const candidateList = collection(candidate);
    if (candidateList.length) return candidateList;
  }

  if (source.data && source.data !== value) return listFrom(source.data, keys);
  return [];
};

const textOf = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(", ");
  const record = asRecord(value);
  return textOf(record.name ?? record.full_name ?? record.title ?? record.label ?? record.email ?? record.uuid ?? record.id);
};

const nestedValue = (source: AnyRecord, key: string) => {
  if (!key.includes(".")) return source[key];
  return key.split(".").reduce((current: unknown, part) => asRecord(current)[part], source);
};

const pickText = (source: AnyRecord, keys: string[], fallback = "") => {
  for (const key of keys) {
    const text = textOf(nestedValue(source, key)).trim();
    if (text) return text;
  }
  return fallback;
};

const pickNumber = (source: AnyRecord, keys: string[], fallback = 0) => {
  for (const key of keys) {
    const value = nestedValue(source, key);
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return fallback;
};

const pickBoolean = (source: AnyRecord, keys: string[], fallback = false) => {
  for (const key of keys) {
    const value = nestedValue(source, key);
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normal = value.toLowerCase();
      if (["1", "true", "yes", "active", "enabled"].includes(normal)) return true;
      if (["0", "false", "no", "inactive", "disabled"].includes(normal)) return false;
    }
  }
  return fallback;
};

const moneyKobo = (source: AnyRecord, koboKeys: string[], amountKeys: string[] = []) => {
  const kobo = pickNumber(source, koboKeys, Number.NaN);
  if (Number.isFinite(kobo)) return kobo;
  const amount = pickNumber(source, amountKeys, 0);
  return Math.round(amount * 100);
};

const nairaToKobo = (value: string) => Math.round((Number(value) || 0) * 100);

const koboToInput = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "";
  return String(value / 100);
};

const formatMoney = (kobo: number) => {
  const amount = Number.isFinite(kobo) ? kobo / 100 : 0;
  return `NGN ${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const statusBadge = (status: string) => {
  const normal = status.toLowerCase();
  if (["resolved", "paid", "completed", "approved"].includes(normal)) {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
  }
  if (["rejected", "failed", "declined"].includes(normal)) {
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
  }
  if (["processing", "in_progress"].includes(normal)) {
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
  }
  return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{status || "Open"}</Badge>;
};

const hmoRateId = (rate: AnyRecord, index: number) =>
  pickText(rate, ["hmo_provider_id", "provider_id", "id", "uuid", "hmoProvider.id", "hmo_provider.id"], `hmo-${index}`);

const hmoRateName = (rate: AnyRecord) =>
  pickText(rate, ["hmo_provider.name", "provider.name", "name", "hmo_name", "provider_name"], "Unnamed HMO");

const payoutId = (payout: AnyRecord, index: number) =>
  pickText(payout, ["uuid", "id", "reference"], `payout-${index}`);

const reconciliationId = (item: AnyRecord, index: number) =>
  pickText(item, ["uuid", "id", "reconciliation_uuid"], `reconciliation-${index}`);

const normalizeDoctor = (entry: unknown): DoctorOption | null => {
  const source = asRecord(entry);
  const profile = userProfileFromApi(entry);
  const uuid = profile.id || pickText(source, ["uuid", "id", "user_uuid", "user.id"]);
  if (!uuid) return null;

  return {
    uuid,
    name: profile.full_name || pickText(source, ["name", "full_name", "profile.full_name"], "Unnamed doctor"),
    email: profile.email || pickText(source, ["email", "user.email", "profile.email"], ""),
    specialty: pickText(source, ["specialty", "specialty_name", "profile.specialty", "doctor_profile.specialty"], "Doctor"),
  };
};

const AdminPaymentDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("rates");

  const [rates, setRates] = useState<AnyRecord | null>(null);
  const [rateForm, setRateForm] = useState<RateForm>(emptyRateForm);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesSaving, setRatesSaving] = useState(false);

  const [hmoRates, setHmoRates] = useState<AnyRecord[]>([]);
  const [hmoEdits, setHmoEdits] = useState<Record<string, HmoRateEdit>>({});
  const [hmoLoading, setHmoLoading] = useState(true);
  const [savingHmoId, setSavingHmoId] = useState<string | null>(null);

  const [partnerForm, setPartnerForm] = useState<PartnerRateForm>({
    type: "pharmacy",
    userUuid: "",
    amount: "",
  });
  const [partnerSaving, setPartnerSaving] = useState(false);

  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedDoctorUuid, setSelectedDoctorUuid] = useState("");
  const [payouts, setPayouts] = useState<AnyRecord[]>([]);
  const [payoutSummary, setPayoutSummary] = useState<AnyRecord>({});
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutForm, setPayoutForm] = useState<PayoutForm>({
    amount: "",
    paid_on: todayIso(),
    period_start: monthStartIso(),
    period_end: todayIso(),
    notes: "",
  });

  const [reconciliationStatus, setReconciliationStatus] = useState("open");
  const [reconciliations, setReconciliations] = useState<AnyRecord[]>([]);
  const [reconciliationLoading, setReconciliationLoading] = useState(true);
  const [decision, setDecision] = useState<{ item: AnyRecord; action: "resolve" | "reject" } | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [decisionSaving, setDecisionSaving] = useState(false);

  const selectedDoctor = doctors.find((doctor) => doctor.uuid === selectedDoctorUuid) ?? null;

  const filteredDoctors = useMemo(() => {
    const query = doctorSearch.trim().toLowerCase();
    if (!query) return doctors;
    return doctors.filter((doctor) =>
      [doctor.name, doctor.email, doctor.specialty].some((value) => value.toLowerCase().includes(query)),
    );
  }, [doctorSearch, doctors]);

  const outstandingKobo = useMemo(
    () =>
      moneyKobo(payoutSummary, [
        "outstanding_kobo",
        "outstanding_amount_kobo",
        "available_balance_kobo",
        "available_payout_kobo",
        "net_payable_kobo",
      ]),
    [payoutSummary],
  );

  const openReconciliationCount = reconciliations.filter((item) => {
    const status = pickText(item, ["status"], "open").toLowerCase();
    return status === "open" || status === "pending";
  }).length;

  const activeHmoCount = hmoRates.filter((rate, index) => {
    const key = hmoRateId(rate, index);
    return hmoEdits[key]?.is_active ?? pickBoolean(rate, ["is_active", "active"], false);
  }).length;

  const loadRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const response = await api.admin.payments.rates.get();
      const data = asRecord(unwrapData(response));
      setRates(data);
      setRateForm({
        card_commission_percent: String(data.card_commission_percent ?? ""),
        subscription_consultation_fee: koboToInput(pickNumber(data, ["subscription_consultation_fee_kobo"])),
        organization_consultation_fee: koboToInput(pickNumber(data, ["organization_consultation_fee_kobo"])),
        referral_default_lab: koboToInput(pickNumber(data, ["referral_default_lab_kobo"])),
        referral_default_diagnostic: koboToInput(pickNumber(data, ["referral_default_diagnostic_kobo"])),
        referral_default_pharmacy: koboToInput(pickNumber(data, ["referral_default_pharmacy_kobo"])),
        referral_default_doctor: koboToInput(pickNumber(data, ["referral_default_doctor_kobo"])),
      });
    } catch (error) {
      toast({
        title: "Could not load payment settings",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRatesLoading(false);
    }
  }, [toast]);

  const loadHmoRates = useCallback(async () => {
    setHmoLoading(true);
    try {
      const response = await api.admin.payments.hmoRates.list();
      const rows = listFrom(unwrapData(response), ["hmo_rates", "rates", "items"]);
      setHmoRates(rows);
      setHmoEdits(
        rows.reduce<Record<string, HmoRateEdit>>((acc, row, index) => {
          const rate = asRecord(row);
          const key = hmoRateId(rate, index);
          acc[key] = {
            amount: koboToInput(moneyKobo(rate, ["amount_kobo", "consultation_fee_kobo", "rate_kobo"], ["amount", "rate"])),
            is_active: pickBoolean(rate, ["is_active", "active"], true),
          };
          return acc;
        }, {}),
      );
    } catch (error) {
      toast({
        title: "Could not load HMO rates",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setHmoLoading(false);
    }
  }, [toast]);

  const loadDoctors = useCallback(async () => {
    setDoctorsLoading(true);
    try {
      const response = await api.admin.users.list({ role: "doctor", per_page: 100 });
      const rows = collection(response.data)
        .map(normalizeDoctor)
        .filter(Boolean) as DoctorOption[];
      setDoctors(rows);
      setSelectedDoctorUuid((current) => current || rows[0]?.uuid || "");
    } catch (error) {
      toast({
        title: "Could not load doctors",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDoctorsLoading(false);
    }
  }, [toast]);

  const loadPayouts = useCallback(async () => {
    if (!selectedDoctorUuid) {
      setPayouts([]);
      setPayoutSummary({});
      return;
    }

    setPayoutsLoading(true);
    try {
      const response = await api.admin.payments.doctorPayouts.list(selectedDoctorUuid);
      const data = unwrapData(response);
      const summary = asRecord(data);
      const rows = listFrom(data, ["payouts", "items", "history"]);
      setPayoutSummary(summary);
      setPayouts(rows);

      const available = moneyKobo(summary, [
        "outstanding_kobo",
        "outstanding_amount_kobo",
        "available_balance_kobo",
        "available_payout_kobo",
        "net_payable_kobo",
      ]);
      if (available > 0) {
        setPayoutForm((current) => ({ ...current, amount: current.amount || koboToInput(available) }));
      }
    } catch (error) {
      toast({
        title: "Could not load doctor payouts",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPayoutsLoading(false);
    }
  }, [selectedDoctorUuid, toast]);

  const loadReconciliations = useCallback(async () => {
    setReconciliationLoading(true);
    try {
      const response = await api.admin.payments.reconciliation.list({
        status: reconciliationStatus === "all" ? undefined : reconciliationStatus,
        per_page: 50,
      });
      const rows = listFrom(unwrapData(response), ["reconciliation", "reconciliations", "items"]);
      setReconciliations(rows);
    } catch (error) {
      toast({
        title: "Could not load reconciliation queue",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setReconciliationLoading(false);
    }
  }, [reconciliationStatus, toast]);

  useEffect(() => {
    loadRates();
    loadHmoRates();
    loadDoctors();
  }, [loadRates, loadHmoRates, loadDoctors]);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  useEffect(() => {
    loadReconciliations();
  }, [loadReconciliations]);

  const saveRates = async () => {
    setRatesSaving(true);
    try {
      await api.admin.payments.rates.update({
        card_commission_percent: Number(rateForm.card_commission_percent) || 0,
        subscription_consultation_fee_kobo: nairaToKobo(rateForm.subscription_consultation_fee),
        organization_consultation_fee_kobo: nairaToKobo(rateForm.organization_consultation_fee),
        referral_default_lab_kobo: nairaToKobo(rateForm.referral_default_lab),
        referral_default_diagnostic_kobo: nairaToKobo(rateForm.referral_default_diagnostic),
        referral_default_pharmacy_kobo: nairaToKobo(rateForm.referral_default_pharmacy),
        referral_default_doctor_kobo: nairaToKobo(rateForm.referral_default_doctor),
      });
      toast({ title: "Payment settings saved", description: "The payment rates were updated." });
      await loadRates();
    } catch (error) {
      toast({
        title: "Could not save payment settings",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRatesSaving(false);
    }
  };

  const saveHmoRate = async (rate: AnyRecord, index: number) => {
    const key = hmoRateId(rate, index);
    const providerId = pickText(rate, ["hmo_provider_id", "provider_id", "id", "uuid", "hmoProvider.id", "hmo_provider.id"]);
    const edit = hmoEdits[key];
    if (!edit) return;
    if (!providerId) {
      toast({
        title: "HMO fee cannot be saved",
        description: "This HMO is missing the account ID needed to update it.",
        variant: "destructive",
      });
      return;
    }

    setSavingHmoId(key);
    try {
      await api.admin.payments.hmoRates.update(providerId, {
        amount_kobo: nairaToKobo(edit.amount),
        is_active: edit.is_active,
      });
      toast({ title: "HMO rate saved", description: `${hmoRateName(rate)} was updated.` });
      await loadHmoRates();
    } catch (error) {
      toast({
        title: "Could not save HMO rate",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingHmoId(null);
    }
  };

  const savePartnerRate = async () => {
    if (!partnerForm.userUuid.trim() || !partnerForm.amount.trim()) {
      toast({
        title: "Missing partner details",
        description: "Enter the partner account ID and referral commission amount.",
        variant: "destructive",
      });
      return;
    }

    setPartnerSaving(true);
    try {
      await api.admin.payments.partnerRates.update(partnerForm.type, partnerForm.userUuid.trim(), {
        referral_commission_kobo: nairaToKobo(partnerForm.amount),
      });
      toast({ title: "Partner rate saved", description: "The referral commission was updated." });
      setPartnerForm((current) => ({ ...current, userUuid: "", amount: "" }));
    } catch (error) {
      toast({
        title: "Could not save partner rate",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPartnerSaving(false);
    }
  };

  const recordPayout = async () => {
    if (!selectedDoctorUuid || !payoutForm.amount || !payoutForm.paid_on || !payoutForm.period_start || !payoutForm.period_end) {
      toast({
        title: "Missing payout details",
        description: "Select a doctor and complete the amount and date fields.",
        variant: "destructive",
      });
      return;
    }

    setPayoutSaving(true);
    try {
      await api.admin.payments.doctorPayouts.create(selectedDoctorUuid, {
        amount_kobo: nairaToKobo(payoutForm.amount),
        paid_on: payoutForm.paid_on,
        period_start: payoutForm.period_start,
        period_end: payoutForm.period_end,
        notes: payoutForm.notes || undefined,
      });
      toast({ title: "Payout recorded", description: "The doctor payout has been saved." });
      setPayoutForm({
        amount: "",
        paid_on: todayIso(),
        period_start: monthStartIso(),
        period_end: todayIso(),
        notes: "",
      });
      await loadPayouts();
    } catch (error) {
      toast({
        title: "Could not record payout",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPayoutSaving(false);
    }
  };

  const submitDecision = async () => {
    if (!decision || !resolutionNote.trim()) {
      toast({
        title: "Resolution note required",
        description: "Add a note before resolving or rejecting the request.",
        variant: "destructive",
      });
      return;
    }

    const uuid = pickText(decision.item, ["uuid", "id", "reconciliation_uuid"]);
    if (!uuid) {
      toast({
        title: "Missing reconciliation ID",
        description: "This request is missing the record ID needed to update it.",
        variant: "destructive",
      });
      return;
    }

    setDecisionSaving(true);
    try {
      if (decision.action === "resolve") {
        await api.admin.payments.reconciliation.resolve(uuid, resolutionNote.trim());
      } else {
        await api.admin.payments.reconciliation.reject(uuid, resolutionNote.trim());
      }
      toast({
        title: decision.action === "resolve" ? "Reconciliation resolved" : "Reconciliation rejected",
        description: "The queue has been updated.",
      });
      setDecision(null);
      setResolutionNote("");
      await loadReconciliations();
    } catch (error) {
      toast({
        title: "Could not update reconciliation",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDecisionSaving(false);
    }
  };

  const updateHmoEdit = (key: string, patch: Partial<HmoRateEdit>) => {
    setHmoEdits((current) => ({
      ...current,
      [key]: {
        amount: current[key]?.amount ?? "",
        is_active: current[key]?.is_active ?? true,
        ...patch,
      },
    }));
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Payment Management"
        description="Set service fees, pay doctors, and review payment complaints."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Card Commission</p>
                <p className="text-2xl font-bold mt-1">{ratesLoading ? "..." : `${rates?.card_commission_percent ?? 0}%`}</p>
                <p className="text-xs text-muted-foreground mt-1">Global platform rate</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active HMO Rates</p>
                <p className="text-2xl font-bold mt-1">{hmoLoading ? "..." : activeHmoCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{hmoRates.length} total HMO fees</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selected Outstanding</p>
                <p className="text-2xl font-bold mt-1">{payoutsLoading ? "..." : formatMoney(outstandingKobo)}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedDoctor?.name || "Choose a doctor"}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Reconciliation</p>
                <p className="text-2xl font-bold mt-1">{reconciliationLoading ? "..." : openReconciliationCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Requests awaiting admin action</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="rates" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Payment Rates
          </TabsTrigger>
          <TabsTrigger value="hmo" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> HMO Fees
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-2">
            <Building2 className="h-4 w-4" /> Referral Fees
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2">
            <Wallet className="h-4 w-4" /> Doctor Payouts
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="gap-2">
            <Clock className="h-4 w-4" /> Payment Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-5 space-y-5">
              <div>
                <div>
                  <h2 className="text-lg font-semibold">Payment Rates</h2>
                  <p className="text-sm text-muted-foreground">Set the default fees and commissions used for bookings and referrals.</p>
                </div>
              </div>

              {ratesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card_commission_percent">Card commission percent</Label>
                      <Input
                        id="card_commission_percent"
                        type="number"
                        min="0"
                        step="0.01"
                        value={rateForm.card_commission_percent}
                        onChange={(event) => setRateForm((current) => ({ ...current, card_commission_percent: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription_consultation_fee">Subscription consultation fee (NGN)</Label>
                      <Input
                        id="subscription_consultation_fee"
                        type="number"
                        min="0"
                        value={rateForm.subscription_consultation_fee}
                        onChange={(event) => setRateForm((current) => ({ ...current, subscription_consultation_fee: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization_consultation_fee">Organization consultation fee (NGN)</Label>
                      <Input
                        id="organization_consultation_fee"
                        type="number"
                        min="0"
                        value={rateForm.organization_consultation_fee}
                        onChange={(event) => setRateForm((current) => ({ ...current, organization_consultation_fee: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referral_default_lab">Default lab referral (NGN)</Label>
                      <Input
                        id="referral_default_lab"
                        type="number"
                        min="0"
                        value={rateForm.referral_default_lab}
                        onChange={(event) => setRateForm((current) => ({ ...current, referral_default_lab: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referral_default_diagnostic">Default diagnostic referral (NGN)</Label>
                      <Input
                        id="referral_default_diagnostic"
                        type="number"
                        min="0"
                        value={rateForm.referral_default_diagnostic}
                        onChange={(event) => setRateForm((current) => ({ ...current, referral_default_diagnostic: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referral_default_pharmacy">Default pharmacy referral (NGN)</Label>
                      <Input
                        id="referral_default_pharmacy"
                        type="number"
                        min="0"
                        value={rateForm.referral_default_pharmacy}
                        onChange={(event) => setRateForm((current) => ({ ...current, referral_default_pharmacy: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referral_default_doctor">Default doctor referral (NGN)</Label>
                      <Input
                        id="referral_default_doctor"
                        type="number"
                        min="0"
                        value={rateForm.referral_default_doctor}
                        onChange={(event) => setRateForm((current) => ({ ...current, referral_default_doctor: event.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveRates} disabled={ratesSaving}>
                      {ratesSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Payment Rates
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hmo" className="space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="p-5 flex items-center justify-between gap-3 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold">HMO Fees</h2>
                  <p className="text-sm text-muted-foreground">Set the consultation fee each HMO should cover.</p>
                </div>
              </div>

              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>HMO Provider</TableHead>
                    <TableHead>Rate (NGN)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hmoLoading ? (
                    [...Array(4)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : hmoRates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        No HMO fees were found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    hmoRates.map((row, index) => {
                      const rate = asRecord(row);
                      const key = hmoRateId(rate, index);
                      const edit = hmoEdits[key] ?? { amount: "", is_active: true };
                      return (
                        <TableRow key={key}>
                          <TableCell>
                            <div className="font-medium">{hmoRateName(rate)}</div>
                            <div className="text-xs text-muted-foreground">ID: {key}</div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={edit.amount}
                              onChange={(event) => updateHmoEdit(key, { amount: event.target.value })}
                              className="max-w-[160px]"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch checked={edit.is_active} onCheckedChange={(value) => updateHmoEdit(key, { is_active: value })} />
                              <span className="text-sm">{edit.is_active ? "Active" : "Inactive"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => saveHmoRate(rate, index)} disabled={savingHmoId === key}>
                              {savingHmoId === key ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                              Save
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-5 space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Referral Fee</h2>
                <p className="text-sm text-muted-foreground">Set how much a partner or referred doctor earns from referrals.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Partner type</Label>
                  <Select
                    value={partnerForm.type}
                    onValueChange={(value) => setPartnerForm((current) => ({ ...current, type: value as PartnerRateForm["type"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner_user_uuid">Partner account ID</Label>
                  <Input
                    id="partner_user_uuid"
                    value={partnerForm.userUuid}
                    onChange={(event) => setPartnerForm((current) => ({ ...current, userUuid: event.target.value }))}
                    placeholder="Paste account ID from the partner profile"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner_amount">Referral commission (NGN)</Label>
                  <Input
                    id="partner_amount"
                    type="number"
                    min="0"
                    value={partnerForm.amount}
                    onChange={(event) => setPartnerForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="150"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={savePartnerRate} disabled={partnerSaving}>
                  {partnerSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Referral Fee
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(260px,360px)_1fr] gap-4">
            <Card className="border-border/60">
              <CardContent className="p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Pay a Doctor</h2>
                  <p className="text-sm text-muted-foreground">Choose a doctor, enter the amount paid, and save the payout record.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor_search">Find doctor</Label>
                  <Input
                    id="doctor_search"
                    value={doctorSearch}
                    onChange={(event) => setDoctorSearch(event.target.value)}
                    placeholder="Search name, email, specialty"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Doctor</Label>
                  <Select value={selectedDoctorUuid} onValueChange={setSelectedDoctorUuid} disabled={doctorsLoading || filteredDoctors.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={doctorsLoading ? "Loading doctors..." : "Select doctor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDoctors.map((doctor) => (
                        <SelectItem key={doctor.uuid} value={doctor.uuid}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDoctor && (
                    <p className="text-xs text-muted-foreground truncate">{selectedDoctor.email || selectedDoctor.specialty}</p>
                  )}
                </div>

                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Amount currently owed</p>
                  <p className="text-xl font-bold">{payoutsLoading ? "Loading..." : formatMoney(outstandingKobo)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payout_amount">Amount (NGN)</Label>
                  <Input
                    id="payout_amount"
                    type="number"
                    min="0"
                    value={payoutForm.amount}
                    onChange={(event) => setPayoutForm((current) => ({ ...current, amount: event.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="paid_on">Paid on</Label>
                    <Input
                      id="paid_on"
                      type="date"
                      value={payoutForm.paid_on}
                      onChange={(event) => setPayoutForm((current) => ({ ...current, paid_on: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period_start">Period start</Label>
                    <Input
                      id="period_start"
                      type="date"
                      value={payoutForm.period_start}
                      onChange={(event) => setPayoutForm((current) => ({ ...current, period_start: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period_end">Period end</Label>
                    <Input
                      id="period_end"
                      type="date"
                      value={payoutForm.period_end}
                      onChange={(event) => setPayoutForm((current) => ({ ...current, period_end: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payout_notes">Notes</Label>
                  <Textarea
                    id="payout_notes"
                    rows={3}
                    value={payoutForm.notes}
                    onChange={(event) => setPayoutForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="June batch"
                  />
                </div>

                <Button className="w-full" onClick={recordPayout} disabled={payoutSaving || !selectedDoctorUuid}>
                  {payoutSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Record Payout
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-0">
                <div className="p-5 flex items-center justify-between gap-3 border-b border-border">
                  <div>
                    <h2 className="text-lg font-semibold">Payout History</h2>
                    <p className="text-sm text-muted-foreground">{selectedDoctor?.name || "Select a doctor to load payouts"}</p>
                  </div>
                </div>

                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Paid On</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutsLoading ? (
                      [...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : payouts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                          No payouts found for this doctor.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payouts.map((row, index) => {
                        const payout = asRecord(row);
                        const amount = moneyKobo(payout, ["amount_kobo", "paid_amount_kobo"], ["amount", "paid_amount"]);
                        return (
                          <TableRow key={payoutId(payout, index)}>
                            <TableCell className="font-mono text-xs">
                              {pickText(payout, ["reference", "payout_reference", "uuid", "id"], "No reference")}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(pickText(payout, ["period_start", "start_date"]))} - {formatDate(pickText(payout, ["period_end", "end_date"]))}
                            </TableCell>
                            <TableCell>{formatDate(pickText(payout, ["paid_on", "paid_at", "created_at"]))}</TableCell>
                            <TableCell className="text-right font-semibold">{formatMoney(amount)}</TableCell>
                            <TableCell>{statusBadge(pickText(payout, ["status"], "paid"))}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="p-5 flex items-center justify-between gap-3 border-b border-border flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">Payment Review Requests</h2>
                  <p className="text-sm text-muted-foreground">Review doctor payment complaints and close each request after checking.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={reconciliationStatus} onValueChange={setReconciliationStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Expected Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliationLoading ? (
                    [...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-44" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-9 w-32 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : reconciliations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No reconciliation requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reconciliations.map((row, index) => {
                      const item = asRecord(row);
                      const status = pickText(item, ["status"], "open").toLowerCase();
                      const amount = moneyKobo(item, ["expected_amount_kobo", "amount_kobo", "requested_amount_kobo"], ["expected_amount", "amount"]);
                      return (
                        <TableRow key={reconciliationId(item, index)}>
                          <TableCell>
                            <div className="font-medium">
                              {pickText(item, ["doctor.name", "doctor.full_name", "doctor_name", "user.name", "user.full_name"], "Unknown doctor")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {pickText(item, ["doctor.email", "user.email", "email", "doctor_uuid"], reconciliationId(item, index))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[260px]">
                            <div className="font-medium truncate">{pickText(item, ["reason"], "Review requested")}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{pickText(item, ["details", "description", "note"], "")}</div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{formatMoney(amount)}</TableCell>
                          <TableCell>{statusBadge(status)}</TableCell>
                          <TableCell>{formatDate(pickText(item, ["created_at", "submitted_at"]))}</TableCell>
                          <TableCell className="text-right">
                            {["resolved", "rejected"].includes(status) ? (
                              <span className="text-sm text-muted-foreground">Closed</span>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setDecision({ item, action: "resolve" });
                                    setResolutionNote("");
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setDecision({ item, action: "reject" });
                                    setResolutionNote("");
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(decision)} onOpenChange={(open) => !open && setDecision(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {decision?.action === "resolve" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
              {decision?.action === "resolve" ? "Resolve reconciliation" : "Reject reconciliation"}
            </DialogTitle>
          </DialogHeader>

          {decision && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Request</p>
                <p className="font-medium">
                  {pickText(decision.item, ["reason"], "Payment reconciliation")} -{" "}
                  {formatMoney(moneyKobo(decision.item, ["expected_amount_kobo", "amount_kobo"], ["expected_amount", "amount"]))}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution_note">Resolution note</Label>
                <Textarea
                  id="resolution_note"
                  rows={4}
                  value={resolutionNote}
                  onChange={(event) => setResolutionNote(event.target.value)}
                  placeholder={decision.action === "resolve" ? "Adjusted; paid next batch." : "No discrepancy found."}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDecision(null)}>Cancel</Button>
            <Button
              variant={decision?.action === "reject" ? "destructive" : "default"}
              onClick={submitDecision}
              disabled={decisionSaving}
            >
              {decisionSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminPaymentDashboard;
