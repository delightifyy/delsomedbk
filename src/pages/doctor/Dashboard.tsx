import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, CalendarClock, Clock, FileEdit, Loader2, Users, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, SectionCard, StatCard } from "@/components/portal/PortalUI";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { doctorPortalApi, type DoctorPortalDashboard } from "@/lib/doctorPortalApi";
import { doctorNav } from "./nav";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PT";

const labelForStatus = (status: string) => {
  const normalized = status.replace(/_/g, " ").toLowerCase();
  if (normalized === "in progress") return "In Progress";
  if (normalized === "completed") return "Done";
  return normalized || "Scheduled";
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DoctorPortalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorPortalApi.dashboard(user?.name ?? user?.email ?? "Doctor");
      setDashboard(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schedule = dashboard?.todaySchedule ?? [];
  const upcomingAppointments = schedule.slice(0, 5);
  const nextAppointment = schedule.find((appointment) => appointment.status !== "completed") ?? schedule[0];
  const nextAppointmentUrl = nextAppointment
    ? `/doctor/consultations/${nextAppointment.consultationUuid ?? nextAppointment.appointmentUuid}`
    : "/doctor/consultations";

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title={dashboard ? `Good morning, ${dashboard.profile.name.split(" ").slice(-1)[0] || "Doctor"}` : "Doctor Dashboard"}
        description={
          dashboard
            ? `${dashboard.profile.specialty} - License ${dashboard.profile.license}`
            : "Your EMR dashboard and appointment activity."
        }
        action={
          <Button asChild className="hidden sm:inline-flex" disabled={!nextAppointment}>
            <Link to={nextAppointmentUrl}>
              <Video className="h-4 w-4" />
              Start Next Consult
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="grid min-h-[360px] place-items-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <EmptyState
          icon={Activity}
          title="Could not load doctor dashboard"
          description={error}
          action={
            <Button onClick={loadDashboard}>
              Try again
            </Button>
          }
        />
      ) : dashboard ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Today" value={dashboard.stats.todayAppointments} icon={CalendarClock} trend={`${schedule.length} scheduled`} />
            <StatCard label="This Week" value={dashboard.stats.weekConsultations} icon={Activity} accent="secondary" />
            <StatCard label="Total Patients" value={dashboard.stats.activePatients} icon={Users} />
            <StatCard label="Pending Notes" value={dashboard.stats.pendingNotes} icon={FileEdit} accent="muted" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionCard title="Today's Schedule" description={new Date().toDateString()}>
                {schedule.length > 0 ? (
                  <div className="space-y-3">
                    {schedule.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
                      >
                        <div className="w-14 shrink-0 text-center">
                          <p className="font-display text-sm font-bold">{appointment.time || "--:--"}</p>
                        </div>

                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {initials(appointment.patientName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{appointment.patientName}</p>
                          <p className="truncate text-xs text-muted-foreground">{appointment.reason}</p>
                        </div>

                        <Badge variant={appointment.status === "in_progress" ? "default" : "outline"} className="hidden shrink-0 capitalize sm:inline-flex">
                          {labelForStatus(appointment.status)}
                        </Badge>

                        <Button size="sm" className="shrink-0" asChild>
                          <Link to={`/doctor/consultations/${appointment.consultationUuid ?? appointment.appointmentUuid}`}>
                            <Video className="h-3.5 w-3.5" />
                            <span className="ml-1">Open</span>
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={CalendarClock}
                    title="No appointments today"
                    description="Confirmed appointments will appear here."
                    action={
                      <Button variant="outline" asChild>
                        <Link to="/doctor/schedule">View schedule</Link>
                      </Button>
                    }
                  />
                )}
              </SectionCard>
            </div>

            <div>
              <SectionCard title="Upcoming Reminders" description="Next appointments" action={<Clock className="h-4 w-4 text-muted-foreground" />}>
                {upcomingAppointments.length > 0 ? (
                  <ul className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <li key={`reminder-${appointment.id}`} className="flex items-start gap-3 border-l-2 border-primary/60 py-1 pl-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{appointment.patientName}</p>
                          <p className="truncate text-xs text-muted-foreground">{appointment.reason}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <Badge variant="outline" className="text-[10px]">
                            {appointment.time || "--:--"}
                          </Badge>
                          <p className="mt-0.5 text-[9px] capitalize text-muted-foreground">
                            {labelForStatus(appointment.status)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                )}
                <div className="mt-3 border-t border-border/40 pt-2">
                  <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                    <Link to="/doctor/consultations">View full schedule</Link>
                  </Button>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      ) : null}
    </PortalLayout>
  );
};

export default DoctorDashboard;
