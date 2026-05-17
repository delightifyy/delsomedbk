import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard, StatCard } from "@/components/portal/PortalUI";
import { orgNav } from "./nav";
import { orgMock, formatNGN } from "@/data/portalMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Calendar, Building2, Download } from "lucide-react";

export const Billing = () => (
  <PortalLayout portalName="HMO Portal" nav={orgNav}>
    <PageHeader title="Billing" description="Subscription, balance, and payment summary." />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard label="Current Balance" value={formatNGN(0)} icon={Wallet} />
      <StatCard label="Next Billing" value="Jun 1, 2026" icon={Calendar} accent="secondary" />
      <StatCard label="Plan" value="Enterprise" icon={Building2} accent="muted" />
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <SectionCard title="Subscription" className="lg:col-span-2">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-medium">Enterprise — Annual</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Members covered</span><span className="font-medium">{orgMock.org.members.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Per-member rate</span><span className="font-medium">{formatNGN(6500)}/mo</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Renewal</span><span className="font-medium">Jan 1, 2027</span></div>
          <div className="pt-3 border-t border-border/60 flex gap-2">
            <Button>Manage subscription</Button>
            <Button variant="outline">Download receipt</Button>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Payment Method">
        <div className="rounded-lg bg-gradient-to-br from-primary/90 to-primary p-5 text-primary-foreground">
          <p className="text-xs opacity-80">Visa •••• 4242</p>
          <p className="font-display font-bold text-lg mt-2">Sterling HMO</p>
          <p className="text-xs opacity-80 mt-1">Exp 09/28</p>
        </div>
        <Button variant="outline" className="w-full mt-4">Update payment method</Button>
      </SectionCard>
    </div>
  </PortalLayout>
);

export const Invoices = () => (
  <PortalLayout portalName="HMO Portal" nav={orgNav}>
    <PageHeader title="Invoices" description="Download and review your invoice history." />
    <SectionCard>
      <Table>
        <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {orgMock.invoices.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="font-medium">{i.id}</TableCell>
              <TableCell className="text-muted-foreground">{i.date}</TableCell>
              <TableCell className="text-right font-medium">{formatNGN(i.amount)}</TableCell>
              <TableCell><Badge variant="default" className="capitalize">{i.status}</Badge></TableCell>
              <TableCell><Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /> PDF</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  </PortalLayout>
);

export const OrgSettings = () => (
  <PortalLayout portalName="HMO Portal" nav={orgNav}>
    <PageHeader title="Settings" description="HMO preferences and account." />
    <SectionCard title="HMO profile">
      <p className="text-sm text-muted-foreground">Settings editor coming soon.</p>
    </SectionCard>
  </PortalLayout>
);
