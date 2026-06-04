import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type LocalAdvert } from "@/lib/localStore";
import { api, appendFormValue } from "@/lib/api";
import { advertFromApi, collection, lookupOptionFromApi, type LookupOption } from "@/lib/backendAdapters";

type FormState = {
  title: string;
  subtitle: string;
  providerName: string;
  serviceId: string;
  zoneId: string;
  stateId: string;
  address: string;
  description: string;
  bannerImage: File | null;
  existingImage: string;
  ctaLabel: string;
  ctaUrl: string;
  phone: string;
  email: string;
  website: string;
  priceText: string;
  publishedAt: string;
  expiresAt: string;
  sortOrder: string;
  featured: boolean;
  status: "draft" | "published";
};

const NONE = "__none";
const today = () => new Date().toISOString().slice(0, 10);

const empty: FormState = {
  title: "",
  subtitle: "",
  providerName: "",
  serviceId: "",
  zoneId: "",
  stateId: "",
  address: "",
  description: "",
  bannerImage: null,
  existingImage: "",
  ctaLabel: "Read the story",
  ctaUrl: "",
  phone: "",
  email: "",
  website: "",
  priceText: "",
  publishedAt: today(),
  expiresAt: "",
  sortOrder: "0",
  featured: false,
  status: "published",
};

const findOptionId = (options: LookupOption[], label: string) =>
  options.find((option) => option.label.toLowerCase() === label.toLowerCase())?.id ?? "";

const toDateInput = (value?: string | null) => {
  if (!value) return today();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? today() : date.toISOString().slice(0, 10);
};

const buildAdvertFormData = (form: FormState) => {
  const body = new FormData();

  appendFormValue(body, "title", form.title.trim());
  appendFormValue(body, "subtitle", form.subtitle.trim());
  appendFormValue(body, "description", form.description.trim());
  appendFormValue(body, "cta_label", form.ctaLabel.trim());
  appendFormValue(body, "cta_url", form.ctaUrl.trim());
  appendFormValue(body, "phone", form.phone.trim());
  appendFormValue(body, "email", form.email.trim());
  appendFormValue(body, "website", form.website.trim());
  appendFormValue(body, "price_text", form.priceText.trim());
  appendFormValue(body, "provider_name", form.providerName.trim());
  appendFormValue(body, "address", form.address.trim());
  appendFormValue(body, "state_id", form.stateId ? Number(form.stateId) || form.stateId : undefined);
  appendFormValue(body, "status", form.status);
  appendFormValue(body, "published_at", form.status === "published" ? form.publishedAt || today() : undefined);
  appendFormValue(body, "expires_at", form.expiresAt);
  appendFormValue(body, "is_featured", form.featured);
  appendFormValue(body, "sort_order", Number(form.sortOrder) || 0);

  if (form.bannerImage) body.append("banner_image", form.bannerImage);
  if (form.zoneId) body.append("zone_ids[]", form.zoneId);
  if (form.serviceId) body.append("service_ids[]", form.serviceId);

  return body;
};

const BlogPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LocalAdvert[]>([]);
  const [services, setServices] = useState<LookupOption[]>([]);
  const [zones, setZones] = useState<LookupOption[]>([]);
  const [states, setStates] = useState<LookupOption[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocalAdvert | null>(null);
  const [deleting, setDeleting] = useState<LocalAdvert | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    let cancelled = false;

    const loadBackend = async () => {
      try {
        const response = await api.admin.adverts.list();
        const mapped = collection(response.data).map(advertFromApi);
        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems([]);
      }
    };

    const loadLookups = async () => {
      const [serviceResult, zoneResult, stateResult] = await Promise.allSettled([
        api.lookups.services(),
        api.lookups.zones(),
        api.lookups.states(),
      ]);
      if (cancelled) return;
      setServices(serviceResult.status === "fulfilled" ? collection(serviceResult.value.data).map(lookupOptionFromApi) : []);
      setZones(zoneResult.status === "fulfilled" ? collection(zoneResult.value.data).map(lookupOptionFromApi) : []);
      setStates(stateResult.status === "fulfilled" ? collection(stateResult.value.data).map(lookupOptionFromApi) : []);
    };

    loadBackend();
    loadLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (advert: LocalAdvert) => {
    setEditing(advert);
    setForm({
      title: advert.title,
      subtitle: "",
      providerName: advert.sponsor,
      serviceId: findOptionId(services, advert.category),
      zoneId: findOptionId(zones, advert.zone),
      stateId: findOptionId(states, advert.state),
      address: advert.city,
      description: advert.description,
      bannerImage: null,
      existingImage: advert.image ?? "",
      ctaLabel: advert.cta_label ?? "Read the story",
      ctaUrl: "",
      phone: "",
      email: "",
      website: "",
      priceText: advert.author_role ?? "",
      publishedAt: toDateInput(advert.created_at),
      expiresAt: "",
      sortOrder: "0",
      featured: false,
      status: advert.published ? "published" : "draft",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast({
        title: "Required fields missing",
        description: "Advert title is required.",
        variant: "destructive",
      });
      return;
    }

    const selectedService = services.find((option) => option.id === form.serviceId);
    const selectedZone = zones.find((option) => option.id === form.zoneId);
    const selectedState = states.find((option) => option.id === form.stateId);

    try {
      const payload = buildAdvertFormData(form);
      const response = editing
        ? await api.admin.adverts.update(editing.id, payload)
        : await api.admin.adverts.create(payload);
      const saved = response.data ? advertFromApi(response.data) : {
        id: editing?.id ?? crypto.randomUUID(),
        title: form.title.trim(),
        sponsor: form.providerName.trim() || "DesolMed partner",
        category: selectedService?.label ?? "Health",
        zone: selectedZone?.label ?? "",
        state: selectedState?.label ?? "",
        city: form.address.trim(),
        description: form.description.trim() || form.subtitle.trim(),
        published: form.status === "published",
        image: form.existingImage || null,
        date_label: form.publishedAt || today(),
        read_time: null,
        author: form.providerName.trim() || null,
        author_role: form.priceText.trim() || form.address.trim() || null,
        cta_label: form.ctaLabel.trim() || "Read the story",
        created_at: new Date().toISOString(),
      };
      setItems((prev) => editing ? prev.map((item) => item.id === editing.id ? saved : item) : [saved, ...prev]);
      toast({ title: editing ? "Advert updated" : "Advert created" });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Advert save failed",
        description: error instanceof Error ? error.message : "Could not save this advert.",
        variant: "destructive",
      });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.admin.adverts.delete(deleting.id);
      setItems((prev) => prev.filter((item) => item.id !== deleting.id));
      toast({ title: "Advert deleted" });
      setDeleting(null);
    } catch (error) {
      toast({
        title: "Advert delete failed",
        description: error instanceof Error ? error.message : "Could not delete this advert.",
        variant: "destructive",
      });
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Health Adverts</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage DesolMed adverts and partner stories.</p>
        </div>
        <Button variant="hero" onClick={openNew}><Plus className="h-4 w-4" /> New advert</Button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No adverts yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((advert) => (
              <li key={advert.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {advert.image ? (
                    <img src={advert.image} alt="" className="h-12 w-12 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{advert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {advert.sponsor} / {advert.category} / {advert.state || "No state"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${advert.published ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"}`}>
                    {advert.published ? "Published" : "Draft"}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(advert)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleting(advert)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>{editing ? "Edit advert" : "New advert"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="grid gap-5">
              <div className="grid gap-4 lg:grid-cols-[1.6fr_0.8fr_0.8fr]">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as FormState["status"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Published date</Label>
                  <Input type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Provider name</Label>
                  <Input value={form.providerName} onChange={(e) => setForm({ ...form, providerName: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select value={form.serviceId || NONE} onValueChange={(value) => setForm({ ...form, serviceId: value === NONE ? "" : value })}>
                    <SelectTrigger><SelectValue placeholder="No service" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No service</SelectItem>
                      {services.map((option) => (
                        <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Select value={form.zoneId || NONE} onValueChange={(value) => setForm({ ...form, zoneId: value === NONE ? "" : value })}>
                    <SelectTrigger><SelectValue placeholder="No zone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No zone</SelectItem>
                      {zones.map((option) => (
                        <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={form.stateId || NONE} onValueChange={(value) => setForm({ ...form, stateId: value === NONE ? "" : value })}>
                    <SelectTrigger><SelectValue placeholder="No state" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No state</SelectItem>
                      {states.map((option) => (
                        <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={7} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Banner image</Label>
                  <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setForm({ ...form, bannerImage: e.target.files?.[0] ?? null })} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>CTA label</Label>
                  <Input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>CTA URL</Label>
                  <Input value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Price text</Label>
                  <Input value={form.priceText} onChange={(e) => setForm({ ...form, priceText: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Expires date</Label>
                  <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Sort order</Label>
                  <Input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                </div>
              </div>

                <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                  <Switch checked={form.featured} onCheckedChange={(value) => setForm({ ...form, featured: value })} />
                  <Label>{"\n"}</Label>
                </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog
        open={Boolean(deleting)}
        title="Delete advert?"
        description={`This will remove "${deleting?.title ?? "this advert"}" from the admin and public advert list.`}
        loading={deleteBusy}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={remove}
      />
    </DashboardLayout>
  );
};

export default BlogPage;
