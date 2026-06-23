import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { doctorNav } from "./nav";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, Wallet, TrendingUp, Calendar, Download, 
  Eye, CheckCircle, Clock, AlertCircle, ArrowUpRight,
  FileText, CreditCard, PiggyBank, User, Users, Send,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Filter, RefreshCw, Scale, AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data for doctor's earnings
const mockDoctorData = {
  id: "DOC001",
  name: "Dr. Chinedu Okafor",
  specialty: "Consultant Cardiologist",
  totalEarnings: 42500,
  platformCommission: 6375,
  netEarnings: 36125,
  referralCommission: 850,
  totalReferrals: 2,
  pendingAmount: 12500,
  availableBalance: 23625,
  nextPayout: "2026-07-01",
};

// Mock payout history
const mockPayoutHistory = [
  { id: "PAY001", date: "2026-06-18", amount: 36125, method: "Bank Transfer", reference: "DES-2026-06-18-001" },
  { id: "PAY002", date: "2026-05-15", amount: 32895, method: "Bank Transfer", reference: "DES-2026-05-15-002" },
  { id: "PAY003", date: "2026-04-20", amount: 39015, method: "Bank Transfer", reference: "DES-2026-04-20-003" },
  { id: "PAY004", date: "2026-03-10", amount: 26520, method: "Bank Transfer", reference: "DES-2026-03-10-004" },
];

// Generate more mock transactions for pagination demo
const generateMockTransactions = () => {
  const types = ["Consultation", "Referral Commission", "Lab Test", "Prescription"];
  const patients = ["Adaobi Okeke", "Tunde Bakare", "Ngozi Eze", "Yusuf Lawal", "Blessing Okafor", "Samuel Idris", "Grace Okafor", "Michael Eze", "Sarah Idris", "David Okafor"];
  
  const transactions = [];
  for (let i = 1; i <= 45; i++) {
    const date = new Date(2026, 5, Math.floor(Math.random() * 30) + 1);
    transactions.push({
      id: `TXN${String(i).padStart(3, '0')}`,
      type: types[Math.floor(Math.random() * types.length)],
      patient: patients[Math.floor(Math.random() * patients.length)],
      amount: Math.floor(Math.random() * 500) + 50,
      date: date.toISOString().split('T')[0],
    });
  }
  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const mockTransactions = generateMockTransactions();

// Mock referral history
const mockReferrals = [
  { id: "REF001", doctor: "Dr. Adebayo Ogunlade", patient: "Grace Okafor", date: "2026-06-15", commission: 85 },
  { id: "REF002", doctor: "Dr. Funke Adeyemi", patient: "Michael Eze", date: "2026-06-10", commission: 120 },
  { id: "REF003", doctor: "Dr. Bola Tinubu", patient: "Sarah Idris", date: "2026-06-05", commission: 95 },
  { id: "REF004", doctor: "Dr. Kunle Olawale", patient: "David Okafor", date: "2026-05-28", commission: 75 },
];

const DoctorPayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTransaction, setSelectedTransaction] = useState<typeof mockTransactions[0] | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showReconciliationDialog, setShowReconciliationDialog] = useState(false);
  const [reconciliationReason, setReconciliationReason] = useState("");
  const [reconciliationAmount, setReconciliationAmount] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states for transactions
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [transactionDateFilter, setTransactionDateFilter] = useState("all");

  // Filter states for referrals
  const [referralFilter, setReferralFilter] = useState("all");
  const [referralDateFilter, setReferralDateFilter] = useState("all");

  // Filter states for payout history
  const [payoutDateFilter, setPayoutDateFilter] = useState("all");

  // Filter transactions by date range
  const filterByDate = (items: any[], dateFilter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(dateFilter) {
      case "today": {
        return items.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= today;
        });
      }
      case "week": {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return items.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= weekAgo;
        });
      }
      case "month": {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return items.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= monthAgo;
        });
      }
      case "quarter": {
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(today.getMonth() - 3);
        return items.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= quarterAgo;
        });
      }
      case "year": {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        return items.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= yearAgo;
        });
      }
      default:
        return items;
    }
  };

  // Get current transactions for pagination with filters
  const getFilteredTransactions = () => {
    let filtered = mockTransactions;
    
    // Filter by status
    if (transactionFilter !== "all") {
      filtered = filtered.filter(tx => tx.status?.toLowerCase() === transactionFilter.toLowerCase());
    }
    
    // Filter by date
    filtered = filterByDate(filtered, transactionDateFilter);
    
    return filtered;
  };

  // Get filtered referrals
  const getFilteredReferrals = () => {
    let filtered = mockReferrals;
    
    // Filter by status
    if (referralFilter !== "all") {
      filtered = filtered.filter(ref => ref.status?.toLowerCase() === referralFilter.toLowerCase());
    }
    
    // Filter by date
    filtered = filterByDate(filtered, referralDateFilter);
    
    return filtered;
  };

  // Get filtered payout history
  const getFilteredPayoutHistory = () => {
    let filtered = mockPayoutHistory;
    
    // Filter by date
    filtered = filterByDate(filtered, payoutDateFilter);
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const filteredReferrals = getFilteredReferrals();
  const filteredPayoutHistory = getFilteredPayoutHistory();
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Date filter options
  const dateFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
  ];

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader 
        title="Payment History" 
        description="Track your earnings, commissions, and payout history"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                <p className="text-2xl font-bold mt-1">₦{mockDoctorData.totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Amount</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">₦{mockDoctorData.pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Referral Commission</p>
                <p className="text-2xl font-bold mt-1">₦{mockDoctorData.referralCommission.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{mockDoctorData.totalReferrals} referrals</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Earning History
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Referrals
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Payment History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Earnings Summary */}
            <Card className="lg:col-span-2 border-border/60">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">Earnings Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-border/60">
                    <span className="text-sm text-muted-foreground">Gross Earnings</span>
                    <span className="font-medium">₦{mockDoctorData.totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/60">
                    <span className="text-sm text-muted-foreground">Platform Commission (15%)</span>
                    <span className="font-medium text-red-500">-₦{mockDoctorData.platformCommission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/60">
                    <span className="text-sm text-muted-foreground">Referral Commission</span>
                    <span className="font-medium text-green-500">+₦{mockDoctorData.referralCommission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-semibold">Net Earnings</span>
                    <span className="text-lg font-bold text-primary">₦{mockDoctorData.netEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reconciliation */}
            <Card className="border-border/60">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  Reconciliation
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-400 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>Request a review if you believe your payment is incorrect, incomplete, or the amount seems outrageous.</span>
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => setShowReconciliationDialog(true)}
                  >
                    <Scale className="h-4 w-4 mr-2" />
                    Request Reconciliation
                  </Button>
                  
                  <Button variant="outline" className="w-full" onClick={() => toast({ title: "Report generated", description: "Earnings report downloaded." })}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Statement
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Next Payout Date</p>
                  <p className="text-sm font-medium">{mockDoctorData.nextPayout}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {mockTransactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {tx.type === "Referral Commission" ? (
                          <Users className="h-4 w-4 text-purple-500" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">{tx.patient}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">₦{tx.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab with Pagination and Filters */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length > 0 ? startIndex + 1 : 0}-{endIndex} of {filteredTransactions.length} transactions
              </p>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="10 per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <Select 
                value={transactionFilter} 
                onValueChange={(value) => {
                  setTransactionFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select 
                value={transactionDateFilter} 
                onValueChange={(value) => {
                  setTransactionDateFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  {dateFilterOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => toast({ title: "Report generated", description: "Transaction report downloaded." })}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold">Patient</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.length > 0 ? (
                    currentTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-muted/20">
                        <TableCell className="text-sm">{tx.type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{tx.patient}</TableCell>
                        <TableCell className="text-sm text-right font-medium">₦{tx.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination Controls */}
          {filteredTransactions.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0 text-xs"
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
                  className="h-8 w-8 p-0"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total: {filteredTransactions.length} transactions</span>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Referrals Tab with Filters */}
        <TabsContent value="referrals" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Your referral commissions</p>
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <Select 
                value={referralFilter} 
                onValueChange={(value) => {
                  setReferralFilter(value);
                }}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select 
                value={referralDateFilter} 
                onValueChange={(value) => {
                  setReferralDateFilter(value);
                }}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  {dateFilterOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => toast({ title: "Report generated", description: "Referral report downloaded." })}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Referred Doctor</TableHead>
                    <TableHead className="text-xs font-semibold">Patient</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.length > 0 ? (
                    filteredReferrals.map((ref) => (
                      <TableRow key={ref.id} className="hover:bg-muted/20">
                        <TableCell className="text-sm font-medium">{ref.doctor}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{ref.patient}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{ref.date}</TableCell>
                        <TableCell className="text-sm text-right font-medium text-green-600">₦{ref.commission.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No referrals found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {filteredReferrals.length} referrals</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Total Commission:</span>
              <span className="font-bold text-primary">₦{filteredReferrals.reduce((sum, r) => sum + r.commission, 0).toLocaleString()}</span>
            </div>
          </div>
        </TabsContent>

        {/* Payout History Tab with Filters */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Your payout history</p>
            <div className="flex flex-wrap items-center gap-2">
              {/* Date Filter */}
              <Select 
                value={payoutDateFilter} 
                onValueChange={(value) => {
                  setPayoutDateFilter(value);
                }}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  {dateFilterOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => toast({ title: "Statement generated", description: "Payout statement downloaded." })}>
                <Download className="h-4 w-4 mr-2" /> Download Statement
              </Button>
            </div>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Reference</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayoutHistory.length > 0 ? (
                    filteredPayoutHistory.map((payout) => (
                      <TableRow key={payout.id} className="hover:bg-muted/20">
                        <TableCell className="text-sm font-mono text-xs">{payout.reference}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{payout.date}</TableCell>
                        <TableCell className="text-sm text-right font-bold text-primary">₦{payout.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No payout history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {filteredPayoutHistory.length} payouts</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Total Payouts:</span>
                <span className="font-bold">₦{filteredPayoutHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Dialog */}
      <Dialog open={showTransactionDetail} onOpenChange={setShowTransactionDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-semibold">{selectedTransaction.type}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-semibold">{selectedTransaction.patient}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-semibold text-primary">₦{selectedTransaction.amount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-semibold">{selectedTransaction.date}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTransactionDetail(false)}>Close</Button>
                <Button onClick={() => toast({ title: "Receipt generated", description: "Transaction receipt downloaded." })}>
                  <Download className="h-4 w-4 mr-2" /> Download Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reconciliation Dialog */}
      <Dialog open={showReconciliationDialog} onOpenChange={setShowReconciliationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Request Reconciliation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Use this if you believe your payment is incorrect, incomplete, or if the amount seems outrageous.</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Expected Amount (₦)</Label>
              <Input 
                type="number" 
                value={reconciliationAmount} 
                onChange={(e) => setReconciliationAmount(e.target.value)}
                placeholder="Enter expected amount..."
              />
            </div>

            <div className="space-y-2">
              <Label>Reason for Reconciliation</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="underpaid">I was underpaid</SelectItem>
                  <SelectItem value="overcharged">I was overcharged / outrageous amount</SelectItem>
                  <SelectItem value="missing">Missing payment</SelectItem>
                  <SelectItem value="incorrect">Incorrect calculation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Additional Details</Label>
              <Textarea 
                rows={3} 
                value={reconciliationReason}
                onChange={(e) => setReconciliationReason(e.target.value)}
                placeholder="Please provide details about the discrepancy..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReconciliationDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ 
                title: "Reconciliation Request Submitted", 
                description: "Your request has been sent for review. We'll get back to you within 2-3 business days." 
              });
              setShowReconciliationDialog(false);
            }}>
              <Send className="h-4 w-4 mr-2" /> Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Request Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Request Payout
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">₦{mockDoctorData.availableBalance.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input 
                type="number" 
                value={payoutAmount} 
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="text-lg font-bold"
                placeholder="Enter amount..."
              />
              <p className="text-xs text-muted-foreground">Minimum payout: ₦5,000</p>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select defaultValue="bank">
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="wallet">Wallet Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Payout requests are processed within 2-3 business days.</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ 
                title: "Payout requested", 
                description: `₦${parseInt(payoutAmount).toLocaleString()} payout request submitted for approval.` 
              });
              setShowPayoutDialog(false);
            }}>
              <Send className="h-4 w-4 mr-2" /> Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default DoctorPayout;