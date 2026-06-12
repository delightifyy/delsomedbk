import { useState } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { patientMock } from "@/data/portalMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Video, Calendar, Clock, Plus, MapPin, Mail, Phone, Globe, CalendarCheck, Stethoscope } from "lucide-react";

type Appt = typeof patientMock.appointments[number];

type DoctorDetails = {
  fullName: string;
  specialty: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zone: string;
  registeredOn: string;
  image?: string;
};

const DOCTOR_DETAILS: Record<string, DoctorDetails> = {
  "Dr. Chinedu Eze": {
    fullName: "Dr. Chinedu Eze",
    specialty: "General Practitioner",
    email: "chinedu.eze@desolmed.com",
    phone: "+234 803 412 7781",
    city: "Abuja",
    state: "FCT",
    zone: "North Central",
    registeredOn: "2023-06-12",
  },
  "Dr. Funmi Adebayo": {
    fullName: "Dr. Funmi Adebayo",
    specialty: "Dermatology",
    email: "funmi.adebayo@desolmed.com",
    phone: "+234 802 998 1124",
    city: "Lagos",
    state: "Lagos",
    zone: "South West",
    registeredOn: "2022-11-03",
  },
  "Dr. Ibrahim Musa": {
    fullName: "Dr. Ibrahim Musa",
    specialty: "Cardiology",
    email: "ibrahim.musa@desolmed.com",
    phone: "+234 805 221 6650",
    city: "Kano",
    state: "Kano",
    zone: "North West",
    registeredOn: "2021-02-18",
  },
};

const Appointments = () => {
  const [selected, setSelected] = useState<Appt | null>(null);
  const [profile, setProfile] = useState<DoctorDetails | null>(null);

  const openProfile = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const d = DOCTOR_DETAILS[name] ?? {
      fullName: name,
      specialty: "—",
      email: "—",
      phone: "—",
      city: "—",
      state: "—",
      zone: "—",
      registeredOn: "—",
    };
    setProfile(d);
  };

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader
        title="Appointments"
        description="Manage your scheduled visits and consultations."
        action={<Button asChild><Link to="/doctor-portal?book=1"><Plus className="h-4 w-4" /> Book Appointment</Link></Button>}
      />
      <SectionCard>
        <div className="space-y-3">
          {patientMock.appointments.map((a) => (
            <div key={a.id} onClick={() => setSelected(a)} role="button" tabIndex={0} className="w-full text-left flex items-center gap-4 p-4 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-all cursor-pointer">
              <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary text-xs">{a.doctor.split(" ").slice(-2).map(s=>s[0]).join("")}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{a.doctor}</p>
                <p className="text-xs text-muted-foreground">{a.specialty}</p>
                <button
                  type="button"
                  onClick={(e) => openProfile(e, a.doctor)}
                  className="mt-1 text-xs text-primary hover:underline font-medium"
                >
                  View doctor profile
                </button>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{a.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.time}</span>
                <span className="flex items-center gap-1">{a.mode === "Video" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}{a.mode}</span>
              </div>
              <Badge variant={a.status === "confirmed" ? "default" : a.status === "pending" ? "secondary" : "outline"} className="capitalize">{a.status}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.doctor}</SheetTitle>
                <SheetDescription>{selected.specialty}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Date</p><p className="font-medium text-sm mt-1">{selected.date}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Time</p><p className="font-medium text-sm mt-1">{selected.time}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Mode</p><p className="font-medium text-sm mt-1">{selected.mode}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Status</p><p className="font-medium text-sm mt-1 capitalize">{selected.status}</p></div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Consultation Notes</p>
                  <p className="text-sm bg-muted/40 p-3 rounded-lg">{selected.notes}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {selected.mode === "Video" && selected.status !== "completed" && (
                    <Button className="w-full"><Video className="h-4 w-4" /> Join Consultation</Button>
                  )}
                  <Button variant="outline" className="w-full" disabled>Reschedule (coming soon)</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!profile} onOpenChange={(o) => !o && setProfile(null)}>
        <DialogContent className="sm:max-w-md">
          {profile && (
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
                      {profile.fullName.split(" ").slice(-2).map((s) => s[0]).join("")}
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
    <p className="font-medium text-sm mt-1 break-words">{value}</p>
  </div>
);

export default Appointments;
