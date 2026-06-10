import { useMemo, useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Loader2, 
  Search, 
  Eye, 
  XCircle, 
  RefreshCw,
  CreditCard,
  CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

type Subscriber = {
  id: string;
  dsm_id: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  package: {
    id: string;
    name: string;
    price: number;
    price_kobo: number;
    billing_period: string;
    consultations_included: number;
  };
  status: "active" | "expired" | "cancelled" | "pending";
  subscribed_at: string;
  expires_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  auto_renew: boolean;
  total_consultations_used: number;
  total_consultations_available: number;
  created_at: string;
  updated_at: string;
};

type SubscriptionHistory = {
  id: string;
  action: "created" | "renewed" | "cancelled" | "reactivated";
  description: string;
  created_at: string;
};

const PAGE_SIZE = 10;

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { 
  day: "2-digit", 
  month: "short", 
  year: "numeric" 
});

const fmtDateTime = (d: string) => new Date(d).toLocaleDateString("en-GB", { 
  day: "2-digit", 
  month: "short", 
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const fmtMoney = (n: number) => "₦" + n.toLocaleString();

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>;
    case "expired":
      return <Badge variant="destructive">Expired</Badge>;
    case "cancelled":
      return <Badge variant="secondary">Cancelled</Badge>;
    case "pending":
      return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Skeleton row component
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </TableCell>
    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
    <TableCell className="text-right">
      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </TableCell>
  </TableRow>
);

// Stats card skeleton
const StatsCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card px-4 py-3">
    <Skeleton className="h-3 w-20 mb-2" />
    <Skeleton className="h-8 w-16" />
  </div>
);

const SubscribersPage = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  
  // Detail modal
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Cancel modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [subscriberToCancel, setSubscriberToCancel] = useState<Subscriber | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  
  // Renew modal
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [subscriberToRenew, setSubscriberToRenew] = useState<Subscriber | null>(null);
  const [renewPeriod, setRenewPeriod] = useState<"monthly" | "quarterly" | "yearly">("yearly");
  const [renewing, setRenewing] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const query: any = {
        page,
        per_page: PAGE_SIZE,
      };
      
      if (searchQuery) query.search = searchQuery;
      if (statusFilter !== "all") query.status = statusFilter;
      if (packageFilter !== "all") query.package_id = packageFilter;
      
      const response = await api.admin.patientSubscriptions.list(query);
      
      if (response?.data) {
        setSubscribers(response.data);
        setTotal(response.meta?.total || 0);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load subscribers");
      }
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionHistory = async (dsmId: string) => {
    setLoadingHistory(true);
    try {
      const response = await api.admin.patientSubscriptions.history(dsmId);
      if (response?.data) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load subscription history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewDetails = async (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setIsDetailModalOpen(true);
    await fetchSubscriptionHistory(subscriber.dsm_id);
  };

  const handleCancelSubscription = async () => {
    if (!subscriberToCancel) return;
    
    setCancelling(true);
    try {
      await api.admin.patientSubscriptions.cancel(subscriberToCancel.dsm_id, {
        reason: cancellationReason || undefined,
      });
      
      toast.success(`Subscription ${subscriberToCancel.dsm_id} has been cancelled`);
      setIsCancelModalOpen(false);
      setSubscriberToCancel(null);
      setCancellationReason("");
      fetchSubscribers();
      
      if (selectedSubscriber?.dsm_id === subscriberToCancel.dsm_id) {
        setIsDetailModalOpen(false);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to cancel subscription");
      }
    } finally {
      setCancelling(false);
    }
  };

  const handleRenewSubscription = async () => {
    if (!subscriberToRenew) return;
    
    setRenewing(true);
    try {
      await api.admin.patientSubscriptions.renew(subscriberToRenew.dsm_id, {
        billing_period: renewPeriod,
      });
      
      toast.success(`Subscription ${subscriberToRenew.dsm_id} has been renewed`);
      setIsRenewModalOpen(false);
      setSubscriberToRenew(null);
      fetchSubscribers();
      
      if (selectedSubscriber?.dsm_id === subscriberToRenew.dsm_id) {
        setIsDetailModalOpen(false);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to renew subscription");
      }
    } finally {
      setRenewing(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page, statusFilter, packageFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchSubscribers();
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const stats = useMemo(() => {
    const active = subscribers.filter(s => s.status === "active").length;
    const expired = subscribers.filter(s => s.status === "expired").length;
    const cancelled = subscribers.filter(s => s.status === "cancelled").length;
    return { active, expired, cancelled, total: total };
  }, [subscribers, total]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Subscribers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All DesolMed subscription members with package and renewal details.
          </p>
        </div>

        {/* Stats Cards with Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {loading && subscribers.length === 0 ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-xs text-muted-foreground">Total Subscribers</p>
                <p className="font-display text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Active</p>
                <p className="font-display text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.active}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
                <p className="text-xs text-amber-600 dark:text-amber-400">Expired</p>
                <p className="font-display text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.expired}</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3">
                <p className="text-xs text-red-600 dark:text-red-400">Cancelled</p>
                <p className="font-display text-2xl font-bold text-red-700 dark:text-red-400">{stats.cancelled}</p>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={packageFilter} onValueChange={setPackageFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Package" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Packages</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table with Skeleton Loading */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribe Date</TableHead>
                <TableHead>Expire Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && subscribers.length === 0 ? (
                // Show 5 skeleton rows while loading
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No subscribers found
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {sub.dsm_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-full bg-primary-soft text-primary inline-flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{sub.patient.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{sub.patient.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full px-2 py-1 text-xs font-medium bg-primary-soft text-primary">
                        {sub.package.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">{fmtMoney(sub.package.price)}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>{fmtDate(sub.subscribed_at)}</TableCell>
                    <TableCell>{fmtDate(sub.expires_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(sub)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {sub.status === "active" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSubscriberToRenew(sub);
                                setIsRenewModalOpen(true);
                              }}
                              title="Renew Subscription"
                              className="text-emerald-500 hover:text-emerald-700"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSubscriberToCancel(sub);
                                setIsCancelModalOpen(true);
                              }}
                              title="Cancel Subscription"
                              className="text-red-500 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination with Skeleton */}
          {!loading && subscribers.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} · Showing {subscribers.length} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Subscriber Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this subscriber's subscription.
            </DialogDescription>
          </DialogHeader>

          {selectedSubscriber && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">ID</p>
                  <p className="font-mono font-semibold">{selectedSubscriber.dsm_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div>{getStatusBadge(selectedSubscriber.status)}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Package</p>
                  <p className="font-medium">{selectedSubscriber.package.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-semibold">{fmtMoney(selectedSubscriber.package.price)} / {selectedSubscriber.package.billing_period}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subscribed On</p>
                  <p>{fmtDateTime(selectedSubscriber.subscribed_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expires On</p>
                  <p>{fmtDateTime(selectedSubscriber.expires_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Auto Renew</p>
                  <p>{selectedSubscriber.auto_renew ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Consultations</p>
                  <p>{selectedSubscriber.total_consultations_used} of {selectedSubscriber.total_consultations_available} used</p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="font-semibold mb-3">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p>{selectedSubscriber.patient.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p>{selectedSubscriber.patient.email}</p>
                  </div>
                  {selectedSubscriber.patient.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p>{selectedSubscriber.patient.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Subscription History</h4>
                {loadingHistory ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No history available</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                        <div className="mt-0.5">
                          {item.action === "created" && <CreditCard className="h-4 w-4 text-emerald-500" />}
                          {item.action === "renewed" && <RefreshCw className="h-4 w-4 text-blue-500" />}
                          {item.action === "cancelled" && <XCircle className="h-4 w-4 text-red-500" />}
                          {item.action === "reactivated" && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{item.description}</p>
                          <p className="text-xs text-muted-foreground">{fmtDateTime(item.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel subscription {subscriberToCancel?.dsm_id}? This action can be undone by renewing the subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cancellation Reason (Optional)</Label>
              <Textarea
                placeholder="Enter cancellation reason..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={cancelling}>
              {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Modal */}
      <Dialog open={isRenewModalOpen} onOpenChange={setIsRenewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
            <DialogDescription>
              Renew subscription {subscriberToRenew?.dsm_id} for an additional period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Billing Period</Label>
              <Select value={renewPeriod} onValueChange={(v: any) => setRenewPeriod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {subscriberToRenew && (
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm font-semibold mb-2">Summary</p>
                <div className="flex justify-between text-sm">
                  <span>Package:</span>
                  <span>{subscriberToRenew.package.name}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Amount:</span>
                  <span className="font-bold">{fmtMoney(subscriberToRenew.package.price)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Period:</span>
                  <span className="capitalize">{renewPeriod}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenewSubscription} disabled={renewing}>
              {renewing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {renewing ? "Renewing..." : "Confirm Renewal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SubscribersPage;