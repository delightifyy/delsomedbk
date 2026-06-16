import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, StatCard, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, FileText, Pill, Video, Plus, ArrowRight, Clock, ShieldCheck, BadgeCheck, Building2, CreditCard, Star, Heart, Droplet, AlertCircle, Phone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { usePatientCategory, categoryLabel } from "@/hooks/usePatientCategory";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import desolmedLogo from "@/assets/desolmed-logo.png";

interface DashboardResponse {
  patient: {
    uuid: string;
    first_name: string;
    name: string;
  };
  active_payment_category: string;
  payment_category_banner: {
    category: string;
    title: string;
    subtitle: string;
  };
  stats: {
    upcoming: number;
    next_appointment_date: string;
    past_visits: number;
    active_rx: number;
  };
  upcoming_appointments: any[];
  past_consultations: any[];
  health_snapshot: {
    blood_type: string;
    date_of_birth: string;
    gender: string;
    phone: string;
  };
}

const statusVariant = (s: string) =>
  s === "confirmed" ? "default" : s === "pending" ? "secondary" : "outline";

// Loading screen component with ONLY logo - NO spinner
const DashboardLoadingScreen = () => (
  <PortalLayout portalName="Patient Portal" nav={patientNav}>
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        {/* Logo with bounce animation only - NO SPINNER */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-xl animate-pulse"></div>
          <div className="relative animate-bounce">
            <img 
              src={desolmedLogo} 
              alt="Desolmed" 
              className="w-28 h-28 mx-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  </PortalLayout>
);

const PatientDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [category, setCategory] = usePatientCategory();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response = await api.me.dashboard();
        console.log("Dashboard response:", response);
        const data = response.data as DashboardResponse;
        setDashboardData(data);
        
        // Update payment category from API response
        if (data.active_payment_category) {
          setCategory(data.active_payment_category as any);
        }
      } catch (error: any) {
        console.error("Failed to load dashboard:", error);
        toast({
          title: "Error loading dashboard",
          description: error.message || "Could not load your dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [toast, setCategory]);

  // Show loading screen with ONLY logo - NO spinner
  if (loading) {
    return <DashboardLoadingScreen />;
  }

  // Safe access with fallbacks
  const data = dashboardData || {
    patient: { uuid: "", first_name: "", name: "" },
    active_payment_category: "card",
    payment_category_banner: { category: "card", title: "Card Payment", subtitle: "Pay per consultation" },
    stats: { upcoming: 0, next_appointment_date: "", past_visits: 0, active_rx: 0 },
    upcoming_appointments: [],
    past_consultations: [],
    health_snapshot: { blood_type: "", date_of_birth: "", gender: "", phone: "" }
  };
  
  const patientName = data.patient?.first_name || data.patient?.name?.split(" ")[0] || "Patient";
  const upcoming = data.upcoming_appointments || [];
  const pastConsultations = data.past_consultations || [];
  const stats = data.stats || { upcoming: 0, next_appointment_date: "", past_visits: 0, active_rx: 0 };
  const healthSnapshot = data.health_snapshot || { blood_type: "", date_of_birth: "", gender: "", phone: "" };
  const paymentCategory = data.active_payment_category || "card";

  const categoryMeta = {
    card: { icon: CreditCard, line: "Card Payment account · Pay per consultation", title: "Card Payment" },
    hmo: { icon: ShieldCheck, line: "HMO coverage active", title: "HMO Coverage" },
    subscription: { icon: BadgeCheck, line: "Active subscription plan", title: "Subscription" },
    organization: { icon: Building2, line: "Organization coverage", title: "Organization" },
  }[paymentCategory] || { icon: CreditCard, line: "Pay per consultation", title: "Card Payment" };
  
  const CategoryIcon = categoryMeta.icon;

  // Get initials from name - safely
  const getInitials = (name: string) => {
    if (!name) return "DR";
    return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  };

  // Format date of birth for display
  const formatDOB = (dob: string) => {
    if (!dob) return "Not specified";
    return new Date(dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // Get gender display text and icon
  const getGenderDisplay = (gender: string) => {
    if (gender === "male") return { text: "Male" };
    if (gender === "female") return { text: "Female"};
    return { text: "Not specified", emoji: "" };
  };

  const genderDisplay = getGenderDisplay(healthSnapshot.gender);

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader
        title={`Welcome back, ${patientName}`}
        description="Here's a quick overview of your health activity."
        action={
          <Button asChild>
            <Link to="/doctors"><Plus className="h-4 w-4" /> Book Appointment</Link>
          </Button>
        }
      />

      {/* Payment Category Banner */}
      <div className="mb-6 rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-primary/0 p-4 sm:p-5 flex items-center gap-4">
        <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <CategoryIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Payment Category</p>
          <p className="font-medium text-sm truncate">{categoryMeta.title}</p>
          <p className="text-xs text-muted-foreground truncate">{categoryMeta.line}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/patient/payments">Manage <ArrowRight className="h-3.5 w-3.5" /></Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard 
          label="Upcoming" 
          value={String(stats.upcoming || 0)} 
          icon={CalendarDays} 
          trend={stats.next_appointment_date ? `Next: ${new Date(stats.next_appointment_date).toLocaleDateString()}` : "No upcoming"} 
        />
        <StatCard label="Past Visits" value={String(stats.past_visits || 0)} icon={FileText} accent="secondary" />
        <StatCard label="Active Rx" value={String(stats.active_rx || 0)} icon={Pill} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Appointments & Consultations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <SectionCard
            title="Upcoming Appointments"
            description="Your scheduled visits"
            action={<Button variant="ghost" size="sm" asChild><Link to="/patient/appointments">View all <ArrowRight className="h-3 w-3" /></Link></Button>}
          >
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No upcoming appointments</p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link to="/doctors">Book an appointment →</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((a: any, idx: number) => (
                  <div key={a.id || idx} className="flex items-center gap-4 p-3 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(a.doctor_name || a.doctor || "Doctor")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{a.doctor_name || a.doctor || "Doctor"}</p>
                      <p className="text-xs text-muted-foreground">{a.specialty || "General"} • {a.mode || "In-person"}</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end text-xs">
                      <span className="font-medium">{a.date ? new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Date TBD"}</span>
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{a.time || "Time TBD"}</span>
                    </div>
                    <Badge variant={statusVariant(a.status || "confirmed")} className="capitalize">{a.status || "confirmed"}</Badge>
                    {a.mode === "Video" && (
                      <Button size="sm"><Video className="h-3.5 w-3.5" /> Join</Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Past Consultations */}
          <SectionCard title="Past Consultations">
            {pastConsultations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No consultation history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastConsultations.map((c: any, idx: number) => (
                  <div key={c.id || idx} className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.doctor_name || "Doctor"} • {c.specialty || "General"}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.notes || c.reason || "Consultation"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-muted-foreground">{c.date ? new Date(c.date).toLocaleDateString() : "Date TBD"}</span>
                      <Button variant="ghost" size="sm" className="ml-2 h-7 px-2" asChild>
                        <Link to={`/patient/consultations/${c.id || idx}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column - Health Snapshot & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/patient/appointments"><Video className="h-4 w-4" /> Join Consultation</Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/doctors"><Plus className="h-4 w-4" /> Book Appointment</Link>
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

          {/* Health Snapshot */}
          <SectionCard title="Health Snapshot">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground flex items-center gap-2">
                  <Droplet className="h-4 w-4" /> Blood Type
                </dt>
                <dd className="font-medium">{healthSnapshot.blood_type || "Not specified"}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Date of Birth
                </dt>
                <dd className="font-medium">{formatDOB(healthSnapshot.date_of_birth)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Gender
                </dt>
                <dd className="font-medium">
                  {genderDisplay.emoji && <span className="mr-1">{genderDisplay.emoji}</span>}
                  {genderDisplay.text}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </dt>
                <dd className="font-medium">{healthSnapshot.phone || "Not specified"}</dd>
              </div>
            </dl>
            <Button variant="link" size="sm" className="w-full mt-3" asChild>
              <Link to="/patient/settings">Update health information →</Link>
            </Button>
          </SectionCard>
        </div>
      </div>
    </PortalLayout>
  );
};

export default PatientDashboard;