import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { doctorNav } from "./nav";
import { doctorMock } from "@/data/portalMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Video, FileText } from "lucide-react";
import { Link } from "react-router-dom";

type PatientRecord = {
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  history: { date: string; note: string }[];
};

const patientRecords: Record<string, PatientRecord> = {
  "Adaobi Okeke": {
    age: 33, gender: "Female", bloodGroup: "O+",
    phone: "+234 803 123 4567", email: "adaobi.okeke@example.com",
    address: "12 Admiralty Way, Lekki, Lagos",
    allergies: ["Penicillin", "Peanuts"],
    medications: ["Lisinopril 10mg — daily", "Vitamin D3 2000 IU — daily"],
    conditions: ["Hypertension (2024)", "Mild asthma (childhood)"],
    history: [
      { date: "Apr 28, 2026", note: "Cardiology consult — BP 138/86, adjusted dose" },
      { date: "Mar 12, 2026", note: "Wellness check — labs normal" },
      { date: "Jan 09, 2026", note: "Sinusitis — completed antibiotic course" },
    ],
  },
  "Tunde Bakare": {
    age: 41, gender: "Male", bloodGroup: "A+",
    phone: "+234 802 555 7821", email: "tunde.bakare@example.com",
    address: "5 Bourdillon Road, Ikoyi, Lagos",
    allergies: ["Sulfa drugs"],
    medications: ["Salbutamol inhaler — PRN", "Montelukast 10mg — nightly"],
    conditions: ["Asthma (2018)", "Seasonal allergies"],
    history: [
      { date: "Apr 21, 2026", note: "Asthma review — peak flow stable" },
      { date: "Feb 18, 2026", note: "Upper respiratory infection" },
      { date: "Nov 03, 2025", note: "Annual physical — cleared" },
    ],
  },
  "Ngozi Eze": {
    age: 29, gender: "Female", bloodGroup: "B+",
    phone: "+234 805 992 1145", email: "ngozi.eze@example.com",
    address: "8 Awolowo Road, Ikoyi, Lagos",
    allergies: ["None known"],
    medications: ["Sumatriptan 50mg — PRN", "Propranolol 40mg — daily"],
    conditions: ["Chronic migraine (2022)"],
    history: [
      { date: "Apr 15, 2026", note: "Migraine review — frequency reduced" },
      { date: "Jan 30, 2026", note: "Neurology referral follow-up" },
      { date: "Oct 12, 2025", note: "MRI brain — unremarkable" },
    ],
  },
  "Yusuf Lawal": {
    age: 56, gender: "Male", bloodGroup: "AB+",
    phone: "+234 806 441 8830", email: "yusuf.lawal@example.com",
    address: "22 Glover Road, Ikoyi, Lagos",
    allergies: ["Aspirin"],
    medications: ["Metformin 1g — twice daily", "Atorvastatin 20mg — nightly"],
    conditions: ["Type 2 Diabetes (2019)", "Hyperlipidaemia"],
    history: [
      { date: "Apr 10, 2026", note: "Diabetes review — HbA1c 7.1%" },
      { date: "Feb 02, 2026", note: "Foot exam — no neuropathy" },
      { date: "Sep 15, 2025", note: "Lipid panel — improved" },
    ],
  },
  "Blessing Okafor": {
    age: 24, gender: "Female", bloodGroup: "O-",
    phone: "+234 807 220 3399", email: "blessing.okafor@example.com",
    address: "14 Adeola Odeku, Victoria Island, Lagos",
    allergies: ["Nickel", "Latex"],
    medications: ["Hydrocortisone cream 1% — topical"],
    conditions: ["Atopic eczema (childhood)"],
    history: [
      { date: "Mar 30, 2026", note: "Eczema flare — topical steroid prescribed" },
      { date: "Dec 11, 2025", note: "Wellness visit" },
      { date: "Jun 04, 2025", note: "Patch test — nickel positive" },
    ],
  },
  "Samuel Idris": {
    age: 47, gender: "Male", bloodGroup: "A-",
    phone: "+234 809 776 5520", email: "samuel.idris@example.com",
    address: "3 Banana Island Road, Ikoyi, Lagos",
    allergies: ["None known"],
    medications: ["Multivitamin — daily"],
    conditions: ["No chronic conditions"],
    history: [
      { date: "Mar 22, 2026", note: "Annual physical — all parameters normal" },
      { date: "Mar 22, 2025", note: "Annual physical — cleared" },
      { date: "Apr 18, 2024", note: "Travel vaccinations" },
    ],
  },
};

const Consultations = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = openId ? doctorMock.todaySchedule.find(c => c.id === openId) : null;
  const record = active ? patientRecords[active.patient] : null;

  return (
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
              <Button size="sm" variant="outline" onClick={() => setOpenId(c.id)}>
                <FileText className="h-3.5 w-3.5" /> Details
              </Button>
              <Button size="sm" asChild><Link to={`/doctor/consultations/${c.id}`}><Video className="h-3.5 w-3.5" /> Open</Link></Button>
            </div>
          ))}
        </div>
      </SectionCard>

      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {active && record && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {active.patient.split(" ").map(s => s[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{active.patient}</DialogTitle>
                    <DialogDescription>
                      {record.age} yrs • {record.gender} • Blood {record.bloodGroup}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                <Block title="Appointment">
                  <Row label="Time" value={active.time} />
                  <Row label="Reason" value={active.reason} />
                  <Row label="Status" value={active.status.replace("_", " ")} />
                </Block>

                <Block title="Contact">
                  <Row label="Phone" value={record.phone} />
                  <Row label="Email" value={record.email} />
                  <Row label="Address" value={record.address} />
                </Block>

                <Block title="Allergies">
                  <div className="flex flex-wrap gap-1.5">
                    {record.allergies.map(a => <Badge key={a} variant="secondary">{a}</Badge>)}
                  </div>
                </Block>

                <Block title="Current Medications">
                  <ul className="text-sm space-y-1 list-disc pl-5">
                    {record.medications.map(m => <li key={m}>{m}</li>)}
                  </ul>
                </Block>

                <Block title="Medical Conditions">
                  <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
                    {record.conditions.map(c => <li key={c}>{c}</li>)}
                  </ul>
                </Block>

                <Block title="Visit History">
                  <ul className="space-y-2">
                    {record.history.map((h, i) => (
                      <li key={i} className="text-sm border-l-2 border-primary/40 pl-3">
                        <div className="font-medium">{h.date}</div>
                        <div className="text-muted-foreground text-xs">{h.note}</div>
                      </li>
                    ))}
                  </ul>
                </Block>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpenId(null)}>Close</Button>
                  <Button asChild><Link to={`/doctor/consultations/${active.id}`}><Video className="h-3.5 w-3.5" /> Start consultation</Link></Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">{title}</p>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm py-1 border-b border-border/40 last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right capitalize">{value}</span>
  </div>
);

export default Consultations;
