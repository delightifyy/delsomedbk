import { useEffect, useState, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, Plus, Trash2,
  Save, Send, Download, Check, Loader2, FileText, Move, Minimize2, Maximize2,
  X, Pill, FlaskConical, Stethoscope, User, Calendar, Clock, Phone, MapPin, Mail
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock patient data for auto-population
const mockPatientData = {
  id: "P001",
  name: "Adaobi Okeke",
  age: 33,
  gender: "Female",
  dob: "1993-03-15",
  phone: "+234 802 345 6789",
  email: "adaobi.okeke@email.com",
  address: "12 Awolowo Road, Ikoyi, Lagos",
  phin: "123456789",
  mhsc: "987654321",
  emergencyContact: "+234 803 456 7890"
};

const mockDoctorData = {
  name: "Dr. Chinedu Okafor",
  specialty: "Consultant Cardiologist",
  license: "MDCN/2014/45821",
  hospital: "Desolmed Medical Centre",
  phone: "+234 802 345 6789",
  email: "chinedu.okafor@desolmed.com",
  address: "12 Awolowo Road, Ikoyi, Lagos",
  signature: "Dr. C. Okafor"
};

// Drug categories with sub-drugs
const drugCategories = {
  "Antibiotics": ["Amoxicillin 500mg", "Azithromycin 250mg", "Ciprofloxacin 500mg", "Doxycycline 100mg", "Metronidazole 400mg", "Cloxacillin 500mg", "Ceftriaxone 1g"],
  "Antihypertensives": ["Lisinopril 10mg", "Amlodipine 5mg", "Losartan 50mg", "Hydrochlorothiazide 25mg", "Metoprolol 25mg", "Enalapril 5mg", "Nifedipine 30mg"],
  "Antidiabetics": ["Metformin 500mg", "Gliclazide 80mg", "Insulin Regular", "Insulin NPH", "Glimepiride 2mg", "Pioglitazone 15mg"],
  "Bronchodilators": ["Salbutamol 100mcg", "Budesonide 200mcg", "Formoterol 12mcg", "Ipratropium 40mcg"],
  "PPI & Antacids": ["Omeprazole 20mg", "Pantoprazole 40mg", "Esomeprazole 40mg", "Ranitidine 150mg", "Aluminum Hydroxide"],
  "Antidepressants": ["Sertraline 50mg", "Fluoxetine 20mg", "Citalopram 20mg", "Escitalopram 10mg", "Amitriptyline 25mg"],
  "Antianxiety": ["Diazepam 5mg", "Alprazolam 0.5mg", "Lorazepam 1mg", "Clonazepam 0.5mg"],
  "Analgesics": ["Tramadol 50mg", "Ibuprofen 400mg", "Paracetamol 500mg", "Diclofenac 50mg", "Naproxen 250mg", "Morphine 10mg"],
  "Statins": ["Atorvastatin 20mg", "Rosuvastatin 10mg", "Simvastatin 20mg"],
  "Anticoagulants": ["Warfarin 5mg", "Apixaban 2.5mg", "Rivaroxaban 15mg", "Heparin"],
  "Antifungals": ["Fluconazole 150mg", "Itraconazole 100mg", "Clotrimazole", "Miconazole"],
  "Antivirals": ["Acyclovir 400mg", "Valacyclovir 500mg", "Oseltamivir 75mg"],
  "Steroids": ["Prednisone 40mg", "Dexamethasone 4mg", "Hydrocortisone", "Beclomethasone"],
  "Vitamins & Supplements": ["Vitamin D 1000IU", "Vitamin C 500mg", "Vitamin B12", "Iron 65mg", "Calcium 500mg", "Multivitamin"]
};

const ConsultationRoom = () => {
  const { id } = useParams();
  const consult = doctorMock.todaySchedule.find((c) => c.id === id) ?? doctorMock.todaySchedule[0];

  // Floating video state
  const [isFloating, setIsFloating] = useState(true);
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const floatingRef = useRef<HTMLDivElement>(null);

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

  // Prescription - Drug selection with categories
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDrug, setSelectedDrug] = useState("");
  const [meds, setMeds] = useState<{ id: string; name: string; dosage: string; frequency: string; duration: string; instructions: string; }[]>([
    { id: crypto.randomUUID(), name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [refills, setRefills] = useState("0");

  // Auto-populate patient info
  const [patientInfo, setPatientInfo] = useState({
    lastName: mockPatientData.name.split(" ")[1] || "",
    firstName: mockPatientData.name.split(" ")[0] || "",
    phin: mockPatientData.phin,
    mhsc: mockPatientData.mhsc,
    dob: mockPatientData.dob,
    gender: mockPatientData.gender,
    address: mockPatientData.address,
    phone: mockPatientData.phone,
    email: mockPatientData.email,
    emergencyContact: mockPatientData.emergencyContact,
  });

  // Auto-populate doctor info
  const [physicianInfo, setPhysicianInfo] = useState({
    surname: mockDoctorData.name.split(" ")[1] || "",
    firstInitial: mockDoctorData.name.split(" ")[0]?.charAt(0) || "",
    address: mockDoctorData.address,
    phone: mockDoctorData.phone,
    email: mockDoctorData.email,
    afterHoursContact: mockDoctorData.phone,
    ccPhysicianName: "",
    ccAddress: "",
    ccPhone: "",
    ccFax: "",
    specialty: mockDoctorData.specialty,
    license: mockDoctorData.license,
    hospital: mockDoctorData.hospital,
    signature: mockDoctorData.signature,
  });

  // Payment Agency
  const [paymentAgency, setPaymentAgency] = useState<"MB" | "WCB" | "Other" | "">("");
  const [otherPaymentAgency, setOtherPaymentAgency] = useState("");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "Insurance" | "Bank Transfer" | "">("");
  const [receiptNumber, setReceiptNumber] = useState("");

  // Menthol Allergy
  const [mentholAllergy, setMentholAllergy] = useState(false);
  const [otherAllergies, setOtherAllergies] = useState("");

  // Lab selection
  const [selectedLab, setSelectedLab] = useState("");

  // Lab tests with categories
  const [labTests, setLabTests] = useState({
    // Hematology
    hemoglobin: false, hematocrit: false, rbc: false, indices: false, platelet: false,
    wbc: false, wbcDifferential: false, reticulocytes: false, esr: false,
    // Chemistry
    sodium: false, potassium: false, chloride: false, co2: false, bun: false,
    creatinine: false, fastingGlucose: false, randomGlucose: false, glucose2HrPc: false, gtt: false,
    // Lipids
    fastingLipids: false, randomLipids: false, cholesterol: false, triglycerides: false,
    hdlCholesterol: false, ldlCholesterol: false, cholesterolHdlRatio: false,
    // Endocrine
    cortisolAM: false, cortisolPM: false, cortisolRandom: false, estradiol: false,
    progesterone: false, prolactin: false, testosterone: false, thyroidAB: false, tsh: false,
    // Pregnancy
    bhcgQuantitative: false, glucose50gLoad: false,
    // Drug Levels
    carbamazepine: false, digoxin: false, lithium: false, phenobarbital: false,
    phenytoin: false, valproicAcid: false,
    // Serology
    ana: false, cReactiveProtein: false,
    // Cultures
    throatCandS: false, urineCandS: false, earCandS: false, earCandSLeft: false,
    earCandSRight: false, eyeCandS: false, eyeCandSLeft: false, eyeCandSRight: false,
    otherCandS: false,
    // Genital Samples
    chlamydia: false, cervixForGC: false, gcOtherThanCervix: false,
    // Synovial Fluid & Semen
    synovialCellCount: false, synovialCrystals: false, semenCompleteAnalysis: false,
    // Additional
    hiv: false, hepatitisB: false, hepatitisC: false, syphilis: false, malaria: false,
  });

  // Form input fields
  const [otherCandSSource, setOtherCandSSource] = useState("");
  const [chlamydiaSource, setChlamydiaSource] = useState("");
  const [gcOtherThanCervixSpecify, setGcOtherThanCervixSpecify] = useState("");
  const [labNotes, setLabNotes] = useState("");
  const [specimenType, setSpecimenType] = useState("Blood");
  const [collectionDate, setCollectionDate] = useState("");
  const [collectionTime, setCollectionTime] = useState("");

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (floatingRef.current) {
      const rect = floatingRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 320));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 200));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleFloating = () => {
    setIsFloating(!isFloating);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Get drugs for selected category
  const getDrugsForCategory = (category: string) => {
    return drugCategories[category as keyof typeof drugCategories] || [];
  };

  // Add drug to medication list
  const addDrugToMeds = (drugName: string) => {
    if (meds.some(m => m.name === drugName)) {
      toast({ title: "Drug already added", description: "This medication is already in the list.", variant: "destructive" });
      return;
    }
    const firstEmpty = meds.findIndex(m => !m.name);
    if (firstEmpty !== -1) {
      const updated = [...meds];
      updated[firstEmpty] = { ...updated[firstEmpty], name: drugName };
      setMeds(updated);
    } else {
      setMeds([...meds, { id: crypto.randomUUID(), name: drugName, dosage: "", frequency: "", duration: "", instructions: "" }]);
    }
    setSelectedDrug("");
    setSelectedCategory("");
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      {/* Floating Video Call Interface */}
      {isFloating && (
        <div
          ref={floatingRef}
          className="fixed z-50 shadow-2xl rounded-xl border border-border/60 bg-background overflow-hidden"
          style={{
            top: position.y,
            left: position.x,
            width: isMinimized ? '280px' : '320px',
            minWidth: '280px',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Drag Handle */}
          <div 
            className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/60 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <Move className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{consult.patient}</span>
              <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800">Live</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={toggleMinimize}>
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={toggleFloating}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Video */}
              <div className="aspect-video bg-gradient-to-br from-muted-foreground/30 to-foreground flex items-center justify-center relative">
                {camOn ? (
                  <div className="text-center">
                    <Avatar className="h-14 w-14 mx-auto mb-1.5"><AvatarFallback className="bg-primary text-primary-foreground text-xl">{consult.patient.split(" ").map(s=>s[0]).join("")}</AvatarFallback></Avatar>
                    <p className="text-xs font-medium text-white">{consult.patient}</p>
                    <p className="text-[10px] opacity-60 text-white">{consult.reason}</p>
                  </div>
                ) : (
                  <div className="text-center opacity-60">
                    <VideoOff className="h-8 w-8 mx-auto mb-1 text-white" />
                    <p className="text-xs text-white">Camera off</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/20 backdrop-blur px-2 py-0.5 rounded-full text-[10px] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Recording
                </div>
                <div className="absolute bottom-2 right-2 w-14 aspect-video rounded-lg bg-foreground/40 border border-background/20 flex items-center justify-center text-[8px] opacity-70 text-white">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/80 text-white text-xs">DR</AvatarFallback></Avatar>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-1.5 p-2 bg-muted/10">
                <Button size="icon" variant={micOn ? "secondary" : "destructive"} className="h-7 w-7" onClick={() => setMicOn(!micOn)}>
                  {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant={camOn ? "secondary" : "destructive"} className="h-7 w-7" onClick={() => setCamOn(!camOn)}>
                  {camOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant="secondary" className="h-7 w-7"><ScreenShare className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="destructive" className="h-7 w-7"><PhoneOff className="h-3.5 w-3.5" /></Button>
              </div>

              {/* Call duration */}
              <div className="text-center text-[10px] text-muted-foreground py-1 bg-muted/5">
                Call duration: 12:34
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild><Link to="/doctor/consultations"><ArrowLeft className="h-4 w-4" /> Back</Link></Button>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold truncate">Consultation • {consult.patient}</h1>
            <p className="text-xs text-muted-foreground truncate">{consult.reason} • {consult.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={isFloating ? "default" : "outline"} size="sm" onClick={toggleFloating}>
            {isFloating ? <Minimize2 className="h-3.5 w-3.5 mr-1" /> : <Maximize2 className="h-3.5 w-3.5 mr-1" />}
            {isFloating ? "Hide Call" : "Show Call"}
          </Button>
          <Badge variant="default" className="shrink-0">Live</Badge>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient Info Sidebar */}
          <Card className="lg:col-span-1 border-border/60">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary/10 text-primary text-lg">{consult.patient.split(" ").map(s=>s[0]).join("")}</AvatarFallback></Avatar>
                <div>
                  <p className="font-semibold text-sm">{consult.patient}</p>
                  <p className="text-xs text-muted-foreground">{mockPatientData.age} yrs • {mockPatientData.gender}</p>
                  <p className="text-xs text-muted-foreground">ID: {mockPatientData.id}</p>
                </div>
              </div>
              
              <div className="border-t border-border/60 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Patient Details</p>
                <div className="text-xs space-y-1.5">
                  <div className="flex items-center gap-2"><Calendar className="h-3 w-3 text-muted-foreground" /> DOB: {mockPatientData.dob}</div>
                  <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground" /> {mockPatientData.phone}</div>
                  <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" /> {mockPatientData.email}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-muted-foreground" /> {mockPatientData.address}</div>
                </div>
              </div>

              <Section title="Previous Clinical Notes">
                <ul className="text-xs space-y-1.5">
                  <li className="flex justify-between"><span>Apr 28, 2026</span><span className="text-muted-foreground">Cardiology</span></li>
                  <li className="flex justify-between"><span>Mar 12, 2026</span><span className="text-muted-foreground">Wellness</span></li>
                  <li className="flex justify-between"><span>Jan 09, 2026</span><span className="text-muted-foreground">Sinusitis</span></li>
                </ul>
              </Section>
            </CardContent>
          </Card>

          {/* Main Form */}
          <Card className="lg:col-span-3 border-border/60">
            <CardContent className="p-6">
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="w-full grid grid-cols-4 mb-6">
                  <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
                  <TabsTrigger value="rx">Meds</TabsTrigger>
                  <TabsTrigger value="lab">Lab</TabsTrigger>
                  <TabsTrigger value="ref">Referral</TabsTrigger>
                </TabsList>

                {/* Clinical Notes */}
                <TabsContent value="notes" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Symptoms / Presenting Complaints">
                      <Textarea rows={4} value={notes.symptoms} onChange={(e) => setNotes({ ...notes, symptoms: e.target.value })} placeholder="Chest pain, shortness of breath, palpitations..." className="min-h-[100px]" />
                    </Field>
                    <Field label="Diagnosis">
                      <Textarea rows={4} value={notes.diagnosis} onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })} placeholder="I10 - Essential hypertension" className="min-h-[100px]" />
                    </Field>
                  </div>
                  <Field label="Examination Findings / Observations">
                    <Textarea rows={4} value={notes.observations} onChange={(e) => setNotes({ ...notes, observations: e.target.value })} placeholder="BP 140/90, HR 78, Temp 36.8°C, ECG shows sinus tachycardia..." />
                  </Field>
                  <Field label="Treatment Plan">
                    <Textarea rows={4} value={notes.plan} onChange={(e) => setNotes({ ...notes, plan: e.target.value })} placeholder="Start Lisinopril 10mg daily. Refer to cardiology. Follow-up in 2 weeks." />
                  </Field>
                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                      {autoSave === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Auto-saving...</>}
                      {autoSave === "saved" && <><Check className="h-3 w-3 text-primary" /> All changes saved</>}
                      {autoSave === "idle" && "No changes"}
                    </span>
                    <Button onClick={() => toast({ title: "Notes saved", description: "Clinical notes saved to patient record." })}>
                      <Save className="h-3.5 w-3.5" /> Save Notes
                    </Button>
                  </div>
                </TabsContent>

                {/* Prescription - with Drug Categories */}
                <TabsContent value="rx" className="space-y-4">
                  {/* Patient & Doctor Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/5 rounded-lg border border-border/60">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Patient Information</p>
                      <p className="font-medium text-sm">{mockPatientData.name}</p>
                      <p className="text-xs text-muted-foreground">DOB: {mockPatientData.dob} • {mockPatientData.gender}</p>
                      <p className="text-xs text-muted-foreground">PHIN: {mockPatientData.phin} • MHSC: {mockPatientData.mhsc}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Physician Information</p>
                      <p className="font-medium text-sm">{mockDoctorData.name}</p>
                      <p className="text-xs text-muted-foreground">{mockDoctorData.specialty}</p>
                      <p className="text-xs text-muted-foreground">License: {mockDoctorData.license}</p>
                    </div>
                  </div>

                  {/* Pharmacy Dropdown */}
                  <div className="border border-border/60 rounded-lg p-4 bg-muted/5">
                    <Label className="text-sm font-semibold">Select Pharmacy</Label>
                    <Select value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a pharmacy..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shoppers-drug-mart">Shoppers Drug Mart</SelectItem>
                        <SelectItem value="rexall">Rexall</SelectItem>
                        <SelectItem value="london-drugs">London Drugs</SelectItem>
                        <SelectItem value="costco-pharmacy">Costco Pharmacy</SelectItem>
                        <SelectItem value="walmart-pharmacy">Walmart Pharmacy</SelectItem>
                        <SelectItem value="superstore-pharmacy">Superstore Pharmacy</SelectItem>
                        <SelectItem value="guardian-pharmacy">Guardian Pharmacy</SelectItem>
                        <SelectItem value="pharmasave">Pharmasave</SelectItem>
                        <SelectItem value="independent-pharmacy">Independent Pharmacy</SelectItem>
                        <SelectItem value="other-pharmacy">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedPharmacy === "other-pharmacy" && (
                      <Input className="mt-2" placeholder="Enter pharmacy name and address" onChange={(e) => setSelectedPharmacy(e.target.value)} />
                    )}
                  </div>

                  {/* Drug Selection - Categories and Drugs */}
                  <div className="border border-border/60 rounded-lg p-4 bg-muted/5">
                    <Label className="text-sm font-semibold">Select Medication</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setSelectedDrug(""); }}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(drugCategories).map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Drug</Label>
                        <Select value={selectedDrug} onValueChange={setSelectedDrug}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="Select drug" /></SelectTrigger>
                          <SelectContent>
                            {selectedCategory && getDrugsForCategory(selectedCategory).map((drug) => (
                              <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3 w-full" onClick={() => selectedDrug && addDrugToMeds(selectedDrug)} disabled={!selectedDrug}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add to Prescription
                    </Button>
                  </div>

                  {/* Medication List */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Prescribed Medications</p>
                    {meds.map((m, i) => (
                      <div key={m.id} className="border border-border/60 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Medication #{i + 1}</span>
                          {meds.length > 1 && (
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setMeds(meds.filter((x) => x.id !== m.id))}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <Input placeholder="Medication name" value={m.name} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, name: e.target.value } : x))} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input placeholder="Dosage (e.g., 500mg)" value={m.dosage} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, dosage: e.target.value } : x))} />
                          <Input placeholder="Frequency (e.g., 3x daily)" value={m.frequency} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, frequency: e.target.value } : x))} />
                        </div>
                        <Input placeholder="Duration (e.g., 7 days)" value={m.duration} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, duration: e.target.value } : x))} />
                        <Textarea rows={2} placeholder="Special instructions" value={m.instructions} onChange={(e) => setMeds(meds.map(x => x.id === m.id ? { ...x, instructions: e.target.value } : x))} />
                      </div>
                    ))}
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setMeds([...meds, { id: crypto.randomUUID(), name: "", dosage: "", frequency: "", duration: "", instructions: "" }])}>
                      <Plus className="h-3.5 w-3.5" /> Add another medication
                    </Button>
                  </div>

                  {/* Refills */}
                  <div className="border border-border/60 rounded-lg p-4">
                    <Label className="text-sm font-semibold">Refills</Label>
                    <Select value={refills} onValueChange={setRefills}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Number of refills" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 refills</SelectItem>
                        <SelectItem value="1">1 refill</SelectItem>
                        <SelectItem value="2">2 refills</SelectItem>
                        <SelectItem value="3">3 refills</SelectItem>
                        <SelectItem value="5">5 refills</SelectItem>
                        <SelectItem value="10">10 refills</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => toast({ title: "Prescription generated", description: "PDF created for download." })}><FileText className="h-4 w-4 mr-2" /> Generate</Button>
                    <Button className="flex-1" onClick={() => {
                      if (!selectedPharmacy || selectedPharmacy === "other-pharmacy" && !selectedPharmacy.includes("Enter pharmacy")) {
                        toast({ title: "Pharmacy required", description: "Please select a pharmacy before sending.", variant: "destructive" });
                        return;
                      }
                      if (meds.some(m => !m.name)) {
                        toast({ title: "Missing medication details", description: "Please fill in all medication names.", variant: "destructive" });
                        return;
                      }
                      toast({ title: "Prescription sent", description: `Sent to ${selectedPharmacy === "other-pharmacy" ? selectedPharmacy : selectedPharmacy.replace(/-/g, ' ')}.` });
                    }}><Send className="h-4 w-4 mr-2" /> Send to Pharmacy</Button>
                  </div>
                </TabsContent>

                {/* Lab Requisition - Comprehensive with Patient/Doctor Info */}
                <TabsContent value="lab" className="space-y-4">
                  <div className="overflow-y-auto max-h-[600px] pr-2">
                    {/* Patient & Doctor Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/5 rounded-lg border border-border/60">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Patient Information</p>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{mockPatientData.name}</p></div>
                          <div><p className="text-xs text-muted-foreground">DOB</p><p className="text-sm">{mockPatientData.dob}</p></div>
                          <div><p className="text-xs text-muted-foreground">Gender</p><p className="text-sm">{mockPatientData.gender}</p></div>
                          <div><p className="text-xs text-muted-foreground">PHIN</p><p className="text-sm">{mockPatientData.phin}</p></div>
                          <div className="col-span-2"><p className="text-xs text-muted-foreground">Address</p><p className="text-sm">{mockPatientData.address}</p></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Physician Information</p>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div className="col-span-2"><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{mockDoctorData.name}</p></div>
                          <div className="col-span-2"><p className="text-xs text-muted-foreground">Specialty</p><p className="text-sm">{mockDoctorData.specialty}</p></div>
                          <div><p className="text-xs text-muted-foreground">License</p><p className="text-sm">{mockDoctorData.license}</p></div>
                          <div><p className="text-xs text-muted-foreground">Hospital</p><p className="text-sm">{mockDoctorData.hospital}</p></div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Agency */}
                    <div className="border border-border/60 rounded-lg p-4 bg-muted/5">
                      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payment Agency</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="payMB" className="h-4 w-4" checked={paymentAgency === "MB"} onCheckedChange={() => setPaymentAgency("MB")} />
                          <Label htmlFor="payMB" className="text-sm cursor-pointer">MB</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="payWCB" className="h-4 w-4" checked={paymentAgency === "WCB"} onCheckedChange={() => setPaymentAgency("WCB")} />
                          <Label htmlFor="payWCB" className="text-sm cursor-pointer">WCB</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="payOther" className="h-4 w-4" checked={paymentAgency === "Other"} onCheckedChange={() => setPaymentAgency("Other")} />
                            <Label htmlFor="payOther" className="text-sm cursor-pointer">Other</Label>
                          </div>
                          <Input className="h-9 text-sm w-40" placeholder="Private" value={otherPaymentAgency} onChange={(e) => setOtherPaymentAgency(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Laboratory Dropdown */}
                    <div className="border border-border/60 rounded-lg p-4">
                      <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Laboratory</Label>
                      <Select value={selectedLab} onValueChange={setSelectedLab}>
                        <SelectTrigger className="h-9 text-sm mt-2"><SelectValue placeholder="Choose laboratory..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dynacare">Dynacare</SelectItem>
                          <SelectItem value="cadham">Cadham Provincial Laboratory</SelectItem>
                          <SelectItem value="canadian_blood">Canadian Blood Services</SelectItem>
                          <SelectItem value="other_lab">Other Laboratory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Specimen Collection */}
                    <div className="border border-border/60 rounded-lg p-4">
                      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Specimen Collection</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Specimen Type</Label>
                          <Select value={specimenType} onValueChange={setSpecimenType}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Blood">Blood</SelectItem>
                              <SelectItem value="Urine">Urine</SelectItem>
                              <SelectItem value="Stool">Stool</SelectItem>
                              <SelectItem value="Swab">Swab</SelectItem>
                              <SelectItem value="Sputum">Sputum</SelectItem>
                              <SelectItem value="CSF">CSF</SelectItem>
                              <SelectItem value="Tissue">Tissue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Collection Date</Label>
                          <Input className="h-9" type="date" value={collectionDate} onChange={(e) => setCollectionDate(e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Collection Time</Label>
                          <Input className="h-9" type="time" value={collectionTime} onChange={(e) => setCollectionTime(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Test Sections - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {/* Hematology */}
                      <div className="border border-border/60 rounded-lg p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Hematology</p>
                        <div className="grid grid-cols-2 gap-0.5">
                          <LabCheckbox id="hgb" label="Hemoglobin" checked={labTests.hemoglobin} onChange={() => setLabTests({ ...labTests, hemoglobin: !labTests.hemoglobin })} />
                          <LabCheckbox id="hct" label="Hematocrit" checked={labTests.hematocrit} onChange={() => setLabTests({ ...labTests, hematocrit: !labTests.hematocrit })} />
                          <LabCheckbox id="rbc2" label="RBC" checked={labTests.rbc} onChange={() => setLabTests({ ...labTests, rbc: !labTests.rbc })} />
                          <LabCheckbox id="indices2" label="Indices" checked={labTests.indices} onChange={() => setLabTests({ ...labTests, indices: !labTests.indices })} />
                          <LabCheckbox id="plt" label="Platelet" checked={labTests.platelet} onChange={() => setLabTests({ ...labTests, platelet: !labTests.platelet })} />
                          <LabCheckbox id="wbc2" label="WBC" checked={labTests.wbc} onChange={() => setLabTests({ ...labTests, wbc: !labTests.wbc })} />
                          <LabCheckbox id="wbcDiff" label="WBC Diff" checked={labTests.wbcDifferential} onChange={() => setLabTests({ ...labTests, wbcDifferential: !labTests.wbcDifferential })} />
                          <LabCheckbox id="retic" label="Reticulocytes" checked={labTests.reticulocytes} onChange={() => setLabTests({ ...labTests, reticulocytes: !labTests.reticulocytes })} />
                          <LabCheckbox id="esr2" label="ESR" checked={labTests.esr} onChange={() => setLabTests({ ...labTests, esr: !labTests.esr })} />
                        </div>
                      </div>

                      {/* Chemistry */}
                      <div className="border border-border/60 rounded-lg p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Chemistry</p>
                        <div className="grid grid-cols-2 gap-0.5">
                          <LabCheckbox id="na" label="Sodium" checked={labTests.sodium} onChange={() => setLabTests({ ...labTests, sodium: !labTests.sodium })} />
                          <LabCheckbox id="k" label="Potassium" checked={labTests.potassium} onChange={() => setLabTests({ ...labTests, potassium: !labTests.potassium })} />
                          <LabCheckbox id="cl" label="Chloride" checked={labTests.chloride} onChange={() => setLabTests({ ...labTests, chloride: !labTests.chloride })} />
                          <LabCheckbox id="co2_2" label="CO2" checked={labTests.co2} onChange={() => setLabTests({ ...labTests, co2: !labTests.co2 })} />
                          <LabCheckbox id="bun2" label="BUN/Urea" checked={labTests.bun} onChange={() => setLabTests({ ...labTests, bun: !labTests.bun })} />
                          <LabCheckbox id="creat" label="Creatinine" checked={labTests.creatinine} onChange={() => setLabTests({ ...labTests, creatinine: !labTests.creatinine })} />
                          <LabCheckbox id="fGluc" label="Fasting Glucose" checked={labTests.fastingGlucose} onChange={() => setLabTests({ ...labTests, fastingGlucose: !labTests.fastingGlucose })} />
                          <LabCheckbox id="rGluc" label="Random Glucose" checked={labTests.randomGlucose} onChange={() => setLabTests({ ...labTests, randomGlucose: !labTests.randomGlucose })} />
                          <LabCheckbox id="gluc2hr" label="Glucose 2-Hr PC" checked={labTests.glucose2HrPc} onChange={() => setLabTests({ ...labTests, glucose2HrPc: !labTests.glucose2HrPc })} />
                          <LabCheckbox id="gtt2" label="GTT" checked={labTests.gtt} onChange={() => setLabTests({ ...labTests, gtt: !labTests.gtt })} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Lipids */}
                      <div className="border border-border/60 rounded-lg p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Lipids</p>
                        <div className="flex items-center gap-3 mb-1">
                          <LabCheckbox id="fastLip" label="Fasting" checked={labTests.fastingLipids} onChange={() => setLabTests({ ...labTests, fastingLipids: !labTests.fastingLipids })} />
                          <LabCheckbox id="randLip" label="Random" checked={labTests.randomLipids} onChange={() => setLabTests({ ...labTests, randomLipids: !labTests.randomLipids })} />
                        </div>
                        <div className="grid grid-cols-2 gap-0.5">
                          <LabCheckbox id="chol" label="Cholesterol" checked={labTests.cholesterol} onChange={() => setLabTests({ ...labTests, cholesterol: !labTests.cholesterol })} />
                          <LabCheckbox id="tg" label="Triglycerides" checked={labTests.triglycerides} onChange={() => setLabTests({ ...labTests, triglycerides: !labTests.triglycerides })} />
                          <LabCheckbox id="hdl" label="HDL Cholesterol" checked={labTests.hdlCholesterol} onChange={() => setLabTests({ ...labTests, hdlCholesterol: !labTests.hdlCholesterol })} />
                          <LabCheckbox id="ldl" label="LDL Cholesterol" checked={labTests.ldlCholesterol} onChange={() => setLabTests({ ...labTests, ldlCholesterol: !labTests.ldlCholesterol })} />
                          <LabCheckbox id="cholHdl" label="Chol/HDL Ratio" checked={labTests.cholesterolHdlRatio} onChange={() => setLabTests({ ...labTests, cholesterolHdlRatio: !labTests.cholesterolHdlRatio })} />
                          <LabCheckbox id="cea2" label="CEA" checked={labTests.cea} onChange={() => setLabTests({ ...labTests, cea: !labTests.cea })} />
                          <LabCheckbox id="psa" label="PSA Total" checked={labTests.psaTotal} onChange={() => setLabTests({ ...labTests, psaTotal: !labTests.psaTotal })} />
                        </div>
                      </div>

                      {/* Endocrine */}
                      <div className="border border-border/60 rounded-lg p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Endocrine</p>
                        <div className="flex items-center gap-1 mb-1 flex-wrap">
                          <span className="text-[10px] text-muted-foreground">Cortisol:</span>
                          <LabCheckbox id="cortAM" label="AM" checked={labTests.cortisolAM} onChange={() => setLabTests({ ...labTests, cortisolAM: !labTests.cortisolAM })} />
                          <LabCheckbox id="cortPM" label="PM" checked={labTests.cortisolPM} onChange={() => setLabTests({ ...labTests, cortisolPM: !labTests.cortisolPM })} />
                          <LabCheckbox id="cortRand" label="Random" checked={labTests.cortisolRandom} onChange={() => setLabTests({ ...labTests, cortisolRandom: !labTests.cortisolRandom })} />
                        </div>
                        <div className="grid grid-cols-2 gap-0.5">
                          <LabCheckbox id="estradiol2" label="Estradiol" checked={labTests.estradiol} onChange={() => setLabTests({ ...labTests, estradiol: !labTests.estradiol })} />
                          <LabCheckbox id="prog" label="Progesterone" checked={labTests.progesterone} onChange={() => setLabTests({ ...labTests, progesterone: !labTests.progesterone })} />
                          <LabCheckbox id="prol" label="Prolactin" checked={labTests.prolactin} onChange={() => setLabTests({ ...labTests, prolactin: !labTests.prolactin })} />
                          <LabCheckbox id="test" label="Testosterone" checked={labTests.testosterone} onChange={() => setLabTests({ ...labTests, testosterone: !labTests.testosterone })} />
                          <LabCheckbox id="thyAB" label="Thyroid AB" checked={labTests.thyroidAB} onChange={() => setLabTests({ ...labTests, thyroidAB: !labTests.thyroidAB })} />
                          <LabCheckbox id="tsh2" label="TSH" checked={labTests.tsh} onChange={() => setLabTests({ ...labTests, tsh: !labTests.tsh })} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pregnancy */}
                      <div className="border border-border/60 rounded-lg p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Pregnancy</p>
                        <div className="space-y-0.5">
                          <LabCheckbox id="bhcg" label="BHCG Quantitative" checked={labTests.bhcgQuantitative} onChange={() => setLabTests({ ...labTests, bhcgQuantitative: !labTests.bhcgQuantitative })} />
                          <LabCheckbox id="gluc50" label="Glucose 50g Load" checked={labTests.glucose50gLoad} onChange={() => setLabTests({ ...labTests, glucose50gLoad: !labTests.glucose50gLoad })} />
                        </div>
                      </div>

                      {/* Drug Levels */}
                      <div className="border border-border/60 rounded-lg p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Drug Levels</p>
                        <div className="grid grid-cols-2 gap-0.5">
                          <LabCheckbox id="carbo" label="Carbamazepine" checked={labTests.carbamazepine} onChange={() => setLabTests({ ...labTests, carbamazepine: !labTests.carbamazepine })} />
                          <LabCheckbox id="dig" label="Digoxin" checked={labTests.digoxin} onChange={() => setLabTests({ ...labTests, digoxin: !labTests.digoxin })} />
                          <LabCheckbox id="lith" label="Lithium" checked={labTests.lithium} onChange={() => setLabTests({ ...labTests, lithium: !labTests.lithium })} />
                          <LabCheckbox id="phenobarb" label="Phenobarbital" checked={labTests.phenobarbital} onChange={() => setLabTests({ ...labTests, phenobarbital: !labTests.phenobarbital })} />
                          <LabCheckbox id="phenyt" label="Phenytoin" checked={labTests.phenytoin} onChange={() => setLabTests({ ...labTests, phenytoin: !labTests.phenytoin })} />
                          <LabCheckbox id="valp" label="Valproic Acid" checked={labTests.valproicAcid} onChange={() => setLabTests({ ...labTests, valproicAcid: !labTests.valproicAcid })} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Serology */}
                      <div className="border border-border/60 rounded-lg p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Serology</p>
                        <div className="space-y-0.5">
                          <LabCheckbox id="ana2" label="ANA" checked={labTests.ana} onChange={() => setLabTests({ ...labTests, ana: !labTests.ana })} />
                          <LabCheckbox id="crp" label="C-Reactive Protein" checked={labTests.cReactiveProtein} onChange={() => setLabTests({ ...labTests, cReactiveProtein: !labTests.cReactiveProtein })} />
                          <LabCheckbox id="hiv" label="HIV" checked={labTests.hiv} onChange={() => setLabTests({ ...labTests, hiv: !labTests.hiv })} />
                          <LabCheckbox id="hepb" label="Hepatitis B" checked={labTests.hepatitisB} onChange={() => setLabTests({ ...labTests, hepatitisB: !labTests.hepatitisB })} />
                          <LabCheckbox id="hepc" label="Hepatitis C" checked={labTests.hepatitisC} onChange={() => setLabTests({ ...labTests, hepatitisC: !labTests.hepatitisC })} />
                          <LabCheckbox id="syph" label="Syphilis" checked={labTests.syphilis} onChange={() => setLabTests({ ...labTests, syphilis: !labTests.syphilis })} />
                          <LabCheckbox id="malaria" label="Malaria" checked={labTests.malaria} onChange={() => setLabTests({ ...labTests, malaria: !labTests.malaria })} />
                        </div>
                      </div>

                      {/* Cultures */}
                      <div className="border border-border/60 rounded-lg p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Cultures</p>
                        <div className="space-y-0.5">
                          <LabCheckbox id="throat" label="Throat C&S" checked={labTests.throatCandS} onChange={() => setLabTests({ ...labTests, throatCandS: !labTests.throatCandS })} />
                          <LabCheckbox id="urineC" label="Urine C&S" checked={labTests.urineCandS} onChange={() => setLabTests({ ...labTests, urineCandS: !labTests.urineCandS })} />
                          <div className="flex items-center gap-1">
                            <LabCheckbox id="ear" label="Ear C&S" checked={labTests.earCandS} onChange={() => setLabTests({ ...labTests, earCandS: !labTests.earCandS })} />
                            <LabCheckbox id="earL" label="L" checked={labTests.earCandSLeft} onChange={() => setLabTests({ ...labTests, earCandSLeft: !labTests.earCandSLeft })} />
                            <LabCheckbox id="earR" label="R" checked={labTests.earCandSRight} onChange={() => setLabTests({ ...labTests, earCandSRight: !labTests.earCandSRight })} />
                          </div>
                          <div className="flex items-center gap-1">
                            <LabCheckbox id="eye" label="Eye C&S" checked={labTests.eyeCandS} onChange={() => setLabTests({ ...labTests, eyeCandS: !labTests.eyeCandS })} />
                            <LabCheckbox id="eyeL" label="L" checked={labTests.eyeCandSLeft} onChange={() => setLabTests({ ...labTests, eyeCandSLeft: !labTests.eyeCandSLeft })} />
                            <LabCheckbox id="eyeR" label="R" checked={labTests.eyeCandSRight} onChange={() => setLabTests({ ...labTests, eyeCandSRight: !labTests.eyeCandSRight })} />
                          </div>
                          <div className="flex items-center gap-1">
                            <LabCheckbox id="otherC" label="Other C&S" checked={labTests.otherCandS} onChange={() => setLabTests({ ...labTests, otherCandS: !labTests.otherCandS })} />
                            <Input className="h-6 text-xs w-28" placeholder="Source" value={otherCandSSource} onChange={(e) => setOtherCandSSource(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Lab Features */}
                    <div className="border border-border/60 rounded-lg p-4">
                      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Allergies</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mentholAllergy" className="h-4 w-4" checked={mentholAllergy} onCheckedChange={() => setMentholAllergy(!mentholAllergy)} />
                          <Label htmlFor="mentholAllergy" className="text-sm cursor-pointer">Menthol Allergy</Label>
                        </div>
                        <div className="flex-1">
                          <Input placeholder="Other allergies..." value={otherAllergies} onChange={(e) => setOtherAllergies(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Lab Notes */}
                    <div className="border border-border/60 rounded-lg p-4">
                      <Label className="text-sm font-semibold">Clinical Notes for Lab</Label>
                      <Textarea rows={3} placeholder="Additional clinical information for the laboratory..." value={labNotes} onChange={(e) => setLabNotes(e.target.value)} className="mt-2" />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border/60">
                      <Button className="flex-1" onClick={() => toast({ title: "Lab requisition sent", description: "All selected tests have been sent to the lab." })}>
                        <Send className="h-4 w-4 mr-2" /> Send to Lab
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Referral */}
                <TabsContent value="ref" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Specialist">
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select specialist" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardio">Cardiologist</SelectItem>
                          <SelectItem value="derm">Dermatologist</SelectItem>
                          <SelectItem value="endo">Endocrinologist</SelectItem>
                          <SelectItem value="neuro">Neurologist</SelectItem>
                          <SelectItem value="ortho">Orthopedic Surgeon</SelectItem>
                          <SelectItem value="psych">Psychiatrist</SelectItem>
                          <SelectItem value="nephro">Nephrologist</SelectItem>
                          <SelectItem value="onco">Oncologist</SelectItem>
                          <SelectItem value="ophth">Ophthalmologist</SelectItem>
                          <SelectItem value="ent">ENT Specialist</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Facility">
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select facility" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="luth">Lagos University Teaching Hospital</SelectItem>
                          <SelectItem value="nha">National Hospital Abuja</SelectItem>
                          <SelectItem value="eko">Eko Hospital</SelectItem>
                          <SelectItem value="reddington">Reddington Hospital</SelectItem>
                          <SelectItem value="lagos-island">Lagos Island General Hospital</SelectItem>
                          <SelectItem value="st-nicholas">St. Nicholas Hospital</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Reason for Referral">
                    <Textarea rows={4} placeholder="Patient with chest pain, refer for stress test. Include relevant history and findings..." />
                  </Field>
                  <Field label="Additional Notes">
                    <Textarea rows={3} placeholder="Any other relevant information for the specialist..." />
                  </Field>
                  <div className="flex gap-3">
                    <Button className="flex-1" onClick={() => toast({ title: "Referral sent" })}><Send className="h-4 w-4 mr-2" /> Send Referral</Button>
                    <Button variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" /> Download</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
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
    <Label className="text-sm font-medium">{label}</Label>
    {children}
  </div>
);

const LabCheckbox = ({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) => (
  <div className="flex items-center space-x-1.5">
    <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="h-3.5 w-3.5" />
    <Label htmlFor={id} className="text-xs cursor-pointer leading-none">{label}</Label>
  </div>
);

export default ConsultationRoom;