import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, StatCard, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { patientMock } from "@/data/portalMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, FileText, Pill, Video, Plus, ArrowRight, Clock, ShieldCheck, BadgeCheck, Building2, CreditCard, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { usePatientCategory, categoryLabel } from "@/hooks/usePatientCategory";

const statusVariant = (s: string) =>
  s === "confirmed" ? "default" : s === "pending" ? "secondary" : "outline";

const PatientDashboard = () => {
  const upcoming = patientMock.appointments.filter((a) => a.status !== "completed");
  const past = patientMock.appointments.filter((a) => a.status === "completed");
  const [category] = usePatientCategory();

  const categoryMeta = {
    card: { icon: CreditCard, line: "Card Payment account · Pay per consultation" },
    hmo: { icon: ShieldCheck, line: `${patientMock.hmo.provider} · ${patientMock.hmo.plan}` },
    subscription: { icon: BadgeCheck, line: `${patientMock.subscription.plan} · Renews ${new Date(patientMock.subscription.renewsOn).toLocaleDateString()}` },
    organization: { icon: Building2, line: `${patientMock.organization.name} · ${patientMock.organization.coverageTier}` },
  }[category];
  const CategoryIcon = categoryMeta.icon;

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader
        title={`Welcome back, ${patientMock.profile.name.split(" ")[0]}`}
        description="Here's a quick overview of your health activity."
        action={
          <Button asChild>
            <Link to="/patient/appointments"><Plus className="h-4 w-4" /> Book Appointment</Link>
          </Button>
        }
      />

      <div className="mb-6 rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-primary/0 p-4 sm:p-5 flex items-center gap-4">
        <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <CategoryIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Payment category</p>
          <p className="font-medium text-sm truncate">{categoryLabel(category)}</p>
          <p className="text-xs text-muted-foreground truncate">{categoryMeta.line}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/patient/payments">Manage <ArrowRight className="h-3.5 w-3.5" /></Link>
        </Button>
      </div>



      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Upcoming" value={patientMock.stats.upcoming} icon={CalendarDays} trend="Next: May 15" />
        <StatCard label="Past Visits" value={patientMock.stats.past} icon={FileText} accent="secondary" />
        <StatCard label="Active Rx" value={patientMock.stats.prescriptions} icon={Pill} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Upcoming Appointments"
            description="Your scheduled visits"
            action={<Button variant="ghost" size="sm" asChild><Link to="/patient/appointments">View all <ArrowRight className="h-3 w-3" /></Link></Button>}
          >
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors">
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary text-xs">{a.doctor.split(" ").slice(-2).map(s=>s[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{a.doctor}</p>
                    <p className="text-xs text-muted-foreground">{a.specialty} • {a.mode}</p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end text-xs">
                    <span className="font-medium">{new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{a.time}</span>
                  </div>
                  <Badge variant={statusVariant(a.status)} className="capitalize">{a.status}</Badge>
                  {a.mode === "Video" && (
                    <Button size="sm"><Video className="h-3.5 w-3.5" /> Join</Button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Past Consultations">
            <div className="space-y-3">
              {past.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.doctor} • {a.specialty}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.notes}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{new Date(a.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Quick Actions">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/patient/appointments"><Video className="h-4 w-4" /> Join Consultation</Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/patient/appointments"><Plus className="h-4 w-4" /> Book Appointment</Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/patient/records"><FileText className="h-4 w-4" /> View Records</Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/patient/prescriptions"><Pill className="h-4 w-4" /> Refill Rx</Link>
              </Button>
              <Button className="justify-start" asChild>
                <Link to="/subscription"><Star className="h-4 w-4" /> Subscribe / Choose Plan</Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Health Snapshot">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Blood Type</dt><dd className="font-medium">{patientMock.profile.blood}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">DOB</dt><dd className="font-medium">{patientMock.profile.dob}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Gender</dt><dd className="font-medium">{patientMock.profile.gender}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{patientMock.profile.phone}</dd></div>
            </dl>
          </SectionCard>
        </div>
      </div>
    </PortalLayout>
  );
};

export default PatientDashboard;
