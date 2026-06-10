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
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";

type SubscriptionPackage = {
  id: string;
  name: string;
  type: "individual" | "family" | "corporate" | "custom";
  price: number;
  price_kobo?: number;
  currency: string;
  billing_period: "monthly" | "quarterly" | "yearly";
  consultations_included: number;
  features: string[];
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Skeleton row component for table
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <div className="space-y-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </TableCell>
    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
    <TableCell className="text-right">
      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </TableCell>
  </TableRow>
);

// Stats card skeleton
const StatsCardSkeleton = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

const SubscriptionPackagesManager = () => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<SubscriptionPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form state (API format)
  const [formData, setFormData] = useState({
    name: "",
    type: "individual" as "individual" | "family" | "corporate" | "custom",
    price_kobo: 5000000, // 50,000 NGN = 5,000,000 kobo
    billing_period: "yearly" as "monthly" | "quarterly" | "yearly",
    consultations_included: 8,
    description: "",
    features: [""],
    is_active: true,
  });

  // Fetch packages from API
  const fetchPackages = async () => {
    setInitialLoading(true);
    try {
      const response = await api.admin.subscriptionPackages.list({
        search: searchQuery || undefined,
      });
      // Transform API response to component format
      const transformedPackages = response.data.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        type: pkg.type,
        price: pkg.price_kobo / 100, // Convert kobo to NGN
        price_kobo: pkg.price_kobo,
        currency: "NGN",
        billing_period: pkg.billing_period,
        consultations_included: pkg.consultations_included,
        features: pkg.features,
        description: pkg.description,
        is_active: pkg.is_active,
        created_at: pkg.created_at,
        updated_at: pkg.updated_at,
      }));
      setPackages(transformedPackages);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load subscription packages");
      }
      console.error("Error fetching packages:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!initialLoading) {
        fetchPackages();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPackages = packages; // Search is handled by API

  const stats = {
    total: packages.length,
    active: packages.filter((p) => p.is_active).length,
    totalRevenue: packages.reduce((sum, p) => sum + p.price, 0),
    avgPrice: packages.length ? packages.reduce((sum, p) => sum + p.price, 0) / packages.length : 0,
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "individual",
      price_kobo: 5000000,
      billing_period: "yearly",
      consultations_included: 8,
      description: "",
      features: [""],
      is_active: true,
    });
    setEditingPackage(null);
  };

  const handleEdit = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      type: pkg.type,
      price_kobo: pkg.price_kobo || pkg.price * 100,
      billing_period: pkg.billing_period,
      consultations_included: pkg.consultations_included,
      description: pkg.description,
      features: pkg.features.length ? pkg.features : [""],
      is_active: pkg.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;
    setLoading(true);
    try {
      await api.admin.subscriptionPackages.delete(packageToDelete.id);
      toast.success(`${packageToDelete.name} has been deleted`);
      setIsDeleteModalOpen(false);
      setPackageToDelete(null);
      fetchPackages();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete package");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.features.filter(f => f.trim()).length === 0) {
      toast.error("Please add at least one feature");
      return;
    }

    setLoading(true);
    try {
      const packageData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        price_kobo: formData.price_kobo,
        billing_period: formData.billing_period,
        consultations_included: formData.consultations_included,
        features: formData.features.filter((f) => f.trim()),
        is_active: formData.is_active,
      };

      if (editingPackage) {
        await api.admin.subscriptionPackages.update(editingPackage.id, packageData);
        toast.success(`${formData.name} has been updated`);
      } else {
        await api.admin.subscriptionPackages.create(packageData);
        toast.success(`${formData.name} has been created`);
      }

      setIsModalOpen(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save package");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePackageStatus = async (pkg: SubscriptionPackage) => {
    try {
      await api.admin.subscriptionPackages.update(pkg.id, {
        is_active: !pkg.is_active,
      });
      toast.success(`${pkg.name} is now ${!pkg.is_active ? "active" : "inactive"}`);
      fetchPackages();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update package status");
      }
    }
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

  // Show skeleton loading while fetching initial data
  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>

          {/* Search Bar Skeleton */}
          <div className="relative max-w-sm">
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Table Skeleton */}
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
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
                    <TableCell className="capitalize">{pkg.billing_period}</TableCell>
                    <TableCell>{pkg.consultations_included} / year</TableCell>
                    <TableCell>
                      <button
                        onClick={() => togglePackageStatus(pkg)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition",
                          pkg.is_active
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                      >
                        {pkg.is_active ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {pkg.is_active ? "Active" : "Inactive"}
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

            {filteredPackages.length === 0 && !initialLoading && (
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
                <Label>Description *</Label>
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
                    value={formData.price_kobo / 100}
                    onChange={(e) => setFormData({ ...formData, price_kobo: (parseInt(e.target.value) || 0) * 100 })}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value="NGN" disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Billing Period</Label>
                  <Select
                    value={formData.billing_period}
                    onValueChange={(v: any) => setFormData({ ...formData, billing_period: v })}
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
                  value={formData.consultations_included}
                  onChange={(e) =>
                    setFormData({ ...formData, consultations_included: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              {/* Features */}
              <div>
                <Label>Features *</Label>
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
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
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
                        {formData.billing_period.toUpperCase()} BILLING
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-2xl font-bold">
                        {formatPrice(formData.price_kobo / 100)}
                      </span>
                      <span className="text-xs text-muted-foreground"> / {getBillingText(formData.billing_period)}</span>
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
                    {formData.consultations_included > 0 && (
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formData.consultations_included} consultations per year
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