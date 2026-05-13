import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { patientMock } from "@/data/portalMock";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Stethoscope, Pill, Paperclip } from "lucide-react";

const MedicalRecords = () => {
  const [q, setQ] = useState("");
  const filtered = patientMock.records.filter((r) =>
    [r.title, r.doctor, r.diagnosis, r.treatment].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader title="Medical Records" description="Your full clinical history in one place." />

      <SectionCard>
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search records, diagnoses, treatments..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>

        <div className="relative pl-6 border-l-2 border-border/60 space-y-6">
          {filtered.map((r) => (
            <div key={r.id} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
              <Accordion type="single" collapsible>
                <AccordionItem value={r.id} className="border border-border/60 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs text-muted-foreground">{r.date} • {r.doctor}</span>
                      <span className="font-medium">{r.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 sm:grid-cols-2 pb-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Stethoscope className="h-3 w-3" /> Diagnosis</p>
                        <p className="text-sm mt-1">{r.diagnosis}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Pill className="h-3 w-3" /> Treatment</p>
                        <p className="text-sm mt-1">{r.treatment}</p>
                      </div>
                      {r.attachments.length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2"><Paperclip className="h-3 w-3" /> Attachments</p>
                          <div className="flex flex-wrap gap-2">
                            {r.attachments.map((f) => (
                              <Badge key={f} variant="secondary" className="gap-1"><FileText className="h-3 w-3" />{f}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      </SectionCard>
    </PortalLayout>
  );
};

export default MedicalRecords;
