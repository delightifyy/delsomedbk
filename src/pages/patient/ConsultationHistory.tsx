import { useState, useMemo } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { patientMock } from "@/data/portalMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Calendar, Clock, MapPin, Search, Stethoscope, Pill, FileText, Paperclip, Download, FlaskConical, RefreshCw } from "lucide-react";

type Prescription = typeof patientMock.prescriptions[number];
type LabRequest = typeof patientMock.labRequests[number];
type Consultation = typeof patientMock.appointments[number] & {
  diagnosis?: string;
  treatment?: string;
  attachments?: string[];
  prescriptions: Prescription[];
  labRequests: LabRequest[];
};

const ConsultationHistory = () => {
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming">("all");

  // Enrich consultations with matching medical records, prescriptions, and lab requests by date
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

  const filtered = consultations.filter((c) => {
    const matchesQuery = [c.doctor, c.specialty, c.notes, c.diagnosis, c.treatment]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && c.status === "completed") ||
      (filter === "upcoming" && c.status !== "completed");
    return matchesQuery && matchesFilter;
  });

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader
        title="Consultation History"
        description="Track every consultation and access your healthcare records in one place."
      />

      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by doctor, diagnosis, treatment..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="relative pl-6 border-l-2 border-border/60 space-y-5">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">No consultations found.</p>
          )}
          {filtered.map((c) => (
            <div key={c.id} className="relative">
              <span className="absolute -left-[31px] top-4 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
              <button
                onClick={() => setSelected(c)}
                className="w-full text-left flex items-center gap-4 p-4 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-all"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {c.doctor.split(" ").slice(-2).map((s) => s[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.doctor}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.specialty}
                    {c.diagnosis ? ` • ${c.diagnosis}` : ""}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {c.time}
                  </span>
                  <span className="flex items-center gap-1">
                    {c.mode === "Video" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {c.mode}
                  </span>
                </div>
                <Badge
                  variant={c.status === "confirmed" ? "default" : c.status === "pending" ? "secondary" : "outline"}
                  className="capitalize"
                >
                  {c.status}
                </Badge>
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.doctor}</SheetTitle>
                <SheetDescription>
                  {selected.specialty} • {new Date(selected.date).toLocaleDateString()}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Date</p>
                    <p className="font-medium text-sm mt-1">{selected.date}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Time</p>
                    <p className="font-medium text-sm mt-1">{selected.time}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Mode</p>
                    <p className="font-medium text-sm mt-1">{selected.mode}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Status</p>
                    <p className="font-medium text-sm mt-1 capitalize">{selected.status}</p>
                  </div>
                </div>

                {selected.diagnosis && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                      <Stethoscope className="h-3 w-3" /> Diagnosis
                    </p>
                    <p className="text-sm bg-muted/40 p-3 rounded-lg">{selected.diagnosis}</p>
                  </div>
                )}

                {selected.treatment && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                      <Pill className="h-3 w-3" /> Treatment
                    </p>
                    <p className="text-sm bg-muted/40 p-3 rounded-lg">{selected.treatment}</p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                    <FileText className="h-3 w-3" /> Consultation Notes
                  </p>
                  <p className="text-sm bg-muted/40 p-3 rounded-lg">{selected.notes}</p>
                </div>

                {selected.attachments && selected.attachments.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2">
                      <Paperclip className="h-3 w-3" /> Attachments
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.attachments.map((f) => (
                        <Badge key={f} variant="secondary" className="gap-1">
                          <FileText className="h-3 w-3" />
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

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
