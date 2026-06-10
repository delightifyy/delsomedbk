// src/pages/dashboard/AppointmentsPage.tsx
import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar, 
  Mail, 
  Phone, 
  Building2, 
  User, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle as XCircleIcon,
  CreditCard,
  Stethoscope,
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// Types based on actual API response
type AppointmentStatus = "pending" | "awaiting_verification" | "verified" | "rejected" | "completed";

interface Appointment {
  id: string;
  uuid: string;
  patient?: {
    id: string;
    uuid: string;
    name: string;
    email: string;
    phone?: string;
  };
  doctor?: {
    id: string;
    uuid: string;
    name: string;
    email: string;
    specialty?: string;
  };
  service?: {
    id: string;
    name: string;
    duration?: number;
    price?: number;
  };
  status: AppointmentStatus;
  access_method: "card" | "subscription" | "hmo" | "organization";
  appointment_type: "physical" | "online";
  slot_date: string;
  slot_start_time: string;
  slot_end_time?: string;
  organization?: {
    id: string;
    name: string;
  };
  hmo_provider?: string;
  hmo_policy_number?: string;
  enrollee_id?: string;
  employee_id?: string;
  location?: {
    id: string;
    name: string;
    address: string;
  };
  notes?: string;
  rejection_reason?: string;
  verified_at?: string;
  verified_by?: {
    id: string;
    name: string;
  };
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Helper functions for status config
const getStatusConfig = (status: AppointmentStatus) => {
  switch (status) {
    case "awaiting_verification":
      return { 
        label: "Awaiting Verification", 
        color: "bg-yellow-100 text-yellow-800", 
        icon: Clock,
        description: "Waiting for admin to verify HMO/organization authorization"
      };
    case "pending":
      return { 
        label: "Pending", 
        color: "bg-gray-100 text-gray-800", 
        icon: AlertCircle,
        description: "Initial booking state"
      };
    case "verified":
      return { 
        label: "Verified", 
        color: "bg-green-100 text-green-800", 
        icon: ShieldCheck,
        description: "HMO/organization approved, awaiting doctor consultation"
      };
    case "rejected":
      return { 
        label: "Rejected", 
        color: "bg-red-100 text-red-800", 
        icon: XCircleIcon,
        description: "HMO/organization authorization denied"
      };
    case "completed":
      return { 
        label: "Completed", 
        color: "bg-blue-100 text-blue-800", 
        icon: CheckCircle,
        description: "Consultation completed by doctor"
      };
    default:
      return { 
        label: status, 
        color: "bg-gray-100 text-gray-800", 
        icon: AlertCircle,
        description: ""
      };
  }
};

const getAccessMethodConfig = (method?: string) => {
  switch (method) {
    case "hmo":
      return { label: "HMO", color: "bg-purple-100 text-purple-800", icon: Building2 };
    case "organization":
      return { label: "Organization", color: "bg-indigo-100 text-indigo-800", icon: Building2 };
    case "subscription":
      return { label: "Subscription", color: "bg-teal-100 text-teal-800", icon: CreditCard };
    case "card":
      return { label: "Card", color: "bg-blue-100 text-blue-800", icon: CreditCard };
    default:
      return { label: method || "Standard", color: "bg-gray-100 text-gray-800", icon: Building2 };
  }
};

// Skeleton loader component
const TableSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/30 border-b border-border">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Patient</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Service / Doctor</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Date & Time</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Access</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Status</th>
            <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted"></div>
                  <div>
                    <div className="h-4 w-28 bg-muted rounded"></div>
                    <div className="h-3 w-36 bg-muted rounded mt-1"></div>
                  </div>
                </div>
               </td>
              <td className="px-4 py-3">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-3 w-20 bg-muted rounded mt-1"></div>
               </td>
              <td className="px-4 py-3">
                <div className="h-4 w-32 bg-muted rounded"></div>
                <div className="h-3 w-24 bg-muted rounded mt-1"></div>
               </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 bg-muted rounded-full"></div>
               </td>
              <td className="px-4 py-3">
                <div className="h-5 w-28 bg-muted rounded-full"></div>
               </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <div className="w-8 h-8 bg-muted rounded"></div>
                </div>
               </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Stats Skeleton
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="rounded-xl border border-border bg-card p-4 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded"></div>
        <div className="h-8 w-12 bg-muted rounded mt-2"></div>
        <div className="h-3 w-20 bg-muted rounded mt-2"></div>
      </div>
    ))}
  </div>
);

const AppointmentsPage = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("awaiting_verification");
  const [accessMethodFilter, setAccessMethodFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectingAppointment, setRejectingAppointment] = useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchAppointments = useCallback(async (page = 1) => {
    setLoading(true);
    
    try {
      const query: any = { page, per_page: perPage };
      if (statusFilter !== "all") {
        query.status = statusFilter;
      }
      if (accessMethodFilter !== "all") {
        query.access_method = accessMethodFilter;
      }
      if (searchTerm) {
        query.search = searchTerm;
      }
      if (dateFrom) {
        query.from = dateFrom;
      }
      if (dateTo) {
        query.to = dateTo;
      }
      
      const response = await api.admin.appointments.list(query);
      const result = response as unknown as { data: Appointment[]; meta: PaginatedMeta };
      setAppointments(result.data);
      setCurrentPage(result.meta.current_page);
      setLastPage(result.meta.last_page);
      setTotal(result.meta.total);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, accessMethodFilter, perPage, searchTerm, dateFrom, dateTo, toast]);

  useEffect(() => {
    fetchAppointments(1);
  }, [fetchAppointments]);

  const updateAppointmentStatus = useCallback((appointmentId: string, newStatus: AppointmentStatus, rejectionReason?: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.uuid === appointmentId) {
        const updates: Partial<Appointment> = { 
          status: newStatus,
          updated_at: new Date().toISOString()
        };
        if (newStatus === "verified") {
          updates.verified_at = new Date().toISOString();
          updates.verified_by = { id: "admin", name: "Admin" };
        }
        if (rejectionReason) {
          updates.rejection_reason = rejectionReason;
        }
        return { ...a, ...updates };
      }
      return a;
    }));
  }, []);

  const verifyAppointment = async (appointment: Appointment) => {
    const appointmentId = appointment.uuid;
    setProcessingIds(prev => new Set(prev).add(appointmentId));
    
    // Optimistic update
    updateAppointmentStatus(appointmentId, "verified");
    
    try {
      await api.admin.appointments.verify(appointmentId);
      toast({
        title: "Appointment Verified",
        description: `${appointment.patient?.name}'s appointment has been verified. The appointment is now ready for the doctor to complete.`,
      });
    } catch (error) {
      // Rollback on error
      updateAppointmentStatus(appointmentId, "awaiting_verification");
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Could not verify appointment.",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const rejectAppointment = async () => {
    if (!rejectingAppointment) return;
    const appointmentId = rejectingAppointment.uuid;
    setRejecting(true);
    setProcessingIds(prev => new Set(prev).add(appointmentId));
    
    // Optimistic update
    updateAppointmentStatus(appointmentId, "rejected", rejectionReason);
    
    try {
      await api.admin.appointments.reject(appointmentId, {
        reason: rejectionReason.trim() || undefined,
      });
      toast({
        title: "Appointment Rejected",
        description: `Appointment for ${rejectingAppointment.patient?.name} has been rejected.`,
      });
      setRejectingAppointment(null);
      setRejectionReason("");
    } catch (error) {
      // Rollback on error
      updateAppointmentStatus(appointmentId, "awaiting_verification");
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Could not reject appointment.",
        variant: "destructive",
      });
    } finally {
      setRejectingAppointment(null);
      setRejectionReason("");
      setRejecting(false);
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateObj = parseISO(date);
      return `${format(dateObj, "MMM dd, yyyy")} • ${time}`;
    } catch {
      return `${date} • ${time}`;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      fetchAppointments(page);
    }
  };

  const resetFilters = () => {
    setStatusFilter("awaiting_verification");
    setAccessMethodFilter("all");
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  const statusOptions: { value: AppointmentStatus | "all"; label: string; color: string }[] = [
    { value: "awaiting_verification", label: "Awaiting Verification", color: "bg-yellow-600" },
    { value: "verified", label: "Verified", color: "bg-green-600" },
    { value: "completed", label: "Completed", color: "bg-blue-600" },
    { value: "rejected", label: "Rejected", color: "bg-red-600" },
    { value: "pending", label: "Pending", color: "bg-gray-600" },
    { value: "all", label: "All", color: "bg-gray-600" },
  ];

  const accessMethodOptions = [
    { value: "all", label: "All Methods" },
    { value: "hmo", label: "HMO" },
    { value: "organization", label: "Organization" },
    { value: "subscription", label: "Subscription" },
    { value: "card", label: "Card" },
  ];

  const isProcessing = (appointmentId: string) => processingIds.has(appointmentId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage HMO and organization appointment verifications
          </p>
        </div>

        {/* Stats Cards - Only Verified, Completed, Rejected, Total */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setStatusFilter("verified")}
            >
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Verified
              </div>
              <div className="text-2xl font-bold mt-1">-</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for doctor</p>
            </div>
            
            <div 
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setStatusFilter("completed")}
            >
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                Completed
              </div>
              <div className="text-2xl font-bold mt-1">-</div>
              <p className="text-xs text-muted-foreground mt-1">Done by doctor</p>
            </div>
            
            <div 
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setStatusFilter("rejected")}
            >
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <XCircleIcon className="h-4 w-4 text-red-500" />
                Rejected
              </div>
              <div className="text-2xl font-bold mt-1">-</div>
              <p className="text-xs text-muted-foreground mt-1">Authorization denied</p>
            </div>
            
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                Total
              </div>
              <div className="text-2xl font-bold mt-1">{total}</div>
              <p className="text-xs text-muted-foreground mt-1">All appointments</p>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(dateFrom || dateTo || accessMethodFilter !== "all") && (
                <Badge variant="secondary" className="ml-1">Active</Badge>
              )}
            </Button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by patient name, email, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex flex-wrap gap-1">
                  {statusOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={statusFilter === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(option.value)}
                      className={cn(
                        "h-7 px-2 text-xs",
                        statusFilter === option.value && option.value !== "all" && option.color
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Access:</span>
                <div className="flex flex-wrap gap-1">
                  {accessMethodOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={accessMethodFilter === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAccessMethodFilter(option.value)}
                      className="h-7 px-2 text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Date Range:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-7 px-2 text-sm rounded border border-border bg-background"
                  placeholder="From"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-7 px-2 text-sm rounded border border-border bg-background"
                  placeholder="To"
                />
              </div>
              
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7">
                Reset
              </Button>
            </div>
          )}
        </div>

        {/* Table with Skeleton */}
        {loading ? (
          <TableSkeleton />
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No appointments found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm || dateFrom || dateTo || accessMethodFilter !== "all" || statusFilter !== "all" 
                ? "Try adjusting your filters." 
                : "No appointments match the selected criteria."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Patient</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Service / Doctor</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Date & Time</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Access</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {appointments.map((appointment) => {
                    const isAwaitingVerification = appointment.status === "awaiting_verification";
                    const statusConfig = getStatusConfig(appointment.status);
                    const StatusIcon = statusConfig.icon;
                    const accessConfig = getAccessMethodConfig(appointment.access_method);
                    const AccessIcon = accessConfig.icon;
                    
                    return (
                      <tr key={appointment.uuid} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {appointment.patient?.name?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{appointment.patient?.name || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">{appointment.patient?.email}</div>
                              {appointment.patient?.phone && (
                                <div className="text-xs text-muted-foreground">{appointment.patient.phone}</div>
                              )}
                            </div>
                          </div>
                         </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">{appointment.service?.name || "General Consultation"}</div>
                          {appointment.doctor?.name && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Stethoscope className="h-3 w-3" />
                              Dr. {appointment.doctor.name}
                            </div>
                          )}
                         </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{formatDateTime(appointment.slot_date, appointment.slot_start_time)}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {formatRelativeTime(appointment.created_at)}
                          </div>
                         </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("gap-1", accessConfig.color)}>
                            <AccessIcon className="h-3 w-3" />
                            {accessConfig.label}
                          </Badge>
                          {appointment.organization?.name && (
                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                              {appointment.organization.name}
                            </div>
                          )}
                          {appointment.hmo_provider && (
                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                              {appointment.hmo_provider}
                            </div>
                          )}
                         </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("gap-1", statusConfig.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                          {appointment.status === "verified" && appointment.verified_at && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Verified {formatRelativeTime(appointment.verified_at)}
                            </div>
                          )}
                          {appointment.status === "completed" && appointment.completed_at && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Completed {formatRelativeTime(appointment.completed_at)}
                            </div>
                          )}
                         </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const response = await api.admin.appointments.detail(appointment.uuid);
                                  setSelectedAppointment(response.data as Appointment);
                                  setDetailsOpen(true);
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to load appointment details.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isAwaitingVerification && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => verifyAppointment(appointment)}
                                  disabled={isProcessing(appointment.uuid)}
                                  title="Verify HMO/Organization Authorization"
                                >
                                  {isProcessing(appointment.uuid) ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <ShieldCheck className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setRejectingAppointment(appointment)}
                                  disabled={isProcessing(appointment.uuid)}
                                  title="Reject Authorization"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {appointment.status === "verified" && (
                              <div className="text-xs text-muted-foreground px-2">
                                Waiting for doctor
                              </div>
                            )}
                            {appointment.status === "completed" && (
                              <div className="text-xs text-green-600 px-2">
                                Done
                              </div>
                            )}
                          </div>
                         </td>
                       </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && lastPage > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, lastPage))].map((_, i) => {
                  let pageNum: number;
                  if (lastPage <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= lastPage - 2) {
                    pageNum = lastPage - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-9"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="perPage" className="text-sm whitespace-nowrap">Per page:</Label>
              <select
                id="perPage"
                className="h-8 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {selectedAppointment.patient?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedAppointment.patient?.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {getStatusBadge(selectedAppointment.status)}
                        <Badge variant="outline" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          {getAccessMethodLabel(selectedAppointment.access_method)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="rounded-lg bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2",
                        selectedAppointment.status === "awaiting_verification" || selectedAppointment.status === "verified" || selectedAppointment.status === "completed"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-400"
                      )}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-medium">Awaiting<br />Verification</p>
                    </div>
                    <div className="flex-1 text-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2",
                        selectedAppointment.status === "verified" || selectedAppointment.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      )}>
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-medium">Verified</p>
                      {selectedAppointment.verified_at && (
                        <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(selectedAppointment.verified_at)}</p>
                      )}
                    </div>
                    <div className="flex-1 text-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2",
                        selectedAppointment.status === "completed"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-400"
                      )}>
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-medium">Completed</p>
                      {selectedAppointment.completed_at && (
                        <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(selectedAppointment.completed_at)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Service" value={selectedAppointment.service?.name || "General Consultation"} />
                  <DetailItem 
                    label="Appointment Type" 
                    value={selectedAppointment.appointment_type === "online" ? "Online" : "Physical"} 
                  />
                  <DetailItem 
                    label="Date & Time" 
                    value={formatDateTime(selectedAppointment.slot_date, selectedAppointment.slot_start_time)}
                    subValue={selectedAppointment.slot_end_time ? `Until ${selectedAppointment.slot_end_time}` : undefined}
                  />
                  <DetailItem label="Email" value={selectedAppointment.patient?.email || "No email"} />
                  {selectedAppointment.patient?.phone && (
                    <DetailItem label="Phone" value={selectedAppointment.patient.phone} />
                  )}
                  {selectedAppointment.doctor?.name && (
                    <DetailItem 
                      label="Doctor" 
                      value={`Dr. ${selectedAppointment.doctor.name}`}
                      subValue={selectedAppointment.doctor.specialty}
                    />
                  )}
                  {selectedAppointment.organization?.name && (
                    <DetailItem label="Organization" value={selectedAppointment.organization.name} />
                  )}
                  {selectedAppointment.hmo_provider && (
                    <DetailItem 
                      label="HMO Provider" 
                      value={selectedAppointment.hmo_provider}
                      subValue={selectedAppointment.hmo_policy_number ? `Policy: ${selectedAppointment.hmo_policy_number}` : undefined}
                    />
                  )}
                  {selectedAppointment.location && (
                    <DetailItem 
                      label="Location" 
                      value={selectedAppointment.location.name}
                      subValue={selectedAppointment.location.address}
                    />
                  )}
                  <DetailItem 
                    label="Requested On" 
                    value={formatDate(selectedAppointment.created_at)}
                    subValue={formatRelativeTime(selectedAppointment.created_at)}
                  />
                </div>
                
                {selectedAppointment.notes && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Additional Notes</Label>
                    <div className="text-sm bg-muted/30 p-3 rounded-lg">{selectedAppointment.notes}</div>
                  </div>
                )}
                
                {selectedAppointment.rejection_reason && (
                  <div className="space-y-2">
                    <Label className="text-red-600">Rejection Reason</Label>
                    <div className="text-sm bg-red-50 p-3 rounded-lg text-red-700">{selectedAppointment.rejection_reason}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
            {selectedAppointment && selectedAppointment.status === "awaiting_verification" && (
              <>
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    verifyAppointment(selectedAppointment);
                    setDetailsOpen(false);
                  }}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Verify Authorization
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setDetailsOpen(false);
                    setRejectingAppointment(selectedAppointment);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Authorization
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <DeleteConfirmDialog
        open={Boolean(rejectingAppointment)}
        title="Reject Appointment Authorization?"
        description={`Are you sure you want to reject the HMO/organization authorization for ${rejectingAppointment?.patient?.name}?`}
        loading={rejecting}
        onOpenChange={(open) => !open && setRejectingAppointment(null)}
        onConfirm={rejectAppointment}
      >
        <div className="mt-4 pt-4 border-t border-border">
          <Label htmlFor="reason" className="text-sm font-medium">Reason (Optional)</Label>
          <textarea
            id="reason"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
            placeholder="Provide a reason for rejecting the authorization..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      </DeleteConfirmDialog>
    </DashboardLayout>
  );
};

// Helper Components
const DetailItem = ({ label, value, subValue }: { label: string; value: string; subValue?: string }) => (
  <div className="space-y-1">
    <Label className="text-muted-foreground text-xs uppercase tracking-wider">{label}</Label>
    <p className="font-medium">{value}</p>
    {subValue && <p className="text-sm text-muted-foreground">{subValue}</p>}
  </div>
);

const getStatusBadge = (status: AppointmentStatus) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <Badge className={cn("gap-1", config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const getAccessMethodLabel = (method?: string) => {
  const config = getAccessMethodConfig(method);
  return config.label;
};

const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

export default AppointmentsPage;