import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, EmptyState } from "@/components/portal/PortalUI";
import { doctorNav } from "./nav";
import { Pill, FlaskConical, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/portal/PortalUI";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const initialRx = [
  { id: "rx_a01", patient: "Adaobi Okeke", med: "Lisinopril 10mg", date: "2026-04-28", status: "active" },
  { id: "rx_a02", patient: "Tunde Bakare", med: "Salbutamol Inhaler", date: "2026-04-21", status: "active" },
  { id: "rx_a03", patient: "Ngozi Eze", med: "Sumatriptan 50mg", date: "2026-04-15", status: "completed" },
];

export const DoctorPrescriptions = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rxList, setRxList] = useState(initialRx);
  const [drug, setDrug] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");

  const reset = () => { setDrug(""); setDosage(""); setInstructions(""); };

  const handleSave = () => {
    if (!drug.trim() || !dosage.trim()) {
      toast({ title: "Missing details", description: "Drug name and dosage are required.", variant: "destructive" });
      return;
    }
    setRxList((arr) => [
      { id: `rx_${Date.now()}`, patient: "New Patient", med: `${drug} ${dosage}`.trim(), date: new Date().toISOString().slice(0, 10), status: "active" },
      ...arr,
    ]);
    toast({ title: "Prescription created", description: `${drug} ${dosage}` });
    reset();
    setOpen(false);
  };

  return (
  <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
    <PageHeader title="Prescriptions" description="All prescriptions you've issued." action={<Button onClick={() => setOpen(true)}><Pill className="h-4 w-4" /> New Prescription</Button>} />
    <SectionCard>
      <Table>
        <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Medication</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          {rxList.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.patient}</TableCell>
              <TableCell>{r.med}</TableCell>
              <TableCell className="text-muted-foreground">{r.date}</TableCell>
              <TableCell><Badge variant={r.status === "active" ? "default" : "outline"} className="capitalize">{r.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>

    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Prescription</DialogTitle>
          <DialogDescription>Enter the medication details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drug">Drug name</Label>
            <Input id="drug" value={drug} onChange={(e) => setDrug(e.target.value)} placeholder="e.g. Amoxicillin" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage</Label>
            <Input id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 500mg twice daily" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea id="instructions" rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Take after meals for 7 days" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Prescription</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </PortalLayout>
  );
};

export const DoctorInvestigations = () => (
  <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
    <PageHeader title="Investigations" description="Lab requests and diagnostic orders." action={<Button><FlaskConical className="h-4 w-4" /> New Request</Button>} />
    <EmptyState icon={FlaskConical} title="No pending investigations" description="When you order labs or imaging during a consultation, they'll appear here." action={<Button variant="outline">View archive</Button>} />
  </PortalLayout>
);

export const DoctorReferrals = () => (
  <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
    <PageHeader title="Referrals" description="Specialist referrals you've issued." action={<Button><Send className="h-4 w-4" /> New Referral</Button>} />
    <EmptyState icon={Send} title="No active referrals" description="Referrals you send to specialists will appear here." />
  </PortalLayout>
);

export const DoctorSettings = () => (
  <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
    <PageHeader title="Settings" description="Manage your profile and preferences." />
    <SectionCard title="Profile">
      <p className="text-sm text-muted-foreground">Profile editor coming soon. Contact support to update your license details.</p>
    </SectionCard>
  </PortalLayout>
);
