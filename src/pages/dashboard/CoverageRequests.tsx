import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Calendar,
  User,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";
import { useToast } from "@/hooks/use-toast";
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

// ============ DEMO MODE ============
const USE_DEMO_DATA = false;

// Types
type HmoEnrollment = {
  id: string;
  uuid: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  provider_name: string;
  provider_code: string;
  policy_number: string;
  member_name: string;
  member_dob?: string;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  verified_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
};

type OrganizationMembership = {
  id: string;
  uuid: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  company_name: string;
  employee_id: string;
  department?: string;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  verified_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
};

// Demo Data
const DEMO_HMO_REQUESTS: HmoEnrollment[] = [
  {
    id: "1",
    uuid: "hmo-001",
    patient_name: "Samuel Agboola",
    patient_email: "samuel@example.com",
    patient_phone: "+234 803 456 7890",
    provider_name: "HealthPlus HMO",
    provider_code: "HP001",
    policy_number: "POL-HMO-001234",
    member_name: "Samuel Agboola",
    member_dob: "1990-05-15",
    status: "pending",
    submitted_at: "2024-05-10T10:30:00Z",
  },
  {
    id: "2",
    uuid: "hmo-002",
    patient_name: "Adaobi Okonkwo",
    patient_email: "adaobi@example.com",
    patient_phone: "+234 802 345 6789",
    provider_name: "Hygeia HMO",
    provider_code: "HYG002",
    policy_number: "POL-HYG-005678",
    member_name: "Adaobi Okonkwo",
    member_dob: "1988-12-20",
    status: "pending",
    submitted_at: "2024-05-12T14:15:00Z",
  },
  {
    id: "3",
    uuid: "hmo-003",
    patient_name: "Chidi Okafor",
    patient_email: "chidi@example.com",
    patient_phone: "+234 805 678 9012",
    provider_name: "Reliance HMO",
    provider_code: "REL003",
    policy_number: "POL-REL-009876",
    member_name: "Chidi Okafor",
    member_dob: "1985-08-10",
    status: "verified",
    verified_at: "2024-05-08T09:00:00Z",
    submitted_at: "2024-05-01T11:00:00Z",
  },
  {
    id: "4",
    uuid: "hmo-004",
    patient_name: "Funmi Adebayo",
    patient_email: "funmi@example.com",
    patient_phone: "+234 806 789 0123",
    provider_name: "Avon HMO",
    provider_code: "AVN004",
    policy_number: "POL-AVN-003456",
    member_name: "Funmi Adebayo",
    member_dob: "1992-03-25",
    status: "rejected",
    rejected_at: "2024-05-05T16:30:00Z",
    rejection_reason: "Invalid policy number. Please verify and resubmit.",
    submitted_at: "2024-04-28T09:45:00Z",
  },
];

const DEMO_ORG_REQUESTS: OrganizationMembership[] = [
  {
    id: "1",
    uuid: "org-001",
    patient_name: "Samuel Agboola",
    patient_email: "samuel@example.com",
    patient_phone: "+234 803 456 7890",
    company_name: "Sterling Bank Nigeria",
    employee_id: "SBN-EMP-48217",
    department: "Engineering",
    status: "pending",
    submitted_at: "2024-05-11T13:20:00Z",
  },
  {
    id: "2",
    uuid: "org-002",
    patient_name: "Adaobi Okonkwo",
    patient_email: "adaobi@example.com",
    patient_phone: "+234 802 345 6789",
    company_name: "Guaranty Trust Bank",
    employee_id: "GTB-EMP-12345",
    department: "Human Resources",
    status: "pending",
    submitted_at: "2024-05-13T11:00:00Z",
  },
  {
    id: "3",
    uuid: "org-003",
    patient_name: "Chidi Okafor",
    patient_email: "chidi@example.com",
    patient_phone: "+234 805 678 9012",
    company_name: "First Bank Nigeria",
    employee_id: "FBN-EMP-67890",
    department: "Finance",
    status: "verified",
    verified_at: "2024-05-09T14:30:00Z",
    submitted_at: "2024-05-02T10:15:00Z",
  },
  {
    id: "4",
    uuid: "org-004",
    patient_name: "Funmi Adebayo",
    patient_email: "funmi@example.com",
    patient_phone: "+234 806 789 0123",
    company_name: "Access Bank",
    employee_id: "ACC-EMP-54321",
    department: "Operations",
    status: "rejected",
    rejected_at: "2024-05-06T11:00:00Z",
    rejection_reason: "Employee ID not found in company records.",
    submitted_at: "2024-04-29T14:00:00Z",
  },
];

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, icon: AlertCircle },
  verified: { label: "Verified", variant: "default" as const, icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Skeleton Components
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="rounded-xl border border-border bg-card px-4 py-3">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-7 w-12" />
      </div>
    ))}
  </div>
);

const RequestRowSkeleton = () => (
  <div className="p-4 border-b border-border">
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </div>
);

const RequestsListSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <RequestRowSkeleton />
    <RequestRowSkeleton />
    <RequestRowSkeleton />
  </div>
);

const CoverageRequests = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"hmo" | "organization">("hmo");
  const [hmoRequests, setHmoRequests] = useState<HmoEnrollment[]>([]);
  const [orgRequests, setOrgRequests] = useState<OrganizationMembership[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    
    if (USE_DEMO_DATA) {
      setTimeout(() => {
        setHmoRequests(DEMO_HMO_REQUESTS);
        setOrgRequests(DEMO_ORG_REQUESTS);
        setLoading(false);
      }, 800);
      return;
    }
    
    try {
      if (activeTab === "hmo") {
        const params: any = {};
        if (statusFilter !== "all") params.status = statusFilter;
        const response = await api.admin.coverage.hmo.list(params);
        setHmoRequests(collection(response.data));
      } else {
        const params: any = {};
        if (statusFilter !== "all") params.status = statusFilter;
        const response = await api.admin.coverage.organization.list(params);
        setOrgRequests(collection(response.data));
      }
    } catch (error: any) {
      console.error("Failed to load coverage requests:", error);
      toast({
        title: "Error loading requests",
        description: error.message || "Could not load coverage requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter]);

  const handleVerify = async (request: any) => {
    setActionLoading(true);
    
    if (USE_DEMO_DATA) {
      setTimeout(() => {
        if (activeTab === "hmo") {
          setHmoRequests(prev =>
            prev.map(r =>
              r.uuid === request.uuid
                ? { ...r, status: "verified", verified_at: new Date().toISOString() }
                : r
            )
          );
        } else {
          setOrgRequests(prev =>
            prev.map(r =>
              r.uuid === request.uuid
                ? { ...r, status: "verified", verified_at: new Date().toISOString() }
                : r
            )
          );
        }
        toast({
          title: "Request verified",
          description: `Coverage request has been approved.`,
        });
        setShowDetailsDialog(false);
        setActionLoading(false);
      }, 1000);
      return;
    }
    
    try {
      if (activeTab === "hmo") {
        await api.admin.coverage.hmo.verify(request.uuid);
      } else {
        await api.admin.coverage.organization.verify(request.uuid);
      }
      
      toast({
        title: "Request verified",
        description: "The coverage request has been approved.",
      });
      
      loadData();
      setShowDetailsDialog(false);
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Could not verify request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setActionLoading(true);
    
    if (USE_DEMO_DATA) {
      setTimeout(() => {
        if (activeTab === "hmo") {
          setHmoRequests(prev =>
            prev.map(r =>
              r.uuid === selectedRequest.uuid
                ? { ...r, status: "rejected", rejected_at: new Date().toISOString(), rejection_reason: rejectionReason }
                : r
            )
          );
        } else {
          setOrgRequests(prev =>
            prev.map(r =>
              r.uuid === selectedRequest.uuid
                ? { ...r, status: "rejected", rejected_at: new Date().toISOString(), rejection_reason: rejectionReason }
                : r
            )
          );
        }
        toast({
          title: "Request rejected",
          description: `Coverage request has been rejected.`,
        });
        setShowRejectDialog(false);
        setShowDetailsDialog(false);
        setRejectionReason("");
        setSelectedRequest(null);
        setActionLoading(false);
      }, 1000);
      return;
    }
    
    try {
      if (activeTab === "hmo") {
        await api.admin.coverage.hmo.reject(selectedRequest.uuid, { reason: rejectionReason });
      } else {
        await api.admin.coverage.organization.reject(selectedRequest.uuid, { reason: rejectionReason });
      }
      
      toast({
        title: "Request rejected",
        description: "The coverage request has been rejected.",
      });
      
      setShowRejectDialog(false);
      setShowDetailsDialog(false);
      setRejectionReason("");
      setSelectedRequest(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Rejection failed",
        description: error.message || "Could not reject request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openDetails = (request: any) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const openRejectDialog = (request: any) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const getCounts = (items: any[]) => {
    return {
      all: items.length,
      pending: items.filter(i => i.status === "pending").length,
      verified: items.filter(i => i.status === "verified").length,
      rejected: items.filter(i => i.status === "rejected").length,
    };
  };

  const filteredItems = () => {
    const items = activeTab === "hmo" ? hmoRequests : orgRequests;
    if (statusFilter === "all") return items;
    return items.filter(i => i.status === statusFilter);
  };

  const counts = getCounts(activeTab === "hmo" ? hmoRequests : orgRequests);
  const displayItems = filteredItems();

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;
    return (
      <Badge variant={config?.variant || "secondary"} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config?.label || status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Coverage Requests</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage HMO and organization coverage enrollment requests.
            </p>
          </div>
        </div>

        {/* Demo Mode Banner */}
        {USE_DEMO_DATA && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
            <span className="font-medium">📋 Demo Mode:</span> Showing sample coverage request data. 
            Set <code className="bg-amber-100 px-1 rounded">USE_DEMO_DATA = false</code> to use real API.
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="hmo" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              HMO Requests
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organization Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hmo" className="mt-6">
            {/* Stats Cards with Skeleton */}
            {loading ? <StatsSkeleton /> : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {Object.entries(counts).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-border bg-card px-4 py-3">
                    <p className="text-xs capitalize text-muted-foreground">{key}</p>
                    <p className="font-display text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter */}
            <div className="flex justify-end mb-4">
              <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requests List with Skeleton */}
            {loading ? (
              <RequestsListSkeleton />
            ) : displayItems.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="p-10 text-center text-sm text-muted-foreground">No HMO requests found.</div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="divide-y divide-border">
                  {displayItems.map((request) => (
                    <div key={request.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">{request.patient_name}</p>
                            <StatusBadge status={request.status} />
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {request.patient_email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {request.patient_phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" /> {request.provider_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(request.submitted_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetails(request)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleVerify(request)}
                                disabled={actionLoading}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectDialog(request)}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="organization" className="mt-6">
            {/* Stats Cards with Skeleton */}
            {loading ? <StatsSkeleton /> : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {Object.entries(counts).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-border bg-card px-4 py-3">
                    <p className="text-xs capitalize text-muted-foreground">{key}</p>
                    <p className="font-display text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter */}
            <div className="flex justify-end mb-4">
              <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requests List with Skeleton */}
            {loading ? (
              <RequestsListSkeleton />
            ) : displayItems.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="p-10 text-center text-sm text-muted-foreground">No organization requests found.</div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="divide-y divide-border">
                  {displayItems.map((request) => (
                    <div key={request.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">{request.patient_name}</p>
                            <StatusBadge status={request.status} />
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {request.patient_email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {request.patient_phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {request.company_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" /> ID: {request.employee_id}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(request.submitted_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetails(request)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleVerify(request)}
                                disabled={actionLoading}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectDialog(request)}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this coverage request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${
                selectedRequest.status === "pending" ? "bg-amber-50 border border-amber-200" :
                selectedRequest.status === "verified" ? "bg-emerald-50 border border-emerald-200" :
                "bg-red-50 border border-red-200"
              }`}>
                <div className="flex items-center gap-2">
                  {selectedRequest.status === "pending" && <AlertCircle className="h-5 w-5 text-amber-600" />}
                  {selectedRequest.status === "verified" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                  {selectedRequest.status === "rejected" && <XCircle className="h-5 w-5 text-red-600" />}
                  <span className="font-semibold capitalize">{selectedRequest.status} Request</span>
                </div>
                {selectedRequest.rejection_reason && (
                  <p className="text-sm text-red-600 mt-2">Reason: {selectedRequest.rejection_reason}</p>
                )}
              </div>

              {/* Patient Information */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" /> Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground text-xs">Full Name</p>
                    <p className="font-medium">{selectedRequest.patient_name}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium">{selectedRequest.patient_email}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p className="font-medium">{selectedRequest.patient_phone}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground text-xs">Submitted</p>
                    <p className="font-medium">{formatDate(selectedRequest.submitted_at)}</p>
                  </div>
                </div>
              </div>

              {/* Coverage Details - HMO */}
              {activeTab === "hmo" && selectedRequest.provider_name && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> HMO Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-muted-foreground text-xs">Provider</p>
                      <p className="font-medium">{selectedRequest.provider_name}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-muted-foreground text-xs">Provider Code</p>
                      <p className="font-medium">{selectedRequest.provider_code}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-muted-foreground text-xs">Policy Number</p>
                      <p className="font-medium">{selectedRequest.policy_number}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-muted-foreground text-xs">Member Name</p>
                      <p className="font-medium">{selectedRequest.member_name}</p>
                    </div>
                    {selectedRequest.member_dob && (
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground text-xs">Date of Birth</p>
                        <p className="font-medium">{formatDate(selectedRequest.member_dob)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Coverage Details - Organization */}
              {activeTab === "organization" && selectedRequest.company_name && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Organization Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-muted-foreground text-xs">Company</p>
                      <p className="font-medium">{selectedRequest.company_name}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-muted-foreground text-xs">Employee ID</p>
                      <p className="font-medium">{selectedRequest.employee_id}</p>
                    </div>
                    {selectedRequest.department && (
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground text-xs">Department</p>
                        <p className="font-medium">{selectedRequest.department}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground">Submitted</span>
                    <span className="font-medium">{formatDate(selectedRequest.submitted_at)}</span>
                  </div>
                  {selectedRequest.verified_at && (
                    <div className="flex justify-between p-2 rounded-lg bg-emerald-50">
                      <span className="text-muted-foreground">Verified</span>
                      <span className="font-medium text-emerald-600">{formatDate(selectedRequest.verified_at)}</span>
                    </div>
                  )}
                  {selectedRequest.rejected_at && (
                    <div className="flex justify-between p-2 rounded-lg bg-red-50">
                      <span className="text-muted-foreground">Rejected</span>
                      <span className="font-medium text-red-600">{formatDate(selectedRequest.rejected_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleVerify(selectedRequest)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Verify Request"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    openRejectDialog(selectedRequest);
                  }}
                  disabled={actionLoading}
                >
                  Reject Request
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Coverage Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this coverage request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim() || actionLoading}>
              {actionLoading ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CoverageRequests;