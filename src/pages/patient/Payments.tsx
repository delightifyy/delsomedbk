import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, StatCard, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { formatNGN } from "@/data/portalMock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Building2,
  ShieldCheck,
  BadgeCheck,
  CalendarClock,
  Users,
  RefreshCw,
  CheckCircle2,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { usePatientCategory, categoryLabel } from "@/hooks/usePatientCategory";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import desolmedLogo from "@/assets/desolmed-logo.png";

// ============ DEMO MODE ============
const USE_DEMO_DATA = false;

interface Transaction {
  id: string;
  date: string;
  description: string;
  method: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface HmoCoverage {
  provider: string;
  plan: string;
  memberId: string;
  policyNumber: string;
  supportPhone: string;
  annualLimitNGN: number;
  usedNGN: number;
  verifiedAt: string;
  expiresAt: string;
  coveredServices: string[];
}

interface SubscriptionData {
  id: string;
  plan: string;
  status: string;
  priceNGN: number;
  billingCycle: string;
  startedOn: string;
  renewsOn: string;
  consultationsIncluded: number;
  consultationsUsed: number;
  perks: string[];
}

interface OrganizationCoverage {
  name: string;
  employeeId: string;
  department: string;
  hrContact: string;
  validUntil: string;
  coverageTier: string;
  consultationsCovered: number;
  consultationsUsed: number;
  coveredServices: string[];
  eligibleDependents: number;
}

// Demo Data (only used when USE_DEMO_DATA = true)
const DEMO_HMO_COVERAGE: HmoCoverage = {
  provider: "HealthPlus HMO",
  plan: "Premium Plus",
  memberId: "HMO-12345-67890",
  policyNumber: "POL-HMO-001234",
  supportPhone: "+234 800 123 4567",
  annualLimitNGN: 500000,
  usedNGN: 125000,
  verifiedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  coveredServices: [
    "General Practitioner Consultations",
    "Specialist Referrals",
    "Diagnostic Tests",
    "Prescription Medications",
    "Emergency Care",
    "Annual Health Checkup",
    "Maternity Care",
    "Mental Health Support"
  ]
};

const DEMO_SUBSCRIPTION: SubscriptionData = {
  id: "sub-001",
  plan: "Family Health Plan",
  status: "active",
  priceNGN: 150000,
  billingCycle: "Annual",
  startedOn: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  renewsOn: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000).toISOString(),
  consultationsIncluded: 12,
  consultationsUsed: 3,
  perks: [
    "Unlimited GP consultations",
    "50% off specialist visits",
    "Free prescription delivery",
    "24/7 nurse hotline",
    "Health tracking app access",
    "Annual wellness exam included"
  ]
};

const DEMO_ORGANIZATION: OrganizationCoverage = {
  name: "Sterling Bank Nigeria",
  employeeId: "SBN-EMP-48217",
  department: "Engineering",
  hrContact: "hr@sterlingbank.com",
  validUntil: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000).toISOString(),
  coverageTier: "Executive Plus",
  consultationsCovered: 24,
  consultationsUsed: 8,
  eligibleDependents: 4,
  coveredServices: [
    "GP Consultations",
    "Specialist Visits",
    "Dental Care",
    "Optometry",
    "Prescription Coverage",
    "Mental Health Services",
    "Wellness Programs"
  ]
};

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "1", date: "2024-05-15", description: "Consultation - Dr. Sarah Johnson", method: "HMO", amount: 25000, status: "paid" },
  { id: "2", date: "2024-05-10", description: "Prescription - Lisinopril", method: "HMO", amount: 5000, status: "paid" },
  { id: "3", date: "2024-05-01", description: "Lab Test - Blood Work", method: "HMO", amount: 15000, status: "paid" },
  { id: "4", date: "2024-04-25", description: "Consultation - Dr. Michael Chen", method: "HMO", amount: 25000, status: "paid" },
];

const DEMO_CARD_TRANSACTIONS: Transaction[] = [
  { id: "1", date: "2024-05-15", description: "Consultation - Dr. Amara Okafor", method: "Card", amount: 75000, status: "paid" },
  { id: "2", date: "2024-05-10", description: "Prescription Refill", method: "Card", amount: 15000, status: "paid" },
];

const ProgressBar = ({ pct }: { pct: number }) => (
  <div className="h-2 rounded-full bg-muted overflow-hidden">
    <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
  </div>
);

// Loading screen with Desolmed logo - FULL PAGE
const PaymentLoadingScreen = () => (
  <PortalLayout portalName="Patient Portal" nav={patientNav}>
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-xl animate-pulse"></div>
          <div className="relative animate-bounce">
            <img 
              src={desolmedLogo} 
              alt="Desolmed" 
              className="w-28 h-28 mx-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  </PortalLayout>
);

const TransactionsCard = ({ transactions, hideAmount = false, methodOverride }: { 
  transactions: Transaction[]; 
  hideAmount?: boolean; 
  methodOverride?: string;
}) => (
  <SectionCard title="Transaction History">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Method</TableHead>
          {!hideAmount && <TableHead className="text-right">Amount</TableHead>}
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!transactions || transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={hideAmount ? 4 : 5} className="text-center text-muted-foreground py-8">
              No transactions yet
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
              <TableCell className="font-medium text-sm">{p.description}</TableCell>
              <TableCell><Badge variant="outline">{methodOverride ?? p.method}</Badge></TableCell>
              {!hideAmount && <TableCell className="text-right font-medium">{formatNGN(p.amount)}</TableCell>}
              <TableCell>
                <Badge variant={p.status === "paid" ? "default" : "secondary"} className="capitalize">
                  {p.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </SectionCard>
);

const CardView = ({ savedCards, transactions, loading }: { 
  savedCards: SavedCard[]; 
  transactions: Transaction[];
  loading: boolean;
}) => {
  if (loading) return null;

  // Calculate total spent from actual transactions
  const totalSpent = transactions.reduce((sum, t) => sum + (t.status === "paid" ? t.amount : 0), 0);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Saved Cards" value={savedCards.length.toString()} icon={CreditCard} accent="secondary" />
        <StatCard label="Total Spent" value={formatNGN(totalSpent)} icon={CreditCard} accent="muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionsCard transactions={transactions} />
        </div>
      </div>
    </>
  );
};

const HmoView = ({ coverage, transactions, loading }: { 
  coverage: HmoCoverage | null; 
  transactions: Transaction[];
  loading: boolean;
}) => {
  const { toast } = useToast();

  if (loading) return null;

  if (!coverage) {
    return (
      <SectionCard title="No HMO Coverage">
        <p className="text-muted-foreground text-center py-8">
          You don't have an active HMO coverage. Please contact your HR or enroll through your organization.
        </p>
        <Button className="w-full mt-4">Enroll in HMO</Button>
      </SectionCard>
    );
  }

  const pct = Math.min(100, Math.max(0, Math.round((coverage.usedNGN / coverage.annualLimitNGN) * 100)));
  const coveredServices = coverage.coveredServices || [];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 mb-6">
        <StatCard label="Card Provider" value={coverage.provider} icon={ShieldCheck} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Card Verification" description="Your coverage is active and verified">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <BadgeCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Coverage verified</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Last verified on {new Date(coverage.verifiedAt).toLocaleDateString()} · Valid until{" "}
                  {new Date(coverage.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <Badge>Active</Badge>
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mt-5">
              <div className="flex justify-between"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{coverage.plan}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Member ID</dt><dd className="font-medium">{coverage.memberId}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Policy No.</dt><dd className="font-medium">{coverage.policyNumber}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Support</dt><dd className="font-medium">{coverage.supportPhone}</dd></div>
            </dl>
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Annual limit usage</span>
                <span className="font-medium">{pct}%</span>
              </div>
              <ProgressBar pct={pct} />
              <div className="flex justify-between text-xs mt-2">
                <span className="text-muted-foreground">Used: {formatNGN(coverage.usedNGN)}</span>
                <span className="text-muted-foreground">Limit: {formatNGN(coverage.annualLimitNGN)}</span>
              </div>
            </div>
          </SectionCard>
          <TransactionsCard transactions={transactions} hideAmount methodOverride="HMO" />
        </div>
        <SectionCard title="Covered Services">
          {coveredServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No services listed</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {coveredServices.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
          <Button variant="outline" className="w-full mt-5">
            <Phone className="h-4 w-4" /> Contact Card Provider
          </Button>
        </SectionCard>
      </div>
    </>
  );
};

const SubscriptionView = ({ subscription, transactions, loading }: { 
  subscription: SubscriptionData | null; 
  transactions: Transaction[];
  loading: boolean;
}) => {
  const { toast } = useToast();

  const handleRenew = async () => {
    if (!subscription) return;
    if (USE_DEMO_DATA) {
      toast({
        title: "Demo Mode",
        description: "Subscription renewal would be processed here.",
      });
      return;
    }
    try {
      await api.me.subscriptions.renew(subscription.id);
      toast({
        title: "Subscription renewed",
        description: "Your subscription has been successfully renewed.",
      });
    } catch (error: any) {
      toast({
        title: "Renewal failed",
        description: error.message || "Could not renew subscription",
        variant: "destructive",
      });
    }
  };

  if (loading) return null;

  if (!subscription) {
    return (
      <SectionCard title="No Active Subscription">
        <p className="text-muted-foreground text-center py-8">
          You don't have an active subscription. Choose a plan that works for you.
        </p>
        <Button className="w-full mt-4" asChild>
          <a href="/subscription">View Plans</a>
        </Button>
      </SectionCard>
    );
  }

  const pct = Math.min(100, Math.max(0, Math.round((subscription.consultationsUsed / subscription.consultationsIncluded) * 100)));
  const perks = subscription.perks || [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active Plan" value={subscription.plan} icon={BadgeCheck} />
        <StatCard
          label="Consultations Left"
          value={`${subscription.consultationsIncluded - subscription.consultationsUsed}/${subscription.consultationsIncluded}`}
          icon={CalendarClock}
          accent="secondary"
        />
        <StatCard label="Renews On" value={new Date(subscription.renewsOn).toLocaleDateString()} icon={RefreshCw} accent="muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Subscription Details"
            description={`${subscription.billingCycle} · ${formatNGN(subscription.priceNGN)}`}
            action={<Button size="sm" onClick={handleRenew}>Renew now</Button>}
          >
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{subscription.plan}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><Badge className="capitalize">{subscription.status}</Badge></dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Started</dt><dd className="font-medium">{new Date(subscription.startedOn).toLocaleDateString()}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Renews</dt><dd className="font-medium">{new Date(subscription.renewsOn).toLocaleDateString()}</dd></div>
            </dl>
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Consultation balance</span>
                <span className="font-medium">{subscription.consultationsUsed} of {subscription.consultationsIncluded} used</span>
              </div>
              <ProgressBar pct={pct} />
            </div>
          </SectionCard>
          <TransactionsCard transactions={transactions} methodOverride="Subscription" hideAmount />
        </div>
        <SectionCard title="Plan Perks">
          {perks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No perks listed</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {perks.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
          <Button variant="outline" className="w-full mt-5">Upgrade plan</Button>
        </SectionCard>
      </div>
    </>
  );
};

const OrganizationView = ({ coverage, transactions, loading }: { 
  coverage: OrganizationCoverage | null; 
  transactions: Transaction[];
  loading: boolean;
}) => {
  if (loading) return null;

  if (!coverage) {
    return (
      <SectionCard title="No Organization Coverage">
        <p className="text-muted-foreground text-center py-8">
          You are not currently covered by any organization. Please contact your HR department.
        </p>
      </SectionCard>
    );
  }

  const pct = Math.min(100, Math.max(0, Math.round((coverage.consultationsUsed / coverage.consultationsCovered) * 100)));
  const coveredServices = coverage.coveredServices || [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Organization" value={coverage.name} icon={Building2} />
        <StatCard
          label="Consultations Covered"
          value={`${coverage.consultationsUsed}/${coverage.consultationsCovered}`}
          icon={CalendarClock}
          accent="secondary"
        />
        <StatCard label="Dependents" value={coverage.eligibleDependents.toString()} icon={Users} accent="muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Organization Coverage" description={coverage.coverageTier}>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Company</dt><dd className="font-medium">{coverage.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Employee ID</dt><dd className="font-medium">{coverage.employeeId}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Department</dt><dd className="font-medium">{coverage.department}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">HR Contact</dt><dd className="font-medium">{coverage.hrContact}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Valid Until</dt><dd className="font-medium">{new Date(coverage.validUntil).toLocaleDateString()}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tier</dt><dd className="font-medium">{coverage.coverageTier}</dd></div>
            </dl>
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Annual consultation usage</span>
                <span className="font-medium">{pct}%</span>
              </div>
              <ProgressBar pct={pct} />
            </div>
          </SectionCard>
          <TransactionsCard transactions={transactions} />
        </div>
        <SectionCard title="Covered Services">
          {coveredServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No services listed</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {coveredServices.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
          <Button variant="outline" className="w-full mt-5">
            <Phone className="h-4 w-4" /> Contact HR
          </Button>
        </SectionCard>
      </div>
    </>
  );
};

const Payments = () => {
  const [category] = usePatientCategory();
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState({ savedCards: [], transactions: [] });
  const [hmoData, setHmoData] = useState<HmoCoverage | null>(null);
  const [hmoTransactions, setHmoTransactions] = useState<Transaction[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [subscriptionTransactions, setSubscriptionTransactions] = useState<Transaction[]>([]);
  const [orgData, setOrgData] = useState<OrganizationCoverage | null>(null);
  const [orgTransactions, setOrgTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  const descriptions: Record<typeof category, string> = {
    card: "Track your billing and saved payment methods.",
    hmo: "Manage your Card verification, coverage and claims.",
    subscription: "Review your DesolMed subscription plan and usage.",
    organization: "View consultations covered by your organization.",
  };

  // Load all data at once
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      
      if (USE_DEMO_DATA) {
        // Simulate loading all data at once
        setTimeout(() => {
          setCardData({
            savedCards: [
              { id: "1", brand: "Visa", last4: "4242", expiryMonth: "08", expiryYear: "27", isDefault: true },
              { id: "2", brand: "Mastercard", last4: "1881", expiryMonth: "12", expiryYear: "26", isDefault: false },
            ],
            transactions: DEMO_CARD_TRANSACTIONS,
          });
          setHmoData(DEMO_HMO_COVERAGE);
          setHmoTransactions(DEMO_TRANSACTIONS);
          setSubscriptionData(DEMO_SUBSCRIPTION);
          setSubscriptionTransactions([]);
          setOrgData(DEMO_ORGANIZATION);
          setOrgTransactions(DEMO_TRANSACTIONS);
          setLoading(false);
        }, 1000);
        return;
      }
      
      // Real API calls - load all in parallel
      try {
        const [cardRes, hmoRes, subRes, orgRes] = await Promise.allSettled([
          // Card data - fetch saved cards and transactions
          Promise.resolve({ data: { savedCards: [], transactions: [] } }),
          // HMO data
          api.me.coverage.hmo.get().catch(() => ({ data: null })),
          // Subscription data
          api.me.subscriptions.list({ status: "active" }).catch(() => ({ data: [] })),
          // Organization data
          api.me.coverage.organization.get().catch(() => ({ data: null })),
        ]);
        
        // Process HMO data
        if (hmoRes.status === "fulfilled" && hmoRes.value?.data) {
          setHmoData(hmoRes.value.data);
        }
        
        // Process Subscription data
        if (subRes.status === "fulfilled" && subRes.value?.data && subRes.value.data.length > 0) {
          setSubscriptionData(subRes.value.data[0]);
        }
        
        // Process Organization data
        if (orgRes.status === "fulfilled" && orgRes.value?.data) {
          setOrgData(orgRes.value.data);
        }
      } catch (error) {
        console.error("Failed to load payment data:", error);
        toast({
          title: "Error loading data",
          description: "Could not load your payment information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, [toast]);

  // Show full page loading screen
  if (loading) {
    return <PaymentLoadingScreen />;
  }

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader
        title="Payments"
        description={descriptions[category]}
        action={<Badge variant="secondary">{categoryLabel(category)}</Badge>}
      />
      
      {category === "card" && (
        <CardView 
          savedCards={cardData.savedCards} 
          transactions={cardData.transactions} 
          loading={loading} 
        />
      )}
      {category === "hmo" && (
        <HmoView 
          coverage={hmoData} 
          transactions={hmoTransactions} 
          loading={loading} 
        />
      )}
      {category === "subscription" && (
        <SubscriptionView 
          subscription={subscriptionData} 
          transactions={subscriptionTransactions} 
          loading={loading} 
        />
      )}
      {category === "organization" && (
        <OrganizationView 
          coverage={orgData} 
          transactions={orgTransactions} 
          loading={loading} 
        />
      )}
    </PortalLayout>
  );
};

export default Payments;