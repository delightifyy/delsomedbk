import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { doctorNav } from "./nav";
import { doctorMock } from "@/data/portalMock";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Search, X, Calendar, Clock, Pill, FileText, User, Activity } from "lucide-react";

// Comprehensive mock data for patient records - matched by patient name
const patientRecordsByName: Record<string, {
  prescriptions: Array<{
    id: string;
    medication: string;
    dosage: string;
    instructions: string;
    date: string;
    time: string;
    status: string;
    refills: number;
  }>;
  clinicalNotes: Array<{
    id: string;
    date: string;
    time: string;
    symptoms: string;
    diagnosis: string;
    notes: string;
    doctor: string;
  }>;
}> = {
  "Adaobi Okeke": {
    prescriptions: [
      { id: "rx_001", medication: "Lisinopril", dosage: "10mg", instructions: "Take one tablet daily in the morning. Do not stop abruptly.", date: "2026-06-10", time: "09:30 AM", status: "Active", refills: 2 },
      { id: "rx_002", medication: "Amlodipine", dosage: "5mg", instructions: "Take one tablet daily in the evening with food.", date: "2026-05-15", time: "02:15 PM", status: "Active", refills: 1 },
      { id: "rx_013", medication: "Hydrochlorothiazide", dosage: "25mg", instructions: "Take one tablet daily in the morning with breakfast.", date: "2026-04-20", time: "10:00 AM", status: "Completed", refills: 0 },
    ],
    clinicalNotes: [
      { id: "cn_001", date: "2026-06-10", time: "09:30 AM", symptoms: "Chest pain, shortness of breath, palpitations. Pain worsens with exertion.", diagnosis: "I10 - Essential Hypertension with Angina", notes: "BP 150/95, HR 88. ECG shows sinus tachycardia. Started on Lisinopril 10mg daily. Referred to cardiology for stress test. Follow-up in 2 weeks.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_002", date: "2026-05-15", time: "02:15 PM", symptoms: "Headache, dizziness, blurred vision. Onset gradual over past week.", diagnosis: "I10 - Essential Hypertension", notes: "BP 145/90. Added Amlodipine 5mg. Continue monitoring. Advised to reduce salt intake.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_013", date: "2026-04-20", time: "10:00 AM", symptoms: "Routine check-up, mild headache, fatigue", diagnosis: "I10 - Essential Hypertension", notes: "BP 138/88. Stable on current medications. Continue monitoring.", doctor: "Dr. Chinedu Okafor" },
    ]
  },
  "Tunde Bakare": {
    prescriptions: [
      { id: "rx_003", medication: "Salbutamol", dosage: "100mcg", instructions: "2 puffs every 4-6 hours as needed. Max 8 puffs per day.", date: "2026-06-08", time: "11:15 AM", status: "Active", refills: 1 },
      { id: "rx_014", medication: "Budesonide", dosage: "200mcg", instructions: "2 puffs twice daily for maintenance. Use regularly even when symptom-free.", date: "2026-06-08", time: "11:15 AM", status: "Active", refills: 2 },
      { id: "rx_027", medication: "Montelukast", dosage: "10mg", instructions: "Take one tablet daily in the evening for asthma control.", date: "2026-05-10", time: "09:30 AM", status: "Active", refills: 1 },
    ],
    clinicalNotes: [
      { id: "cn_003", date: "2026-06-08", time: "11:15 AM", symptoms: "Shortness of breath, wheezing, cough. Symptoms worse at night.", diagnosis: "J45.9 - Moderate Persistent Asthma", notes: "Prescribed Salbutamol inhaler for rescue and Budesonide for maintenance. Added Montelukast for better control. Review in 1 month with PFT.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_014", date: "2026-05-10", time: "09:30 AM", symptoms: "Chest tightness, cough, difficulty breathing during exercise", diagnosis: "J45.9 - Exercise-induced Asthma", notes: "Asthma symptoms triggered by cold weather and exercise. Advised to use preventive inhaler before exercise.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_027", date: "2026-04-05", time: "10:00 AM", symptoms: "Wheezing, cough, shortness of breath", diagnosis: "J45.9 - Asthma Exacerbation", notes: "Mild exacerbation after cold. Treated with prednisone short course. Follow-up in 2 weeks.", doctor: "Dr. Chinedu Okafor" },
    ]
  },
  "Ngozi Eze": {
    prescriptions: [
      { id: "rx_004", medication: "Sumatriptan", dosage: "50mg", instructions: "Take at onset of migraine. May repeat after 2 hours. Max 2 tablets in 24 hours.", date: "2026-06-05", time: "02:45 PM", status: "Completed", refills: 0 },
      { id: "rx_005", medication: "Propranolol", dosage: "40mg", instructions: "Take twice daily for migraine prevention. Do not stop abruptly.", date: "2026-06-05", time: "02:45 PM", status: "Active", refills: 2 },
      { id: "rx_015", medication: "Amitriptyline", dosage: "25mg", instructions: "Take once daily at bedtime for migraine prevention.", date: "2026-05-20", time: "10:00 AM", status: "Active", refills: 1 },
    ],
    clinicalNotes: [
      { id: "cn_004", date: "2026-06-05", time: "02:45 PM", symptoms: "Severe headache, nausea, light sensitivity, vomiting. Aura present.", diagnosis: "G43.1 - Migraine with Aura", notes: "Chronic migraines with aura. Started on Sumatriptan for acute episodes and Propranolol for prevention. Migraine diary advised. Follow-up in 3 months.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_005", date: "2026-05-20", time: "10:00 AM", symptoms: "Recurring headaches, visual aura, nausea", diagnosis: "G43.1 - Migraine with Aura", notes: "3-4 migraines per month. Started on Propranolol 40mg BID. Added Amitriptyline for prevention.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_015", date: "2026-04-15", time: "11:30 AM", symptoms: "Headache, fatigue, difficulty concentrating", diagnosis: "G43.9 - Migraine", notes: "Migraine frequency increasing. Consider preventive therapy. CBC ordered.", doctor: "Dr. Chinedu Okafor" },
    ]
  },
  "Yusuf Lawal": {
    prescriptions: [
      { id: "rx_006", medication: "Metformin", dosage: "500mg", instructions: "Take twice daily with meals to reduce GI side effects.", date: "2026-06-03", time: "10:00 AM", status: "Active", refills: 3 },
      { id: "rx_007", medication: "Gliclazide", dosage: "80mg", instructions: "Take once daily in the morning before breakfast.", date: "2026-06-03", time: "10:00 AM", status: "Active", refills: 2 },
      { id: "rx_016", medication: "Atorvastatin", dosage: "20mg", instructions: "Take once daily in the evening for dyslipidemia.", date: "2026-06-03", time: "10:00 AM", status: "Active", refills: 2 },
    ],
    clinicalNotes: [
      { id: "cn_006", date: "2026-06-03", time: "10:00 AM", symptoms: "Frequent urination, excessive thirst, weight loss 5kg, fatigue", diagnosis: "E11.9 - Type 2 Diabetes Mellitus", notes: "Fasting glucose 168 mg/dL, HbA1c 8.2%. Started on Metformin 500mg BID and Gliclazide 80mg. Added Atorvastatin for dyslipidemia. Diet and exercise counseling provided.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_016", date: "2026-05-01", time: "09:00 AM", symptoms: "Increased thirst, frequent urination, fatigue", diagnosis: "E11.9 - Type 2 Diabetes Mellitus", notes: "Fasting glucose 145 mg/dL. Started on Metformin 500mg BID.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_029", date: "2026-04-01", time: "11:00 AM", symptoms: "Routine check-up, fatigue", diagnosis: "E11.9 - Type 2 Diabetes Mellitus", notes: "HbA1c 7.2%. Well controlled on current regimen. Continue lifestyle modifications.", doctor: "Dr. Chinedu Okafor" },
    ]
  },
  "Blessing Okafor": {
    prescriptions: [
      { id: "rx_008", medication: "Betamethasone", dosage: "0.05% cream", instructions: "Apply thin layer to affected areas twice daily for 2 weeks.", date: "2026-06-01", time: "03:20 PM", status: "Active", refills: 0 },
      { id: "rx_017", medication: "Cetirizine", dosage: "10mg", instructions: "Take once daily for itching. May cause drowsiness.", date: "2026-06-01", time: "03:20 PM", status: "Active", refills: 1 },
      { id: "rx_030", medication: "Hydrocortisone", dosage: "1% cream", instructions: "Apply to affected areas twice daily for 2 weeks.", date: "2026-05-15", time: "02:00 PM", status: "Completed", refills: 0 },
    ],
    clinicalNotes: [
      { id: "cn_007", date: "2026-06-01", time: "03:20 PM", symptoms: "Itchy, red rash on elbows and knees. Dry, scaly skin. Symptoms worse in winter.", diagnosis: "L20.9 - Atopic Dermatitis (Eczema)", notes: "Patient has moderate eczema. Prescribed Betamethasone cream and Cetirizine for itching. Advised to use gentle cleansers and moisturize regularly. Avoid triggers.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_017", date: "2026-05-15", time: "02:00 PM", symptoms: "Rash on arms and legs, itching", diagnosis: "L20.9 - Eczema", notes: "Mild eczema flare-up. Prescribed Hydrocortisone cream. Moisturizing regimen advised.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_030", date: "2026-04-15", time: "11:00 AM", symptoms: "Skin rash, itching, dry skin", diagnosis: "L20.9 - Eczema", notes: "Initial diagnosis of eczema. Skin care education provided. Allergy testing pending.", doctor: "Dr. Chinedu Okafor" },
    ]
  },
  "Samuel Idris": {
    prescriptions: [
      { id: "rx_009", medication: "Multivitamin", dosage: "1 tablet", instructions: "Take once daily with food for overall health.", date: "2026-05-28", time: "01:15 PM", status: "Active", refills: 3 },
      { id: "rx_018", medication: "Vitamin D", dosage: "1000IU", instructions: "Take once daily for bone health and immunity.", date: "2026-05-28", time: "01:15 PM", status: "Active", refills: 2 },
    ],
    clinicalNotes: [
      { id: "cn_008", date: "2026-05-28", time: "01:15 PM", symptoms: "No specific complaints. Routine annual physical.", diagnosis: "Z00.00 - Routine Adult Examination", notes: "Overall health good. BP 120/80, HR 72. All systems normal. Recommended annual screening labs and continue healthy lifestyle. Prescribed multivitamin for general wellness.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_018", date: "2026-04-28", time: "11:00 AM", symptoms: "Mild fatigue, feeling run down", diagnosis: "Z00.00 - Routine Adult Examination", notes: "Annual physical exam. CBC and basic metabolic panel ordered. Vitamin D supplementation started.", doctor: "Dr. Chinedu Okafor" },
      { id: "cn_031", date: "2026-03-28", time: "10:00 AM", symptoms: "No specific complaints", diagnosis: "Z00.00 - Routine Adult Examination", notes: "Regular check-up. All vitals normal. Health education provided.", doctor: "Dr. Chinedu Okafor" },
    ]
  }
};

const Patients = () => {
  const [q, setQ] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<typeof doctorMock.patients[number] | null>(null);
  const [showFullRecord, setShowFullRecord] = useState(false);
  
  const filtered = doctorMock.patients.filter((p) => 
    p.name.toLowerCase().includes(q.toLowerCase()) || 
    p.condition.toLowerCase().includes(q.toLowerCase()) ||
    p.id.toLowerCase().includes(q.toLowerCase())
  );

  const handleViewFullRecord = () => {
    setShowFullRecord(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  // Get patient record by name
  const getPatientRecordByName = (name: string) => {
    return patientRecordsByName[name] || { prescriptions: [], clinicalNotes: [] };
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader title="Patients" description={`${doctorMock.patients.length} patients as been attended to by you`} />
      
      <SectionCard>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, condition, or ID..." 
            className="pl-9 max-w-md" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </div>
        
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-xs uppercase tracking-wider text-muted-foreground">Age/Sex</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-xs uppercase tracking-wider text-muted-foreground">Last Visit</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Condition</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Records</TableHead>
                <TableHead className="text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const record = getPatientRecordByName(p.name);
                const totalRecords = (record.prescriptions?.length || 0) + (record.clinicalNotes?.length || 0);
                return (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => setSelectedPatient(p)}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{p.age} / {p.gender}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{p.lastVisit}</TableCell>
                    <TableCell><Badge variant="outline">{p.condition}</Badge></TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {totalRecords} record{totalRecords !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button size="sm" variant="ghost" className="text-xs" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(p);
                        }}>
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{filtered.length}</span>
            <span className="text-muted-foreground">patients</span>
          </div>
        </div>
      </SectionCard>

      {/* Patient Detail Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => {
        if (!open) {
          setSelectedPatient(null);
          setShowFullRecord(false);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b border-border/60 px-6 py-4">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Patient Record
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete medical history and treatment records
                  </p>
                </div>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>
          </div>
          
          {selectedPatient && (
            <div className="px-6 pb-6 space-y-6">
              {/* Patient Info */}
              <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-5 border border-primary/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{selectedPatient.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm">
                      <span className="text-muted-foreground">{selectedPatient.age} years</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{selectedPatient.gender}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">ID: {selectedPatient.id}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">Last Visit: {selectedPatient.lastVisit}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                    {selectedPatient.condition}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3 border-t border-primary/10">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Status: </span>
                    <span className="font-medium">Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Next Follow-up: </span>
                    <span className="font-medium">2 weeks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Pill className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Active Medications: </span>
                    <span className="font-medium">
                      {getPatientRecordByName(selectedPatient.name).prescriptions?.filter(rx => rx.status === 'Active').length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Record Section */}
              {showFullRecord ? (
                <div className="space-y-6">
                  {/* Prescriptions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Pill className="h-4 w-4 text-primary" />
                        Prescriptions
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {getPatientRecordByName(selectedPatient.name).prescriptions?.length || 0} total
                      </Badge>
                    </div>
                    {getPatientRecordByName(selectedPatient.name).prescriptions?.length > 0 ? (
                      <div className="rounded-lg border border-border/60 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead className="text-xs font-semibold">Medication</TableHead>
                              <TableHead className="text-xs font-semibold">Dosage</TableHead>
                              <TableHead className="text-xs font-semibold">Date</TableHead>
                              <TableHead className="text-xs font-semibold">Status</TableHead>
                              <TableHead className="text-xs font-semibold text-center">Refills</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPatientRecordByName(selectedPatient.name).prescriptions.map((rx) => (
                              <TableRow key={rx.id} className="hover:bg-muted/20">
                                <TableCell className="font-medium text-sm">{rx.medication}</TableCell>
                                <TableCell className="text-sm">{rx.dosage}</TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-sm">{rx.date}</span>
                                    <span className="text-xs text-muted-foreground">{rx.time}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`${getStatusColor(rx.status)} text-xs`}>
                                    {rx.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-center">{rx.refills}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground border border-border/60 rounded-lg">
                        <Pill className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No prescriptions on record
                      </div>
                    )}
                  </div>

                  {/* Clinical Notes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Clinical Notes
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {getPatientRecordByName(selectedPatient.name).clinicalNotes?.length || 0} total
                      </Badge>
                    </div>
                    {getPatientRecordByName(selectedPatient.name).clinicalNotes?.length > 0 ? (
                      <div className="space-y-3">
                        {getPatientRecordByName(selectedPatient.name).clinicalNotes.map((note) => (
                          <div key={note.id} className="rounded-lg border border-border/60 p-4 hover:bg-muted/20 transition-colors">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <Badge variant="secondary" className="text-xs">
                                    {note.diagnosis}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{note.doctor}</span>
                                </div>
                                <div className="mt-2 space-y-1.5">
                                  <p className="text-sm"><span className="font-medium">Symptoms:</span> {note.symptoms}</p>
                                  <p className="text-sm"><span className="font-medium">Notes:</span> {note.notes}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                <span className="text-sm font-medium">{note.date}</span>
                                <span className="text-xs text-muted-foreground">{note.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground border border-border/60 rounded-lg">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No clinical notes on record
                      </div>
                    )}
                  </div>

                  {/* Back Button */}
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={() => setShowFullRecord(false)} className="text-sm">
                      ← Back to Summary
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary View - Recent Activity */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Recent Activity
                    </p>
                    <div className="space-y-3">
                      {/* Show recent prescriptions */}
                      {getPatientRecordByName(selectedPatient.name).prescriptions?.slice(0, 2).map((rx) => (
                        <div key={rx.id} className="border-l-2 border-primary pl-3 py-1.5 hover:bg-muted/20 transition-colors rounded-r-lg">
                          <div className="flex items-center gap-2">
                            <Pill className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-medium">{rx.medication}</span>
                            <span className="text-xs text-muted-foreground">{rx.dosage}</span>
                            <Badge className={`${getStatusColor(rx.status)} text-[10px]`}>
                              {rx.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Prescribed on {rx.date} at {rx.time}</p>
                          {rx.instructions && <p className="text-xs text-muted-foreground mt-0.5 italic">"{rx.instructions}"</p>}
                        </div>
                      ))}
                      
                      {/* Show recent clinical notes */}
                      {getPatientRecordByName(selectedPatient.name).clinicalNotes?.slice(0, 2).map((note) => (
                        <div key={note.id} className="border-l-2 border-blue-400 pl-3 py-1.5 hover:bg-muted/20 transition-colors rounded-r-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-sm font-medium">{note.diagnosis}</span>
                            <span className="text-xs text-muted-foreground">{note.doctor}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Visit on {note.date} at {note.time}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{note.symptoms}</p>
                        </div>
                      ))}
                      
                      {getPatientRecordByName(selectedPatient.name).prescriptions?.length === 0 && 
                       getPatientRecordByName(selectedPatient.name).clinicalNotes?.length === 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground border border-border/60 rounded-lg">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          No recent activity
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border/60 p-3 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {getPatientRecordByName(selectedPatient.name).prescriptions?.length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Prescriptions</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3 text-center">
                      <p className="text-2xl font-bold text-blue-500">
                        {getPatientRecordByName(selectedPatient.name).clinicalNotes?.length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Clinical Notes</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3 text-center">
                      <p className="text-2xl font-bold text-green-500">
                        {getPatientRecordByName(selectedPatient.name).prescriptions?.filter(rx => rx.status === 'Active').length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Active Meds</p>
                    </div>
                  </div>

                  {/* View Full Record Button */}
                  <Button 
                    className="w-full" 
                    onClick={handleViewFullRecord}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Open Full Record
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default Patients;