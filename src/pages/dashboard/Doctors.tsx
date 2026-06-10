import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Stethoscope,
  Eye,
  Mail,
  Phone,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type LocalRegistration, type LocalProfile } from "@/lib/localStore";
import { api } from "@/lib/api";
import { collection, userProfileFromApi } from "@/lib/backendAdapters";

type DoctorProfile = {
  registration: LocalRegistration;
  profile: LocalProfile | null;
  miniSite?: {
    slug: string;
    public_url: string;
    admin_url: string;
  } | null;
  specialty?: string;
  specialty_name?: string;
};

const PAGE_SIZE = 50; // Changed from 10 to 50

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

const fmtDateTime = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// Skeleton row component
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
    <TableCell>
      <div className="space-y-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
    </TableCell>
    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
  </TableRow>
);

// Detail field skeleton
const DetailFieldSkeleton = () => (
  <div className="space-y-1">
    <Skeleton className="h-3 w-20" />
    <Skeleton className="h-4 w-32" />
  </div>
);

// Helper to get specialty from various possible locations
const getDoctorSpecialty = (entry: any, profile: any): string => {
  if (entry?.specialty_name) return entry.specialty_name;
  if (entry?.specialty) return entry.specialty;
  if (entry?.profile?.specialty_name) return entry.profile.specialty_name;
  if (entry?.profile?.specialty) return entry.profile.specialty;
  if (profile?.specialty) return profile.specialty;
  if (entry?.details?.specialty) return entry.details.specialty;
  if (entry?.details?.specialty_name) return entry.details.specialty_name;
  
  const findSpecialty = (obj: any): string | null => {
    if (!obj) return null;
    if (obj.specialty_name) return obj.specialty_name;
    if (obj.specialty) return obj.specialty;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const found = findSpecialty(obj[key]);
        if (found) return found;
      }
    }
    return null;
  };
  
  const found = findSpecialty(entry);
  if (found) return found;
  
  return "Not specified";
};

// Helper to get city from various possible locations
const getDoctorCity = (entry: any, profile: any): string | null => {
  return entry?.city || entry?.profile?.city || profile?.city || null;
};

// Helper to get state from various possible locations
const getDoctorState = (entry: any, profile: any): string | null => {
  return entry?.state_name || entry?.state || entry?.profile?.state_name || entry?.profile?.state || profile?.state || null;
};

const DoctorsPageInner = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.admin.users.list({ role: "doctor" });
      const approvedDoctors = collection(response.data).map((entry: any) => {
        const profile = userProfileFromApi(entry) as LocalProfile;
        
        const specialty = getDoctorSpecialty(entry, profile);
        const city = getDoctorCity(entry, profile);
        const state = getDoctorState(entry, profile);
        
        const registration: LocalRegistration = {
          id: profile.id,
          applicant_type: "doctor",
          status: "approved",
          full_name: profile.full_name,
          organization_name: profile.organization_name,
          email: profile.email ?? "",
          phone: profile.phone,
          city: city,
          state: state,
          zone: entry?.zone_name ?? entry?.zone ?? entry?.profile?.zone ?? null,
          specialty: specialty,
          details: entry?.profile ?? entry ?? {},
          documents: [],
          reviewer_notes: null,
          reviewed_at: null,
          created_at: profile.created_at,
        };
        
        return { 
          registration, 
          profile, 
          miniSite: null,
          specialty: specialty,
          specialty_name: specialty,
        } as DoctorProfile;
      });
      
      const miniSites = await Promise.allSettled(
        approvedDoctors.map((doctor) => api.admin.doctors.miniSite(doctor.registration.id)),
      );
      
      setDoctors(
        approvedDoctors.map((doctor, index) => ({
          ...doctor,
          miniSite:
            miniSites[index].status === "fulfilled"
              ? {
                  slug: miniSites[index].value.data.slug,
                  public_url: miniSites[index].value.data.public_url,
                  admin_url: miniSites[index].value.data.admin_url,
                }
              : null,
        })),
      );
    } catch (error) {
      console.error("Error loading doctors:", error);
      setDoctors([]);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = doctors.filter((d) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      d.registration.full_name?.toLowerCase().includes(needle) ||
      d.registration.email?.toLowerCase().includes(needle) ||
      d.registration.specialty?.toLowerCase().includes(needle) ||
      d.registration.city?.toLowerCase().includes(needle) ||
      d.registration.state?.toLowerCase().includes(needle)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedDoctors = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleViewDetails = async (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setShowDetailDialog(true);
    setDetailLoading(true);
    
    try {
      const response = await api.admin.users.detail(doctor.registration.id);
      const fullProfile = userProfileFromApi(response.data) as LocalProfile;
      const specialty = getDoctorSpecialty(response.data, fullProfile);
      const city = getDoctorCity(response.data, fullProfile);
      const state = getDoctorState(response.data, fullProfile);
      
      setSelectedDoctor(prev => prev ? {
        ...prev,
        profile: fullProfile,
        specialty: specialty,
        registration: {
          ...prev.registration,
          specialty: specialty,
          city: city,
          state: state,
          details: response.data,
        }
      } : null);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Approved Doctors</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage doctor profiles, view details, and access their mini-sites.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, specialty, or city..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Doctors Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mini-Site URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : pagedDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    {doctors.length === 0 ? "No approved doctors yet" : "No doctors match your search"}
                  </TableCell>
                </TableRow>
              ) : (
                pagedDoctors.map((doctor) => (
                  <TableRow key={doctor.registration.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{doctor.registration.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          Registered {fmtDate(doctor.registration.created_at)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {doctor.registration.email && (
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[180px]">{doctor.registration.email}</span>
                          </p>
                        )}
                        {doctor.registration.phone && (
                          <p className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {doctor.registration.phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">
                        Approved
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doctor.miniSite?.public_url ? (
                        <a 
                          href={doctor.miniSite.public_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline break-all flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          {doctor.miniSite.public_url.length > 40 
                            ? doctor.miniSite.public_url.substring(0, 40) + "..." 
                            : doctor.miniSite.public_url}
                        </a>
                      ) : doctor.profile?.website_url ? (
                        <a 
                          href={doctor.profile.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline break-all flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          {doctor.profile.website_url.length > 40 
                            ? doctor.profile.website_url.substring(0, 40) + "..." 
                            : doctor.profile.website_url}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No URL available</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(doctor)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && filtered.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} doctors
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Show total count even when only one page */}
          {!loading && filtered.length > 0 && totalPages === 1 && (
            <div className="border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground text-center">
                Showing all {filtered.length} doctors
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Doctor Details Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Doctor Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this doctor.
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <DetailFieldSkeleton />
                <DetailFieldSkeleton />
                <DetailFieldSkeleton />
                <DetailFieldSkeleton />
                <DetailFieldSkeleton />
                <DetailFieldSkeleton />
              </div>
            </div>
          ) : selectedDoctor && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedDoctor.registration.full_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Specialty</p>
                  <p>{selectedDoctor.registration.specialty && selectedDoctor.registration.specialty !== "Not specified" 
                    ? selectedDoctor.registration.specialty 
                    : "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{selectedDoctor.registration.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p>{selectedDoctor.registration.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  <p>{selectedDoctor.registration.city || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">State</p>
                  <p>{selectedDoctor.registration.state || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Zone</p>
                  <p>{selectedDoctor.registration.zone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registered On</p>
                  <p>{fmtDateTime(selectedDoctor.registration.created_at)}</p>
                </div>
              </div>

              {/* Website / Mini-Site */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-semibold mb-3">Online Presence</h4>
                <div className="space-y-2">
                  {selectedDoctor.miniSite?.public_url ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Mini-Site URL</p>
                      <a 
                        href={selectedDoctor.miniSite.public_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {selectedDoctor.miniSite.public_url}
                      </a>
                    </div>
                  ) : selectedDoctor.profile?.website_url ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Website URL</p>
                      <a 
                        href={selectedDoctor.profile.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {selectedDoctor.profile.website_url}
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No website or mini-site available</p>
                  )}
                  
                  {selectedDoctor.miniSite?.admin_url && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">Admin URL</p>
                      <a 
                        href={selectedDoctor.miniSite.admin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {selectedDoctor.miniSite.admin_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Application Details */}
              {selectedDoctor.registration.details && Object.keys(selectedDoctor.registration.details).length > 0 && (
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold mb-3">Registration Application Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedDoctor.registration.details)
                      .filter(([key]) => !['id', 'uuid', 'password', 'token', 'created_at', 'updated_at', 'email_verified_at', 'profile'].includes(key))
                      .slice(0, 10)
                      .map(([key, value]) => {
                        if (!value) return null;
                        const formattedKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                        return (
                          <div key={key}>
                            <p className="text-xs text-muted-foreground capitalize">{formattedKey}</p>
                            <p className="text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DoctorsPageInner;