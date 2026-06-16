import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, StatCard, SectionCard } from "@/components/portal/PortalUI";
import { doctorNav } from "./nav";
import { doctorMock } from "@/data/portalMock";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Users, FileEdit, Activity, Video, Bell, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const DoctorDashboard = () => {
  // Get upcoming appointments (next 5)
  const upcomingAppointments = doctorMock.todaySchedule.slice(0, 5);

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader
        title={`Good morning, ${doctorMock.profile.name.split(" ").slice(-1)[0]}`}
        description={`${doctorMock.profile.specialty} • License ${doctorMock.profile.license}`}
        action={<Button asChild><Link to="/doctor/consultations/c_001"><Video className="h-4 w-4" /> Start Next Consult</Link></Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today" value={doctorMock.stats.todayAppointments} icon={CalendarClock} trend="6 scheduled" />
        <StatCard label="This Week" value={doctorMock.stats.weekConsultations} icon={Activity} accent="secondary" />
        <StatCard label="Total Patients" value={doctorMock.stats.activePatients} icon={Users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Today's Schedule" description={new Date().toDateString()}>
            <div className="space-y-2">
              {doctorMock.todaySchedule.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors">
                  <div className="w-14 text-center shrink-0">
                    <p className="text-sm font-bold font-display">{c.time}</p>
                  </div>
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs">{c.patient.split(" ").map(s=>s[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.patient}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.reason}</p>
                  </div>
                  <Badge variant={c.status === "in_progress" ? "default" : "outline"} className="capitalize hidden sm:inline-flex">
                    {c.status === "in_progress" ? "In Progress" : c.status === "completed" ? "Done" : "Scheduled"}
                  </Badge>
                  <Button size="sm" asChild><Link to={`/doctor/consultations/${c.id}`}><Video className="h-3.5 w-3.5" /> Start</Link></Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Upcoming Schedule Reminders */}
        <SectionCard title="Upcoming Reminders" description="Next appointments" action={<Clock className="h-4 w-4 text-muted-foreground" />}>
          {upcomingAppointments.length > 0 ? (
            <ul className="space-y-3">
              {upcomingAppointments.map((appt) => (
                <li key={`reminder-${appt.id}`} className="flex items-start gap-3 border-l-2 border-primary/60 pl-3 py-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{appt.patient}</p>
                    <p className="text-xs text-muted-foreground truncate">{appt.reason}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="outline" className="text-[10px]">
                      {appt.time}
                    </Badge>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {appt.status === "in_progress" ? "🔴 In progress" : appt.status === "completed" ? "✅ Done" : "⏳ Upcoming"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming appointments</p>
          )}
          <div className="mt-3 pt-2 border-t border-border/40">
            <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
              <Link to="/doctor/consultations">View full schedule →</Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    </PortalLayout>
  );
};

export default DoctorDashboard;