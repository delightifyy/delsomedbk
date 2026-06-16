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
  Loader2,
  User,
  Clock,
  Activity
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

const DoctorClinical = () => {
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
    // Scroll to top of table
    document.querySelector('.clinical-table-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Skeleton Loading Component
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

  // Get status color based on diagnosis
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

      {/* Search and Stats */}
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

      {/* Clinical Notes Table */}
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
                  // Skeleton loading rows
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

        {/* Pagination */}
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

      {/* Dialog/Modal for viewing full clinical note */}
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
              {/* Patient Info */}
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

              {/* Symptoms */}
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

              {/* Diagnosis */}
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

              {/* Clinical Notes */}
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

              {/* Footer */}
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

export default DoctorClinical;