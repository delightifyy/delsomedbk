import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { patientMock } from "@/data/portalMock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Pill } from "lucide-react";

const Prescriptions = () => (
  <PortalLayout portalName="Patient Portal" nav={patientNav}>
    <PageHeader title="Prescriptions" description="Active and past medications prescribed to you." />
    <div className="grid gap-4 md:grid-cols-2">
      {patientMock.prescriptions.map((rx) => (
        <SectionCard key={rx.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Pill className="h-5 w-5" /></div>
              <div>
                <p className="font-display font-semibold">{rx.medication}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{rx.dosage}</p>
                <p className="text-xs text-muted-foreground mt-2">Prescribed by <span className="text-foreground font-medium">{rx.doctor}</span></p>
                <p className="text-xs text-muted-foreground">{rx.date} • {rx.refills} refills left</p>
              </div>
            </div>
            <Badge variant={rx.status === "active" ? "default" : "outline"} className="capitalize">{rx.status}</Badge>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> Download</Button>
            {rx.status === "active" && <Button size="sm">Request Refill</Button>}
          </div>
        </SectionCard>
      ))}
    </div>
  </PortalLayout>
);

export default Prescriptions;
