import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { doctorNav } from "./nav";
import { doctorMock } from "@/data/portalMock";
import { Badge } from "@/components/ui/badge";

const Schedule = () => (
  <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
    <PageHeader title="Schedule" description="Your week at a glance." />
    <SectionCard title={new Date().toDateString()}>
      <div className="space-y-2">
        {doctorMock.todaySchedule.map((c) => (
          <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/60">
            <div className="w-16 text-sm font-bold font-display">{c.time}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{c.patient}</p>
              <p className="text-xs text-muted-foreground">{c.reason}</p>
            </div>
            <Badge variant="outline" className="capitalize">{c.status.replace("_", " ")}</Badge>
          </div>
        ))}
      </div>
    </SectionCard>
  </PortalLayout>
);

export default Schedule;
