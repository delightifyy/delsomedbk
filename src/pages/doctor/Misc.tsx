import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { doctorNav } from "./nav";
import { 
  ClipboardList, 
  Stethoscope, 
  Calendar, 
  FileText, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Search,
  User,
  Clock,
  Activity,
  Pill,
  Eye,
  Send,
  Building2,
  UserRound,
  Hospital,
  FlaskConical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type ClinicalNote = {
  id: string;
  patient: string;
  patientId: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  symptoms: string;
  diagnosis: string;
  notes: string;
  date: string;
  time: string;
  doctor: string;
};

// Mock data - in a real app, this would come from consultations
const mockClinicalNotes: ClinicalNote[] = Array.from({ length: 25 }, (_, i) => ({
  id: `cl_${i + 1}`,
  patient: `Patient ${i + 1}`,
  patientId: `P${String(i + 1).padStart(3, '0')}`,
  age: 20 + Math.floor(Math.random() * 50),
  gender: Math.random() > 0.5 ? "Male" : "Female" as "Male" | "Female",
  symptoms: [
    "Chest pain, shortness of breath, palpitations",
    "Persistent headache, blurred vision, fatigue",
    "Joint pain in knees and hands, morning stiffness",
    "Frequent urination, excessive thirst, weight loss",
    "Sore throat, fever, swollen lymph nodes",
    "Abdominal pain, nausea, vomiting",
    "Cough, fever, difficulty breathing",
    "Back pain, radiating to legs",
    "Dizziness, fainting episodes",
    "Skin rash, itching, redness"
  ][i % 10],
  diagnosis: [
    "I10 - Essential Hypertension",
    "G44.1 - Tension-type headache",
    "M05.9 - Rheumatoid Arthritis",
    "E11.9 - Type 2 Diabetes Mellitus",
    "J02.9 - Acute Pharyngitis",
    "K30 - Functional Dyspepsia",
    "J18.9 - Pneumonia",
    "M54.5 - Low back pain",
    "I95.1 - Orthostatic hypotension",
    "L50.9 - Urticaria"
  ][i % 10],
  notes: `Clinical notes for patient ${i + 1}. Detailed examination findings and treatment plan. Follow-up scheduled in ${1 + Math.floor(Math.random() * 4)} weeks.`,
  date: `2026-06-${String(1 + i % 15).padStart(2, '0')}`,
  time: `${String(8 + Math.floor(Math.random() * 8)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
  doctor: "Dr. Smith"
}));

const ITEMS_PER_PAGE = 8;

export const DoctorClinical = () => {
  const { toast } = useToast();
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Filter notes based on search
  const filteredNotes = mockClinicalNotes.filter(note =>
    note.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.date.includes(searchTerm)
  );

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNotes = filteredNotes.slice(startIndex, endIndex);

  const handleViewNote = (note: ClinicalNote) => {
    setSelectedNote(note);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.querySelector('.clinical-table-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const SkeletonRow = () => (
    <TableRow>
      <TableCell><div className="h-5 w-28 bg-muted animate-pulse rounded" /></TableCell>
      <TableCell><div className="h-5 w-16 bg-muted animate-pulse rounded" /></TableCell>
      <TableCell><div className="h-5 w-20 bg-muted animate-pulse rounded" /></TableCell>
      <TableCell><div className="h-5 w-40 bg-muted animate-pulse rounded" /></TableCell>
      <TableCell><div className="h-5 w-24 bg-muted animate-pulse rounded" /></TableCell>
      <TableCell><div className="h-8 w-20 bg-muted animate-pulse rounded ml-auto" /></TableCell>
    </TableRow>
  );

  const getDiagnosisColor = (diagnosis: string) => {
    if (diagnosis.includes("Hypertension") || diagnosis.includes("Diabetes")) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (diagnosis.includes("Arthritis") || diagnosis.includes("Pain")) return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    if (diagnosis.includes("Infection") || diagnosis.includes("Pharyngitis")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (diagnosis.includes("Headache") || diagnosis.includes("Dizziness")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    if (diagnosis.includes("Pneumonia") || diagnosis.includes("Cough")) return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400";
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader 
        title="Clinical Notes" 
        description="Review and manage clinical notes from completed consultations" 
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by patient, diagnosis, ID, or date..."
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
            <Activity className="h-4 w-4 text-muted-foreground" />
            {!isLoading && (
              <span className="font-medium">{filteredNotes.length}</span>
            )}
            <span className="text-muted-foreground">notes</span>
          </div>
        </div>
      </div>

      <SectionCard 
        title="Patient Clinical Notes" 
        description="Click on any row to view the full clinical note details"
        className="clinical-table-container"
      >
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-muted/30 border-b border-border/60">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Patient
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-3.5 w-3.5" />
                      Demographics
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Diagnosis
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                    <SkeletonRow key={`skeleton-${index}`} />
                  ))
                ) : currentNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="p-4 rounded-full bg-muted/30">
                          <ClipboardList className="h-10 w-10 opacity-50" />
                        </div>
                        <div>
                          <p className="font-medium text-base">No clinical notes found</p>
                          <p className="text-sm mt-1">Try adjusting your search criteria</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentNotes.map((note, index) => (
                    <TableRow 
                      key={note.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                        index !== currentNotes.length - 1 ? 'border-b border-border/40' : ''
                      }`}
                      onClick={() => handleViewNote(note)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{note.patient}</span>
                          <span className="text-xs text-muted-foreground">{note.doctor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs bg-muted/30">
                          {note.patientId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{note.age} years</span>
                          <span className="text-xs text-muted-foreground">{note.gender}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getDiagnosisColor(note.diagnosis)} font-medium text-xs max-w-[220px] truncate`}>
                          {note.diagnosis}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{note.date}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {note.time}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewNote(note);
                            }}
                          >
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-2">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to{' '}
              <span className="font-medium text-foreground">{Math.min(endIndex, filteredNotes.length)}</span> of{' '}
              <span className="font-medium text-foreground">{filteredNotes.length}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className={`h-9 w-9 ${
                        currentPage === pageNum 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-muted-foreground px-1">…</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 hover:bg-muted"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b border-border/60 px-6 py-4">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    Clinical Note Details
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete consultation record
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
          
          {selectedNote && (
            <div className="px-6 pb-6 space-y-5">
              <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-5 border border-primary/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{selectedNote.patient}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm">
                      <Badge variant="outline" className="font-mono text-xs bg-background/50">
                        {selectedNote.patientId}
                      </Badge>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{selectedNote.gender}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{selectedNote.age} years</span>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {selectedNote.doctor}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-primary/10">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {selectedNote.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {selectedNote.time}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border/60" />
                  Symptoms
                  <span className="h-px flex-1 bg-border/60" />
                </h4>
                <div className="rounded-lg bg-muted/20 p-4 border border-border/40">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedNote.symptoms}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border/60" />
                  Diagnosis
                  <span className="h-px flex-1 bg-border/60" />
                </h4>
                <div className="rounded-lg bg-muted/20 p-4 border border-border/40">
                  <Badge className={`${getDiagnosisColor(selectedNote.diagnosis)} font-medium text-xs mb-2`}>
                    {selectedNote.diagnosis}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border/60" />
                  Clinical Notes
                  <span className="h-px flex-1 bg-border/60" />
                </h4>
                <div className="rounded-lg bg-muted/20 p-4 border border-border/40">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedNote.notes}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center pt-2 border-t border-border/60">
                <Badge variant="secondary" className="text-xs">
                  Recorded: {selectedNote.date} at {selectedNote.time}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedNote.doctor}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

// Prescriptions Page - View Only
export const DoctorPrescriptions = () => {
  const { toast } = useToast();
  const [selectedRx, setSelectedRx] = useState<any | null>(null);

  const initialRx = [
    { 
      id: "rx_a01", 
      patient: "Adaobi Okeke", 
      patientId: "P001",
      medication: "Lisinopril", 
      dosage: "10mg",
      strength: "10mg tablets",
      quantity: "30 tablets",
      instructions: "Take one tablet daily in the morning. Do not stop abruptly.",
      date: "2026-04-28",
      time: "09:30 AM",
      status: "active",
      refills: 2,
      pharmacy: "Shoppers Drug Mart"
    },
    { 
      id: "rx_a02", 
      patient: "Tunde Bakare", 
      patientId: "P002",
      medication: "Salbutamol", 
      dosage: "100mcg",
      strength: "100mcg per puff",
      quantity: "1 inhaler (200 doses)",
      instructions: "2 puffs every 4-6 hours as needed for shortness of breath. Max 8 puffs per day.",
      date: "2026-04-21",
      time: "11:15 AM",
      status: "active",
      refills: 1,
      pharmacy: "Rexall"
    },
    { 
      id: "rx_a03", 
      patient: "Ngozi Eze", 
      patientId: "P003",
      medication: "Sumatriptan", 
      dosage: "50mg",
      strength: "50mg tablets",
      quantity: "9 tablets",
      instructions: "Take one tablet at onset of migraine. May repeat after 2 hours if needed. Max 2 tablets in 24 hours.",
      date: "2026-04-15",
      time: "02:45 PM",
      status: "completed",
      refills: 0,
      pharmacy: "London Drugs"
    },
    { 
      id: "rx_a04", 
      patient: "Emeka Nwosu", 
      patientId: "P004",
      medication: "Metformin", 
      dosage: "500mg",
      strength: "500mg extended release",
      quantity: "60 tablets",
      instructions: "Take one tablet twice daily with meals. Monitor blood glucose regularly.",
      date: "2026-04-10",
      time: "10:00 AM",
      status: "active",
      refills: 3,
      pharmacy: "Costco Pharmacy"
    },
    { 
      id: "rx_a05", 
      patient: "Ifeoma Obi", 
      patientId: "P005",
      medication: "Amoxicillin", 
      dosage: "500mg",
      strength: "500mg capsules",
      quantity: "21 capsules",
      instructions: "Take one capsule three times daily for 7 days. Complete the full course.",
      date: "2026-04-05",
      time: "03:20 PM",
      status: "completed",
      refills: 0,
      pharmacy: "Walmart Pharmacy"
    },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  const handleView = (rx: any) => {
    setSelectedRx(rx);
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader 
        title="Prescriptions" 
        description="View all prescriptions issued to patients" 
      />

      <SectionCard>
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-muted/30 border-b border-border/60">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Patient
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Pill className="h-3.5 w-3.5" />
                      Medication
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Dosage
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialRx.map((rx, index) => (
                  <TableRow 
                    key={rx.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                      index !== initialRx.length - 1 ? 'border-b border-border/40' : ''
                    }`}
                    onClick={() => handleView(rx)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{rx.patient}</span>
                        <span className="text-xs text-muted-foreground">{rx.patientId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{rx.medication}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{rx.dosage}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{rx.date}</span>
                        <span className="text-xs text-muted-foreground">{rx.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(rx.status)} font-medium text-xs capitalize`}>
                        {rx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-3 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(rx);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-sm">
            <Pill className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{initialRx.length}</span>
            <span className="text-muted-foreground">total prescriptions</span>
          </div>
        </div>
      </SectionCard>

      <Dialog open={!!selectedRx} onOpenChange={() => setSelectedRx(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b border-border/60 px-6 py-4">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Prescription Details
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Prescription #{selectedRx?.id}
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
          
          {selectedRx && (
            <div className="px-6 pb-6 space-y-5">
              <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-4 border border-primary/10">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Patient Information</h4>
                <p className="font-medium text-base">{selectedRx.patient}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedRx.patientId}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedRx.date}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{selectedRx.time}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border/60" />
                  Medication Details
                  <span className="h-px flex-1 bg-border/60" />
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                    <p className="text-xs text-muted-foreground">Medication</p>
                    <p className="font-medium">{selectedRx.medication}</p>
                  </div>
                  <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                    <p className="text-xs text-muted-foreground">Dosage</p>
                    <p className="font-medium">{selectedRx.dosage}</p>
                  </div>
                  <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                    <p className="text-xs text-muted-foreground">Strength</p>
                    <p className="font-medium">{selectedRx.strength}</p>
                  </div>
                  <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium">{selectedRx.quantity}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border/60" />
                  Instructions
                  <span className="h-px flex-1 bg-border/60" />
                </h4>
                <div className="rounded-lg bg-muted/20 p-4 border border-border/40">
                  <p className="text-sm leading-relaxed">{selectedRx.instructions}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-xs text-muted-foreground">Pharmacy</p>
                  <p className="font-medium">{selectedRx.pharmacy}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-xs text-muted-foreground">Refills</p>
                  <p className="font-medium">{selectedRx.refills} refill{selectedRx.refills !== 1 ? 's' : ''} remaining</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center pt-2 border-t border-border/60">
                <Badge className={`${getStatusColor(selectedRx.status)} font-medium text-xs capitalize`}>
                  {selectedRx.status}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Issued on {selectedRx.date} at {selectedRx.time}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

// Investigations Page
export const DoctorInvestigations = () => {
  const [selectedInvestigation, setSelectedInvestigation] = useState<any | null>(null);

  const investigationsData = [
    {
      id: "lab_001",
      patient: "Adaobi Okeke",
      patientId: "P001",
      labName: "Dynacare",
      labAddress: "123 Medical Blvd, Suite 200, Winnipeg, MB",
      testType: "Complete Blood Count",
      testCode: "CBC-001",
      date: "2026-06-10",
      time: "09:30 AM",
      status: "pending",
      notes: "CBC with differential. Patient has been experiencing fatigue and weakness.",
      priority: "Standard",
      physician: "Dr. Chinedu Okafor"
    },
    {
      id: "lab_002",
      patient: "Chidi Eze",
      patientId: "P002",
      labName: "Cadham Provincial Laboratory",
      labAddress: "750 William Avenue, Winnipeg, MB",
      testType: "Lipid Panel",
      testCode: "LIP-002",
      date: "2026-06-08",
      time: "11:15 AM",
      status: "completed",
      notes: "Fasting required. Patient has family history of hyperlipidemia.",
      priority: "Standard",
      physician: "Dr. Chinedu Okafor"
    },
    {
      id: "lab_003",
      patient: "Ngozi Okafor",
      patientId: "P003",
      labName: "Canadian Blood Services",
      labAddress: "777 William Avenue, Winnipeg, MB",
      testType: "Blood Culture",
      testCode: "BC-003",
      date: "2026-06-05",
      time: "02:45 PM",
      status: "pending",
      notes: "Urgent - STAT. Patient has fever of unknown origin for 5 days.",
      priority: "Urgent",
      physician: "Dr. Chinedu Okafor"
    },
    {
      id: "lab_004",
      patient: "Emeka Nwosu",
      patientId: "P004",
      labName: "Dynacare",
      labAddress: "123 Medical Blvd, Suite 200, Winnipeg, MB",
      testType: "Thyroid Function Test",
      testCode: "TFT-004",
      date: "2026-06-03",
      time: "10:00 AM",
      status: "completed",
      notes: "TSH, T3, T4. Patient reports weight gain and fatigue.",
      priority: "Standard",
      physician: "Dr. Chinedu Okafor"
    },
    {
      id: "lab_005",
      patient: "Ifeoma Obi",
      patientId: "P005",
      labName: "Cadham Provincial Laboratory",
      labAddress: "750 William Avenue, Winnipeg, MB",
      testType: "Urinalysis",
      testCode: "UA-005",
      date: "2026-06-01",
      time: "03:20 PM",
      status: "pending",
      notes: "Culture and sensitivity. Patient has burning sensation during urination.",
      priority: "Standard",
      physician: "Dr. Chinedu Okafor"
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Standard': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  const handleView = (investigation: any) => {
    setSelectedInvestigation(investigation);
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader 
        title="Investigations" 
        description="Lab requests and diagnostic orders sent to laboratories" 
      />

      <SectionCard>
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-muted/30 border-b border-border/60">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Patient
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Hospital className="h-3.5 w-3.5" />
                      Lab Name
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-3.5 w-3.5" />
                      Test Type
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investigationsData.map((investigation, index) => (
                  <TableRow 
                    key={investigation.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                      index !== investigationsData.length - 1 ? 'border-b border-border/40' : ''
                    }`}
                    onClick={() => handleView(investigation)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{investigation.patient}</span>
                        <span className="text-xs text-muted-foreground">{investigation.patientId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{investigation.labName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{investigation.testType}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{investigation.date}</span>
                        <span className="text-xs text-muted-foreground">{investigation.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(investigation.status)} font-medium text-xs capitalize`}>
                        {investigation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-3 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(investigation);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-sm">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{investigationsData.length}</span>
            <span className="text-muted-foreground">total investigations</span>
          </div>
        </div>
      </SectionCard>

      {/* View Investigation Dialog */}
      <Dialog open={!!selectedInvestigation} onOpenChange={() => setSelectedInvestigation(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b border-border/60 px-6 py-4">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    Investigation Details
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lab Request #{selectedInvestigation?.id}
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
          
          {selectedInvestigation && (
            <div className="px-6 pb-6 space-y-5">
              {/* Patient Info */}
              <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-4 border border-primary/10">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Patient Information</h4>
                <p className="font-medium text-base">{selectedInvestigation.patient}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedInvestigation.patientId}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedInvestigation.date}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{selectedInvestigation.time}</span>
                </div>
              </div>

              {/* Lab Details */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-xs text-muted-foreground">Lab Name</p>
                  <p className="font-medium">{selectedInvestigation.labName}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-xs text-muted-foreground">Test Type</p>
                  <p className="font-medium">{selectedInvestigation.testType}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-xs text-muted-foreground">Test Code</p>
                  <p className="font-medium">{selectedInvestigation.testCode}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Badge className={`${getPriorityColor(selectedInvestigation.priority)} font-medium text-xs`}>
                    {selectedInvestigation.priority}
                  </Badge>
                </div>
              </div>

              {/* Lab Address */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border/60" />
                  Lab Address
                  <span className="h-px flex-1 bg-border/60" />
                </h4>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-sm">{selectedInvestigation.labAddress}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border/60" />
                  Clinical Notes
                  <span className="h-px flex-1 bg-border/60" />
                </h4>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-sm leading-relaxed">{selectedInvestigation.notes}</p>
                </div>
              </div>

              {/* Status Footer */}
              <div className="flex flex-wrap justify-between items-center pt-2 border-t border-border/60">
                <Badge className={`${getStatusColor(selectedInvestigation.status)} font-medium text-xs capitalize`}>
                  {selectedInvestigation.status}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Requested on {selectedInvestigation.date} at {selectedInvestigation.time}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

// Referrals Page - Simple list of referrals to pharmacy and lab
export const DoctorReferrals = () => {
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);

  const referralsData = [
    {
      id: "ref_001",
      patient: "Adaobi Okeke",
      patientId: "P001",
      referredTo: "Shoppers Drug Mart",
      address: "123 Main Street, Winnipeg, MB R3C 1A2",
      type: "Pharmacy",
      date: "2026-06-10",
      time: "09:30 AM",
      notes: "Lisinopril 10mg prescription - 30 tablets. Take one tablet daily in the morning.",
      physician: "Dr. Chinedu Okafor",
      status: "Sent",
      phone: "204-555-0123"
    },
    {
      id: "ref_002",
      patient: "Chidi Eze",
      patientId: "P002",
      referredTo: "Dynacare",
      address: "123 Medical Blvd, Suite 200, Winnipeg, MB R3C 2A1",
      type: "Lab",
      date: "2026-06-08",
      time: "11:15 AM",
      notes: "Complete Blood Count with differential. Patient has been experiencing fatigue.",
      physician: "Dr. Chinedu Okafor",
      status: "Received",
      phone: "204-555-0456"
    },
    {
      id: "ref_003",
      patient: "Ngozi Okafor",
      patientId: "P003",
      referredTo: "Rexall",
      address: "456 Portage Avenue, Winnipeg, MB R3B 2E4",
      type: "Pharmacy",
      date: "2026-06-05",
      time: "02:45 PM",
      notes: "Sumatriptan 50mg - 9 tablets. Take at onset of migraine.",
      physician: "Dr. Chinedu Okafor",
      status: "Sent",
      phone: "204-555-0789"
    },
    {
      id: "ref_004",
      patient: "Emeka Nwosu",
      patientId: "P004",
      referredTo: "Cadham Provincial Laboratory",
      address: "750 William Avenue, Winnipeg, MB R3E 0T4",
      type: "Lab",
      date: "2026-06-03",
      time: "10:00 AM",
      notes: "Lipid Panel - Fasting required. Family history of hyperlipidemia.",
      physician: "Dr. Chinedu Okafor",
      status: "Completed",
      phone: "204-555-1011"
    },
    {
      id: "ref_005",
      patient: "Ifeoma Obi",
      patientId: "P005",
      referredTo: "London Drugs",
      address: "789 St. Mary's Road, Winnipeg, MB R2M 3N4",
      type: "Pharmacy",
      date: "2026-06-01",
      time: "03:20 PM",
      notes: "Amoxicillin 500mg - 21 capsules. Take one capsule three times daily for 7 days.",
      physician: "Dr. Chinedu Okafor",
      status: "Sent",
      phone: "204-555-1213"
    },
    {
      id: "ref_006",
      patient: "Tunde Bakare",
      patientId: "P006",
      referredTo: "Canadian Blood Services",
      address: "777 William Avenue, Winnipeg, MB R3E 0T8",
      type: "Lab",
      date: "2026-05-28",
      time: "01:15 PM",
      notes: "Blood Culture - STAT. Patient has fever of unknown origin.",
      physician: "Dr. Chinedu Okafor",
      status: "Pending",
      phone: "204-555-1415"
    }
  ];

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Pharmacy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Lab': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Received': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  const handleView = (referral: any) => {
    setSelectedReferral(referral);
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader 
        title="Referrals" 
        description="List of patients referred to pharmacies and laboratories" 
      />

      <SectionCard>
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-muted/30 border-b border-border/60">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Patient
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      Referred To
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralsData.map((referral, index) => (
                  <TableRow 
                    key={referral.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                      index !== referralsData.length - 1 ? 'border-b border-border/40' : ''
                    }`}
                    onClick={() => handleView(referral)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{referral.patient}</span>
                        <span className="text-xs text-muted-foreground">{referral.patientId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{referral.referredTo}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTypeColor(referral.type)} font-medium text-xs capitalize`}>
                        {referral.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{referral.date}</span>
                        <span className="text-xs text-muted-foreground">{referral.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(referral.status)} font-medium text-xs capitalize`}>
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-3 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(referral);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-sm">
            <Send className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{referralsData.length}</span>
            <span className="text-muted-foreground">total referrals</span>
          </div>
        </div>
      </SectionCard>

      {/* View Referral Dialog */}
      <Dialog open={!!selectedReferral} onOpenChange={() => setSelectedReferral(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b border-border/60 px-6 py-4">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Referral Details
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Referral #{selectedReferral?.id}
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
          
          {selectedReferral && (
            <div className="px-6 pb-6 space-y-5">
              {/* Patient Info */}
              <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-4 border border-primary/10">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Patient Information</h4>
                <p className="font-medium text-base">{selectedReferral.patient}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedReferral.patientId}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedReferral.date}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{selectedReferral.time}</span>
                </div>
              </div>

              {/* Referral Details */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-xs text-muted-foreground">Referred To</p>
                  <p className="font-medium">{selectedReferral.referredTo}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <Badge className={`${getTypeColor(selectedReferral.type)} font-medium text-xs`}>
                    {selectedReferral.type}
                  </Badge>
                </div>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedReferral.phone}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-xs text-muted-foreground">Physician</p>
                  <p className="font-medium">{selectedReferral.physician}</p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border/60" />
                  Address
                  <span className="h-px flex-1 bg-border/60" />
                </h4>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-sm">{selectedReferral.address}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border/60" />
                  Notes
                  <span className="h-px flex-1 bg-border/60" />
                </h4>
                <div className="rounded-lg bg-muted/20 p-3 border border-border/40">
                  <p className="text-sm leading-relaxed">{selectedReferral.notes}</p>
                </div>
              </div>

              {/* Status Footer */}
              <div className="flex flex-wrap justify-between items-center pt-2 border-t border-border/60">
                <Badge className={`${getStatusColor(selectedReferral.status)} font-medium text-xs capitalize`}>
                  {selectedReferral.status}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Referred on {selectedReferral.date} at {selectedReferral.time}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

// Settings Page
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
            <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
            <Input id="fullName" value={profile.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input id="title" value={profile.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="specialty" className="text-sm font-medium">Specialty</label>
            <Input id="specialty" value={profile.specialty} onChange={(e) => update("specialty", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="license" className="text-sm font-medium">Medical License No.</label>
            <Input id="license" value={profile.license} onChange={(e) => update("license", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="years" className="text-sm font-medium">Years of Experience</label>
            <Input id="years" type="number" value={profile.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="hospital" className="text-sm font-medium">Hospital / Clinic</label>
            <Input id="hospital" value={profile.hospital} onChange={(e) => update("hospital", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="fee" className="text-sm font-medium">Consultation Fee (₦)</label>
            <Input id="fee" type="number" value={profile.consultationFee} onChange={(e) => update("consultationFee", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="lang" className="text-sm font-medium">Languages</label>
            <Input id="lang" value={profile.languages} onChange={(e) => update("languages", e.target.value)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contact Information" description="How patients and the clinic can reach you.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input id="email" type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
            <Input id="phone" value={profile.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label htmlFor="address" className="text-sm font-medium">Address</label>
            <Input id="address" value={profile.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label htmlFor="bio" className="text-sm font-medium">Professional Bio</label>
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

// Import Textarea for Settings
import { Textarea } from "@/components/ui/textarea";