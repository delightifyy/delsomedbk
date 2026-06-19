import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, Users, Building2, Calendar, Download, Send, Eye, 
  Clock, Filter, Search, X, FileText, CreditCard,
  Wallet, AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data for doctors
const mockDoctors = [
  { id: "DOC001", name: "Dr. Chinedu Okafor", specialty: "Cardiologist", totalEarnings: 42500, platformCommission: 6375, netEarnings: 36125, referrals: 2, referralCommission: 850, payoutStatus: "Paid" },
  { id: "DOC002", name: "Dr. Amina Bello", specialty: "Pediatrician", totalEarnings: 38700, platformCommission: 5805, netEarnings: 32895, referrals: 1, referralCommission: 387, payoutStatus: "Pending" },
  { id: "DOC003", name: "Dr. Tunde Adeyemi", specialty: "Orthopedic Surgeon", totalEarnings: 52300, platformCommission: 7845, netEarnings: 44455, referrals: 3, referralCommission: 1569, payoutStatus: "Processing" },
  { id: "DOC004", name: "Dr. Ngozi Eze", specialty: "Gynecologist", totalEarnings: 45900, platformCommission: 6885, netEarnings: 39015, referrals: 2, referralCommission: 918, payoutStatus: "Paid" },
  { id: "DOC005", name: "Dr. Samuel Idris", specialty: "General Practitioner", totalEarnings: 31200, platformCommission: 4680, netEarnings: 26520, referrals: 0, referralCommission: 0, payoutStatus: "Pending" },
];

// Mock data for 3rd parties
const mockThirdParties = [
  { id: "TP001", name: "Lagos Diagnostic Lab", type: "Laboratory", totalEarnings: 28600, platformCommission: 4290, doctorCommission: 2860, netEarnings: 21450, referrals: 1, referralCommission: 286, payoutStatus: "Paid" },
  { id: "TP002", name: "MediScan Radiology", type: "Imaging Center", totalEarnings: 34100, platformCommission: 5115, doctorCommission: 3410, netEarnings: 25575, referrals: 2, referralCommission: 682, payoutStatus: "Processing" },
  { id: "TP003", name: "City Pharmacy Ltd", type: "Pharmacy", totalEarnings: 19800, platformCommission: 2970, doctorCommission: 1980, netEarnings: 14850, referrals: 0, referralCommission: 0, payoutStatus: "Pending" },
  { id: "TP004", name: "Nigerian Health Services", type: "Home Care", totalEarnings: 22400, platformCommission: 3360, doctorCommission: 2240, netEarnings: 16800, referrals: 1, referralCommission: 224, payoutStatus: "Paid" },
];

// Mock data for organizations/HMOs
const mockOrganizations = [
  { id: "ORG001", name: "Shell Nigeria", type: "Corporate", staffCount: 450, monthlyUsage: 87600, invoiceAmount: 87600, paymentStatus: "Paid", dueDate: "2026-06-30" },
  { id: "ORG002", name: "MTN Nigeria", type: "Corporate", staffCount: 320, monthlyUsage: 62400, invoiceAmount: 62400, paymentStatus: "Pending", dueDate: "2026-07-15" },
  { id: "ORG003", name: "Hygeia HMO", type: "HMO", staffCount: 280, monthlyUsage: 54800, invoiceAmount: 54800, paymentStatus: "Overdue", dueDate: "2026-06-05" },
  { id: "ORG004", name: "Axa Mansard", type: "HMO", staffCount: 210, monthlyUsage: 41200, invoiceAmount: 41200, paymentStatus: "Paid", dueDate: "2026-06-20" },
  { id: "ORG005", name: "Dangote Group", type: "Corporate", staffCount: 380, monthlyUsage: 74300, invoiceAmount: 74300, paymentStatus: "Pending", dueDate: "2026-07-10" },
];

const AdminPaymentDashboard = () => {
  const [activeTab, setActiveTab] = useState("doctors");
  const [selectedDoctor, setSelectedDoctor] = useState<typeof mockDoctors[0] | null>(null);
  const [selectedThirdParty, setSelectedThirdParty] = useState<typeof mockThirdParties[0] | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<typeof mockOrganizations[0] | null>(null);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");

  // Stats calculations
  const totalDoctorEarnings = mockDoctors.reduce((sum, d) => sum + d.totalEarnings, 0);
  const totalThirdPartyEarnings = mockThirdParties.reduce((sum, t) => sum + t.totalEarnings, 0);
  const totalPlatformCommission = mockDoctors.reduce((sum, d) => sum + d.platformCommission, 0) + 
                                  mockThirdParties.reduce((sum, t) => sum + t.platformCommission, 0);
  const totalOrgBilling = mockOrganizations.reduce((sum, o) => sum + o.invoiceAmount, 0);
  const totalPendingPayouts = mockDoctors.filter(d => d.payoutStatus !== "Paid").length + 
                             mockThirdParties.filter(t => t.payoutStatus !== "Paid").length;

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Processing</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Payment Management" 
        description="Manage doctor payouts, 3rd party settlements, and organization billing"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                <p className="text-2xl font-bold mt-1">₦{(totalDoctorEarnings + totalThirdPartyEarnings).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">All time revenue</p>
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
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform Commission</p>
                <p className="text-2xl font-bold mt-1">₦{totalPlatformCommission.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">15% average commission</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Organization Billing</p>
                <p className="text-2xl font-bold mt-1">₦{totalOrgBilling.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Monthly invoices</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Payouts</p>
                <p className="text-2xl font-bold mt-1">{totalPendingPayouts}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Doctor Payouts
          </TabsTrigger>
          <TabsTrigger value="thirdparties" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> 3rd Party Payouts
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Organization/HMO Billing
          </TabsTrigger>
        </TabsList>

        {/* Doctor Payouts Tab */}
        <TabsContent value="doctors" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search doctors..." 
                className="pl-9" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Filter applied", description: "Filtering by status." })}>
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button size="sm" onClick={() => toast({ title: "Processing payouts", description: "Bulk payout processing started." })}>
                <Send className="h-4 w-4 mr-2" /> Process All
              </Button>
            </div>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Doctor</TableHead>
                    <TableHead className="text-xs font-semibold">Specialty</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Total Earnings</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Platform Commission (15%)</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Referral Commission</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Net Payable</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDoctors.map((doctor) => (
                    <TableRow key={doctor.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium text-sm">{doctor.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doctor.specialty}</TableCell>
                      <TableCell className="text-sm text-right font-medium">₦{doctor.totalEarnings.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right text-red-500">-₦{doctor.platformCommission.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right text-green-500">+₦{doctor.referralCommission.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right font-bold text-primary">₦{doctor.netEarnings.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(doctor.payoutStatus)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setPayoutAmount(doctor.netEarnings.toString());
                              setShowPayoutDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {doctor.payoutStatus !== "Paid" && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="h-8 px-2 text-xs"
                              onClick={() => {
                                toast({ title: "Payout initiated", description: `₦${doctor.netEarnings.toLocaleString()} sent to ${doctor.name}.` });
                              }}
                            >
                              <Send className="h-3 w-3 mr-1" /> Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {mockDoctors.length} doctors</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Total Payable:</span>
                <span className="font-bold">₦{mockDoctors.reduce((sum, d) => sum + d.netEarnings, 0).toLocaleString()}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Report generated", description: "Doctor payout report downloaded." })}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* 3rd Party Payouts Tab */}
        <TabsContent value="thirdparties" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search 3rd parties..." 
                className="pl-9" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Filter applied" })}>
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button size="sm" onClick={() => toast({ title: "Processing payouts", description: "Bulk 3rd party payout processing started." })}>
                <Send className="h-4 w-4 mr-2" /> Process All
              </Button>
            </div>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Name</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Total Earnings</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Platform Commission (15%)</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Doctor Commission (10%)</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Referral Commission</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Net Payable</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockThirdParties.map((party) => (
                    <TableRow key={party.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium text-sm">{party.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{party.type}</TableCell>
                      <TableCell className="text-sm text-right font-medium">₦{party.totalEarnings.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right text-red-500">-₦{party.platformCommission.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right text-red-400">-₦{party.doctorCommission.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right text-green-500">+₦{party.referralCommission.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right font-bold text-primary">₦{party.netEarnings.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(party.payoutStatus)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedThirdParty(party);
                              setPayoutAmount(party.netEarnings.toString());
                              setShowPayoutDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {party.payoutStatus !== "Paid" && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="h-8 px-2 text-xs"
                              onClick={() => {
                                toast({ title: "Payout initiated", description: `₦${party.netEarnings.toLocaleString()} sent to ${party.name}.` });
                              }}
                            >
                              <Send className="h-3 w-3 mr-1" /> Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {mockThirdParties.length} 3rd parties</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Total Payable:</span>
                <span className="font-bold">₦{mockThirdParties.reduce((sum, t) => sum + t.netEarnings, 0).toLocaleString()}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Report generated", description: "3rd party payout report downloaded." })}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Organization/HMO Billing Tab */}
        <TabsContent value="organizations" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search organizations..." 
                className="pl-9" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Filter applied" })}>
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button size="sm" variant="default" onClick={() => toast({ title: "Generating invoices", description: "Monthly invoices generated for all organizations." })}>
                <FileText className="h-4 w-4 mr-2" /> Generate Invoices
              </Button>
            </div>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Organization/HMO</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Staff Count</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Monthly Usage</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Invoice Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Payment Status</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Due Date</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrganizations.map((org) => (
                    <TableRow key={org.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium text-sm">{org.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{org.type}</TableCell>
                      <TableCell className="text-sm text-center">{org.staffCount}</TableCell>
                      <TableCell className="text-sm text-right">₦{org.monthlyUsage.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right font-medium">₦{org.invoiceAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(org.paymentStatus)}</TableCell>
                      <TableCell className="text-sm text-center">{org.dueDate}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedOrg(org)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {org.paymentStatus === "Overdue" && (
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8 px-2 text-xs"
                              onClick={() => {
                                toast({ title: "Reminder sent", description: `Payment reminder sent to ${org.name}.` });
                              }}
                            >
                              <AlertCircle className="h-3 w-3 mr-1" /> Remind
                            </Button>
                          )}
                          {org.paymentStatus === "Pending" && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="h-8 px-2 text-xs"
                              onClick={() => {
                                toast({ title: "Invoice sent", description: `Invoice sent to ${org.name}.` });
                              }}
                            >
                              <Send className="h-3 w-3 mr-1" /> Send
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 text-xs"
                            onClick={() => {
                              toast({ title: "Invoice downloaded", description: `Invoice for ${org.name} downloaded.` });
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {mockOrganizations.length} organizations</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Total Invoiced:</span>
                <span className="font-bold">₦{mockOrganizations.reduce((sum, o) => sum + o.invoiceAmount, 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Overdue:</span>
                <span className="font-bold text-red-500">
                  ₦{mockOrganizations.filter(o => o.paymentStatus === "Overdue").reduce((sum, o) => sum + o.invoiceAmount, 0).toLocaleString()}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Report generated", description: "Billing report downloaded." })}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Process Payout
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Recipient</p>
              <p className="font-semibold">{selectedDoctor?.name || selectedThirdParty?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">ID: {selectedDoctor?.id || selectedThirdParty?.id}</p>
            </div>

            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input 
                type="number" 
                value={payoutAmount} 
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="text-lg font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select defaultValue="bank">
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card Payment</SelectItem>
                  <SelectItem value="wallet">Wallet Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Please confirm the payout details before proceeding. This action cannot be undone.</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ 
                title: "Payout processed", 
                description: `₦${parseInt(payoutAmount).toLocaleString()} sent to ${selectedDoctor?.name || selectedThirdParty?.name}.` 
              });
              setShowPayoutDialog(false);
            }}>
              <Send className="h-4 w-4 mr-2" /> Process Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Organization Detail Dialog */}
      <Dialog open={!!selectedOrg} onOpenChange={(open) => !open && setSelectedOrg(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Organization Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrg && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Organization</p>
                  <p className="font-semibold">{selectedOrg.name}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-semibold">{selectedOrg.type}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Staff Count</p>
                  <p className="font-semibold">{selectedOrg.staffCount}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Monthly Usage</p>
                  <p className="font-semibold">₦{selectedOrg.monthlyUsage.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Invoice Amount</p>
                  <p className="font-semibold text-primary">₦{selectedOrg.invoiceAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Payment Status</p>
                  <div>{getStatusBadge(selectedOrg.paymentStatus)}</div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4">
                <h4 className="text-sm font-semibold mb-3">Recent Usage Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Consultations</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lab Tests</span>
                    <span className="font-medium">892</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prescriptions</span>
                    <span className="font-medium">1,564</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border/60 pt-2">
                    <span className="text-muted-foreground">Total Usage Cost</span>
                    <span className="font-bold">₦{selectedOrg.monthlyUsage.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOrg(null)}>Close</Button>
                <Button variant="outline" onClick={() => {
                  toast({ title: "Invoice downloaded", description: `Invoice for ${selectedOrg.name} downloaded.` });
                }}>
                  <Download className="h-4 w-4 mr-2" /> Download Invoice
                </Button>
                <Button onClick={() => {
                  toast({ title: "Invoice sent", description: `Invoice sent to ${selectedOrg.name}.` });
                  setSelectedOrg(null);
                }}>
                  <Send className="h-4 w-4 mr-2" /> Send Invoice
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminPaymentDashboard;