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
import { Label } from "@/components/ui/label"; // ADD THIS IMPORT
import { Input } from "@/components/ui/input"; // ADD THIS IMPORT
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // ADD THIS IMPORT
import { 
  DollarSign, Wallet, TrendingUp, Calendar, Download, 
  Eye, CheckCircle, Clock, AlertCircle, ArrowUpRight,
  FileText, CreditCard, PiggyBank, User, Users, Send
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
  { id: "PAY001", date: "2026-06-18", amount: 36125, status: "Completed", method: "Bank Transfer", reference: "DES-2026-06-18-001" },
  { id: "PAY002", date: "2026-05-15", amount: 32895, status: "Completed", method: "Bank Transfer", reference: "DES-2026-05-15-002" },
  { id: "PAY003", date: "2026-04-20", amount: 39015, status: "Completed", method: "Bank Transfer", reference: "DES-2026-04-20-003" },
  { id: "PAY004", date: "2026-03-10", amount: 26520, status: "Completed", method: "Bank Transfer", reference: "DES-2026-03-10-004" },
];

// Mock transaction history
const mockTransactions = [
  { id: "TXN001", type: "Consultation", patient: "Adaobi Okeke", amount: 150, date: "2026-06-17", status: "Completed" },
  { id: "TXN002", type: "Consultation", patient: "Tunde Bakare", amount: 200, date: "2026-06-16", status: "Completed" },
  { id: "TXN003", type: "Referral Commission", patient: "Ngozi Eze", amount: 85, date: "2026-06-15", status: "Pending" },
  { id: "TXN004", type: "Consultation", patient: "Yusuf Lawal", amount: 150, date: "2026-06-14", status: "Completed" },
  { id: "TXN005", type: "Consultation", patient: "Blessing Okafor", amount: 200, date: "2026-06-13", status: "Pending" },
  { id: "TXN006", type: "Referral Commission", patient: "Samuel Idris", amount: 75, date: "2026-06-12", status: "Completed" },
];

// Mock referral history
const mockReferrals = [
  { id: "REF001", doctor: "Dr. Adebayo Ogunlade", patient: "Grace Okafor", date: "2026-06-15", status: "Completed", commission: 85 },
  { id: "REF002", doctor: "Dr. Funke Adeyemi", patient: "Michael Eze", date: "2026-06-10", status: "Pending", commission: 120 },
  { id: "REF003", doctor: "Dr. Bola Tinubu", patient: "Sarah Idris", date: "2026-06-05", status: "Completed", commission: 95 },
  { id: "REF004", doctor: "Dr. Kunle Olawale", patient: "David Okafor", date: "2026-05-28", status: "Completed", commission: 75 },
];

// Mock payout request history
const mockPayoutRequests = [
  { id: "REQ001", date: "2026-06-20", amount: 10000, status: "Pending", method: "Bank Transfer" },
  { id: "REQ002", date: "2026-06-15", amount: 15000, status: "Approved", method: "Bank Transfer" },
  { id: "REQ003", date: "2026-06-05", amount: 5000, status: "Processing", method: "Bank Transfer" },
];

const DoctorPayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTransaction, setSelectedTransaction] = useState<typeof mockTransactions[0] | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>;
      case 'processing':
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader 
        title="Payout & Earnings" 
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
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available Balance</p>
                <p className="text-2xl font-bold mt-1 text-green-600">₦{mockDoctorData.availableBalance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Ready for payout</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-500" />
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
            <FileText className="h-4 w-4" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Referrals
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Payout History
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

            {/* Quick Actions */}
            <Card className="border-border/60">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setPayoutAmount(mockDoctorData.availableBalance.toString());
                      setShowPayoutDialog(true);
                    }}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Request Payout (₦{mockDoctorData.availableBalance.toLocaleString()})
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => toast({ title: "Report generated", description: "Earnings report downloaded." })}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Statement
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("transactions")}>
                    <FileText className="h-4 w-4 mr-2" />
                    View All Transactions
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
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("transactions")}>
                  View All <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
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
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">All your transactions</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Filter applied" })}>
                <FileText className="h-4 w-4 mr-2" /> Filter
              </Button>
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
                    <TableHead className="text-xs font-semibold">Patient/Referral</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/20">
                      <TableCell className="text-sm">{tx.type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tx.patient}</TableCell>
                      <TableCell className="text-sm text-right font-medium">₦{tx.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setShowTransactionDetail(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">Your referral commissions</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Filter applied" })}>
                <FileText className="h-4 w-4 mr-2" /> Filter
              </Button>
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
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReferrals.map((ref) => (
                    <TableRow key={ref.id} className="hover:bg-muted/20">
                      <TableCell className="text-sm font-medium">{ref.doctor}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ref.patient}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ref.date}</TableCell>
                      <TableCell className="text-sm text-right font-medium text-green-600">₦{ref.commission.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(ref.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {mockReferrals.length} referrals</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Total Commission:</span>
              <span className="font-bold text-primary">₦{mockReferrals.reduce((sum, r) => sum + r.commission, 0).toLocaleString()}</span>
            </div>
          </div>
        </TabsContent>

        {/* Payout History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">Your payout history</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Filter applied" })}>
                <FileText className="h-4 w-4 mr-2" /> Filter
              </Button>
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
                    <TableHead className="text-xs font-semibold">Method</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayoutHistory.map((payout) => (
                    <TableRow key={payout.id} className="hover:bg-muted/20">
                      <TableCell className="text-sm font-mono text-xs">{payout.reference}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payout.date}</TableCell>
                      <TableCell className="text-sm text-right font-bold text-primary">₦{payout.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payout.method}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(payout.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {mockPayoutHistory.length} payouts</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Total Payouts:</span>
                <span className="font-bold">₦{mockPayoutHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
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
                <div className="p-3 bg-muted/30 rounded-lg col-span-2">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
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