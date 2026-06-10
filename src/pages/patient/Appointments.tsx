import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { patientMock } from "@/data/portalMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Video, Calendar, Clock, Plus, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";

const Appointments = () => {
  const [selected, setSelected] = useState<typeof patientMock.appointments[number] | null>(null);
  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader
        title="Appointments"
        description="Manage your scheduled visits and consultations."
        action={<Button><Plus className="h-4 w-4" /> Book Appointment</Button>}
      />
      <SectionCard>
        <div className="space-y-3">
          {patientMock.appointments.map((a) => (
            <button key={a.id} onClick={() => setSelected(a)} className="w-full text-left flex items-center gap-4 p-4 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-all">
              <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary text-xs">{a.doctor.split(" ").slice(-2).map(s=>s[0]).join("")}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{a.doctor}</p>
                <p className="text-xs text-muted-foreground">{a.specialty}</p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{a.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.time}</span>
                <span className="flex items-center gap-1">{a.mode === "Video" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}{a.mode}</span>
              </div>
              <Badge variant={a.status === "confirmed" ? "default" : a.status === "pending" ? "secondary" : "outline"} className="capitalize">{a.status}</Badge>
              <Button
                asChild
                variant="outline"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Link to={`/doctors?q=${encodeURIComponent(a.doctor)}`}>
                  <User className="h-3.5 w-3.5" /> View Profile
                </Link>
              </Button>
            </button>
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
    </PortalLayout>
  );
};

export default Appointments;
