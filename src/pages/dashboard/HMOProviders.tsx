// src/pages/dashboard/HMOProviders.tsx
import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  GripVertical,
  X,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// Types
interface HMOProvider {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Stats Skeleton
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
    <div className="rounded-xl border border-border bg-card p-4 animate-pulse">
      <div className="h-4 w-24 bg-muted rounded"></div>
      <div className="h-8 w-12 bg-muted rounded mt-2"></div>
      <div className="h-3 w-20 bg-muted rounded mt-2"></div>
    </div>
  </div>
);

// Table Skeleton Component
const TableSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/30 border-b border-border">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Name</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Code</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Status</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Sort Order</th>
            <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted"></div>
                  <div className="h-5 w-32 bg-muted rounded"></div>
                </div>
               </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 bg-muted rounded"></div>
               </td>
              <td className="px-4 py-3">
                <div className="h-5 w-20 bg-muted rounded-full"></div>
               </td>
              <td className="px-4 py-3">
                <div className="h-5 w-12 bg-muted rounded"></div>
               </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
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

const HMOProvidersPage = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<HMOProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<HMOProvider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<HMOProvider | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Reorder mode
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderList, setReorderList] = useState<HMOProvider[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProviders = useCallback(async (page = 1) => {
    setLoading(true);
    
    try {
      const query: any = { page, per_page: perPage };
      if (debouncedSearch) {
        query.search = debouncedSearch;
      }
      
      const response = await api.admin.hmoProviders.list(query);
      const result = response as unknown as { data: HMOProvider[]; meta: PaginatedMeta };
      setProviders(result.data);
      setCurrentPage(result.meta.current_page);
      setLastPage(result.meta.last_page);
      setTotal(result.meta.total);
    } catch (error) {
      console.error("Failed to fetch HMO providers:", error);
      toast({
        title: "Error",
        description: "Failed to load HMO providers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, perPage, toast]);

  useEffect(() => {
    fetchProviders(currentPage);
  }, [fetchProviders, currentPage]);

  const openCreateForm = () => {
    setEditingProvider(null);
    setFormData({ name: "", code: "", is_active: true });
    setFormOpen(true);
  };

  const openEditForm = (provider: HMOProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      code: provider.code,
      is_active: provider.is_active,
    });
    setFormOpen(true);
  };

  const saveProvider = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Provider name is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Provider code is required.",
        variant: "destructive",
      });
      return;
    }
    
    setFormSubmitting(true);
    
    try {
      if (editingProvider) {
        await api.admin.hmoProviders.update(editingProvider.id, {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          is_active: formData.is_active,
        });
        toast({
          title: "Success",
          description: "HMO provider updated successfully.",
        });
      } else {
        await api.admin.hmoProviders.create({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          is_active: formData.is_active,
        });
        toast({
          title: "Success",
          description: "HMO provider created successfully.",
        });
      }
      setFormOpen(false);
      fetchProviders(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save HMO provider.",
        variant: "destructive",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const deleteProvider = async () => {
    if (!deletingProvider) return;
    setProcessingIds(prev => new Set(prev).add(deletingProvider.id));
    
    try {
      await api.admin.hmoProviders.delete(deletingProvider.id);
      toast({
        title: "Success",
        description: "HMO provider deleted successfully.",
      });
      setDeletingProvider(null);
      fetchProviders(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete HMO provider.",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(deletingProvider.id);
        return newSet;
      });
    }
  };

  const toggleReorderMode = () => {
    if (isReorderMode) {
      saveReorder();
    } else {
      setReorderList([...providers]);
      setIsReorderMode(true);
    }
  };

  const saveReorder = async () => {
    const ids = reorderList.map(p => p.id);
    
    try {
      await api.admin.hmoProviders.reorder({ ids });
      toast({
        title: "Success",
        description: "HMO providers reordered successfully.",
      });
      setIsReorderMode(false);
      fetchProviders(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reorder HMO providers.",
        variant: "destructive",
      });
    }
  };

  const cancelReorder = () => {
    setIsReorderMode(false);
    setReorderList([]);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= reorderList.length) return;
    
    const newList = [...reorderList];
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    setReorderList(newList);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      fetchProviders(page);
    }
  };

  const isProcessing = (id: number) => processingIds.has(id);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 gap-1">
        <Check className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 gap-1">
        <X className="h-3 w-3" />
        Inactive
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">HMO Providers</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage HMO providers for patient appointments
            </p>
          </div>
          <Button variant="hero" onClick={openCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            Add HMO Provider
          </Button>
        </div>

        {/* Total Stats Card */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total HMO Providers</p>
                  <p className="text-3xl font-bold">{total}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Reorder Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {!isReorderMode ? (
            <Button 
              variant="outline" 
              onClick={toggleReorderMode}
              disabled={providers.length < 2 || loading}
              className="gap-2"
            >
              <GripVertical className="h-4 w-4" />
              Reorder Providers
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={cancelReorder} className="gap-2">
                Cancel
              </Button>
              <Button variant="default" onClick={saveReorder} className="gap-2 bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4" />
                Save Order
              </Button>
            </div>
          )}
        </div>

        {/* Table with Skeleton */}
        {loading ? (
          <TableSkeleton />
        ) : providers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No HMO providers found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm ? "Try adjusting your search." : "Click 'Add HMO Provider' to create your first provider."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                      {isReorderMode ? "Order" : "Name"}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Code</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Sort Order</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(isReorderMode ? reorderList : providers).map((provider, index) => (
                    <tr key={provider.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-4 py-3">
                        {isReorderMode ? (
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => moveItem(index, "up")}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => moveItem(index, "down")}
                              disabled={index === reorderList.length - 1}
                            >
                              ↓
                            </Button>
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{provider.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{provider.name}</span>
                          </div>
                        )}
                       </td>
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {provider.code}
                        </code>
                       </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(provider.is_active)}
                       </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {provider.sort_order || index + 1}
                       </td>
                      <td className="px-4 py-3">
                        {!isReorderMode && (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditForm(provider)}
                              className="h-8 w-8 p-0"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingProvider(provider)}
                              disabled={isProcessing(provider.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              {isProcessing(provider.id) ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && lastPage > 1 && !isReorderMode && (
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

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>
              {editingProvider ? "Edit HMO Provider" : "Add New HMO Provider"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Provider Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., AXA Mansard"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Provider Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., AXAM"
                className="w-full font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">Unique code used for identification</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label className="font-medium">Active Status</Label>
                <p className="text-xs text-muted-foreground">Enable to make this provider available</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={saveProvider} disabled={formSubmitting}>
              {formSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingProvider ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={Boolean(deletingProvider)}
        title="Delete HMO Provider?"
        description={`Are you sure you want to delete "${deletingProvider?.name}"? This action cannot be undone.`}
        loading={isProcessing(deletingProvider?.id || 0)}
        onOpenChange={(open) => !open && setDeletingProvider(null)}
        onConfirm={deleteProvider}
      />
    </DashboardLayout>
  );
};

export default HMOProvidersPage;