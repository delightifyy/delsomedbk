import { useEffect, useState } from "react";
import { Activity, Calendar, Clock, FileText, Loader2, Pill, Search, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { doctorPortalApi, type DoctorPortalPatient } from "@/lib/doctorPortalApi";
import { doctorNav } from "./nav";

const textFrom = (record: Record<string, any>, keys: string[], fallback = "N/A") => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return fallback;
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toDateString();
};

const Patients = () => {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState<DoctorPortalPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<DoctorPortalPatient | null>(null);
  const [showFullRecord, setShowFullRecord] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorPortalApi.patients({ search: q, per_page: 50 });
      setPatients(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPatient = async (patient: DoctorPortalPatient) => {
    setSelectedPatient(patient);
    setShowFullRecord(false);
    setDetailLoading(true);
    try {
      const detail = await doctorPortalApi.patientDetail(patient.uuid);
      setSelectedPatient(detail);
    } catch {
      setSelectedPatient(patient);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDialog = () => {
    setSelectedPatient(null);
    setShowFullRecord(false);
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title="Patients"
        description={`${patients.length} patients available in your records`}
      />

      <SectionCard>
        <form
          className="mb-4 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            loadPatients();
          }}
        >
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              className="pl-9"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {loading ? (
          <div className="grid min-h-[280px] place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState
            icon={User}
            title="Could not load patients"
            description={error}
            action={
              <Button onClick={loadPatients}>
                Try again
              </Button>
            }
          />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={User}
            title="No patients found"
            description="Patients will appear here after appointments and consultations."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-border/60">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                    <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Age/Sex</TableHead>
                    <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Last Visit</TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Records</TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => {
                    const totalRecords = patient.prescriptions.length + patient.clinicalNotes.length;
                    return (
                      <TableRow key={patient.id} className="transition-colors hover:bg-muted/40">
                        <TableCell>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">{patient.email || patient.phone || patient.uuid}</div>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {[patient.age, patient.gender].filter(Boolean).join(" / ") || "N/A"}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {formatDate(patient.lastVisit)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {totalRecords} record{totalRecords === 1 ? "" : "s"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs hover:bg-primary/10 hover:text-primary"
                              onClick={() => openPatient(patient)}
                            >
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

            <div className="mt-4 flex items-center justify-end">
              <div className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{patients.length}</span>
                <span className="text-muted-foreground">patients</span>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 border-b border-border/60 bg-background px-6 py-4">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                    <User className="h-5 w-5 text-primary" />
                    Patient Record
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {detailLoading ? "Loading full patient record..." : "Complete medical history and treatment records"}
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
            <div className="space-y-6 px-6 pb-6">
              <div className="rounded-lg border border-primary/10 bg-primary/5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{selectedPatient.name}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>{selectedPatient.age ? `${selectedPatient.age} years` : "Age N/A"}</span>
                      <span>{selectedPatient.gender || "Gender N/A"}</span>
                      <span>ID: {selectedPatient.uuid}</span>
                      <span>Last Visit: {formatDate(selectedPatient.lastVisit)}</span>
                    </div>
                  </div>
                  {selectedPatient.condition && <Badge variant="outline">{selectedPatient.condition}</Badge>}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-primary/10 pt-3 md:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{selectedPatient.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Pill className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Prescriptions:</span>
                    <span className="font-medium">{selectedPatient.prescriptions.length}</span>
                  </div>
                </div>
              </div>

              {showFullRecord ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-sm font-semibold">
                        <Pill className="h-4 w-4 text-primary" />
                        Prescriptions
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {selectedPatient.prescriptions.length} total
                      </Badge>
                    </div>
                    {selectedPatient.prescriptions.length > 0 ? (
                      <div className="overflow-hidden rounded-lg border border-border/60">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead className="text-xs font-semibold">Medication</TableHead>
                              <TableHead className="text-xs font-semibold">Dosage</TableHead>
                              <TableHead className="text-xs font-semibold">Date</TableHead>
                              <TableHead className="text-xs font-semibold">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedPatient.prescriptions.map((rx, index) => (
                              <TableRow key={textFrom(rx, ["uuid", "id"], `rx-${index}`)}>
                                <TableCell className="text-sm font-medium">{textFrom(rx, ["drug_name", "medication", "name"])}</TableCell>
                                <TableCell className="text-sm">{textFrom(rx, ["dosage", "strength", "frequency"])}</TableCell>
                                <TableCell className="text-sm">{formatDate(textFrom(rx, ["prescribed_on", "date", "created_at"], ""))}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {textFrom(rx, ["status"], "active")}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <EmptyState icon={Pill} title="No prescriptions on record" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-sm font-semibold">
                        <FileText className="h-4 w-4 text-primary" />
                        Clinical Notes
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {selectedPatient.clinicalNotes.length} total
                      </Badge>
                    </div>
                    {selectedPatient.clinicalNotes.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPatient.clinicalNotes.map((note, index) => (
                          <div key={textFrom(note, ["uuid", "id"], `note-${index}`)} className="rounded-lg border border-border/60 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <Badge variant="secondary" className="text-xs">
                                  {textFrom(note, ["diagnosis", "type"], "Clinical note")}
                                </Badge>
                                <p className="mt-2 text-sm">
                                  {textFrom(note, ["clinical_notes", "notes", "summary", "presenting_complaint"])}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="text-sm font-medium">{formatDate(textFrom(note, ["notes_signed_on", "date", "created_at"], ""))}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={FileText} title="No clinical notes on record" />
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button variant="outline" onClick={() => setShowFullRecord(false)}>
                      Back to Summary
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Recent Activity
                    </p>
                    <div className="space-y-3">
                      {selectedPatient.prescriptions.slice(0, 2).map((rx, index) => (
                        <div key={textFrom(rx, ["uuid", "id"], `recent-rx-${index}`)} className="border-l-2 border-primary py-1.5 pl-3">
                          <div className="flex items-center gap-2">
                            <Pill className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-medium">{textFrom(rx, ["drug_name", "medication", "name"])}</span>
                            <span className="text-xs text-muted-foreground">{textFrom(rx, ["dosage", "strength", "frequency"], "")}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Prescribed on {formatDate(textFrom(rx, ["prescribed_on", "date", "created_at"], ""))}
                          </p>
                        </div>
                      ))}

                      {selectedPatient.clinicalNotes.slice(0, 2).map((note, index) => (
                        <div key={textFrom(note, ["uuid", "id"], `recent-note-${index}`)} className="border-l-2 border-blue-400 py-1.5 pl-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-sm font-medium">{textFrom(note, ["diagnosis", "type"], "Clinical note")}</span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {textFrom(note, ["clinical_notes", "notes", "summary", "presenting_complaint"])}
                          </p>
                        </div>
                      ))}

                      {selectedPatient.prescriptions.length === 0 && selectedPatient.clinicalNotes.length === 0 && (
                        <EmptyState icon={Activity} title="No recent activity" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border/60 p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{selectedPatient.prescriptions.length}</p>
                      <p className="text-xs text-muted-foreground">Prescriptions</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3 text-center">
                      <p className="text-2xl font-bold text-blue-500">{selectedPatient.clinicalNotes.length}</p>
                      <p className="text-xs text-muted-foreground">Clinical Notes</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3 text-center">
                      <p className="text-2xl font-bold text-green-500">
                        {selectedPatient.prescriptions.filter((rx) => textFrom(rx, ["status"], "active").toLowerCase() === "active").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Active Meds</p>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => setShowFullRecord(true)}>
                    <FileText className="mr-2 h-4 w-4" />
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
