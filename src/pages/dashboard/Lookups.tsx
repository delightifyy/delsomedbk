import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";

type LookupItem = {
  id: string;
  name: string;
  slug?: string;
  code?: string;
  active?: boolean;
};

const RESOURCES = [
  { key: "zones", label: "Zones" },
  { key: "states", label: "States" },
  { key: "cities", label: "Cities" },
  { key: "specialties", label: "Specialties" },
  { key: "sub-specialties", label: "Sub-specialties" },
  { key: "services", label: "Services" },
  { key: "organization-types", label: "Organization Types" },
  { key: "post-categories", label: "Post Categories" },
];

const empty = { name: "", slug: "", code: "", is_active: true };

const asLookupItem = (entry: any): LookupItem => ({
  id: String(entry?.id ?? entry?.uuid ?? entry?.slug ?? crypto.randomUUID()),
  name: String(entry?.name ?? entry?.title ?? entry?.label ?? "Untitled"),
  slug: entry?.slug ? String(entry.slug) : undefined,
  code: entry?.code ? String(entry.code) : undefined,
  active: entry?.is_active ?? entry?.active ?? true,
});

const LookupsPage = () => {
  const { toast } = useToast();
  const [resource, setResource] = useState(RESOURCES[0].key);
  const [items, setItems] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LookupItem | null>(null);
  const [deleting, setDeleting] = useState<LookupItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [form, setForm] = useState(empty);

  const activeResource = useMemo(() => RESOURCES.find((item) => item.key === resource) ?? RESOURCES[0], [resource]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.admin.lookups.list(resource);
      setItems(collection(response.data).map(asLookupItem));
    } catch (error) {
      toast({
        title: "Lookup load failed",
        description: error instanceof Error ? error.message : "Could not load this lookup.",
        variant: "destructive",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [resource]);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item: LookupItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug ?? "",
      code: item.code ?? "",
      is_active: item.active ?? true,
    });
    setOpen(true);
  };

  const save = async () => {
    const body = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      code: form.code.trim() || undefined,
      is_active: form.is_active,
    };
    try {
      const response = editing
        ? await api.admin.lookups.update(resource, editing.id, body)
        : await api.admin.lookups.create(resource, body);
      const saved = response.data ? asLookupItem(response.data) : {
        id: editing?.id ?? crypto.randomUUID(),
        name: body.name,
        slug: body.slug,
        code: body.code,
        active: body.is_active,
      };
      setItems((prev) => editing ? prev.map((item) => item.id === editing.id ? saved : item) : [saved, ...prev]);
      toast({ title: editing ? "Lookup updated" : "Lookup created" });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Lookup save failed",
        description: error instanceof Error ? error.message : "Could not save this lookup.",
        variant: "destructive",
      });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.admin.lookups.delete(resource, deleting.id);
      setItems((prev) => prev.filter((entry) => entry.id !== deleting.id));
      toast({ title: "Lookup deleted" });
      setDeleting(null);
    } catch (error) {
      toast({
        title: "Lookup delete failed",
        description: error instanceof Error ? error.message : "Could not delete this lookup.",
        variant: "destructive",
      });
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Lookups</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage taxonomy lists used by DesolMed forms and filters.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={resource} onValueChange={setResource}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOURCES.map((item) => (
                <SelectItem key={item.key} value={item.key}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="hero" onClick={openNew}><Plus className="h-4 w-4" /> New</Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <p className="font-medium">{activeResource.label}</p>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No lookup items yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="p-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Tags className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.slug ? `/${item.slug}` : "No slug"} {item.code ? `/ ${item.code}` : ""}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleting(item)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit lookup" : "New lookup"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></div>
              <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${activeResource.label.toLowerCase()} item?`}
        description={`This will remove "${deleting?.name ?? "this item"}" from ${activeResource.label}.`}
        loading={deleteBusy}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={remove}
      />
    </DashboardLayout>
  );
};

export default LookupsPage;
