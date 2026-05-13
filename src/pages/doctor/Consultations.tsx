import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { doctorNav } from "./nav";
import { doctorMock } from "@/data/portalMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";
import { Link } from "react-router-dom";

const Consultations = () => (
  <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
    <PageHeader title="Consultations" description="All scheduled and active consultations." />
    <SectionCard>
      <div className="space-y-2">
        {doctorMock.todaySchedule.map((c) => (
          <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors">
            <div className="w-16 text-sm font-bold font-display">{c.time}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.patient}</p>
              <p className="text-xs text-muted-foreground truncate">{c.reason}</p>
            </div>
            <Badge variant={c.status === "in_progress" ? "default" : "outline"} className="capitalize hidden sm:inline-flex">
              {c.status.replace("_", " ")}
            </Badge>
            <Button size="sm" asChild><Link to={`/doctor/consultations/${c.id}`}><Video className="h-3.5 w-3.5" /> Open</Link></Button>
          </div>
        ))}
      </div>
    </SectionCard>
  </PortalLayout>
);

export default Consultations;
