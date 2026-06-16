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

  // Drag handlers - supporting both mouse and touch events
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (floatingRef.current) {
      const rect = floatingRef.current.getBoundingClientRect();
      let clientX, clientY;
      
      if ('touches' in e) {
        // Touch event
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault(); // Prevent scrolling while dragging
      } else {
        // Mouse event
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging) {
      let clientX, clientY;
      
      if ('touches' in e) {
        // Touch event
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        // Mouse event
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      const newX = Math.max(0, Math.min(clientX - dragOffset.x, window.innerWidth - 320));
      const newY = Math.max(0, Math.min(clientY - dragOffset.y, window.innerHeight - 200));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    } else {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
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
          className="fixed z-50 shadow-2xl rounded-xl border border-border/60 bg-background overflow-hidden touch-none"
          style={{
            top: position.y,
            left: position.x,
            width: isMinimized ? '280px' : '320px',
            minWidth: '280px',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none'
          }}
        >
          {/* Drag Handle */}
          <div 
            className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/60 cursor-grab active:cursor-grabbing touch-none"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
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

      {/* Main Content - Keep the rest of your existing code here */}
      {/* ... rest of the component ... */}
    </PortalLayout>
  );
};

// Keep all your existing helper components (Section, Field, LabCheckbox)

export default ConsultationRoom;