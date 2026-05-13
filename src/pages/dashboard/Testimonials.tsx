import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type LocalTestimonial } from "@/lib/localStore";
import { api, appendFormValue } from "@/lib/api";
import { collection, testimonialFromApi } from "@/lib/backendAdapters";

type FormState = {
  quote: string;
  authorName: string;
  authorRole: string;
  initials: string;
  sortOrder: string;
  avatar: File | null;
  published: boolean;
};

const empty: FormState = {
  quote: "",
  authorName: "",
  authorRole: "Patient",
  initials: "",
  sortOrder: "0",
  avatar: null,
  published: true,
};

const deriveInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const testimonialPayload = (form: FormState) => {
  const base = {
    author_name: form.authorName.trim(),
    author_role: form.authorRole.trim() || "Patient",
    quote: form.quote.trim(),
    sort_order: Number(form.sortOrder) || 0,
    is_published: form.published,
  };

  if (!form.avatar) return base;

  const body = new FormData();
  Object.entries(base).forEach(([key, value]) => appendFormValue(body, key, value));
  body.append("avatar", form.avatar);
  return body;
};

const TestimonialsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LocalTestimonial[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocalTestimonial | null>(null);
  const [deleting, setDeleting] = useState<LocalTestimonial | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    let cancelled = false;
    const loadBackend = async () => {
      try {
        const response = await api.admin.cms.testimonials.list();
        const mapped = collection(response.data).map(testimonialFromApi);
        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems([]);
      }
    };
    loadBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item: LocalTestimonial) => {
    setEditing(item);
    setForm({
      quote: item.quote,
      authorName: item.name,
      authorRole: item.role,
      initials: item.initials,
      sortOrder: "0",
      avatar: null,
      published: item.published,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.authorName.trim() || !form.quote.trim()) {
      toast({
        title: "Required fields missing",
        description: "Author name and quote are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = testimonialPayload(form);
      const response = editing
        ? await api.admin.cms.testimonials.update(editing.id, payload)
        : await api.admin.cms.testimonials.create(payload);
      const saved = response.data ? testimonialFromApi(response.data) : {
        id: editing?.id ?? crypto.randomUUID(),
        quote: form.quote.trim(),
        name: form.authorName.trim(),
        role: form.authorRole.trim() || "Patient",
        initials: (form.initials.trim() || deriveInitials(form.authorName)).toUpperCase(),
        published: form.published,
        created_at: new Date().toISOString(),
      };
      setItems((prev) => editing ? prev.map((item) => item.id === editing.id ? saved : item) : [saved, ...prev]);
      toast({ title: editing ? "Testimonial updated" : "Testimonial created" });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Testimonial save failed",
        description: error instanceof Error ? error.message : "Could not save this testimonial.",
        variant: "destructive",
      });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.admin.cms.testimonials.delete(deleting.id);
      setItems((prev) => prev.filter((item) => item.id !== deleting.id));
      toast({ title: "Testimonial deleted" });
      setDeleting(null);
    } catch (error) {
      toast({
        title: "Testimonial delete failed",
        description: error instanceof Error ? error.message : "Could not delete this testimonial.",
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
          <h1 className="font-display text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground text-sm mt-1">Control customer testimonials shown on the homepage.</p>
        </div>
        <Button variant="hero" onClick={openNew}><Plus className="h-4 w-4" /> New testimonial</Button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No testimonials yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.name} <span className="text-muted-foreground text-sm">/ {item.role}</span></p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">"{item.quote}"</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${item.published ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"}`}>
                    {item.published ? "Published" : "Draft"}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleting(item)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>{editing ? "Edit testimonial" : "New testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="grid gap-5">
              <div className="space-y-2">
                <Label>Quote</Label>
                <Textarea rows={5} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Author name</Label>
                  <Input
                    value={form.authorName}
                    onChange={(e) => setForm({
                      ...form,
                      authorName: e.target.value,
                      initials: editing ? form.initials : deriveInitials(e.target.value),
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author role</Label>
                  <Input value={form.authorRole} onChange={(e) => setForm({ ...form, authorRole: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Initials</Label>
                  <Input maxLength={3} value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-2">
                  <Label>Sort order</Label>
                  <Input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setForm({ ...form, avatar: e.target.files?.[0] ?? null })} />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                <Switch checked={form.published} onCheckedChange={(value) => setForm({ ...form, published: value })} />
                <Label>Published</Label>
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
        title="Delete testimonial?"
        description={`This will remove the testimonial from ${deleting?.name ?? "this person"}.`}
        loading={deleteBusy}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={remove}
      />
    </DashboardLayout>
  );
};

export default TestimonialsPage;
