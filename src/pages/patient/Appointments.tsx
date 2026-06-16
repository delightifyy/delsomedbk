import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Video, Calendar, Clock, Plus, MapPin, Mail, Phone, Globe, CalendarCheck, Stethoscope } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import desolmedLogo from "@/assets/desolmed-logo.png";

interface Appointment {
  id: string;
  appointment_uuid?: string;
  doctor_name: string;
  doctor_uuid?: string;
  specialty: string;
  date: string;
  time: string;
  mode: "Video" | "In-person";
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes?: string;
  location?: string;
  meeting_link?: string;
  payment_status?: string;
  access_method?: string;
  created_at?: string;
}

interface AppointmentDetail {
  uuid: string;
  doctor: {
    name: string;
    uuid: string;
    specialty: string;
    email?: string;
    phone?: string;
  };
  slot_date: string;
  slot_start_time: string;
  slot_end_time?: string;
  status: string;
  mode: string;
  reason?: string;
  meeting_link?: string;
  location?: {
    name: string;
    address: string;
  };
  payment_status?: string;
  access_method?: string;
  created_at: string;
}

interface DoctorDetails {
  fullName: string;
  specialty: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zone: string;
  registeredOn: string;
  image?: string;
}

const statusVariant = (s: string) => {
  switch (s) {
    case "confirmed": return "default";
    case "pending": return "secondary";
    case "cancelled": return "destructive";
    case "completed": return "outline";
    default: return "secondary";
  }
};

// Loading screen component with ONLY logo - NO spinner
const AppointmentsLoadingScreen = () => (
  <PortalLayout portalName="Patient Portal" nav={patientNav}>
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
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

// Detail loading screen - ONLY logo, NO spinner
const AppointmentDetailLoading = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative mb-4">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-xl animate-pulse"></div>
      <div className="relative animate-bounce">
        <img 
          src={desolmedLogo} 
          alt="Desolmed" 
          className="w-16 h-16 mx-auto object-contain"
        />
      </div>
    </div>
    <p className="text-muted-foreground text-sm animate-pulse">Loading appointment details...</p>
  </div>
);

// Profile loading screen - ONLY logo, NO spinner
const ProfileLoadingScreen = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative mb-4">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-xl animate-pulse"></div>
      <div className="relative animate-bounce">
        <img 
          src={desolmedLogo} 
          alt="Desolmed" 
          className="w-16 h-16 mx-auto object-contain"
        />
      </div>
    </div>
    <p className="text-muted-foreground text-sm animate-pulse">Loading doctor profile...</p>
  </div>
);

const Appointments = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [profile, setProfile] = useState<DoctorDetails | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load appointments list
  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      try {
        const response = await api.me.appointments.list({ status: "confirmed" });
        console.log("Appointments response:", response);
        
        const dataArray = response.data?.data || [];
        
        if (dataArray.length === 0) {
          setAppointments([]);
          setLoading(false);
          return;
        }
        
        const transformedAppointments = dataArray.map((apt: any) => ({
          id: apt.id || apt.appointment_uuid,
          appointment_uuid: apt.appointment_uuid || apt.uuid,
          doctor_name: apt.doctor_name || apt.doctor?.name || "",
          doctor_uuid: apt.doctor_uuid || apt.doctor?.uuid,
          specialty: apt.specialty || apt.doctor?.specialty || "",
          date: apt.date || apt.slot_date,
          time: apt.time || apt.slot_start_time,
          mode: apt.mode === "online" ? "Video" : "In-person",
          status: apt.status || "confirmed",
          notes: apt.notes || apt.reason,
          location: apt.location || apt.clinic_location?.address,
        }));
        
        setAppointments(transformedAppointments);
      } catch (error: any) {
        console.error("Failed to load appointments:", error);
        toast({
          title: "Error loading appointments",
          description: error.message || "Could not load your appointments",
          variant: "destructive",
        });
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [toast]);

  // Load appointment details when clicked
  const loadAppointmentDetail = async (appointmentUuid: string) => {
    setDetailLoading(true);
    try {
      const response = await api.me.appointments.detail(appointmentUuid);
      console.log("Appointment detail response:", response);
      const detail = response.data as AppointmentDetail;
      setSelectedAppointment(detail);
    } catch (error: any) {
      console.error("Failed to load appointment details:", error);
      toast({
        title: "Error",
        description: error.message || "Could not load appointment details",
        variant: "destructive",
      });
      setSelectedAppointment(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectAppointment = async (apt: Appointment) => {
    setSelected(apt);
    if (apt.appointment_uuid) {
      await loadAppointmentDetail(apt.appointment_uuid);
    }
  };

  const openProfile = async (e: React.MouseEvent, doctorUuid?: string) => {
    e.stopPropagation();
    
    if (!doctorUuid) {
      toast({
        title: "Cannot load profile",
        description: "Doctor information not available",
        variant: "destructive",
      });
      return;
    }
    
    setProfileLoading(true);
    
    try {
      const response = await api.doctors.detail(doctorUuid);
      const doctorData = response.data;
      
      if (!doctorData) {
        throw new Error("No doctor data received");
      }
      
      setProfile({
        fullName: doctorData.name || "",
        specialty: doctorData.specialty || "",
        email: doctorData.email || "",
        phone: doctorData.phone || "",
        city: doctorData.city || "",
        state: doctorData.state || "",
        zone: doctorData.zone || "",
        registeredOn: doctorData.created_at ? new Date(doctorData.created_at).toLocaleDateString() : "",
        image: doctorData.avatar_url,
      });
    } catch (error) {
      console.error("Failed to fetch doctor details:", error);
      toast({
        title: "Error",
        description: "Could not load doctor details",
        variant: "destructive",
      });
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "DR";
    return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Date TBD";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDateTime = (dateStr: string, timeStr?: string) => {
    if (!dateStr) return "Date TBD";
    const date = new Date(dateStr);
    if (timeStr) {
      return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${timeStr}`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return <AppointmentsLoadingScreen />;
  }

  // Use detail data if available, otherwise use list data
  const displayAppointment = selectedAppointment || (selected ? {
    uuid: selected.appointment_uuid || "",
    doctor: {
      name: selected.doctor_name,
      uuid: selected.doctor_uuid || "",
      specialty: selected.specialty,
    },
    slot_date: selected.date,
    slot_start_time: selected.time,
    status: selected.status,
    mode: selected.mode === "Video" ? "online" : "physical",
    reason: selected.notes,
    created_at: new Date().toISOString(),
  } : null);

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader
        title="Appointments"
        description="Manage your scheduled visits and consultations."
        action={
          <Button asChild>
            <Link to="/doctors">
              <Plus className="h-4 w-4" /> Book Appointment
            </Link>
          </Button>
        }
      />
      
      <SectionCard>
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No appointments found</p>
            <Button variant="link" size="sm" asChild className="mt-2">
              <Link to="/doctors">Book your first appointment →</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div 
                key={a.id} 
                onClick={() => handleSelectAppointment(a)} 
                role="button" 
                tabIndex={0} 
                className="w-full text-left flex items-center gap-4 p-4 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-all cursor-pointer"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(a.doctor_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{a.doctor_name}</p>
                  <p className="text-xs text-muted-foreground">{a.specialty}</p>
                  <button
                    type="button"
                    onClick={(e) => openProfile(e, a.doctor_uuid)}
                    className="mt-1 text-xs text-primary hover:underline font-medium"
                  >
                    View doctor profile
                  </button>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(a.date)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.time || "Time TBD"}</span>
                  <span className="flex items-center gap-1">
                    {a.mode === "Video" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {a.mode}
                  </span>
                </div>
                <Badge variant={statusVariant(a.status)} className="capitalize">{a.status}</Badge>
                {a.mode === "Video" && a.status === "confirmed" && (
                  <Button size="sm" className="ml-2">
                    <Video className="h-3.5 w-3.5" /> Join
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Appointment Details Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => {
        if (!o) {
          setSelected(null);
          setSelectedAppointment(null);
        }
      }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailLoading ? (
            <AppointmentDetailLoading />
          ) : displayAppointment && (
            <>
              <SheetHeader>
                <SheetTitle>{displayAppointment.doctor?.name || "Appointment Details"}</SheetTitle>
                <SheetDescription>{displayAppointment.doctor?.specialty || ""}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Date & Time</p>
                    <p className="font-medium text-sm mt-1">
                      {formatDateTime(displayAppointment.slot_date, displayAppointment.slot_start_time)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Mode</p>
                    <p className="font-medium text-sm mt-1 capitalize">
                      {displayAppointment.mode === "online" ? "Video Consultation" : "In-person Visit"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Status</p>
                    <p className="font-medium text-sm mt-1 capitalize">{displayAppointment.status}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Payment Method</p>
                    <p className="font-medium text-sm mt-1 capitalize">{displayAppointment.access_method || displayAppointment.payment_status || "Not specified"}</p>
                  </div>
                  {displayAppointment.location && (
                    <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Location</p>
                      <p className="font-medium text-sm mt-1">
                        {(typeof displayAppointment.location === 'object' 
                          ? displayAppointment.location.name || displayAppointment.location.address 
                          : displayAppointment.location) || "Address provided upon confirmation"}
                      </p>
                    </div>
                  )}
                  {displayAppointment.meeting_link && (
                    <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Meeting Link</p>
                      <a 
                        href={displayAppointment.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-sm mt-1 text-primary hover:underline break-all"
                      >
                        {displayAppointment.meeting_link}
                      </a>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Reason for Visit</p>
                  <p className="text-sm bg-muted/40 p-3 rounded-lg">{displayAppointment.reason || "No reason provided"}</p>
                </div>
                
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Booking Date</p>
                  <p className="text-sm text-muted-foreground">
                    {displayAppointment.created_at ? new Date(displayAppointment.created_at).toLocaleDateString("en-US", { 
                      month: "long", 
                      day: "numeric", 
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "Not available"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  {displayAppointment.mode === "online" && displayAppointment.status !== "completed" && displayAppointment.status !== "cancelled" && (
                    <Button className="w-full" asChild>
                      <a href={displayAppointment.meeting_link || "#"} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4" /> Join Consultation
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" disabled>
                    Reschedule (coming soon)
                  </Button>
                  {displayAppointment.status === "confirmed" && (
                    <Button variant="outline" className="w-full text-red-500 hover:text-red-600" disabled>
                      Cancel Appointment
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Doctor Profile Dialog */}
      <Dialog open={!!profile} onOpenChange={(o) => !o && setProfile(null)}>
        <DialogContent className="sm:max-w-md">
          {profileLoading ? (
            <ProfileLoadingScreen />
          ) : profile && (
            <>
              <DialogHeader>
                <DialogTitle>Doctor Details</DialogTitle>
                <DialogDescription>Complete information about this doctor.</DialogDescription>
              </DialogHeader>
              <div className="mt-2 flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24">
                  {profile.image ? (
                    <img src={profile.image} alt={profile.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(profile.fullName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold">{profile.fullName}</p>
                  <p className="text-xs text-muted-foreground">{profile.specialty}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Detail icon={<Stethoscope className="h-3.5 w-3.5" />} label="Full Name" value={profile.fullName} />
                <Detail icon={<Stethoscope className="h-3.5 w-3.5" />} label="Specialty" value={profile.specialty} />
                <Detail icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={profile.email} />
                <Detail icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={profile.phone} />
                <Detail icon={<MapPin className="h-3.5 w-3.5" />} label="City" value={profile.city} />
                <Detail icon={<MapPin className="h-3.5 w-3.5" />} label="State" value={profile.state} />
                <Detail icon={<Globe className="h-3.5 w-3.5" />} label="Zone" value={profile.zone} />
                <Detail icon={<CalendarCheck className="h-3.5 w-3.5" />} label="Registered On" value={profile.registeredOn} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

const Detail = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="p-3 rounded-lg bg-muted/50">
    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">{icon}{label}</p>
    <p className="font-medium text-sm mt-1 break-words">{value || "—"}</p>
  </div>
);

export default Appointments;