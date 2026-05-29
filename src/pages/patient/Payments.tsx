import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, StatCard, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { patientMock, formatNGN } from "@/data/portalMock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  CreditCard,
  Building2,
  ShieldCheck,
  BadgeCheck,
  CalendarClock,
  Users,
  RefreshCw,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { usePatientCategory, categoryLabel } from "@/hooks/usePatientCategory";

const ProgressBar = ({ pct }: { pct: number }) => (
  <div className="h-2 rounded-full bg-muted overflow-hidden">
    <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
  </div>
);

const TransactionsCard = ({ hideAmount = false }: { hideAmount?: boolean }) => (
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
        {patientMock.payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
            <TableCell className="font-medium text-sm">{p.description}</TableCell>
            <TableCell><Badge variant="outline">{p.method}</Badge></TableCell>
            {!hideAmount && <TableCell className="text-right font-medium">{formatNGN(p.amount)}</TableCell>}
            <TableCell>
              <Badge variant={p.status === "paid" ? "default" : "secondary"} className="capitalize">
                {p.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </SectionCard>
);

const CardView = () => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <StatCard label="Saved Cards" value="2" icon={CreditCard} accent="secondary" />
      <StatCard label="This Month" value={formatNGN(30000)} icon={CreditCard} accent="muted" />
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2"><TransactionsCard /></div>
      <SectionCard title="Saved Cards" description="Manage your payment methods">
        <div className="space-y-3 text-sm">
          {[
            { brand: "Visa", last4: "4242", exp: "08/27" },
            { brand: "Mastercard", last4: "1881", exp: "12/26" },
          ].map((c) => (
            <div key={c.last4} className="flex items-center justify-between p-3 rounded-lg border border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-12 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                  {c.brand}
                </div>
                <div>
                  <p className="font-medium">•••• {c.last4}</p>
                  <p className="text-xs text-muted-foreground">Expires {c.exp}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Remove</Button>
            </div>
          ))}
          <Button className="w-full" variant="outline">
            <CreditCard className="h-4 w-4" /> Add new card
          </Button>
        </div>
      </SectionCard>
    </div>
  </>
);

const HmoView = () => {
  const h = patientMock.hmo;
  const pct = Math.round((h.usedNGN / h.annualLimitNGN) * 100);
  return (
    <>
      <div className="grid grid-cols-1 gap-4 mb-6">
        <StatCard label="Card Provider" value={h.provider} icon={ShieldCheck} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Card Verification" description="Your coverage is active and verified">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <BadgeCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Coverage verified</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Last verified on {new Date(h.verifiedAt).toLocaleDateString()} · Valid until{" "}
                  {new Date(h.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <Badge>Active</Badge>
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mt-5">
              <div className="flex justify-between"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{h.plan}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Member ID</dt><dd className="font-medium">{h.memberId}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Policy No.</dt><dd className="font-medium">{h.policyNumber}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Support</dt><dd className="font-medium">{h.supportPhone}</dd></div>
            </dl>
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Annual limit usage</span>
                <span className="font-medium">{pct}%</span>
              </div>
              <ProgressBar pct={pct} />
            </div>
          </SectionCard>
          <TransactionsCard hideAmount />
        </div>
        <SectionCard title="Covered Services">
          <ul className="space-y-2 text-sm">
            {h.coveredServices.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full mt-5">
            <Phone className="h-4 w-4" /> Contact Card Provider
          </Button>
        </SectionCard>
      </div>
    </>
  );
};

const SubscriptionView = () => {
  const s = patientMock.subscription;
  const pct = Math.round((s.consultationsUsed / s.consultationsIncluded) * 100);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active Plan" value={s.plan} icon={BadgeCheck} />
        <StatCard
          label="Consultations Left"
          value={`${s.consultationsIncluded - s.consultationsUsed}/${s.consultationsIncluded}`}
          icon={CalendarClock}
          accent="secondary"
        />
        <StatCard label="Renews On" value={new Date(s.renewsOn).toLocaleDateString()} icon={RefreshCw} accent="muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Subscription Details"
            description={`${s.billingCycle} · ${formatNGN(s.priceNGN)}`}
            action={<Button size="sm">Renew now</Button>}
          >
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{s.plan}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><Badge className="capitalize">{s.status}</Badge></dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Started</dt><dd className="font-medium">{new Date(s.startedOn).toLocaleDateString()}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Renews</dt><dd className="font-medium">{new Date(s.renewsOn).toLocaleDateString()}</dd></div>
            </dl>
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Consultation balance</span>
                <span className="font-medium">{s.consultationsUsed} of {s.consultationsIncluded} used</span>
              </div>
              <ProgressBar pct={pct} />
            </div>
          </SectionCard>
          <TransactionsCard />
        </div>
        <SectionCard title="Plan Perks">
          <ul className="space-y-2 text-sm">
            {s.perks.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full mt-5">Upgrade plan</Button>
        </SectionCard>
      </div>
    </>
  );
};

const OrganizationView = () => {
  const o = patientMock.organization;
  const pct = Math.round((o.consultationsUsed / o.consultationsCovered) * 100);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Organization" value={o.name} icon={Building2} />
        <StatCard
          label="Consultations Covered"
          value={`${o.consultationsUsed}/${o.consultationsCovered}`}
          icon={CalendarClock}
          accent="secondary"
        />
        <StatCard label="Dependents" value={o.eligibleDependents} icon={Users} accent="muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Organization Coverage" description={o.coverageTier}>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Company</dt><dd className="font-medium">{o.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Employee ID</dt><dd className="font-medium">{o.employeeId}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Department</dt><dd className="font-medium">{o.department}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">HR Contact</dt><dd className="font-medium">{o.hrContact}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Valid Until</dt><dd className="font-medium">{new Date(o.validUntil).toLocaleDateString()}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tier</dt><dd className="font-medium">{o.coverageTier}</dd></div>
            </dl>
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Annual consultation usage</span>
                <span className="font-medium">{pct}%</span>
              </div>
              <ProgressBar pct={pct} />
            </div>
          </SectionCard>
          <TransactionsCard />
        </div>
        <SectionCard title="Covered Services">
          <ul className="space-y-2 text-sm">
            {o.coveredServices.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
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
  const descriptions: Record<typeof category, string> = {
    card: "Track your billing and saved payment methods.",
    hmo: "Manage your Card verification, coverage and claims.",
    subscription: "Review your DesolMed subscription plan and usage.",
    organization: "View consultations covered by your organization.",
  };
  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader
        title="Payments"
        description={descriptions[category]}
        action={<Badge variant="secondary">{categoryLabel(category)}</Badge>}
      />
      {category === "card" && <CardView />}
      {category === "hmo" && <HmoView />}
      {category === "subscription" && <SubscriptionView />}
      {category === "organization" && <OrganizationView />}
    </PortalLayout>
  );
};

export default Payments;
