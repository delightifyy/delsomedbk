import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, FileText, Loader2, User, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  doctorPortalApi,
  normalizeAppointment,
  type DoctorPortalAppointment,
} from "@/lib/doctorPortalApi";
import { doctorNav } from "./nav";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PT";

const statusLabel = (status: string) => status.replace(/_/g, " ") || "scheduled";

const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
  <div className="flex justify-between gap-4 border-b border-border/40 py-2 text-sm last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium">{value || "N/A"}</span>
  </div>
);

const Consultations = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState("confirmed");
  const [appointments, setAppointments] = useState<DoctorPortalAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorPortalAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorPortalApi.appointments({
        status: status === "all" ? undefined : status,
        per_page: 50,
      });
      setAppointments(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load consultations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const openDetails = async (appointment: DoctorPortalAppointment) => {
    setSelectedAppointment(appointment);
    setDetailLoading(true);
    try {
      const detail = await api.doctorPortal.appointments.detail(appointment.appointmentUuid);
      setSelectedAppointment(normalizeAppointment(detail));
    } catch {
      setSelectedAppointment(appointment);
    } finally {
      setDetailLoading(false);
    }
  };

  const markNoShow = async (appointment: DoctorPortalAppointment) => {
    setActionBusyId(appointment.id);
    try {
      await api.doctorPortal.appointments.noShow(appointment.appointmentUuid);
      toast({ title: "Appointment updated", description: "The appointment has been marked as no-show." });
      await loadAppointments();
    } catch (err) {
      toast({
        title: "Could not update appointment",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionBusyId(null);
    }
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title="Consultations"
        description="Scheduled and active appointments for your practice."
        action={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <SectionCard>
        {loading ? (
          <div className="grid min-h-[280px] place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState
            icon={Calendar}
            title="Could not load consultations"
            description={error}
            action={
              <Button onClick={loadAppointments}>
                Try again
              </Button>
            }
          />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No consultations found"
            description="Appointments will appear here when they are available."
          />
        ) : (
          <div className="space-y-2">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-4 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="w-16 font-display text-sm font-bold">{appointment.time || "--:--"}</div>
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {initials(appointment.patientName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{appointment.patientName}</p>
                  <p className="truncate text-xs text-muted-foreground">{appointment.reason}</p>
                </div>
                <Badge variant={appointment.status === "in_progress" ? "default" : "outline"} className="hidden capitalize sm:inline-flex">
                  {statusLabel(appointment.status)}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => openDetails(appointment)}>
                  <FileText className="h-3.5 w-3.5" />
                  Details
                </Button>
                {appointment.status !== "completed" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markNoShow(appointment)}
                    disabled={actionBusyId === appointment.id}
                  >
                    {actionBusyId === appointment.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    No-show
                  </Button>
                )}
                <Button size="sm" asChild>
                  <Link to={`/doctor/consultations/${appointment.consultationUuid ?? appointment.appointmentUuid}`}>
                    <Video className="h-3.5 w-3.5" />
                    Open
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials(selectedAppointment.patientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedAppointment.patientName}</DialogTitle>
                    <DialogDescription>
                      {detailLoading ? "Loading appointment details..." : selectedAppointment.reason}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-2 space-y-5">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Appointment</p>
                  <DetailRow label="Date" value={selectedAppointment.date} />
                  <DetailRow label="Time" value={selectedAppointment.time} />
                  <DetailRow label="Status" value={statusLabel(selectedAppointment.status)} />
                  <DetailRow label="Mode" value={selectedAppointment.mode} />
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Patient</p>
                  <DetailRow label="Email" value={selectedAppointment.patientEmail} />
                  <DetailRow label="Phone" value={selectedAppointment.patientPhone} />
                  <DetailRow label="Age" value={selectedAppointment.age} />
                  <DetailRow label="Gender" value={selectedAppointment.gender} />
                  <DetailRow label="Patient ID" value={selectedAppointment.patientUuid} />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                    Close
                  </Button>
                  {selectedAppointment.patientUuid && (
                    <Button variant="outline" asChild>
                      <Link to="/doctor/patients">
                        <User className="h-3.5 w-3.5" />
                        Patient records
                      </Link>
                    </Button>
                  )}
                  <Button asChild>
                    <Link to={`/doctor/consultations/${selectedAppointment.consultationUuid ?? selectedAppointment.appointmentUuid}`}>
                      <Video className="h-3.5 w-3.5" />
                      Start consultation
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default Consultations;
