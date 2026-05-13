import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, StatCard, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { patientMock, formatNGN } from "@/data/portalMock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, Building2 } from "lucide-react";

const Payments = () => (
  <PortalLayout portalName="Patient Portal" nav={patientNav}>
    <PageHeader title="Payments" description="Track your billing, subscriptions and HMO usage." />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard label="Wallet Balance" value={formatNGN(patientMock.stats.balanceNGN)} icon={Wallet} />
      <StatCard label="Active Plan" value="HMO Premium" icon={Building2} accent="secondary" />
      <StatCard label="This Month" value={formatNGN(30000)} icon={CreditCard} accent="muted" />
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionCard title="Transaction History">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientMock.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
                  <TableCell className="font-medium text-sm">{p.description}</TableCell>
                  <TableCell><Badge variant="outline">{p.method}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{formatNGN(p.amount)}</TableCell>
                  <TableCell><Badge variant={p.status === "paid" ? "default" : "secondary"} className="capitalize">{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>

      <SectionCard title="HMO Coverage" description="Sterling HMO • Premium">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Member ID</span><span className="font-medium">SHMO-19284</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Annual Limit</span><span className="font-medium">{formatNGN(2000000)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Used</span><span className="font-medium">{formatNGN(640000)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Renews</span><span className="font-medium">Jan 2027</span></div>
          <div className="pt-3 border-t border-border/60">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "32%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">32% of annual limit used</p>
          </div>
        </div>
      </SectionCard>
    </div>
  </PortalLayout>
);

export default Payments;
