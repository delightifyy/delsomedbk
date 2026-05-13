import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, StatCard, SectionCard } from "@/components/portal/PortalUI";
import { doctorNav } from "./nav";
import { doctorMock } from "@/data/portalMock";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Users, FileEdit, Activity, Video, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const DoctorDashboard = () => (
  <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
    <PageHeader
      title={`Good morning, ${doctorMock.profile.name.split(" ").slice(-1)[0]}`}
      description={`${doctorMock.profile.specialty} • License ${doctorMock.profile.license}`}
      action={<Button asChild><Link to="/doctor/consultations/c_001"><Video className="h-4 w-4" /> Start Next Consult</Link></Button>}
    />

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Today" value={doctorMock.stats.todayAppointments} icon={CalendarClock} trend="6 scheduled" />
      <StatCard label="This Week" value={doctorMock.stats.weekConsultations} icon={Activity} accent="secondary" />
      <StatCard label="Patients" value={doctorMock.stats.activePatients} icon={Users} />
      <StatCard label="Pending Notes" value={doctorMock.stats.pendingNotes} icon={FileEdit} accent="muted" />
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
                  {c.status.replace("_", " ")}
                </Badge>
                <Button size="sm" asChild><Link to={`/doctor/consultations/${c.id}`}><Video className="h-3.5 w-3.5" /> Start</Link></Button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Notifications" action={<Bell className="h-4 w-4 text-muted-foreground" />}>
        <ul className="space-y-3">
          {doctorMock.notifications.map((n) => (
            <li key={n.id} className="text-sm border-l-2 border-primary pl-3 py-1">
              <p>{n.text}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  </PortalLayout>
);

export default DoctorDashboard;
