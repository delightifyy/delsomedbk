import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Loader2, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { doctorPortalApi, type DoctorPortalAppointment } from "@/lib/doctorPortalApi";
import { doctorNav } from "./nav";

const startOfWeek = (date: Date) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next.toISOString().slice(0, 10);
};

const statusLabel = (status: string) => status.replace(/_/g, " ") || "scheduled";

const Schedule = () => {
  const [weekOf, setWeekOf] = useState(startOfWeek(new Date()));
  const [appointments, setAppointments] = useState<DoctorPortalAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return appointments.reduce<Record<string, DoctorPortalAppointment[]>>((acc, appointment) => {
      const date = appointment.date || "Unscheduled";
      acc[date] = acc[date] ?? [];
      acc[date].push(appointment);
      return acc;
    }, {});
  }, [appointments]);

  const loadSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorPortalApi.schedule(weekOf);
      setAppointments(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOf]);

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title="Schedule"
        description="Your confirmed appointments for the selected week."
        action={
          <Input
            type="date"
            value={weekOf}
            onChange={(event) => setWeekOf(event.target.value)}
            className="h-9 w-[150px]"
          />
        }
      />

      <SectionCard title="Weekly Schedule" description={`Week of ${weekOf}`}>
        {loading ? (
          <div className="grid min-h-[260px] place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <EmptyState
            icon={CalendarClock}
            title="Could not load schedule"
            description={error}
            action={
              <Button onClick={loadSchedule}>
                Try again
              </Button>
            }
          />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No appointments found"
            description="Confirmed appointments for the selected week will appear here."
          />
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([date, entries]) => (
              <div key={date}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {date === "Unscheduled" ? date : new Date(date).toDateString()}
                </p>
                <div className="space-y-2">
                  {entries.map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-4 rounded-lg border border-border/60 p-3">
                      <div className="w-16 font-display text-sm font-bold">{appointment.time || "--:--"}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{appointment.patientName}</p>
                        <p className="truncate text-xs text-muted-foreground">{appointment.reason}</p>
                      </div>
                      <Badge variant="outline" className="hidden capitalize sm:inline-flex">
                        {statusLabel(appointment.status)}
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/doctor/consultations/${appointment.consultationUuid ?? appointment.appointmentUuid}`}>
                          <Video className="h-3.5 w-3.5" />
                          Open
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PortalLayout>
  );
};

export default Schedule;
