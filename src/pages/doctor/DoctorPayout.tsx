import { useEffect, useState } from "react";
import { AlertTriangle, Calendar, Download, FileText, Loader2, Scale, Send, TrendingUp, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageHeader } from "@/components/portal/PortalUI";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  doctorPortalApi,
  formatNGN,
  type DoctorPortalEarning,
  type DoctorPortalPaymentOverview,
  type DoctorPortalPayout,
  type DoctorPortalReferralEarning,
} from "@/lib/doctorPortalApi";
import { doctorNav } from "./nav";

type Reconciliation = Record<string, any>;

const emptyOverview: DoctorPortalPaymentOverview = {
  totalEarnings: 0,
  platformCommission: 0,
  netEarnings: 0,
  referralCommission: 0,
  totalReferrals: 0,
  pendingAmount: 0,
  availableBalance: 0,
  nextPayout: "",
};

const textFrom = (record: Record<string, any>, keys: string[], fallback = "N/A") => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return fallback;
};

const dateFrom = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toDateString();
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const StatTile = ({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper?: string;
  icon: typeof TrendingUp;
}) => (
  <Card className="border-border/60">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DoctorPayout = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState<DoctorPortalPaymentOverview>(emptyOverview);
  const [earnings, setEarnings] = useState<DoctorPortalEarning[]>([]);
  const [referrals, setReferrals] = useState<DoctorPortalReferralEarning[]>([]);
  const [payouts, setPayouts] = useState<DoctorPortalPayout[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [earningType, setEarningType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReconciliationDialog, setShowReconciliationDialog] = useState(false);
  const [reconciliationReason, setReconciliationReason] = useState("");
  const [reconciliationAmount, setReconciliationAmount] = useState("");
  const [reconciliationDetails, setReconciliationDetails] = useState("");
  const [submittingReconciliation, setSubmittingReconciliation] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewResponse, earningsResponse, referralsResponse, payoutsResponse, reconciliationResponse] = await Promise.all([
        doctorPortalApi.payments.overview(),
        doctorPortalApi.payments.earnings({
          type: earningType === "all" ? undefined : earningType,
          from: from || undefined,
          to: to || undefined,
          per_page: 50,
        }),
        doctorPortalApi.payments.referrals({ per_page: 50 }),
        doctorPortalApi.payments.payouts({ per_page: 50 }),
        api.doctorPortal.payments.reconciliation.list(),
      ]);

      setOverview(overviewResponse);
      setEarnings(earningsResponse.items);
      setReferrals(referralsResponse.items);
      setPayouts(payoutsResponse.items);
      setReconciliations(Array.isArray(reconciliationResponse.data) ? reconciliationResponse.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportEarnings = async () => {
    try {
      const file = await api.doctorPortal.payments.earningsExport({
        type: earningType === "all" ? undefined : earningType,
        from: from || undefined,
        to: to || undefined,
      });
      downloadBlob(file.blob, file.filename ?? "doctor-earnings.csv");
    } catch (err) {
      toast({ title: "Export failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    }
  };

  const submitReconciliation = async () => {
    const amount = Number(reconciliationAmount);
    if (!amount || amount <= 0 || !reconciliationReason.trim()) {
      toast({
        title: "Missing details",
        description: "Enter the expected amount and a reason for reconciliation.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReconciliation(true);
    try {
      await api.doctorPortal.payments.reconciliation.submit({
        expected_amount_kobo: Math.round(amount * 100),
        reason: reconciliationReason,
        details: reconciliationDetails,
      });
      toast({ title: "Reconciliation submitted", description: "Your payment review request has been sent." });
      setShowReconciliationDialog(false);
      setReconciliationAmount("");
      setReconciliationReason("");
      setReconciliationDetails("");
      await loadPayments();
    } catch (err) {
      toast({ title: "Could not submit request", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setSubmittingReconciliation(false);
    }
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title="Payment History"
        description="Track earnings, referrals, payouts, and reconciliation requests."
      />

      {loading ? (
        <div className="grid min-h-[380px] place-items-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <EmptyState
          icon={Wallet}
          title="Could not load payment history"
          description={error}
          action={<Button onClick={loadPayments}>Try again</Button>}
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Total Earnings" value={formatNGN(overview.totalEarnings)} helper="Lifetime earnings" icon={TrendingUp} />
            <StatTile label="Pending Amount" value={formatNGN(overview.pendingAmount)} helper="Awaiting approval" icon={Wallet} />
            <StatTile label="Referral Commission" value={formatNGN(overview.referralCommission)} helper={`${overview.totalReferrals} referrals`} icon={Users} />
            <StatTile label="Available Balance" value={formatNGN(overview.availableBalance)} helper={overview.nextPayout ? `Next payout ${overview.nextPayout}` : "Ready for payout"} icon={Calendar} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-5">
              <TabsTrigger value="overview"><TrendingUp className="h-4 w-4" /> Overview</TabsTrigger>
              <TabsTrigger value="earnings"><FileText className="h-4 w-4" /> Earnings</TabsTrigger>
              <TabsTrigger value="referrals"><Users className="h-4 w-4" /> Referrals</TabsTrigger>
              <TabsTrigger value="payouts"><Wallet className="h-4 w-4" /> Payouts</TabsTrigger>
              <TabsTrigger value="reconciliation"><Scale className="h-4 w-4" /> Review</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="border-border/60 lg:col-span-2">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold">Earnings Summary</h3>
                    <div className="space-y-4">
                      <SummaryRow label="Gross Earnings" value={formatNGN(overview.totalEarnings)} />
                      <SummaryRow label="Platform Commission" value={`-${formatNGN(overview.platformCommission)}`} />
                      <SummaryRow label="Referral Commission" value={`+${formatNGN(overview.referralCommission)}`} />
                      <SummaryRow label="Net Earnings" value={formatNGN(overview.netEarnings)} strong />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardContent className="p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                      <Scale className="h-4 w-4 text-primary" />
                      Reconciliation
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        <AlertTriangle className="mr-2 inline h-4 w-4" />
                        Request a review if an earning, payout, or commission looks incorrect.
                      </div>
                      <Button className="w-full" onClick={() => setShowReconciliationDialog(true)}>
                        <Scale className="h-4 w-4" />
                        Request Reconciliation
                      </Button>
                      <Button variant="outline" className="w-full" onClick={exportEarnings}>
                        <Download className="h-4 w-4" />
                        Export Earnings CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={earningType} onValueChange={setEarningType}>
                    <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-9 w-[150px]" />
                  <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-9 w-[150px]" />
                  <Button variant="outline" size="sm" onClick={loadPayments}>Apply</Button>
                </div>
                <Button variant="outline" size="sm" onClick={exportEarnings}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              <EarningsTable earnings={earnings} />
            </TabsContent>

            <TabsContent value="referrals" className="space-y-4">
              <Card className="border-border/60">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Referred Doctor</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No referrals found</TableCell>
                        </TableRow>
                      ) : referrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">{referral.doctor}</TableCell>
                          <TableCell>{referral.patient}</TableCell>
                          <TableCell>{dateFrom(referral.date)}</TableCell>
                          <TableCell className="text-right font-medium">{formatNGN(referral.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-4">
              <Card className="border-border/60">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No payout history found</TableCell>
                        </TableRow>
                      ) : payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell className="font-mono text-xs">{payout.reference}</TableCell>
                          <TableCell>{dateFrom(payout.date)}</TableCell>
                          <TableCell>{payout.method || "N/A"}</TableCell>
                          <TableCell className="text-right font-bold text-primary">{formatNGN(payout.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reconciliation" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowReconciliationDialog(true)}>
                  <Scale className="h-4 w-4" />
                  New Request
                </Button>
              </div>
              <Card className="border-border/60">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Reason</TableHead>
                        <TableHead>Expected Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reconciliations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No reconciliation requests found</TableCell>
                        </TableRow>
                      ) : reconciliations.map((item, index) => (
                        <TableRow key={textFrom(item, ["uuid", "id"], String(index))}>
                          <TableCell>{textFrom(item, ["reason"])}</TableCell>
                          <TableCell>{formatNGN(Number(textFrom(item, ["expected_amount", "expected_amount_kobo"], "0")) / (item.expected_amount_kobo ? 100 : 1))}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{textFrom(item, ["status"], "open")}</Badge></TableCell>
                          <TableCell>{dateFrom(textFrom(item, ["created_at", "date"], ""))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <Dialog open={showReconciliationDialog} onOpenChange={setShowReconciliationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Request Reconciliation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Expected Amount (NGN)</Label>
              <Input
                type="number"
                value={reconciliationAmount}
                onChange={(event) => setReconciliationAmount(event.target.value)}
                placeholder="Enter expected amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reconciliationReason} onValueChange={setReconciliationReason}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="underpaid">I was underpaid</SelectItem>
                  <SelectItem value="missing">Missing payment</SelectItem>
                  <SelectItem value="incorrect">Incorrect calculation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Details</Label>
              <Textarea
                rows={3}
                value={reconciliationDetails}
                onChange={(event) => setReconciliationDetails(event.target.value)}
                placeholder="Explain the discrepancy"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReconciliationDialog(false)}>Cancel</Button>
            <Button onClick={submitReconciliation} disabled={submittingReconciliation}>
              {submittingReconciliation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

const SummaryRow = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className={`flex items-center justify-between border-b border-border/60 pb-2 last:border-0 ${strong ? "pt-2 text-base font-semibold" : "text-sm"}`}>
    <span className="text-muted-foreground">{label}</span>
    <span className={strong ? "text-lg font-bold text-primary" : "font-medium"}>{value}</span>
  </div>
);

const EarningsTable = ({ earnings }: { earnings: DoctorPortalEarning[] }) => (
  <Card className="border-border/60">
    <CardContent className="p-0">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {earnings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No earnings found</TableCell>
            </TableRow>
          ) : earnings.map((earning) => (
            <TableRow key={earning.id}>
              <TableCell>{earning.type}</TableCell>
              <TableCell>{earning.patient}</TableCell>
              <TableCell>{dateFrom(earning.date)}</TableCell>
              <TableCell><Badge variant="outline" className="capitalize">{earning.status || "posted"}</Badge></TableCell>
              <TableCell className="text-right font-medium">{formatNGN(earning.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default DoctorPayout;
