import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { doctorNav } from "./nav";
import { doctorMock } from "@/data/portalMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, Plus, Trash2,
  Save, Send, Download, Check, Loader2, FileText
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ConsultationRoom = () => {
  const { id } = useParams();
  const consult = doctorMock.todaySchedule.find((c) => c.id === id) ?? doctorMock.todaySchedule[0];

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // Clinical notes
  const [notes, setNotes] = useState({ symptoms: "", diagnosis: "", observations: "", plan: "" });
  const [autoSave, setAutoSave] = useState<"idle" | "saving" | "saved">("idle");
  useEffect(() => {
    if (!Object.values(notes).some(Boolean)) return;
    setAutoSave("saving");
    const t = setTimeout(() => setAutoSave("saved"), 800);
    return () => clearTimeout(t);
  }, [notes]);

  // Prescription
  const [meds, setMeds] = useState<{ id: string; name: string; dosage: string; instructions: string }[]>([
    { id: crypto.randomUUID(), name: "", dosage: "", instructions: "" },
  ]);

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild><Link to="/doctor/consultations"><ArrowLeft className="h-4 w-4" /> Back</Link></Button>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold truncate">Consultation • {consult.patient}</h1>
            <p className="text-xs text-muted-foreground truncate">{consult.reason} • {consult.time}</p>
          </div>
        </div>
        <Badge variant="default" className="shrink-0">Live</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* LEFT */}
        <Card className="lg:col-span-3 border-border/60">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/10 text-primary">{consult.patient.split(" ").map(s=>s[0]).join("")}</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold text-sm">{consult.patient}</p>
                <p className="text-xs text-muted-foreground">33 yrs • Female</p>
              </div>
            </div>
            <Section title="Allergies"><div className="flex flex-wrap gap-1.5"><Badge variant="secondary">Penicillin</Badge><Badge variant="secondary">Peanuts</Badge></div></Section>
            <Section title="Current Medications">
              <ul className="text-xs space-y-1">
                <li>• Lisinopril 10mg — daily</li>
                <li>• Vitamin D3 2000 IU — daily</li>
              </ul>
            </Section>
            <Section title="Medical History">
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Hypertension (2024)</li>
                <li>• Mild asthma (childhood)</li>
              </ul>
            </Section>
            <Section title="Previous Consultations">
              <ul className="text-xs space-y-1.5">
                <li className="flex justify-between"><span>Apr 28</span><span className="text-muted-foreground">Cardiology</span></li>
                <li className="flex justify-between"><span>Mar 12</span><span className="text-muted-foreground">Wellness</span></li>
                <li className="flex justify-between"><span>Jan 09</span><span className="text-muted-foreground">Sinusitis</span></li>
              </ul>
            </Section>
          </CardContent>
        </Card>

        {/* CENTER — Video */}
        <Card className="lg:col-span-5 border-border/60 bg-foreground text-background overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video bg-gradient-to-br from-muted-foreground/20 to-foreground flex items-center justify-center relative">
              {camOn ? (
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-3"><AvatarFallback className="bg-primary text-primary-foreground text-3xl">{consult.patient.split(" ").map(s=>s[0]).join("")}</AvatarFallback></Avatar>
                  <p className="text-sm opacity-80">{consult.patient}</p>
                  <p className="text-xs opacity-50 mt-1">Connecting video stream...</p>
                </div>
              ) : (
                <div className="text-center opacity-60">
                  <VideoOff className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Camera off</p>
                </div>
              )}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/10 backdrop-blur px-2 py-1 rounded-full text-xs">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Recording
              </div>
              <div className="absolute bottom-3 right-3 w-28 sm:w-36 aspect-video rounded-lg bg-foreground/40 border border-background/20 flex items-center justify-center text-[10px] opacity-70">You</div>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 bg-foreground">
              <Button size="icon" variant={micOn ? "secondary" : "destructive"} onClick={() => setMicOn(!micOn)}>{micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}</Button>
              <Button size="icon" variant={camOn ? "secondary" : "destructive"} onClick={() => setCamOn(!camOn)}>{camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}</Button>
              <Button size="icon" variant="secondary"><ScreenShare className="h-4 w-4" /></Button>
              <Button size="icon" variant="destructive"><PhoneOff className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT — Tabs */}
        <Card className="lg:col-span-4 border-border/60">
          <CardContent className="p-4">
            <Tabs defaultValue="notes">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="rx">Rx</TabsTrigger>
                <TabsTrigger value="lab">Labs</TabsTrigger>
                <TabsTrigger value="ref">Refer</TabsTrigger>
              </TabsList>

              {/* Clinical Notes */}
              <TabsContent value="notes" className="space-y-3 mt-4">
                <Field label="Symptoms"><Textarea rows={2} value={notes.symptoms} onChange={(e) => setNotes({ ...notes, symptoms: e.target.value })} placeholder="Chief complaints..." /></Field>
                <Field label="Diagnosis"><Textarea rows={2} value={notes.diagnosis} onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })} placeholder="ICD-10 / clinical diagnosis" /></Field>
                <Field label="Observations"><Textarea rows={2} value={notes.observations} onChange={(e) => setNotes({ ...notes, observations: e.target.value })} placeholder="Vitals, exam findings..." /></Field>
                <Field label="Treatment Plan"><Textarea rows={2} value={notes.plan} onChange={(e) => setNotes({ ...notes, plan: e.target.value })} placeholder="Plan of care..." /></Field>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    {autoSave === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Auto-saving...</>}
                    {autoSave === "saved" && <><Check className="h-3 w-3 text-primary" /> All changes saved</>}
                    {autoSave === "idle" && "No changes"}
                  </span>
                  <Button size="sm" onClick={() => toast({ title: "Notes saved", description: "Clinical notes saved to patient record." })}>
                    <Save className="h-3.5 w-3.5" /> Save Notes
                  </Button>
                </div>
              </TabsContent>

              {/* Prescription */}
              <TabsContent value="rx" className="space-y-3 mt-4">
                {meds.map((m, i) => (
                  <div key={m.id} className="border border-border/60 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Medication #{i + 1}</span>
                      {meds.length > 1 && (
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setMeds(meds.filter((x) => x.id !== m.id))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input placeholder="Medication name (e.g. Amoxicillin 500mg)" value={m.name} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, name: e.target.value } : x))} />
                    <Input placeholder="Dosage (e.g. 1 capsule 3x daily)" value={m.dosage} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, dosage: e.target.value } : x))} />
                    <Textarea rows={2} placeholder="Instructions" value={m.instructions} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, instructions: e.target.value } : x))} />
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full" onClick={() => setMeds([...meds, { id: crypto.randomUUID(), name: "", dosage: "", instructions: "" }])}>
                  <Plus className="h-3.5 w-3.5" /> Add medication
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => toast({ title: "Prescription generated" })}><FileText className="h-3.5 w-3.5" /> Generate</Button>
                  <Button size="sm" className="flex-1" onClick={() => toast({ title: "Prescription sent to patient" })}><Send className="h-3.5 w-3.5" /> Send</Button>
                </div>
              </TabsContent>

              {/* Investigations */}
              <TabsContent value="lab" className="space-y-3 mt-4">
                <Field label="Laboratory">
                  <Select><SelectTrigger><SelectValue placeholder="Select laboratory" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="union">Union Diagnostics</SelectItem>
                      <SelectItem value="clina">Clina-Lancet</SelectItem>
                      <SelectItem value="synlab">SynLab Nigeria</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Test Type">
                  <Select><SelectTrigger><SelectValue placeholder="Select test" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cbc">Full Blood Count</SelectItem>
                      <SelectItem value="lft">Liver Function Test</SelectItem>
                      <SelectItem value="lipid">Lipid Profile</SelectItem>
                      <SelectItem value="urine">Urinalysis</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Additional notes"><Textarea rows={3} placeholder="Clinical context for the lab..." /></Field>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5" /> Add test</Button>
                  <Button size="sm" onClick={() => toast({ title: "Lab request sent" })}><Send className="h-3.5 w-3.5" /> Send</Button>
                  <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /> Download</Button>
                </div>
              </TabsContent>

              {/* Referral */}
              <TabsContent value="ref" className="space-y-3 mt-4">
                <Field label="Specialist">
                  <Select><SelectTrigger><SelectValue placeholder="Select specialist" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardio">Cardiologist</SelectItem>
                      <SelectItem value="derm">Dermatologist</SelectItem>
                      <SelectItem value="endo">Endocrinologist</SelectItem>
                      <SelectItem value="neuro">Neurologist</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Referral notes"><Textarea rows={4} placeholder="Reason for referral, history, current management..." /></Field>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => toast({ title: "Referral sent" })}><Send className="h-3.5 w-3.5" /> Send</Button>
                  <Button size="sm" variant="outline" className="flex-1"><Download className="h-3.5 w-3.5" /> Download</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{title}</p>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

export default ConsultationRoom;
