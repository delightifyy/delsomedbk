import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, StatCard, SectionCard } from "@/components/portal/PortalUI";
import { orgNav } from "./nav";
import { orgMock, formatNGN } from "@/data/portalMock";
import { Users, Activity, Wallet, Gauge } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

const OrgDashboard = () => (
  <PortalLayout portalName="HMO Portal" nav={orgNav}>
    <PageHeader title={orgMock.org.name} description={`${orgMock.org.plan} plan • ${orgMock.org.members.toLocaleString()} members`} />

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Active Staff" value={orgMock.stats.activeStaff.toLocaleString()} icon={Users} />
      <StatCard label="Consultations" value={orgMock.stats.monthlyConsultations} icon={Activity} accent="secondary" trend="this month" />
      <StatCard label="Spend" value={formatNGN(orgMock.stats.monthlySpendNGN)} icon={Wallet} />
      <StatCard label="Utilization" value={`${orgMock.stats.utilizationPct}%`} icon={Gauge} accent="muted" />
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      <SectionCard title="Monthly Consultations" className="lg:col-span-2">
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={orgMock.monthlyUsage}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Line type="monotone" dataKey="consultations" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Recent Activity">
        <ul className="space-y-3 text-sm">
          <li className="border-l-2 border-primary pl-3"><p>14 new consultations today</p><p className="text-xs text-muted-foreground">across 5 departments</p></li>
          <li className="border-l-2 border-border pl-3"><p>Invoice INV-2026-005 paid</p><p className="text-xs text-muted-foreground">2 days ago</p></li>
          <li className="border-l-2 border-border pl-3"><p>3 new staff onboarded</p><p className="text-xs text-muted-foreground">last week</p></li>
        </ul>
      </SectionCard>
    </div>

    <SectionCard title="Department Usage" className="mt-6">
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={orgMock.departmentUsage}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="dept" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="consultations" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  </PortalLayout>
);

export default OrgDashboard;
