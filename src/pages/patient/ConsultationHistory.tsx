import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, EmptyState } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { patientMock } from "@/data/portalMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Video,
  Calendar,
  Clock,
  MapPin,
  Search,
  Stethoscope,
  Pill,
  FileText,
  Download,
  FlaskConical,
  RefreshCw,
  ClipboardList,
  User,
  NotebookPen,
  CalendarPlus,
  Eye,
} from "lucide-react";

type Prescription = typeof patientMock.prescriptions[number];
type LabRequest = typeof patientMock.labRequests[number];
type Consultation = typeof patientMock.appointments[number] & {
  diagnosis?: string;
  treatment?: string;
  attachments?: string[];
  prescriptions: Prescription[];
  labRequests: LabRequest[];
};

const typeLabel = (mode: string) => (mode === "Video" ? "Virtual" : "In-Person");

const ConsultationHistory = () => {
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [query, setQuery] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const consultations: Consultation[] = useMemo(() => {
    return patientMock.appointments
      .map((a) => {
        const record = patientMock.records.find((r) => r.date === a.date);
        return {
          ...a,
          diagnosis: record?.diagnosis,
          treatment: record?.treatment,
          attachments: record?.attachments,
          prescriptions: patientMock.prescriptions.filter((p) => p.date === a.date),
          labRequests: patientMock.labRequests.filter((l) => l.date === a.date),
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, []);

  const doctors = useMemo(
    () => Array.from(new Set(consultations.map((c) => c.doctor))),
    [consultations]
  );

  const filtered = consultations.filter((c) => {
    const matchesQuery = [c.doctor, c.specialty, c.notes, c.diagnosis, c.treatment]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesDoctor = doctorFilter === "all" || c.doctor === doctorFilter;
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "virtual" && c.mode === "Video") ||
      (typeFilter === "in_person" && c.mode !== "Video");

    let matchesDate = true;
    if (dateFilter !== "all") {
      const now = new Date();
      const d = new Date(c.date);
      const days = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (dateFilter === "30") matchesDate = days <= 30 && days >= -30;
      if (dateFilter === "90") matchesDate = days <= 90 && days >= -90;
      if (dateFilter === "year") matchesDate = days <= 365 && days >= -365;
    }

    return matchesQuery && matchesDoctor && matchesType && matchesDate;
  });

  const statusBadge = (status: string) => {
    const variant =
      status === "completed"
        ? "default"
        : status === "confirmed"
        ? "secondary"
        : status === "pending"
        ? "outline"
        : "outline";
    return (
      <Badge variant={variant as "default" | "secondary" | "outline"} className="capitalize">
        {status === "confirmed" ? "Follow-up" : status}
      </Badge>
    );
  };

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader
        title="Consultation History"
        description="Review your complete healthcare history — consultations, prescriptions, and lab results in one place."
      />

      {/* Filters */}
      <Card className="border-border/60 mb-5">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="relative md:col-span-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by doctor, diagnosis, symptoms..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="md:col-span-3">
                <SelectValue placeholder="Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All doctors</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="md:col-span-2">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="in_person">In-Person</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="md:col-span-2">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="You do not have any consultation records yet."
          description="Once you've had a consultation, your history, prescriptions and lab results will appear here."
          action={
            <Button asChild>
              <Link to="/doctor-portal?book=1">
                <CalendarPlus className="h-4 w-4" /> Book Appointment
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="border-border/60 hover:shadow-md hover:border-primary/40 transition-all"
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {c.doctor
                        .split(" ")
                        .slice(-2)
                        .map((s) => s[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-base truncate">{c.doctor}</p>
                      {statusBadge(c.status)}
                      <Badge variant="outline" className="capitalize gap-1">
                        {c.mode === "Video" ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <MapPin className="h-3 w-3" />
                        )}
                        {typeLabel(c.mode)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {c.specialty}
                      {c.diagnosis ? ` • ${c.diagnosis}` : ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(c.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {c.time}
                      </span>
                      {c.prescriptions.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Pill className="h-3.5 w-3.5" />
                          {c.prescriptions.length} prescription
                          {c.prescriptions.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {c.labRequests.length > 0 && (
                        <span className="flex items-center gap-1">
                          <FlaskConical className="h-3.5 w-3.5" />
                          {c.labRequests.length} lab request
                          {c.labRequests.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 md:items-end">
                    <Button size="sm" onClick={() => setSelected(c)} className="w-full md:w-auto">
                      <Eye className="h-4 w-4" /> View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Consultation Details
                </SheetTitle>
                <SheetDescription>
                  {selected.specialty} •{" "}
                  {new Date(selected.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Doctor card */}
                <Card className="border-border/60">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {selected.doctor
                          .split(" ")
                          .slice(-2)
                          .map((s) => s[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{selected.doctor}</p>
                      <p className="text-xs text-muted-foreground">{selected.specialty}</p>
                    </div>
                    {statusBadge(selected.status)}
                  </CardContent>
                </Card>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date
                    </p>
                    <p className="font-medium text-sm mt-1">{selected.date}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Time
                    </p>
                    <p className="font-medium text-sm mt-1">{selected.time}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      {selected.mode === "Video" ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}{" "}
                      Type
                    </p>
                    <p className="font-medium text-sm mt-1">{typeLabel(selected.mode)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3" /> Status
                    </p>
                    <p className="font-medium text-sm mt-1 capitalize">{selected.status}</p>
                  </div>
                </div>

                <Separator />

                {/* Accordion sections */}
                <Accordion
                  type="multiple"
                  defaultValue={["info", "rx", "labs"]}
                  className="space-y-2"
                >
                  <AccordionItem value="info" className="border rounded-lg px-3">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <NotebookPen className="h-4 w-4 text-primary" />
                        Consultation Information
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                          Reason for Visit / Notes
                        </p>
                        <p className="text-sm bg-muted/40 p-3 rounded-lg">{selected.notes}</p>
                      </div>
                      {selected.diagnosis && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            Diagnosis
                          </p>
                          <p className="text-sm bg-muted/40 p-3 rounded-lg">{selected.diagnosis}</p>
                        </div>
                      )}
                      {selected.treatment && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            Treatment Plan
                          </p>
                          <p className="text-sm bg-muted/40 p-3 rounded-lg">{selected.treatment}</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="rx" className="border rounded-lg px-3">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Pill className="h-4 w-4 text-primary" />
                        Prescriptions
                        {selected.prescriptions.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {selected.prescriptions.length}
                          </Badge>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      {selected.prescriptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No prescriptions for this consultation.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selected.prescriptions.map((rx) => (
                            <div
                              key={rx.id}
                              className="p-3 rounded-lg border border-border/60 bg-muted/30"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium text-sm">{rx.medication}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {rx.dosage}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {rx.refills} refills left
                                  </p>
                                </div>
                                <Badge
                                  variant={rx.status === "active" ? "default" : "outline"}
                                  className="capitalize shrink-0"
                                >
                                  {rx.status}
                                </Badge>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" className="h-7 text-xs">
                                  <Download className="h-3 w-3" /> View / Download
                                </Button>
                                {rx.status === "active" && (
                                  <Button size="sm" className="h-7 text-xs">
                                    <RefreshCw className="h-3 w-3" /> Refill
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="labs" className="border rounded-lg px-3">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <FlaskConical className="h-4 w-4 text-primary" />
                        Lab Requests
                        {selected.labRequests.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {selected.labRequests.length}
                          </Badge>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      {selected.labRequests.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No lab requests for this consultation.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selected.labRequests.map((lab) => (
                            <div
                              key={lab.id}
                              className="p-3 rounded-lg border border-border/60 bg-muted/30"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium text-sm">{lab.test}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{lab.lab}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Requested {new Date(lab.date).toLocaleDateString()}
                                  </p>
                                  {lab.result && <p className="text-xs mt-1.5">{lab.result}</p>}
                                </div>
                                <Badge
                                  variant={lab.status === "completed" ? "default" : "secondary"}
                                  className="capitalize shrink-0"
                                >
                                  {lab.status}
                                </Badge>
                              </div>
                              {lab.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {lab.attachments.map((f) => (
                                    <Badge key={f} variant="outline" className="gap-1 text-xs">
                                      <FileText className="h-3 w-3" />
                                      {f}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {lab.status === "completed" && (
                                <Button size="sm" variant="outline" className="h-7 text-xs mt-2">
                                  <Eye className="h-3 w-3" /> View Results
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {selected.attachments && selected.attachments.length > 0 && (
                    <AccordionItem value="files" className="border rounded-lg px-3">
                      <AccordionTrigger className="hover:no-underline">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-4 w-4 text-primary" />
                          Attachments
                          <Badge variant="secondary" className="ml-1">
                            {selected.attachments.length}
                          </Badge>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <div className="flex flex-wrap gap-2">
                          {selected.attachments.map((f) => (
                            <Badge key={f} variant="secondary" className="gap-1">
                              <FileText className="h-3 w-3" />
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>

                <div className="flex flex-col gap-2 pt-2">
                  {selected.mode === "Video" && selected.status !== "completed" && (
                    <Button className="w-full">
                      <Video className="h-4 w-4" /> Join Consultation
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4" /> Download Summary
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PortalLayout>
  );
};

export default ConsultationHistory;
