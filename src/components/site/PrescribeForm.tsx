import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Plus, Trash2, FileText, Printer, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Doctor } from "@/data/doctors";

type Item = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
};

const FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "As needed",
  "At bedtime",
];

const blank = (): Item => ({
  id: crypto.randomUUID(),
  name: "",
  dosage: "",
  frequency: "Twice daily",
  duration: "",
  notes: "",
});

export const PrescribeForm = ({ doctor }: { doctor: Doctor }) => {
  const { toast } = useToast();
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [items, setItems] = useState<Item[]>([blank()]);
  const [generalNotes, setGeneralNotes] = useState("");

  const update = (id: string, field: keyof Item, value: string) =>
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const addItem = () => setItems((arr) => [...arr, blank()]);
  const removeItem = (id: string) =>
    setItems((arr) => (arr.length === 1 ? arr : arr.filter((i) => i.id !== id)));

  const reset = () => {
    setPatientName("");
    setPatientEmail("");
    setDiagnosis("");
    setItems([blank()]);
    setGeneralNotes("");
  };

  const validate = () => {
    if (!patientName.trim()) return "Please enter the patient's name.";
    if (items.some((i) => !i.name.trim() || !i.dosage.trim())) return "Each medicine needs a name and dosage.";
    return null;
  };

  const handleSend = () => {
    const err = validate();
    if (err) return toast({ title: "Missing details", description: err, variant: "destructive" });
    toast({
      title: "Prescription sent",
      description: `Sent to ${patientName}${patientEmail ? ` (${patientEmail})` : ""}.`,
    });
    reset();
  };

  const handlePrint = () => {
    const err = validate();
    if (err) return toast({ title: "Missing details", description: err, variant: "destructive" });
    window.print();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary grid place-items-center flex-shrink-0">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold leading-tight">Prescribe medication</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Issued by <span className="font-medium text-foreground">{doctor.name}</span> · {doctor.specialty}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
          <FileText className="h-3 w-3" /> E-Prescription
        </div>
      </div>

      {/* Patient */}
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pname">Patient name</Label>
          <Input id="pname" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g. Adaeze N." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pemail">Patient email (optional)</Label>
          <Input id="pemail" type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="patient@email.com" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="diag">Diagnosis / reason</Label>
          <Input id="diag" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Acute bronchitis" />
        </div>
      </div>

      {/* Medicines */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold tracking-wider">Medicines</h3>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" /> Add medicine
          </Button>
        </div>

        <div className="mt-3 space-y-3">
          {items.map((it, idx) => (
            <div key={it.id} className="rounded-xl border border-border p-4 bg-background">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                  Medicine {idx + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(it.id)}
                  disabled={items.length === 1}
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">Drug name</Label>
                  <Input value={it.name} onChange={(e) => update(it.id, "name", e.target.value)} placeholder="e.g. Amoxicillin 500mg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Dosage</Label>
                  <Input value={it.dosage} onChange={(e) => update(it.id, "dosage", e.target.value)} placeholder="e.g. 1 tablet" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Frequency</Label>
                  <Select value={it.frequency} onValueChange={(v) => update(it.id, "frequency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duration</Label>
                  <Input value={it.duration} onChange={(e) => update(it.id, "duration", e.target.value)} placeholder="e.g. 7 days" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Instructions</Label>
                  <Input value={it.notes} onChange={(e) => update(it.id, "notes", e.target.value)} placeholder="e.g. After meals" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="gnotes">General notes</Label>
        <Textarea
          id="gnotes"
          rows={3}
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="Lifestyle advice, follow-up date, warnings…"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="hero" onClick={handleSend}>
          <Send className="h-4 w-4" /> Send to patient
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print prescription
        </Button>
        <Button variant="ghost" onClick={reset} className="ml-auto">
          Clear form
        </Button>
      </div>
    </div>
  );
};
