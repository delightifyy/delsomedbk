import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard, StatCard } from "@/components/portal/PortalUI";
import { orgNav } from "./nav";
import { orgMock } from "@/data/portalMock";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, AreaChart, Area } from "recharts";
import { Activity, TrendingUp, Gauge } from "lucide-react";

const Usage = () => (
  <PortalLayout portalName="HMO Portal" nav={orgNav}>
    <PageHeader title="Usage Tracking" description="Consultation utilization across your organization." />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard label="This Month" value={orgMock.stats.monthlyConsultations} icon={Activity} />
      <StatCard label="vs Last Month" value="+4.0%" icon={TrendingUp} accent="secondary" />
      <StatCard label="Utilization" value={`${orgMock.stats.utilizationPct}%`} icon={Gauge} accent="muted" />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Monthly Trend">
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={orgMock.monthlyUsage}>
              <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" /><YAxis className="text-xs" /><Tooltip />
              <Area type="monotone" dataKey="consultations" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
      <SectionCard title="By Department">
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={orgMock.departmentUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" /><YAxis dataKey="dept" type="category" className="text-xs" width={90} /><Tooltip />
              <Bar dataKey="consultations" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  </PortalLayout>
);

export default Usage;
