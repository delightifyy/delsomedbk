import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  FileText,
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  CalendarCheck,
  Globe,
  ChevronDown,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import desolmedLogo from "@/assets/desolmed-logo.png";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Consultation {
  id: string;
  consultation_uuid: string;
  doctor_name: string;
  doctor_uuid: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
  status: "completed" | "cancelled" | "scheduled";
  reason?: string;
  notes?: string;
  prescription?: string;
}

interface ConsultationDetail {
  uuid: string;
  doctor: {
    name: string;
    uuid: string;
    specialty: string;
    email?: string;
    phone?: string;
    image?: string;
  };
  consultation_date: string;
  consultation_time?: string;
  type: string;
  status: string;
  reason: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  follow_up_advice?: string;
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
  };
  created_at: string;
}

const statusVariant = (s: string) => {
  switch (s) {
    case "completed": return "default";
    case "scheduled": return "secondary";
    case "cancelled": return "destructive";
    default: return "outline";
  }
};

// Loading screen component with ONLY logo - NO spinner
const ConsultationsLoadingScreen = () => (
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

// Detail loading screen
const DetailLoadingScreen = () => (
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
    <p className="text-muted-foreground text-sm animate-pulse">Loading consultation details...</p>
  </div>
);

const Consultations = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationDetail | null>(null);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const consultationTypes = ["follow_up", "initial", "emergency", "routine"];

  // Load consultations list
  useEffect(() => {
    const loadConsultations = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedTypes.length > 0) params.type = selectedTypes.join(",");
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        
        const response = await api.me.consultations.list(params);
        console.log("Consultations response:", response);
        
        const dataArray = response.data?.data || [];
        
        const transformedConsultations = dataArray.map((c: any) => ({
          id: c.id || c.consultation_uuid,
          consultation_uuid: c.consultation_uuid || c.uuid,
          doctor_name: c.doctor_name || c.doctor?.name || "",
          doctor_uuid: c.doctor_uuid || c.doctor?.uuid,
          specialty: c.specialty || c.doctor?.specialty || "",
          date: c.date || c.consultation_date,
          time: c.time || c.consultation_time,
          type: c.type || "routine",
          status: c.status || "completed",
          reason: c.reason,
          notes: c.notes,
        }));
        
        setConsultations(transformedConsultations);
        setFilteredConsultations(transformedConsultations);
      } catch (error: any) {
        console.error("Failed to load consultations:", error);
        toast({
          title: "Error loading consultations",
          description: error.message || "Could not load your consultation history",
          variant: "destructive",
        });
        setConsultations([]);
        setFilteredConsultations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConsultations();
  }, [toast]);

  // Apply filters
  useEffect(() => {
    let filtered = [...consultations];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.doctor_name.toLowerCase().includes(term) ||
        c.specialty.toLowerCase().includes(term) ||
        (c.reason && c.reason.toLowerCase().includes(term))
      );
    }
    
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(c => selectedTypes.includes(c.type));
    }
    
    if (dateFrom) {
      filtered = filtered.filter(c => c.date >= dateFrom);
    }
    
    if (dateTo) {
      filtered = filtered.filter(c => c.date <= dateTo);
    }
    
    setFilteredConsultations(filtered);
  }, [searchTerm, selectedTypes, dateFrom, dateTo, consultations]);

  // Load consultation details when clicked
  const loadConsultationDetail = async (consultationUuid: string) => {
    setDetailLoading(true);
    try {
      const response = await api.me.consultations.detail(consultationUuid);
      console.log("Consultation detail response:", response);
      const detail = response.data as ConsultationDetail;
      setSelectedConsultation(detail);
    } catch (error: any) {
      console.error("Failed to load consultation details:", error);
      toast({
        title: "Error",
        description: error.message || "Could not load consultation details",
        variant: "destructive",
      });
      setSelectedConsultation(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Download consultation summary PDF
  const downloadSummary = async (consultationUuid: string, doctorName: string) => {
    setDownloading(consultationUuid);
    try {
      const response = await api.me.consultations.downloadSummary(consultationUuid);
      
      // Create blob link to download
      const url = window.URL.createObjectURL(response.blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `consultation_${doctorName.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your consultation summary is being downloaded.",
      });
    } catch (error: any) {
      console.error("Failed to download summary:", error);
      toast({
        title: "Download failed",
        description: error.message || "Could not download consultation summary",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleSelectConsultation = async (c: Consultation) => {
    setSelected(c);
    if (c.consultation_uuid) {
      await loadConsultationDetail(c.consultation_uuid);
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

  const formatType = (type: string) => {
    const types: Record<string, string> = {
      follow_up: "Follow-up",
      initial: "Initial Consultation",
      emergency: "Emergency",
      routine: "Routine Checkup",
    };
    return types[type] || type;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTypes([]);
    setDateFrom("");
    setDateTo("");
  };

  if (loading) {
    return <ConsultationsLoadingScreen />;
  }

  const displayConsultation = selectedConsultation || (selected ? {
    uuid: selected.consultation_uuid,
    doctor: {
      name: selected.doctor_name,
      uuid: selected.doctor_uuid,
      specialty: selected.specialty,
    },
    consultation_date: selected.date,
    consultation_time: selected.time,
    type: selected.type,
    status: selected.status,
    reason: selected.reason || "",
    created_at: new Date().toISOString(),
  } : null);

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader
        title="Consultations"
        description="View your consultation history and medical records."
      />

      {/* Search and Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by doctor, specialty, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          {(searchTerm || selectedTypes.length > 0 || dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
        
        {showFilters && (
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Consultation Type</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedTypes.length > 0 ? `${selectedTypes.length} selected` : "All types"}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {consultationTypes.map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTypes([...selectedTypes, type]);
                          } else {
                            setSelectedTypes(selectedTypes.filter(t => t !== type));
                          }
                        }}
                      >
                        {formatType(type)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Consultations List */}
      <SectionCard>
        {filteredConsultations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No consultations found</p>
            {(searchTerm || selectedTypes.length > 0 || dateFrom || dateTo) && (
              <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConsultations.map((c) => (
              <div 
                key={c.id} 
                onClick={() => handleSelectConsultation(c)} 
                role="button" 
                tabIndex={0} 
                className="w-full text-left flex items-center gap-4 p-4 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-all cursor-pointer"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(c.doctor_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{c.doctor_name}</p>
                  <p className="text-xs text-muted-foreground">{c.specialty}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {c.reason || "No reason provided"}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(c.date)}</span>
                  {c.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.time}</span>}
                  <span className="capitalize">{formatType(c.type)}</span>
                </div>
                <Badge variant={statusVariant(c.status)} className="capitalize">{c.status}</Badge>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSummary(c.consultation_uuid, c.doctor_name);
                  }}
                  disabled={downloading === c.consultation_uuid}
                >
                  {downloading === c.consultation_uuid ? (
                    <div className="relative w-4 h-4">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-sm animate-pulse"></div>
                      <div className="relative animate-bounce">
                        <img src={desolmedLogo} alt="" className="w-4 h-4 object-contain" />
                      </div>
                    </div>
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Consultation Details Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => {
        if (!o) {
          setSelected(null);
          setSelectedConsultation(null);
        }
      }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailLoading ? (
            <DetailLoadingScreen />
          ) : displayConsultation && (
            <>
              <SheetHeader>
                <SheetTitle>{displayConsultation.doctor?.name || "Consultation Details"}</SheetTitle>
                <SheetDescription>{displayConsultation.doctor?.specialty || ""}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Date</p>
                    <p className="font-medium text-sm mt-1">{formatDate(displayConsultation.consultation_date)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Type</p>
                    <p className="font-medium text-sm mt-1 capitalize">{formatType(displayConsultation.type)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Status</p>
                    <p className="font-medium text-sm mt-1 capitalize">{displayConsultation.status}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Consultation ID</p>
                    <p className="font-medium text-sm mt-1 truncate">{displayConsultation.uuid?.slice(0, 8)}...</p>
                  </div>
                </div>

                {/* Vital Signs (if available) */}
                {displayConsultation.vital_signs && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Vital Signs</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {displayConsultation.vital_signs.blood_pressure && (
                        <div className="p-2 rounded-lg bg-muted/30">
                          <span className="text-muted-foreground">BP:</span> {displayConsultation.vital_signs.blood_pressure}
                        </div>
                      )}
                      {displayConsultation.vital_signs.heart_rate && (
                        <div className="p-2 rounded-lg bg-muted/30">
                          <span className="text-muted-foreground">Heart Rate:</span> {displayConsultation.vital_signs.heart_rate} bpm
                        </div>
                      )}
                      {displayConsultation.vital_signs.temperature && (
                        <div className="p-2 rounded-lg bg-muted/30">
                          <span className="text-muted-foreground">Temp:</span> {displayConsultation.vital_signs.temperature}°C
                        </div>
                      )}
                      {displayConsultation.vital_signs.weight && (
                        <div className="p-2 rounded-lg bg-muted/30">
                          <span className="text-muted-foreground">Weight:</span> {displayConsultation.vital_signs.weight} kg
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Reason for Visit</p>
                  <p className="text-sm bg-muted/40 p-3 rounded-lg">{displayConsultation.reason || "No reason provided"}</p>
                </div>

                {displayConsultation.diagnosis && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Diagnosis</p>
                    <p className="text-sm bg-muted/40 p-3 rounded-lg">{displayConsultation.diagnosis}</p>
                  </div>
                )}

                {displayConsultation.prescription && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Prescription</p>
                    <p className="text-sm bg-muted/40 p-3 rounded-lg whitespace-pre-wrap">{displayConsultation.prescription}</p>
                  </div>
                )}

                {displayConsultation.notes && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Doctor's Notes</p>
                    <p className="text-sm bg-muted/40 p-3 rounded-lg">{displayConsultation.notes}</p>
                  </div>
                )}

                {displayConsultation.follow_up_advice && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Follow-up Advice</p>
                    <p className="text-sm bg-muted/40 p-3 rounded-lg">{displayConsultation.follow_up_advice}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button 
                    className="w-full"
                    onClick={() => downloadSummary(displayConsultation.uuid, displayConsultation.doctor?.name || "Consultation")}
                    disabled={downloading === displayConsultation.uuid}
                  >
                    {downloading === displayConsultation.uuid ? (
                      <>
                        <div className="relative w-4 h-4 mr-2">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-sm animate-pulse"></div>
                          <div className="relative animate-bounce">
                            <img src={desolmedLogo} alt="" className="w-4 h-4 object-contain" />
                          </div>
                        </div>
                        Downloading Summary...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Consultation Summary (PDF)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PortalLayout>
  );
};

export default Consultations;