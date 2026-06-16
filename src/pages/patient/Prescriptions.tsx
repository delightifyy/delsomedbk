import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Pill, RefreshCw, FileText, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import desolmedLogo from "@/assets/desolmed-logo.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Prescription {
  id: string;
  prescription_uuid: string;
  medication: string;
  dosage: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  doctor_name: string;
  doctor_uuid?: string;
  date: string;
  expiry_date?: string;
  refills_total: number;
  refills_used: number;
  refills_left: number;
  status: "active" | "expired" | "completed" | "cancelled";
  pharmacy?: string;
  notes?: string;
}

// ============ DEMO DATA ============
// Toggle this to false to use real API, true to use demo data
const USE_DEMO_DATA = false;

const DEMO_PRESCRIPTIONS: Prescription[] = [
  {
    id: "1",
    prescription_uuid: "demo-rx-001",
    medication: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "30 days",
    instructions: "Take with or without food. Do not exceed prescribed dose.",
    doctor_name: "Dr. Sarah Johnson",
    doctor_uuid: "doc-001",
    date: "2024-05-15",
    expiry_date: "2024-08-15",
    refills_total: 3,
    refills_used: 1,
    refills_left: 2,
    status: "active",
    pharmacy: "MedPlus Pharmacy",
    notes: "For hypertension management",
  },
  {
    id: "2",
    prescription_uuid: "demo-rx-002",
    medication: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily with meals",
    duration: "90 days",
    instructions: "Take with meals to reduce stomach upset.",
    doctor_name: "Dr. Michael Chen",
    doctor_uuid: "doc-002",
    date: "2024-04-10",
    expiry_date: "2024-07-10",
    refills_total: 2,
    refills_used: 0,
    refills_left: 2,
    status: "active",
    pharmacy: "HealthPlus Pharmacy",
    notes: "For type 2 diabetes management",
  },
  {
    id: "3",
    prescription_uuid: "demo-rx-003",
    medication: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times daily",
    duration: "7 days",
    instructions: "Complete full course even if symptoms improve.",
    doctor_name: "Dr. Emily Rodriguez",
    doctor_uuid: "doc-003",
    date: "2024-03-20",
    expiry_date: "2024-04-20",
    refills_total: 0,
    refills_used: 0,
    refills_left: 0,
    status: "expired",
    pharmacy: "CarePlus Pharmacy",
    notes: "For bacterial infection",
  },
  {
    id: "4",
    prescription_uuid: "demo-rx-004",
    medication: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    duration: "90 days",
    instructions: "Take at the same time each day.",
    doctor_name: "Dr. James Wilson",
    doctor_uuid: "doc-004",
    date: "2024-05-01",
    expiry_date: "2024-08-01",
    refills_total: 3,
    refills_used: 0,
    refills_left: 3,
    status: "active",
    pharmacy: "MedPlus Pharmacy",
    notes: "For cholesterol management",
  },
  {
    id: "5",
    prescription_uuid: "demo-rx-005",
    medication: "Albuterol Inhaler",
    dosage: "90mcg",
    frequency: "2 puffs every 4-6 hours as needed",
    duration: "30 days",
    instructions: "Shake well before use. Rinse mouth after use.",
    doctor_name: "Dr. Lisa Wang",
    doctor_uuid: "doc-005",
    date: "2024-04-25",
    expiry_date: "2024-07-25",
    refills_total: 2,
    refills_used: 1,
    refills_left: 1,
    status: "active",
    pharmacy: "HealthPlus Pharmacy",
    notes: "For asthma/rescue inhaler",
  },
  {
    id: "6",
    prescription_uuid: "demo-rx-006",
    medication: "Ibuprofen",
    dosage: "400mg",
    frequency: "Every 6-8 hours as needed",
    duration: "14 days",
    instructions: "Take with food or milk. Do not exceed 1200mg per day.",
    doctor_name: "Dr. Robert Taylor",
    doctor_uuid: "doc-006",
    date: "2024-05-10",
    expiry_date: "2024-06-10",
    refills_total: 1,
    refills_used: 0,
    refills_left: 1,
    status: "active",
    pharmacy: "CarePlus Pharmacy",
    notes: "For pain and inflammation",
  },
];

// Loading screen component
const PrescriptionsLoadingScreen = () => (
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

// Generate demo prescription PDF
const generateDemoPrescriptionPDF = async (prescription: Prescription) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Prescription - ${prescription.medication}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .title { font-size: 20px; font-weight: bold; margin: 20px 0; color: #1e293b; }
        .section { margin-bottom: 20px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #2563eb; border-left: 3px solid #2563eb; padding-left: 10px; }
        .row { display: flex; margin-bottom: 8px; }
        .label { width: 150px; font-weight: bold; color: #64748b; }
        .value { flex: 1; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
        .status-active { color: #10b981; font-weight: bold; }
        .status-expired { color: #ef4444; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">DesolMed</div>
        <p>Prescription Document</p>
      </div>
      
      <div class="section">
        <div class="section-title">Prescription Information</div>
        <div class="row"><div class="label">Medication:</div><div class="value">${prescription.medication} ${prescription.dosage}</div></div>
        <div class="row"><div class="label">Frequency:</div><div class="value">${prescription.frequency || "As prescribed"}</div></div>
        <div class="row"><div class="label">Duration:</div><div class="value">${prescription.duration || "N/A"}</div></div>
        <div class="row"><div class="label">Prescribed By:</div><div class="value">${prescription.doctor_name}</div></div>
        <div class="row"><div class="label">Date Prescribed:</div><div class="value">${new Date(prescription.date).toLocaleDateString()}</div></div>
        <div class="row"><div class="label">Expiry Date:</div><div class="value">${prescription.expiry_date ? new Date(prescription.expiry_date).toLocaleDateString() : "N/A"}</div></div>
        <div class="row"><div class="label">Status:</div><div class="value status-${prescription.status}">${prescription.status.toUpperCase()}</div></div>
      </div>
      
      <div class="section">
        <div class="section-title">Instructions</div>
        <p>${prescription.instructions || "Take as directed by your doctor."}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Refill Information</div>
        <div class="row"><div class="label">Total Refills:</div><div class="value">${prescription.refills_total}</div></div>
        <div class="row"><div class="label">Refills Used:</div><div class="value">${prescription.refills_used}</div></div>
        <div class="row"><div class="label">Refills Remaining:</div><div class="value">${prescription.refills_left}</div></div>
      </div>
      
      ${prescription.pharmacy ? `
      <div class="section">
        <div class="section-title">Preferred Pharmacy</div>
        <p>${prescription.pharmacy}</p>
      </div>
      ` : ''}
      
      ${prescription.notes ? `
      <div class="section">
        <div class="section-title">Additional Notes</div>
        <p>${prescription.notes}</p>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>This is an official prescription from DesolMed. Please present this to your pharmacy.</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/pdf' });
  return blob;
};

const Prescriptions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [refillDialogOpen, setRefillDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [refillNote, setRefillNote] = useState("");
  const [submittingRefill, setSubmittingRefill] = useState(false);

  // Load prescriptions
  useEffect(() => {
    const loadPrescriptions = async () => {
      setLoading(true);
      
      if (USE_DEMO_DATA) {
        setTimeout(() => {
          setPrescriptions(DEMO_PRESCRIPTIONS);
          setLoading(false);
        }, 1000);
        return;
      }
      
      try {
        const response = await api.me.prescriptions.list({ status: "active" });
        console.log("Prescriptions response:", response);
        
        const dataArray = response.data?.data || [];
        const transformedPrescriptions = dataArray.map((rx: any) => ({
          id: rx.id || rx.prescription_uuid,
          prescription_uuid: rx.prescription_uuid || rx.uuid,
          medication: rx.medication,
          dosage: rx.dosage,
          frequency: rx.frequency,
          duration: rx.duration,
          instructions: rx.instructions,
          doctor_name: rx.doctor_name || rx.doctor?.name,
          doctor_uuid: rx.doctor_uuid,
          date: rx.date,
          expiry_date: rx.expiry_date,
          refills_total: rx.refills_total,
          refills_used: rx.refills_used,
          refills_left: rx.refills_left,
          status: rx.status,
          pharmacy: rx.pharmacy,
          notes: rx.notes,
        }));
        
        setPrescriptions(transformedPrescriptions);
      } catch (error: any) {
        console.error("Failed to load prescriptions:", error);
        toast({
          title: "Error loading prescriptions",
          description: error.message || "Could not load your prescriptions",
          variant: "destructive",
        });
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, [toast]);

  // Download prescription
  const downloadPrescription = async (prescription: Prescription) => {
    setDownloading(prescription.id);
    
    if (USE_DEMO_DATA) {
      try {
        const blob = await generateDemoPrescriptionPDF(prescription);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `prescription_${prescription.medication.replace(/\s/g, "_")}_${prescription.date}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download started",
          description: "Your prescription is being downloaded (DEMO).",
        });
      } catch (error) {
        console.error("Failed to generate demo PDF:", error);
        toast({
          title: "Download failed",
          description: "Could not generate prescription PDF",
          variant: "destructive",
        });
      } finally {
        setDownloading(null);
      }
      return;
    }
    
    try {
      const response = await api.me.prescriptions.download(prescription.prescription_uuid);
      const url = window.URL.createObjectURL(response.blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription_${prescription.medication.replace(/\s/g, "_")}_${prescription.date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your prescription is being downloaded.",
      });
    } catch (error: any) {
      console.error("Failed to download prescription:", error);
      toast({
        title: "Download failed",
        description: error.message || "Could not download prescription",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  // Request refill
  const requestRefill = async () => {
    if (!selectedPrescription) return;
    
    setSubmittingRefill(true);
    
    if (USE_DEMO_DATA) {
      setTimeout(() => {
        toast({
          title: "Refill requested",
          description: `Refill request for ${selectedPrescription.medication} has been submitted.`,
        });
        setRefillDialogOpen(false);
        setRefillNote("");
        setSelectedPrescription(null);
        setSubmittingRefill(false);
      }, 1000);
      return;
    }
    
    try {
      await api.me.prescriptions.requestRefill(selectedPrescription.prescription_uuid, {
        note: refillNote || undefined,
      });
      
      toast({
        title: "Refill requested",
        description: `Refill request for ${selectedPrescription.medication} has been submitted.`,
      });
      
      setRefillDialogOpen(false);
      setRefillNote("");
      setSelectedPrescription(null);
    } catch (error: any) {
      console.error("Failed to request refill:", error);
      toast({
        title: "Refill request failed",
        description: error.message || "Could not submit refill request",
        variant: "destructive",
      });
    } finally {
      setSubmittingRefill(false);
    }
  };

  const openRefillDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setRefillNote("");
    setRefillDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const activePrescriptions = prescriptions.filter(rx => rx.status === "active");
  const pastPrescriptions = prescriptions.filter(rx => rx.status !== "active");

  if (loading) {
    return <PrescriptionsLoadingScreen />;
  }

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      {/* Demo Mode Banner */}
      {USE_DEMO_DATA && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <span className="font-medium">📋 Demo Mode:</span> Showing sample prescription data. PDF download will generate a demo PDF.
          Set <code className="bg-amber-100 px-1 rounded">USE_DEMO_DATA = false</code> in the file to use real API.
        </div>
      )}

      <PageHeader 
        title="Prescriptions" 
        description="Active and past medications prescribed to you."
      />

      {/* Active Prescriptions */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <Pill className="h-5 w-5 text-primary" />
          Active Prescriptions
        </h2>
        {activePrescriptions.length === 0 ? (
          <SectionCard>
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active prescriptions</p>
            </div>
          </SectionCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activePrescriptions.map((rx) => (
              <SectionCard key={rx.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display font-semibold">{rx.medication}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{rx.dosage}</p>
                      {rx.frequency && (
                        <p className="text-xs text-muted-foreground mt-1">{rx.frequency}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Prescribed by <span className="text-foreground font-medium">{rx.doctor_name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(rx.date)} • {rx.refills_left} refills left
                        {rx.expiry_date && ` • Expires ${formatDate(rx.expiry_date)}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="capitalize">{rx.status}</Badge>
                </div>
                
                {rx.instructions && (
                  <p className="text-xs text-muted-foreground mt-3 p-2 bg-muted/30 rounded">
                     {rx.instructions}
                  </p>
                )}
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => downloadPrescription(rx)}
                    disabled={downloading === rx.id}
                  >
                    {downloading === rx.id ? (
                      <div className="relative w-4 h-4 mr-2">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-sm animate-pulse"></div>
                        <div className="relative animate-bounce">
                          <img src={desolmedLogo} alt="" className="w-4 h-4 object-contain" />
                        </div>
                      </div>
                    ) : (
                      <Download className="h-3.5 w-3.5 mr-1" />
                    )}
                    Download
                  </Button>
                  {rx.refills_left > 0 && (
                    <Button 
                      size="sm" 
                      onClick={() => openRefillDialog(rx)}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Request Refill
                    </Button>
                  )}
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </div>

      {/* Past Prescriptions */}
      {pastPrescriptions.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Past Prescriptions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastPrescriptions.map((rx) => (
              <SectionCard key={rx.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted/30 text-muted-foreground flex items-center justify-center shrink-0">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display font-semibold">{rx.medication}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{rx.dosage}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Prescribed by <span className="text-foreground font-medium">{rx.doctor_name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(rx.date)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">{rx.status}</Badge>
                </div>
                
                <div className="mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => downloadPrescription(rx)}
                    disabled={downloading === rx.id}
                  >
                    {downloading === rx.id ? (
                      <div className="relative w-4 h-4 mr-2">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-sm animate-pulse"></div>
                        <div className="relative animate-bounce">
                          <img src={desolmedLogo} alt="" className="w-4 h-4 object-contain" />
                        </div>
                      </div>
                    ) : (
                      <Download className="h-3.5 w-3.5 mr-1" />
                    )}
                    Download
                  </Button>
                </div>
              </SectionCard>
            ))}
          </div>
        </div>
      )}

      {/* Refill Request Dialog */}
      <Dialog open={refillDialogOpen} onOpenChange={setRefillDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Refill</DialogTitle>
            <DialogDescription>
              Request a refill for {selectedPrescription?.medication} {selectedPrescription?.dosage}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refill-note">Additional Note (Optional)</Label>
              <Textarea
                id="refill-note"
                placeholder="Any additional information for your doctor or pharmacy..."
                value={refillNote}
                onChange={(e) => setRefillNote(e.target.value)}
                rows={3}
              />
            </div>
            
            {selectedPrescription && (
              <div className="rounded-lg bg-muted/30 p-3 text-sm">
                <p className="font-medium mb-1">Prescription Details:</p>
                <p className="text-muted-foreground">
                  {selectedPrescription.medication} {selectedPrescription.dosage}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Refills remaining: {selectedPrescription.refills_left}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRefillDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={requestRefill} disabled={submittingRefill}>
              {submittingRefill ? (
                <>
                  <div className="relative w-4 h-4 mr-2">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-sm animate-pulse"></div>
                    <div className="relative animate-bounce">
                      <img src={desolmedLogo} alt="" className="w-4 h-4 object-contain" />
                    </div>
                  </div>
                  Submitting...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Submit Refill Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default Prescriptions;