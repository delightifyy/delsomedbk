import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { doctorNav } from "./nav";
import { ClipboardList, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type ClinicalNote = {
  id: string;
  patient: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  date: string;
};

const DoctorClinical = () => {
  const { toast } = useToast();
  const [patient, setPatient] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [records, setRecords] = useState<ClinicalNote[]>([]);

  const reset = () => {
    setPatient(""); setSymptoms(""); setDiagnosis(""); setNotes("");
  };

  const handleSave = () => {
    if (!patient.trim() || !symptoms.trim() || !diagnosis.trim()) {
      toast({ title: "Missing details", description: "Patient, symptoms and diagnosis are required.", variant: "destructive" });
      return;
    }
    setRecords((arr) => [
      { id: `cl_${Date.now()}`, patient, symptoms, diagnosis, notes, date: new Date().toISOString().slice(0, 10) },
      ...arr,
    ]);
    toast({ title: "Clinical note saved", description: `${patient} — ${diagnosis}` });
    reset();
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader title="Clinical Notes" description="Capture structured clinical notes for each encounter." />

      <SectionCard title="Structured Form" description="Record symptoms, diagnosis and clinical notes.">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="patient">Patient</Label>
            <Input id="patient" placeholder="e.g. Adaobi Okeke" value={patient} onChange={(e) => setPatient(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea id="symptoms" placeholder="Presenting complaints, onset, duration..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input id="diagnosis" placeholder="Working / final diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Examination findings, plan, follow-up..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={reset}>Clear</Button>
            <Button onClick={handleSave}><Save className="h-4 w-4" /> Save Note</Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Recent Clinical Notes" description="Notes saved during this session.">
        {records.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <ClipboardList className="h-8 w-8 opacity-50" />
            <p>No clinical notes yet. Fill the form above to add one.</p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {records.map((r) => (
              <li key={r.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{r.patient}</p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <Badge variant="outline">{r.diagnosis}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <div><span className="font-medium">Symptoms: </span><span className="text-muted-foreground">{r.symptoms}</span></div>
                  {r.notes && <div><span className="font-medium">Notes: </span><span className="text-muted-foreground">{r.notes}</span></div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </PortalLayout>
  );
};

export default DoctorClinical;
