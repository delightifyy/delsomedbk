import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  CalendarDays,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SubscriptionPackage = {
  id: string;
  name: string;
  type: "individual" | "family" | "corporate" | "custom";
  price: number;
  currency: string;
  billingPeriod: "monthly" | "quarterly" | "yearly";
  consultationsIncluded: number;
  features: string[];
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Initial packages
const INITIAL_PACKAGES: SubscriptionPackage[] = [
  {
    id: "1",
    name: "Individual Package",
    type: "individual",
    price: 50000,
    currency: "NGN",
    billingPeriod: "yearly",
    consultationsIncluded: 8,
    features: [
      "8 Consultations per year",
      "Access to healthcare support",
      "Personal healthcare management",
      "Online appointment booking",
    ],
    description: "Personal healthcare designed for everyday wellness.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Family Package",
    type: "family",
    price: 100000,
    currency: "NGN",
    billingPeriod: "yearly",
    consultationsIncluded: 20,
    features: [
      "20 Consultations per year",
      "Family healthcare management",
      "Multiple member access",
      "Online appointment booking",
      "Priority healthcare support",
    ],
    description: "Comprehensive coverage for the whole family.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SubscriptionPackagesManager = () => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>(INITIAL_PACKAGES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<SubscriptionPackage | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "individual" as "individual" | "family" | "corporate" | "custom",
    price: 50000,
    currency: "NGN",
    billingPeriod: "yearly" as "monthly" | "quarterly" | "yearly",
    consultationsIncluded: 8,
    description: "",
    features: [""],
    isActive: true,
  });

  const loadPackages = () => {
    const saved = localStorage.getItem("subscription_packages");
    if (saved) {
      setPackages(JSON.parse(saved));
    } else {
      setPackages(INITIAL_PACKAGES);
      localStorage.setItem("subscription_packages", JSON.stringify(INITIAL_PACKAGES));
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const savePackages = (newPackages: SubscriptionPackage[]) => {
    localStorage.setItem("subscription_packages", JSON.stringify(newPackages));
    setPackages(newPackages);
  };

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: packages.length,
    active: packages.filter((p) => p.isActive).length,
    totalRevenue: packages.reduce((sum, p) => sum + p.price, 0),
    avgPrice: packages.length ? packages.reduce((sum, p) => sum + p.price, 0) / packages.length : 0,
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "individual",
      price: 50000,
      currency: "NGN",
      billingPeriod: "yearly",
      consultationsIncluded: 8,
      description: "",
      features: [""],
      isActive: true,
    });
    setEditingPackage(null);
  };

  const handleEdit = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      type: pkg.type,
      price: pkg.price,
      currency: pkg.currency,
      billingPeriod: pkg.billingPeriod,
      consultationsIncluded: pkg.consultationsIncluded,
      description: pkg.description,
      features: pkg.features.length ? pkg.features : [""],
      isActive: pkg.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!packageToDelete) return;
    setLoading(true);
    setTimeout(() => {
      const newPackages = packages.filter((p) => p.id !== packageToDelete.id);
      savePackages(newPackages);
      toast.success(`${packageToDelete.name} has been deleted`);
      setIsDeleteModalOpen(false);
      setPackageToDelete(null);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newPackage: SubscriptionPackage = {
        id: editingPackage?.id || Date.now().toString(),
        name: formData.name,
        type: formData.type,
        price: formData.price,
        currency: formData.currency,
        billingPeriod: formData.billingPeriod,
        consultationsIncluded: formData.consultationsIncluded,
        features: formData.features.filter((f) => f.trim()),
        description: formData.description,
        isActive: formData.isActive,
        createdAt: editingPackage?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let newPackages;
      if (editingPackage) {
        newPackages = packages.map((p) => (p.id === editingPackage.id ? newPackage : p));
        toast.success(`${formData.name} has been updated`);
      } else {
        newPackages = [newPackage, ...packages];
        toast.success(`${formData.name} has been created`);
      }

      savePackages(newPackages);
      setIsModalOpen(false);
      resetForm();
      setLoading(false);
    }, 500);
  };

  const togglePackageStatus = (pkg: SubscriptionPackage) => {
    const updated = { ...pkg, isActive: !pkg.isActive, updatedAt: new Date().toISOString() };
    const newPackages = packages.map((p) => (p.id === pkg.id ? updated : p));
    savePackages(newPackages);
    toast.success(`${pkg.name} is now ${updated.isActive ? "active" : "inactive"}`);
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const getBillingText = (period: string) => {
    switch (period) {
      case "monthly":
        return "month";
      case "quarterly":
        return "3 months";
      case "yearly":
        return "year";
      default:
        return period;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Subscription Packages</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage healthcare subscription plans that users can purchase
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Package
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Packages</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Packages</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Package Price</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.avgPrice)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Packages Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Billing Period</TableHead>
                  <TableHead>Consultations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {pkg.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{pkg.type}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(pkg.price)}</TableCell>
                    <TableCell className="capitalize">{pkg.billingPeriod}</TableCell>
                    <TableCell>{pkg.consultationsIncluded} / year</TableCell>
                    <TableCell>
                      <button
                        onClick={() => togglePackageStatus(pkg)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition",
                          pkg.isActive
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                      >
                        {pkg.isActive ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {pkg.isActive ? "Active" : "Inactive"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(pkg)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setPackageToDelete(pkg);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredPackages.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No packages found</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first package
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Package Modal */}
        <Dialog open={isModalOpen} onOpenChange={(v) => !v && (resetForm(), setIsModalOpen(v))}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">
                {editingPackage ? "Edit Package" : "Create New Package"}
              </DialogTitle>
              <DialogDescription>
                Configure the subscription package details including pricing, features, and billing period
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Package Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Corporate Package"
                  />
                </div>
                <div>
                  <Label>Package Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the package"
                  rows={2}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Price (NGN)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Billing Period</Label>
                  <Select
                    value={formData.billingPeriod}
                    onValueChange={(v: any) => setFormData({ ...formData, billingPeriod: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Consultations Included (per year)</Label>
                <Input
                  type="number"
                  value={formData.consultationsIncluded}
                  onChange={(e) =>
                    setFormData({ ...formData, consultationsIncluded: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              {/* Features */}
              <div>
                <Label>Features</Label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...formData.features];
                        newFeatures[index] = e.target.value;
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      placeholder="e.g., 24/7 Support"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newFeatures = formData.features.filter((_, i) => i !== index);
                        setFormData({ ...formData, features: newFeatures.length ? newFeatures : [""] });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setFormData({ ...formData, features: [...formData.features, ""] })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Feature
                </Button>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <Label>Active Status</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              {/* Preview Section */}
              <div className="rounded-xl bg-muted/30 border border-border p-4">
                <p className="text-sm font-semibold mb-3">Preview</p>
                <div className="rounded-lg bg-white p-4 border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-display font-bold text-lg">{formData.name || "Package Name"}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formData.billingPeriod.toUpperCase()} BILLING
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-2xl font-bold">
                        {formatPrice(formData.price)}
                      </span>
                      <span className="text-xs text-muted-foreground"> / {getBillingText(formData.billingPeriod)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{formData.description || "Description"}</p>
                  <ul className="space-y-1.5">
                    {formData.features.map((f, i) =>
                      f.trim() ? (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          {f}
                        </li>
                      ) : null
                    )}
                    {formData.consultationsIncluded > 0 && (
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formData.consultationsIncluded} consultations per year
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editingPackage ? "Update Package" : "Create Package"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Package</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{packageToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPackagesManager;