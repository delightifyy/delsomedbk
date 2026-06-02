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

export const DoctorSettings = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    fullName: "Dr. Chinedu Okafor",
    title: "Consultant Cardiologist",
    specialty: "Cardiology",
    license: "MDCN/2014/45821",
    yearsExperience: "12",
    hospital: "Desolmed Medical Centre",
    email: "chinedu.okafor@desolmed.com",
    phone: "+234 802 345 6789",
    address: "12 Awolowo Road, Ikoyi, Lagos",
    bio: "Board-certified cardiologist with a focus on preventive cardiology, hypertension management and echocardiography.",
    languages: "English, Igbo, Yoruba",
    consultationFee: "25000",
  });
  const [prefs, setPrefs] = useState({ emailNotif: true, smsNotif: false, autoAccept: false });

  const update = (k: keyof typeof profile, v: string) => setProfile((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    toast({ title: "Profile updated", description: "Your doctor details have been saved." });
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader title="Settings" description="Manage your profile, credentials and preferences." />

      <SectionCard title="Doctor Profile" description="Personal information shown to patients and staff.">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
            {profile.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <p className="text-lg font-semibold">{profile.fullName}</p>
            <p className="text-sm text-muted-foreground">{profile.title}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant="secondary">{profile.specialty}</Badge>
              <Badge variant="outline">{profile.yearsExperience} yrs exp</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={profile.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={profile.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input id="specialty" value={profile.specialty} onChange={(e) => update("specialty", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="license">Medical License No.</Label>
            <Input id="license" value={profile.license} onChange={(e) => update("license", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="years">Years of Experience</Label>
            <Input id="years" type="number" value={profile.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hospital">Hospital / Clinic</Label>
            <Input id="hospital" value={profile.hospital} onChange={(e) => update("hospital", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fee">Consultation Fee (₦)</Label>
            <Input id="fee" type="number" value={profile.consultationFee} onChange={(e) => update("consultationFee", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lang">Languages</Label>
            <Input id="lang" value={profile.languages} onChange={(e) => update("languages", e.target.value)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contact Information" description="How patients and the clinic can reach you.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={profile.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={profile.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea id="bio" rows={4} value={profile.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Preferences" description="Notification and consultation preferences.">
        <div className="grid gap-3">
          {[
            { key: "emailNotif", label: "Email notifications for new appointments" },
            { key: "smsNotif", label: "SMS notifications for urgent updates" },
            { key: "autoAccept", label: "Auto-accept appointments from existing patients" },
          ].map((p) => (
            <label key={p.key} className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">{p.label}</span>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={prefs[p.key as keyof typeof prefs]}
                onChange={(e) => setPrefs((s) => ({ ...s, [p.key]: e.target.checked }))}
              />
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </SectionCard>
    </PortalLayout>
  );
};

